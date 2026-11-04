// POST /api/subscribe — registra un lead (nombre + email) y lo sincroniza con Brevo.
import type { Env } from '../_lib/types';
import { json, redirect, readBody, clientIp, country, sha256Hex } from '../_lib/http';
import { parseLeadInput } from '../_lib/validate';
import { recentSignupsFromIp, syncLead, upsertLead } from '../_lib/db';

const CONSENT_VERSION = '2026-11-v1'; // mantener igual a site.consentVersion
const MAX_PER_IP_10_MIN = 6;

async function verifyTurnstile(secret: string, token: string | undefined, ip: string): Promise<boolean> {
  if (!token) return false;
  const body = new FormData();
  body.append('secret', secret);
  body.append('response', token);
  body.append('remoteip', ip);
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
    const data = (await res.json()) as { success?: boolean };
    return !!data.success;
  } catch {
    return false;
  }
}

function errorPage(message: string, status: number): Response {
  const html = `<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Revisa tus datos</title><body style="font-family:system-ui;max-width:32rem;margin:4rem auto;padding:0 1rem;line-height:1.6"><h1>Revisa tus datos</h1><p>${message}</p><p><a href="javascript:history.back()">Volver al formulario</a></p></body></html>`;
  return new Response(html, { status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
}

const MESSAGES: Record<string, string> = {
  name: 'Escribe tu nombre.',
  email: 'Revisa tu email, parece que tiene un error.',
  consent: 'Necesitamos tu autorización para enviarte el material.',
  captcha: 'No pudimos verificar que eres una persona. Recarga la página e intenta de nuevo.',
  rate: 'Demasiados intentos. Espera unos minutos.',
  generic: 'No pudimos registrarte. Intenta de nuevo en un momento.',
};

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const { request, env } = ctx;
  const wantsJson = (request.headers.get('accept') || '').includes('application/json');
  const fail = (error: string, status = 400) => (wantsJson ? json({ ok: false, error }, status) : errorPage(MESSAGES[error] ?? MESSAGES.generic, status));
  const success = () => (wantsJson ? json({ ok: true, redirect: '/gracias' }) : redirect('/gracias'));

  const raw = await readBody(request);
  if (!raw) return fail('generic');

  // Honeypot: si un bot llenó el campo oculto, fingimos éxito y no guardamos nada.
  if (raw.website) return success();

  const parsed = parseLeadInput(raw);
  if (!parsed.ok) return fail(parsed.error);

  const ip = clientIp(request);
  if (env.TURNSTILE_SECRET_KEY && !(await verifyTurnstile(env.TURNSTILE_SECRET_KEY, raw['cf-turnstile-response'], ip))) {
    return fail('captcha');
  }

  const ipHash = (await sha256Hex(`${env.IP_HASH_SALT ?? ''}:${ip}`)).slice(0, 32);
  try {
    if ((await recentSignupsFromIp(env, ipHash)) >= MAX_PER_IP_10_MIN) return fail('rate', 429);
    await upsertLead(env, parsed.data, { ipHash, country: country(request), consentVersion: CONSENT_VERSION });
  } catch (e) {
    console.error('subscribe_db_error', (e as Error).message);
    return fail('generic', 500);
  }

  // Brevo en segundo plano: si falla, el lead queda guardado con esp_synced = 0 y se reintenta con /api/admin/resync.
  ctx.waitUntil(
    syncLead(env, {
      email: parsed.data.email,
      name: parsed.data.name,
      utm_source: parsed.data.utm.source,
      utm_campaign: parsed.data.utm.campaign,
    }).catch((e) => console.error('brevo_sync_error', (e as Error).message)),
  );

  return success();
};

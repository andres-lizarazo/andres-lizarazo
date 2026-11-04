// Cliente mínimo de la API de Brevo (https://developers.brevo.com/reference).
import type { Env } from './types';
import { sleep } from './http';

const API = 'https://api.brevo.com/v3';

export interface BrevoResult {
  ok: boolean;
  status?: number;
  error?: string;
}

const listId = (v?: string): number | null => {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : null;
};

export function brevoLists(env: Env) {
  return {
    leads: listId(env.BREVO_LIST_LEADS),
    buyers: listId(env.BREVO_LIST_BUYERS),
    abandoned: listId(env.BREVO_LIST_ABANDONED),
  };
}

async function call(env: Env, method: string, path: string, body: unknown, fetchImpl: typeof fetch = fetch): Promise<BrevoResult> {
  if (!env.BREVO_API_KEY) return { ok: false, error: 'brevo_no_configurado' };
  const delays = [0, 400, 1500];
  let last: BrevoResult = { ok: false, error: 'sin_intentos' };
  for (const d of delays) {
    if (d) await sleep(d);
    try {
      const res = await fetchImpl(`${API}${path}`, {
        method,
        headers: { 'api-key': env.BREVO_API_KEY, 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) return { ok: true, status: res.status };
      const text = (await res.text().catch(() => '')).slice(0, 300);
      last = { ok: false, status: res.status, error: text || `http_${res.status}` };
      if (res.status !== 429 && res.status < 500) return last; // errores 4xx no se arreglan reintentando
    } catch (e) {
      last = { ok: false, error: `red: ${(e as Error).message}`.slice(0, 300) };
    }
  }
  return last;
}

/** Crea o actualiza un contacto y lo agrega a listas. */
export function upsertContact(
  env: Env,
  contact: { email: string; attributes: Record<string, string | number | boolean | null>; listIds: (number | null)[] },
  fetchImpl?: typeof fetch,
): Promise<BrevoResult> {
  const attributes = Object.fromEntries(Object.entries(contact.attributes).filter(([, v]) => v !== null && v !== ''));
  return call(
    env,
    'POST',
    '/contacts',
    { email: contact.email, attributes, listIds: contact.listIds.filter((n): n is number => n !== null), updateEnabled: true },
    fetchImpl,
  );
}

/** Actualiza atributos y/o saca al contacto de listas. */
export function updateContact(
  env: Env,
  email: string,
  change: { attributes?: Record<string, string | number | boolean>; unlinkListIds?: (number | null)[]; listIds?: (number | null)[] },
  fetchImpl?: typeof fetch,
): Promise<BrevoResult> {
  const body: Record<string, unknown> = {};
  if (change.attributes) body.attributes = change.attributes;
  const unlink = (change.unlinkListIds ?? []).filter((n): n is number => n !== null);
  const link = (change.listIds ?? []).filter((n): n is number => n !== null);
  if (unlink.length) body.unlinkListIds = unlink;
  if (link.length) body.listIds = link;
  if (!Object.keys(body).length) return Promise.resolve({ ok: true });
  return call(env, 'PUT', `/contacts/${encodeURIComponent(email)}?identifierType=email_id`, body, fetchImpl);
}

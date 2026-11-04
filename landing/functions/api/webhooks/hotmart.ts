// POST /api/webhooks/hotmart — recibe compras, reembolsos y carritos abandonados de Hotmart (webhook 2.0.0).
// Configura en Hotmart > Herramientas > Webhook: URL https://TU-DOMINIO/api/webhooks/hotmart
import type { Env } from '../../_lib/types';
import { json, timingSafeEqual } from '../../_lib/http';
import { parseHotmartEvent } from '../../_lib/hotmart';
import { recordHotmartEvent, syncAbandoned, syncPurchase, webhookSeen } from '../../_lib/db';

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const { request, env } = ctx;
  if (!env.HOTMART_HOTTOK) return json({ ok: false, error: 'webhook_no_configurado' }, 503);

  const text = await request.text();
  if (text.length > 256_000) return json({ ok: false, error: 'muy_grande' }, 413);

  let payload: unknown;
  try {
    payload = JSON.parse(text);
  } catch {
    return json({ ok: false, error: 'json_invalido' }, 400);
  }

  const bodyToken = (payload as { hottok?: unknown })?.hottok;
  const token = request.headers.get('x-hotmart-hottok') ?? (typeof bodyToken === 'string' ? bodyToken : '');
  if (!timingSafeEqual(token, env.HOTMART_HOTTOK)) return json({ ok: false, error: 'no_autorizado' }, 401);

  const ev = parseHotmartEvent(payload);
  if (!ev) return json({ ok: false, error: 'evento_invalido' }, 400);

  try {
    if (await webhookSeen(env, ev.eventId)) return json({ ok: true, duplicate: true });
    await recordHotmartEvent(env, ev, text);
  } catch (e) {
    console.error('hotmart_db_error', (e as Error).message);
    return json({ ok: false, error: 'db' }, 500); // Hotmart reintenta si no recibe 2xx
  }

  if (ev.kind === 'abandoned' && ev.email) {
    ctx.waitUntil(syncAbandoned(env, ev.email, ev.name).catch((e) => console.error('brevo_abandoned_error', (e as Error).message)));
  } else if (ev.transactionId && ev.kind !== 'ignored') {
    ctx.waitUntil(syncPurchase(env, ev.transactionId).catch((e) => console.error('brevo_purchase_error', (e as Error).message)));
  }

  return json({ ok: true, event: ev.event, kind: ev.kind });
};

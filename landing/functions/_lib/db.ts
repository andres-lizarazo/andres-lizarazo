// Acceso a la base de datos D1 + sincronización con Brevo.
import type { Env } from './types';
import type { LeadInput } from './validate';
import type { HotmartEvent } from './hotmart';
import { PAID_STATUSES } from './hotmart';
import { brevoLists, upsertContact, updateContact, type BrevoResult } from './brevo';

const now = () => new Date().toISOString();

export async function recentSignupsFromIp(env: Env, ipHash: string, minutes = 10): Promise<number> {
  const since = new Date(Date.now() - minutes * 60_000).toISOString();
  const row = await env.DB.prepare('SELECT COUNT(*) AS n FROM leads WHERE ip_hash = ? AND updated_at > ?').bind(ipHash, since).first<{ n: number }>();
  return row?.n ?? 0;
}

export async function upsertLead(env: Env, lead: LeadInput, meta: { ipHash: string; country: string | null; consentVersion: string }) {
  const ts = now();
  const upsert = env.DB.prepare(
    `INSERT INTO leads (email, name, anon_id, utm_source, utm_medium, utm_campaign, utm_content, utm_term,
       referrer, landing_path, form_id, country, ip_hash, consent_at, consent_version, created_at, updated_at)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?14, ?14)
     ON CONFLICT(email) DO UPDATE SET
       name = excluded.name,
       anon_id = COALESCE(leads.anon_id, excluded.anon_id),
       consent_at = excluded.consent_at,
       consent_version = excluded.consent_version,
       ip_hash = excluded.ip_hash,
       signups = leads.signups + 1,
       updated_at = excluded.updated_at`,
  ).bind(
    lead.email, lead.name, lead.anonId,
    lead.utm.source, lead.utm.medium, lead.utm.campaign, lead.utm.content, lead.utm.term,
    lead.referrer, lead.landingPath, lead.formId, meta.country, meta.ipHash, ts, meta.consentVersion,
  );
  const event = env.DB.prepare(
    `INSERT INTO events (type, anon_id, email, path, utm_source, utm_medium, utm_campaign, utm_content, referrer, country)
     VALUES ('lead', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).bind(lead.anonId, lead.email, lead.landingPath, lead.utm.source, lead.utm.medium, lead.utm.campaign, lead.utm.content, lead.referrer, meta.country);
  await env.DB.batch([upsert, event]);
}

async function markLeadSync(env: Env, email: string, r: BrevoResult) {
  await env.DB.prepare('UPDATE leads SET esp_synced = ?, esp_error = ? WHERE email = ?')
    .bind(r.ok ? 1 : 0, r.ok ? null : (r.error ?? 'error').slice(0, 300), email)
    .run();
}

export async function syncLead(env: Env, lead: { email: string; name: string; utm_source?: string | null; utm_campaign?: string | null }, fetchImpl?: typeof fetch) {
  const lists = brevoLists(env);
  const r = await upsertContact(
    env,
    {
      email: lead.email,
      attributes: { FIRSTNAME: lead.name.split(' ')[0] ?? lead.name, UTM_SOURCE: lead.utm_source ?? null, UTM_CAMPAIGN: lead.utm_campaign ?? null },
      listIds: [lists.leads],
    },
    fetchImpl,
  );
  await markLeadSync(env, lead.email, r);
  return r;
}

export async function insertEvent(env: Env, e: { type: string; anonId: string | null; email?: string | null; path: string | null; utm: Record<string, string | null>; referrer: string | null; country: string | null }) {
  await env.DB.prepare(
    `INSERT INTO events (type, anon_id, email, path, utm_source, utm_medium, utm_campaign, utm_content, referrer, country)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(e.type, e.anonId, e.email ?? null, e.path, e.utm.source ?? null, e.utm.medium ?? null, e.utm.campaign ?? null, e.utm.content ?? null, e.referrer, e.country)
    .run();
}

export async function webhookSeen(env: Env, eventId: string): Promise<boolean> {
  const row = await env.DB.prepare('SELECT 1 AS x FROM webhook_events WHERE event_id = ?').bind(eventId).first();
  return !!row;
}

/** Guarda el evento de Hotmart de forma atómica (compra + marca de evento procesado). */
export async function recordHotmartEvent(env: Env, ev: HotmartEvent, raw: string) {
  const mark = env.DB.prepare('INSERT OR IGNORE INTO webhook_events (event_id, provider, event) VALUES (?, ?, ?)').bind(ev.eventId, 'hotmart', ev.event);
  const stmts = [mark];

  if (ev.kind === 'abandoned') {
    stmts.unshift(
      env.DB.prepare(`INSERT INTO events (type, email, path, utm_source) VALUES ('cart_abandoned', ?, 'hotmart', ?)`).bind(ev.email, ev.src),
    );
  } else if (ev.kind !== 'ignored' && ev.transactionId) {
    const ts = now();
    stmts.unshift(
      env.DB.prepare(
        `INSERT INTO purchases (transaction_id, status, status_rank, last_event, email, name, product_id, product_name, offer_code,
           price_value, price_currency, payment_type, src, sck, approved_at, raw, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?17)
         ON CONFLICT(transaction_id) DO UPDATE SET
           status = CASE WHEN excluded.status_rank >= purchases.status_rank THEN excluded.status ELSE purchases.status END,
           status_rank = MAX(excluded.status_rank, purchases.status_rank),
           last_event = excluded.last_event,
           email = COALESCE(excluded.email, purchases.email),
           name = COALESCE(excluded.name, purchases.name),
           price_value = COALESCE(excluded.price_value, purchases.price_value),
           price_currency = COALESCE(excluded.price_currency, purchases.price_currency),
           payment_type = COALESCE(excluded.payment_type, purchases.payment_type),
           src = COALESCE(purchases.src, excluded.src),
           sck = COALESCE(purchases.sck, excluded.sck),
           approved_at = COALESCE(purchases.approved_at, excluded.approved_at),
           raw = excluded.raw,
           esp_synced = 0,
           updated_at = excluded.updated_at`,
      ).bind(
        ev.transactionId, ev.status, ev.rank, ev.event, ev.email, ev.name, ev.productId, ev.productName, ev.offerCode,
        ev.priceValue, ev.priceCurrency, ev.paymentType, ev.src, ev.sck, ev.approvedAt, raw.slice(0, 20_000), ts,
      ),
    );
  }
  await env.DB.batch(stmts);
}

export async function isBuyer(env: Env, email: string): Promise<boolean> {
  const placeholders = PAID_STATUSES.map(() => '?').join(',');
  const row = await env.DB.prepare(`SELECT 1 AS x FROM purchases WHERE email = ? AND status IN (${placeholders}) LIMIT 1`)
    .bind(email, ...PAID_STATUSES)
    .first();
  return !!row;
}

async function hasConsent(env: Env, email: string): Promise<boolean> {
  const row = await env.DB.prepare('SELECT 1 AS x FROM leads WHERE email = ? LIMIT 1').bind(email).first();
  return !!row;
}

/** Refleja en Brevo el estado actual de una compra (según la fila guardada, no el evento suelto). */
export async function syncPurchase(env: Env, transactionId: string, fetchImpl?: typeof fetch): Promise<BrevoResult> {
  const p = await env.DB.prepare('SELECT email, name, status, approved_at FROM purchases WHERE transaction_id = ?')
    .bind(transactionId)
    .first<{ email: string | null; name: string | null; status: string; approved_at: string | null }>();
  if (!p?.email) return { ok: true };
  const lists = brevoLists(env);
  let r: BrevoResult = { ok: true };
  if ((PAID_STATUSES as readonly string[]).includes(p.status)) {
    r = await upsertContact(
      env,
      {
        email: p.email,
        attributes: { FIRSTNAME: p.name?.split(' ')[0] ?? null, COMPRADOR: true, FECHA_COMPRA: (p.approved_at ?? now()).slice(0, 10) },
        listIds: [lists.buyers],
      },
      fetchImpl,
    );
    if (r.ok && lists.abandoned) await updateContact(env, p.email, { unlinkListIds: [lists.abandoned] }, fetchImpl);
  } else if (p.status === 'REFUNDED' || p.status === 'CHARGEBACK') {
    if (!(await isBuyer(env, p.email))) {
      r = await updateContact(env, p.email, { attributes: { COMPRADOR: false }, unlinkListIds: [lists.buyers] }, fetchImpl);
      if (r.status === 404) r = { ok: true }; // el contacto no existía en Brevo
    }
  }
  await env.DB.prepare('UPDATE purchases SET esp_synced = ?, esp_error = ? WHERE transaction_id = ?')
    .bind(r.ok ? 1 : 0, r.ok ? null : (r.error ?? 'error').slice(0, 300), transactionId)
    .run();
  return r;
}

/**
 * Carrito abandonado: solo escribimos a quien ya nos dio autorización (es lead) y aún no compró.
 * Quien solo dejó su email en el checkout de Hotmart no autorizó correos de marketing (Ley 1581).
 */
export async function syncAbandoned(env: Env, email: string, name: string | null, fetchImpl?: typeof fetch): Promise<BrevoResult> {
  const lists = brevoLists(env);
  if (!lists.abandoned) return { ok: true };
  if (!(await hasConsent(env, email)) || (await isBuyer(env, email))) return { ok: true };
  return upsertContact(env, { email, attributes: { FIRSTNAME: name?.split(' ')[0] ?? null }, listIds: [lists.abandoned] }, fetchImpl);
}

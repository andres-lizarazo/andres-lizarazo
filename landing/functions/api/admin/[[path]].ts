// Panel mínimo de administración (protegido con ADMIN_TOKEN).
//   GET  /api/admin/stats                      -> resumen en JSON
//   GET  /api/admin/export.csv?table=leads     -> CSV (leads | purchases | events | funnel)
//   POST /api/admin/resync                     -> reintenta sincronizar con Brevo lo pendiente
// Autenticación: header "Authorization: Bearer TU_TOKEN" o ?token=TU_TOKEN (útil para Google Sheets / Power BI).
import type { Env } from '../../_lib/types';
import { json, timingSafeEqual } from '../../_lib/http';
import { toCsv } from '../../_lib/csv';
import { PAID_STATUSES } from '../../_lib/hotmart';
import { syncLead, syncPurchase } from '../../_lib/db';

const PAID = PAID_STATUSES.map((s) => `'${s}'`).join(',');
const SOURCE = (col: string) => `CASE WHEN COALESCE(${col}, '') IN ('', 'directo') THEN '(directo)' ELSE lower(${col}) END`;

const QUERIES: Record<string, string> = {
  leads: `SELECT id, email, name, utm_source, utm_medium, utm_campaign, utm_content, utm_term, referrer, landing_path, form_id,
            country, consent_at, consent_version, signups, esp_synced, esp_error, created_at, updated_at
          FROM leads ORDER BY id`,
  purchases: `SELECT id, transaction_id, status, last_event, email, name, product_id, product_name, offer_code, price_value,
                price_currency, payment_type, src, sck, approved_at, esp_synced, esp_error, created_at, updated_at
              FROM purchases ORDER BY id`,
  events: `SELECT id, type, anon_id, email, path, utm_source, utm_medium, utm_campaign, utm_content, referrer, country, created_at
           FROM events ORDER BY id DESC LIMIT 50000`,
  funnel: `WITH
      l AS (SELECT ${SOURCE('utm_source')} AS source, COUNT(*) AS leads FROM leads GROUP BY 1),
      c AS (SELECT ${SOURCE('utm_source')} AS source, COUNT(DISTINCT anon_id) AS checkout_clicks FROM events WHERE type = 'checkout_click' GROUP BY 1),
      p AS (SELECT ${SOURCE('src')} AS source, COUNT(*) AS buyers FROM purchases WHERE status IN (${PAID}) GROUP BY 1),
      s AS (SELECT source FROM l UNION SELECT source FROM c UNION SELECT source FROM p)
    SELECT s.source,
           COALESCE(l.leads, 0) AS leads,
           COALESCE(c.checkout_clicks, 0) AS checkout_clicks,
           COALESCE(p.buyers, 0) AS buyers,
           ROUND(100.0 * COALESCE(p.buyers, 0) / NULLIF(COALESCE(c.checkout_clicks, 0), 0), 1) AS pct_click_a_compra,
           ROUND(100.0 * COALESCE(p.buyers, 0) / NULLIF(COALESCE(l.leads, 0), 0), 1) AS pct_lead_a_compra
    FROM s LEFT JOIN l ON l.source = s.source LEFT JOIN c ON c.source = s.source LEFT JOIN p ON p.source = s.source
    ORDER BY buyers DESC, leads DESC`,
};

function authorized(request: Request, env: Env): boolean {
  if (!env.ADMIN_TOKEN || env.ADMIN_TOKEN.length < 16) return false;
  const header = request.headers.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : new URL(request.url).searchParams.get('token') ?? '';
  return timingSafeEqual(token, env.ADMIN_TOKEN);
}

async function stats(env: Env) {
  const since7 = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const totals = await env.DB.prepare(
    `SELECT
       (SELECT COUNT(*) FROM leads) AS leads_total,
       (SELECT COUNT(*) FROM leads WHERE created_at > ?1) AS leads_7d,
       (SELECT COUNT(DISTINCT anon_id) FROM events WHERE type = 'checkout_click') AS checkout_clickers,
       (SELECT COUNT(*) FROM purchases WHERE status IN (${PAID})) AS buyers,
       (SELECT COUNT(*) FROM purchases WHERE status IN (${PAID}) AND approved_at > ?1) AS buyers_7d,
       (SELECT COUNT(*) FROM purchases WHERE status IN ('REFUNDED', 'CHARGEBACK')) AS refunds,
       (SELECT COUNT(*) FROM events WHERE type = 'cart_abandoned') AS carts_abandoned,
       (SELECT COUNT(*) FROM leads WHERE esp_synced = 0) AS leads_pending_brevo`,
  )
    .bind(since7)
    .first();
  const revenue = await env.DB.prepare(
    `SELECT price_currency AS currency, ROUND(SUM(price_value), 2) AS total FROM purchases WHERE status IN (${PAID}) GROUP BY price_currency`,
  ).all();
  const funnel = await env.DB.prepare(QUERIES.funnel).all();
  return { totals, revenue: revenue.results, funnel: funnel.results, generated_at: new Date().toISOString() };
}

async function resync(env: Env) {
  const leads = await env.DB.prepare('SELECT email, name, utm_source, utm_campaign FROM leads WHERE esp_synced = 0 ORDER BY id LIMIT 40')
    .all<{ email: string; name: string; utm_source: string | null; utm_campaign: string | null }>();
  let leadsOk = 0;
  for (const l of leads.results) if ((await syncLead(env, l)).ok) leadsOk++;

  const purchases = await env.DB.prepare('SELECT transaction_id FROM purchases WHERE esp_synced = 0 ORDER BY id LIMIT 20')
    .all<{ transaction_id: string }>();
  let purchasesOk = 0;
  for (const p of purchases.results) if ((await syncPurchase(env, p.transaction_id)).ok) purchasesOk++;

  return { leads: { attempted: leads.results.length, ok: leadsOk }, purchases: { attempted: purchases.results.length, ok: purchasesOk } };
}

export const onRequest: PagesFunction<Env> = async ({ request, env, params }) => {
  if (!authorized(request, env)) return json({ ok: false, error: 'no_autorizado' }, 401);
  const path = ([] as string[]).concat(params.path ?? []).join('/');

  if (request.method === 'GET' && path === 'stats') return json(await stats(env));

  if (request.method === 'GET' && path === 'export.csv') {
    const table = new URL(request.url).searchParams.get('table') ?? 'leads';
    const sql = QUERIES[table];
    if (!sql) return json({ ok: false, error: 'tabla_invalida', tablas: Object.keys(QUERIES) }, 400);
    const { results } = await env.DB.prepare(sql).all<Record<string, unknown>>();
    return new Response(toCsv(results), {
      headers: {
        'content-type': 'text/csv; charset=utf-8',
        'content-disposition': `attachment; filename="${table}-${new Date().toISOString().slice(0, 10)}.csv"`,
        'cache-control': 'no-store',
      },
    });
  }

  if (request.method === 'POST' && path === 'resync') return json({ ok: true, ...(await resync(env)) });

  return json({ ok: false, error: 'no_encontrado' }, 404);
};

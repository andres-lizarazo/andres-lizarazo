// Prueba de punta a punta contra el servidor local (npm run preview) o tu sitio publicado.
// Uso:  BASE_URL=http://127.0.0.1:8788 ADMIN_TOKEN=... HOTMART_HOTTOK=... node scripts/e2e.mjs
// Requiere Playwright (npm i -D playwright && npx playwright install chromium) para la parte de navegador.
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
const BASE = process.env.BASE_URL || 'http://127.0.0.1:8788';
const ADMIN = process.env.ADMIN_TOKEN || 'admin-de-prueba-1234567890';
const HOTTOK = process.env.HOTMART_HOTTOK || 'hottok-de-prueba';
const RUN = Date.now().toString(36);

const results = [];
async function step(name, fn) {
  try {
    await fn();
    results.push(['✔', name]);
    console.log(`✔ ${name}`);
  } catch (e) {
    results.push(['✘', name]);
    console.error(`✘ ${name}\n  ${e.message}`);
  }
}

const api = (path, init = {}) => fetch(`${BASE}${path}`, { redirect: 'manual', ...init });
const postJson = (path, body, headers = {}) =>
  api(path, { method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json', ...headers }, body: JSON.stringify(body) });
const admin = (path, init = {}) => api(path, { ...init, headers: { authorization: `Bearer ${ADMIN}`, ...(init.headers || {}) } });

function parseCsv(text) {
  const rows = [];
  let row = [], cell = '', q = false;
  const t = text.replace(/^﻿/, '');
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (q) {
      if (c === '"' && t[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n') { row.push(cell.replace(/\r$/, '')); rows.push(row); row = []; cell = ''; }
    else cell += c;
  }
  const [head, ...body] = rows;
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h, r[i]])));
}
const exportTable = async (table) => parseCsv(await (await admin(`/api/admin/export.csv?table=${table}`)).text());

const leadEmail = 'e2e-navegador@example.com';
const approved = JSON.parse(readFileSync(new URL('../tests/fixtures/hotmart-approved.json', import.meta.url)));
const tx = `HP-E2E-${RUN}`;

// ---------- Navegador ----------
let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  console.warn('⚠ Playwright no está instalado: se omiten las pruebas de navegador.');
}

if (chromium) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await page.route('https://pay.hotmart.com/**', (r) => r.fulfill({ status: 200, body: 'checkout simulado' }));
  await page.route('https://challenges.cloudflare.com/**', (r) => r.abort());

  await step('Formulario /gratis registra el lead y redirige a /gracias', async () => {
    await page.goto(`${BASE}/gratis?utm_source=linkedin&utm_campaign=e2e`);
    await page.fill('input[name="name"]', 'Prueba Navegador');
    await page.fill('input[name="email"]', leadEmail);
    await page.check('input[name="consent"]');
    await Promise.all([page.waitForURL(/\/gracias$/), page.click('button[type="submit"]')]);
    await page.waitForFunction(() => document.querySelector('[data-lead-name]')?.textContent?.includes('Prueba'));
  });

  await step('El botón de compra lleva src, sck y email al checkout', async () => {
    const href = await page.getAttribute('a[data-checkout="gracias"]', 'href');
    const u = new URL(href);
    assert.equal(u.searchParams.get('src'), 'linkedin');
    assert.match(u.searchParams.get('sck') || '', /^[a-z0-9]{6,}$/i);
    assert.equal(u.searchParams.get('email'), leadEmail);
  });

  await step('Clic en comprar registra checkout_click', async () => {
    await Promise.all([page.waitForURL(/pay\.hotmart\.com/), page.click('a[data-checkout="gracias"]')]);
    await new Promise((r) => setTimeout(r, 800));
    const events = await exportTable('events');
    assert.ok(events.some((e) => e.type === 'checkout_click' && e.utm_source === 'linkedin'), 'no se encontró el evento');
  });

  await step('Errores de validación se muestran sin salir de la página', async () => {
    await page.goto(`${BASE}/gratis`);
    await page.fill('input[name="name"]', 'Ana');
    await page.fill('input[name="email"]', 'ana@gmial.com');
    await page.click('input[name="consent"]');
    await page.click('input[name="consent"]'); // desmarcado
    await page.click('button[type="submit"]');
    await page.waitForSelector('[data-form-error]:not([hidden])');
    assert.match(await page.textContent('[data-email-hint]'), /gmail\.com/);
  });

  await browser.close();
}

// ---------- API ----------
await step('Lead queda guardado con su fuente (UTM) y autorización', async () => {
  const leads = await exportTable('leads');
  const row = leads.find((l) => l.email === leadEmail);
  assert.ok(row, 'lead no encontrado');
  assert.equal(row.utm_source, 'linkedin');
  assert.ok(row.consent_at && row.consent_version);
});

await step('Email repetido no crea una fila nueva', async () => {
  const before = (await exportTable('leads')).length;
  const r = await postJson('/api/subscribe', { name: 'Prueba Navegador', email: leadEmail.toUpperCase(), consent: 'on', form_id: 'gratis' });
  assert.equal(r.status, 200);
  const after = await exportTable('leads');
  assert.equal(after.length, before);
  assert.ok(Number(after.find((l) => l.email === leadEmail).signups) >= 2);
});

await step('Validaciones del servidor (email, autorización, nombre)', async () => {
  assert.equal((await (await postJson('/api/subscribe', { name: 'Ana', email: 'malo', consent: 'on' })).json()).error, 'email');
  assert.equal((await (await postJson('/api/subscribe', { name: 'Ana', email: 'ana@example.com' })).json()).error, 'consent');
  assert.equal((await (await postJson('/api/subscribe', { name: '', email: 'ana@example.com', consent: 'on' })).json()).error, 'name');
});

await step('Honeypot: el bot recibe "ok" pero no se guarda', async () => {
  const r = await postJson('/api/subscribe', { name: 'Bot', email: `bot-${RUN}@example.com`, consent: 'on', website: 'spam.com' });
  assert.equal(r.status, 200);
  assert.ok(!(await exportTable('leads')).some((l) => l.email === `bot-${RUN}@example.com`));
});

await step('Sin JavaScript: el formulario responde 303 a /gracias', async () => {
  const r = await api('/api/subscribe', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ name: 'Sin JS', email: 'e2e-sinjs@example.com', consent: 'on', form_id: 'gratis' }),
  });
  assert.equal(r.status, 303);
  assert.equal(r.headers.get('location'), '/gracias');
});

await step('Admin sin token responde 401', async () => {
  assert.equal((await api('/api/admin/stats')).status, 401);
  assert.equal((await api('/api/admin/export.csv?token=malo')).status, 401);
});

const purchase = { ...approved, id: `evt-${RUN}-1`, data: { ...approved.data, buyer: { ...approved.data.buyer, email: leadEmail }, purchase: { ...approved.data.purchase, transaction: tx } } };

await step('Webhook con hottok incorrecto responde 401', async () => {
  assert.equal((await postJson('/api/webhooks/hotmart', purchase, { 'x-hotmart-hottok': 'malo' })).status, 401);
});

await step('Webhook de compra aprobada crea la compra', async () => {
  const r = await postJson('/api/webhooks/hotmart', purchase, { 'x-hotmart-hottok': HOTTOK });
  assert.equal(r.status, 200);
  const p = (await exportTable('purchases')).find((x) => x.transaction_id === tx);
  assert.equal(p?.status, 'APPROVED');
  assert.equal(p?.email, leadEmail);
  assert.equal(p?.src, 'linkedin');
});

await step('El mismo evento repetido no se procesa dos veces', async () => {
  const r = await postJson('/api/webhooks/hotmart', purchase, { 'x-hotmart-hottok': HOTTOK });
  assert.equal((await r.json()).duplicate, true);
  assert.equal((await exportTable('purchases')).filter((x) => x.transaction_id === tx).length, 1);
});

await step('Reembolso cambia el estado y un APPROVED atrasado no lo revierte', async () => {
  await postJson('/api/webhooks/hotmart', { ...purchase, id: `evt-${RUN}-2`, event: 'PURCHASE_REFUNDED' }, { 'x-hotmart-hottok': HOTTOK });
  await postJson('/api/webhooks/hotmart', { ...purchase, id: `evt-${RUN}-3` }, { 'x-hotmart-hottok': HOTTOK });
  const p = (await exportTable('purchases')).find((x) => x.transaction_id === tx);
  assert.equal(p?.status, 'REFUNDED');
});

await step('Carrito abandonado se registra como evento', async () => {
  const ab = JSON.parse(readFileSync(new URL('../tests/fixtures/hotmart-abandoned.json', import.meta.url)));
  const r = await postJson('/api/webhooks/hotmart', { ...ab, id: `evt-${RUN}-ab` }, { 'x-hotmart-hottok': HOTTOK });
  assert.equal(r.status, 200);
  assert.ok((await exportTable('events')).some((e) => e.type === 'cart_abandoned'));
});

await step('Estadísticas y embudo por fuente', async () => {
  const s = await (await admin('/api/admin/stats')).json();
  assert.ok(s.totals.leads_total >= 1);
  const funnel = await exportTable('funnel');
  assert.ok(funnel.some((f) => f.source === 'linkedin' && Number(f.leads) >= 1));
});

await step('Resync responde aunque Brevo no esté configurado', async () => {
  const r = await admin('/api/admin/resync', { method: 'POST' });
  assert.equal(r.status, 200);
});

await step('Track ignora tipos de evento no permitidos', async () => {
  assert.equal((await postJson('/api/track', { type: 'hack', anon_id: 'abc123' })).status, 204);
});

const failed = results.filter((r) => r[0] === '✘').length;
console.log(`\n${results.length - failed}/${results.length} pruebas OK`);
process.exit(failed ? 1 : 0);

// Lógica del panel /admin. Todo el texto que viene del API se inserta con textContent:
// las fuentes (UTM) las escribe cualquier visitante, así que nunca se tratan como HTML.

const KEY = 'ra_admin_token';
const nf = new Intl.NumberFormat('es-CO');

interface Totals {
  leads_total: number;
  leads_7d: number;
  checkout_clickers: number;
  buyers: number;
  buyers_7d: number;
  refunds: number;
  carts_abandoned: number;
  leads_pending_brevo: number;
}
interface FunnelRow {
  source: string;
  leads: number;
  checkout_clicks: number;
  buyers: number;
  pct_click_a_compra: number | null;
  pct_lead_a_compra: number | null;
}
export interface Stats {
  totals: Totals;
  revenue: { currency: string | null; total: number | null }[];
  funnel: FunnelRow[];
  generated_at: string;
}

const storage = {
  get(): string {
    try {
      return sessionStorage.getItem(KEY) ?? '';
    } catch {
      return '';
    }
  },
  set(v: string) {
    try {
      sessionStorage.setItem(KEY, v);
    } catch {
      /* modo privado: el token vive solo en memoria */
    }
  },
  clear() {
    try {
      sessionStorage.removeItem(KEY);
    } catch {
      /* nada que borrar */
    }
  },
};

export function formatMoney(total: number | null, currency: string | null): string {
  const value = total ?? 0;
  const code = (currency ?? '').toUpperCase();
  try {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: code || 'USD', maximumFractionDigits: 0 }).format(value);
  } catch {
    return `${code} ${nf.format(Math.round(value))}`.trim();
  }
}

export function pct(part: number, whole: number): string {
  if (!whole) return '—';
  return `${(Math.round((1000 * part) / whole) / 10).toLocaleString('es-CO')}%`;
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className = '', text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;

function kpi(label: string, value: string, note = '', warn = false): HTMLElement {
  const box = el('div', `rounded-2xl border bg-white p-4 ${warn ? 'border-amber-300' : 'border-line'}`);
  box.append(el('dt', 'text-sm font-semibold text-muted', label));
  box.append(el('dd', 'mt-1 text-3xl font-black tracking-tight', value));
  if (note) {
    const n = el('dd', `mt-1 text-xs font-semibold ${warn ? 'text-amber-800' : 'text-muted'}`, warn ? `⚠ ${note}` : note);
    box.append(n);
  }
  return box;
}

function render(s: Stats, goal: number) {
  const t = s.totals;

  // Cifra principal
  $('hero-buyers').textContent = nf.format(t.buyers);
  const progress = goal ? Math.min(100, (100 * t.buyers) / goal) : 0;
  $('goal-fill').style.width = `${progress}%`;
  $('goal-meter').setAttribute('aria-valuenow', String(t.buyers));
  $('goal-pct').textContent = `${(Math.round(progress * 10) / 10).toLocaleString('es-CO')}%`;

  const revenue = $('revenue');
  revenue.replaceChildren();
  const rows = s.revenue.filter((r) => r.total);
  if (!rows.length) revenue.append(el('li', '', formatMoney(0, 'USD')));
  for (const r of rows) revenue.append(el('li', '', formatMoney(r.total, r.currency)));

  // Indicadores
  const kpis = $('kpis');
  kpis.replaceChildren(
    kpi('Leads totales', nf.format(t.leads_total), `${nf.format(t.leads_7d)} en los últimos 7 días`),
    kpi('Compradores (7 días)', nf.format(t.buyers_7d)),
    kpi('Lead → compra', pct(t.buyers, t.leads_total), 'Compradores / leads, total'),
    kpi('Clic en comprar', nf.format(t.checkout_clickers), 'Personas únicas que fueron al checkout'),
    kpi('Clic → compra', pct(t.buyers, t.checkout_clickers), 'Conversión del checkout'),
    kpi('Carritos abandonados', nf.format(t.carts_abandoned)),
    kpi('Reembolsos y contracargos', nf.format(t.refunds), t.buyers + t.refunds ? `${pct(t.refunds, t.buyers + t.refunds)} de las compras` : ''),
    kpi(
      'Pendientes de Brevo',
      nf.format(t.leads_pending_brevo),
      t.leads_pending_brevo ? 'Pendientes: usa "Reintentar ahora"' : 'Todo sincronizado',
      t.leads_pending_brevo > 0,
    ),
  );

  // Embudo por fuente
  const body = $('funnel');
  body.replaceChildren();
  if (!s.funnel.length) {
    const tr = el('tr');
    const td = el('td', 'px-4 py-6 text-center text-muted', 'Todavía no hay datos. Comparte tu link de /gratis con UTM y vuelve en un rato.');
    td.colSpan = 6;
    tr.append(td);
    body.append(tr);
  }
  const maxLeads = Math.max(1, ...s.funnel.map((r) => r.leads));
  for (const r of s.funnel) {
    const tr = el('tr', 'border-b border-line last:border-0');
    tr.append(el('th', 'px-4 py-3 font-semibold', r.source));
    const leads = el('td', 'px-4 py-3');
    const wrap = el('div', 'flex items-center gap-3');
    const track = el('div', 'h-2 w-24 shrink-0 rounded-full bg-brand-soft');
    const bar = el('div', 'h-2 rounded-full bg-brand');
    bar.style.width = `${Math.max(r.leads ? 4 : 0, (100 * r.leads) / maxLeads)}%`;
    track.append(bar);
    track.setAttribute('aria-hidden', 'true');
    wrap.append(track, el('span', '', nf.format(r.leads)));
    leads.append(wrap);
    tr.append(leads);
    tr.append(el('td', 'px-4 py-3 text-right', nf.format(r.checkout_clicks)));
    tr.append(el('td', 'px-4 py-3 text-right font-bold', nf.format(r.buyers)));
    tr.append(el('td', 'px-4 py-3 text-right', r.pct_click_a_compra == null ? '—' : `${r.pct_click_a_compra.toLocaleString('es-CO')}%`));
    tr.append(el('td', 'px-4 py-3 text-right', r.pct_lead_a_compra == null ? '—' : `${r.pct_lead_a_compra.toLocaleString('es-CO')}%`));
    body.append(tr);
  }

  $('updated-at').textContent = new Date(s.generated_at).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });
}

export function initAdmin() {
  const main = $('contenido');
  const goal = Number(main.dataset.goal) || 0;
  const login = $('login');
  const panel = $('panel');
  const form = $<HTMLFormElement>('login-form');
  const input = $<HTMLInputElement>('admin-token');
  const error = $('login-error');
  let token = storage.get();

  const api = (path: string, init: RequestInit = {}) =>
    fetch(`/api/admin/${path}`, { ...init, headers: { authorization: `Bearer ${token}`, ...(init.headers ?? {}) }, cache: 'no-store' });

  function showLogin(message = '') {
    panel.hidden = true;
    login.hidden = false;
    error.textContent = message;
    input.focus();
  }

  async function load() {
    try {
      const r = await api('stats');
      if (r.status === 401) {
        storage.clear();
        token = '';
        return showLogin('Token incorrecto. Revisa el ADMIN_TOKEN configurado en Cloudflare.');
      }
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      render((await r.json()) as Stats, goal);
      login.hidden = true;
      panel.hidden = false;
    } catch (e) {
      showLogin(`No se pudo cargar el panel (${(e as Error).message}). Intenta de nuevo.`);
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    token = input.value.trim();
    storage.set(token);
    input.value = '';
    error.textContent = '';
    load();
  });

  $('refresh').addEventListener('click', load);
  $('logout').addEventListener('click', () => {
    storage.clear();
    token = '';
    showLogin();
  });

  document.querySelectorAll<HTMLButtonElement>('[data-csv]').forEach((btn) =>
    btn.addEventListener('click', async () => {
      const table = btn.dataset.csv!;
      btn.disabled = true;
      try {
        const r = await api(`export.csv?table=${encodeURIComponent(table)}`);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const url = URL.createObjectURL(await r.blob());
        const a = el('a');
        a.href = url;
        a.download = `${table}-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.append(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } catch (e) {
        alert(`No se pudo descargar: ${(e as Error).message}`);
      } finally {
        btn.disabled = false;
      }
    }),
  );

  const resyncBtn = $<HTMLButtonElement>('resync');
  const resyncOut = $('resync-result');
  resyncBtn.addEventListener('click', async () => {
    resyncBtn.disabled = true;
    resyncOut.textContent = 'Sincronizando…';
    try {
      const r = await api('resync', { method: 'POST' });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const d = (await r.json()) as { leads: { attempted: number; ok: number }; purchases: { attempted: number; ok: number } };
      resyncOut.textContent = `Leads: ${d.leads.ok} de ${d.leads.attempted} · Compras: ${d.purchases.ok} de ${d.purchases.attempted}.`;
      load();
    } catch (e) {
      resyncOut.textContent = `Error: ${(e as Error).message}`;
    } finally {
      resyncBtn.disabled = false;
    }
  });

  if (token) load();
  else showLogin();
}

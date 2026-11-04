// Atribución y medición en el navegador (sin cookies de terceros).
// - Guarda la primera fuente (UTM) y un id anónimo en localStorage.
// - Decora los botones de compra con src/sck/email/name para Hotmart.
// - Registra el clic en "comprar" con sendBeacon a /api/track.
import { buildCheckoutUrl } from '../lib/checkout';

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;
type Attribution = Partial<Record<(typeof UTM_KEYS)[number] | 'referrer' | 'landing_path', string>>;

function store(kind: 'local' | 'session') {
  try {
    const s = kind === 'local' ? window.localStorage : window.sessionStorage;
    const k = '__ra_test__';
    s.setItem(k, '1');
    s.removeItem(k);
    return s;
  } catch {
    return null;
  }
}

const local = store('local');
const session = store('session');

function readJSON<T>(s: Storage | null, key: string): T | null {
  if (!s) return null;
  try {
    const raw = s.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJSON(s: Storage | null, key: string, value: unknown) {
  if (!s) return;
  try {
    s.setItem(key, JSON.stringify(value));
  } catch {
    /* almacenamiento lleno o bloqueado */
  }
}

function newId(): string {
  try {
    return crypto.randomUUID().replace(/-/g, '').slice(0, 20);
  } catch {
    return Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
  }
}

export function getAnonId(): string {
  let id = local?.getItem('ra_anon') ?? null;
  if (!id) {
    id = newId();
    try { local?.setItem('ra_anon', id); } catch { /* sin almacenamiento */ }
  }
  return id;
}

function captureAttribution(): Attribution {
  const params = new URLSearchParams(window.location.search);
  const current: Attribution = {};
  for (const k of UTM_KEYS) {
    const v = params.get(k);
    if (v) current[k] = v.slice(0, 100);
  }
  // Atajos comunes: ?ref=linkedin o ?src=tiktok
  const shortcut = params.get('ref') || params.get('src');
  if (!current.utm_source && shortcut) current.utm_source = shortcut.slice(0, 100);

  const ref = document.referrer && !document.referrer.startsWith(window.location.origin) ? document.referrer.slice(0, 300) : '';
  const first = readJSON<Attribution>(local, 'ra_first');
  if (!first) {
    const initial: Attribution = { ...current, referrer: ref, landing_path: window.location.pathname };
    writeJSON(local, 'ra_first', initial);
    return initial;
  }
  return first;
}

export function getAttribution(): Attribution {
  return readJSON<Attribution>(local, 'ra_first') ?? {};
}

export function getLead(): { name?: string; email?: string } {
  return readJSON(session, 'ra_lead') ?? {};
}

export function saveLead(lead: { name: string; email: string }) {
  writeJSON(session, 'ra_lead', lead);
}

function decorateCheckoutLinks() {
  const attribution = getAttribution();
  const lead = getLead();
  const anon = getAnonId();
  document.querySelectorAll<HTMLAnchorElement>('a[data-checkout]').forEach((a) => {
    const base = a.dataset.base || a.href;
    a.dataset.base = base;
    a.href = buildCheckoutUrl(base, {
      src: attribution.utm_source || 'directo',
      sck: anon,
      email: lead.email,
      name: lead.name,
    });
  });
}

export function sendEvent(type: string, extra: Record<string, string> = {}) {
  const body = JSON.stringify({
    type,
    anon_id: getAnonId(),
    path: window.location.pathname,
    ...getAttribution(),
    ...extra,
  });
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/track', new Blob([body], { type: 'application/json' }));
      return;
    }
  } catch {
    /* continúa con fetch */
  }
  fetch('/api/track', { method: 'POST', body, headers: { 'content-type': 'application/json' }, keepalive: true }).catch(() => {});
}

function init() {
  captureAttribution();
  getAnonId();
  decorateCheckoutLinks();
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement | null;
    const a = target?.closest?.('a[data-checkout]') as HTMLAnchorElement | null;
    if (a) {
      decorateCheckoutLinks();
      sendEvent('checkout_click', { placement: a.dataset.checkout || '' });
      const w = window as unknown as { fbq?: (...args: unknown[]) => void };
      w.fbq?.('track', 'InitiateCheckout', { value: Number(a.dataset.price || 0), currency: 'USD' });
      return;
    }
    const d = target?.closest?.('a[data-download]') as HTMLAnchorElement | null;
    if (d) sendEvent('download_click', { file: d.dataset.download || '' });
  });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();

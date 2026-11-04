// Validación y limpieza de los datos del formulario.

export const EMAIL_RE = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/;

// Dominios de correo desechable más comunes (bloquearlos protege la reputación de envío).
const DISPOSABLE = new Set([
  'mailinator.com', 'guerrillamail.com', '10minutemail.com', 'tempmail.com', 'temp-mail.org', 'yopmail.com',
  'trashmail.com', 'getnada.com', 'sharklasers.com', 'dispostable.com', 'maildrop.cc', 'throwawaymail.com',
]);

const CONTROL = /[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u2028\u2029]/g;

export function cleanText(v: unknown, max: number): string {
  if (typeof v !== 'string') return '';
  return v.replace(CONTROL, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}

export function normalizeEmail(v: unknown): string {
  return cleanText(v, 254).toLowerCase();
}

export function isValidEmail(email: string): boolean {
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) return false;
  const [local, domain] = email.split('@');
  if (!local || local.length > 64 || !domain) return false;
  return !DISPOSABLE.has(domain);
}

export type LeadErrorCode = 'name' | 'email' | 'consent';

export interface LeadInput {
  email: string;
  name: string;
  anonId: string | null;
  formId: string;
  utm: { source: string | null; medium: string | null; campaign: string | null; content: string | null; term: string | null };
  referrer: string | null;
  landingPath: string | null;
}

const opt = (v: unknown, max = 100): string | null => cleanText(v, max) || null;

export function parseLeadInput(raw: Record<string, string>): { ok: true; data: LeadInput } | { ok: false; error: LeadErrorCode } {
  const name = cleanText(raw.name, 80);
  const email = normalizeEmail(raw.email);
  const consent = ['on', 'true', '1', 'yes', 'si', 'sí'].includes((raw.consent ?? '').toLowerCase());

  if (name.length < 2 || /https?:\/\/|www\.|<|>/i.test(name)) return { ok: false, error: 'name' };
  if (!isValidEmail(email)) return { ok: false, error: 'email' };
  if (!consent) return { ok: false, error: 'consent' };

  const anon = cleanText(raw.anon_id, 40);
  return {
    ok: true,
    data: {
      email,
      name,
      anonId: /^[a-z0-9]{6,40}$/i.test(anon) ? anon : null,
      formId: cleanText(raw.form_id, 40).replace(/[^\w-]/g, '') || 'desconocido',
      utm: {
        source: opt(raw.utm_source),
        medium: opt(raw.utm_medium),
        campaign: opt(raw.utm_campaign),
        content: opt(raw.utm_content),
        term: opt(raw.utm_term),
      },
      referrer: opt(raw.referrer, 300),
      landingPath: opt(raw.landing_path, 200),
    },
  };
}

export const EVENT_TYPES = new Set(['checkout_click', 'download_click', 'page_view']);

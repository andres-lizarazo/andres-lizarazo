// Construye el link de pago de Hotmart con datos de atribución y prellenado.
// src = fuente del tráfico (utm_source), sck = id anónimo del visitante (para unir compra con lead).
// email/name prellenan el checkout si la persona ya se registró (verifica en Hotmart que sigan soportados).

export interface CheckoutParams {
  src?: string | null;
  sck?: string | null;
  email?: string | null;
  name?: string | null;
}

const clean = (v: string | null | undefined, max = 100): string =>
  (v ?? '').toString().replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, max);

export function buildCheckoutUrl(base: string, params: CheckoutParams): string {
  let url: URL;
  try {
    url = new URL(base);
  } catch {
    return base;
  }
  const src = clean(params.src, 60).replace(/[^\w.\-|]/g, '_');
  const sck = clean(params.sck, 60).replace(/[^\w.\-|]/g, '_');
  const email = clean(params.email, 254);
  const name = clean(params.name, 80);
  if (src) url.searchParams.set('src', src);
  if (sck) url.searchParams.set('sck', sck);
  if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) url.searchParams.set('email', email);
  if (name) url.searchParams.set('name', name);
  return url.toString();
}

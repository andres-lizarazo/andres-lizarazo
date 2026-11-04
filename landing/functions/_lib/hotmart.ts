// Normaliza el webhook 2.0.0 de Hotmart a un formato propio.
// Documentación: https://developers.hotmart.com/docs/es/2.0.0/webhook/purchase-webhook/
import { normalizeEmail, cleanText } from './validate';

export type HotmartKind = 'paid' | 'revoked' | 'unpaid' | 'pending' | 'abandoned' | 'ignored';

interface EventInfo {
  kind: HotmartKind;
  status: string;
  rank: number;
}

// rank: un evento solo puede subir el estado de una compra, nunca bajarlo (los webhooks llegan desordenados).
const EVENTS: Record<string, EventInfo> = {
  PURCHASE_BILLET_PRINTED: { kind: 'pending', status: 'BILLET_PRINTED', rank: 1 },
  PURCHASE_DELAYED: { kind: 'pending', status: 'DELAYED', rank: 1 },
  PURCHASE_EXPIRED: { kind: 'unpaid', status: 'EXPIRED', rank: 2 },
  PURCHASE_CANCELED: { kind: 'unpaid', status: 'CANCELED', rank: 2 },
  PURCHASE_APPROVED: { kind: 'paid', status: 'APPROVED', rank: 3 },
  PURCHASE_PROTEST: { kind: 'paid', status: 'PROTEST', rank: 4 },
  PURCHASE_COMPLETE: { kind: 'paid', status: 'COMPLETE', rank: 4 },
  PURCHASE_REFUNDED: { kind: 'revoked', status: 'REFUNDED', rank: 5 },
  PURCHASE_CHARGEBACK: { kind: 'revoked', status: 'CHARGEBACK', rank: 5 },
  PURCHASE_OUT_OF_SHOPPING_CART: { kind: 'abandoned', status: 'ABANDONED', rank: 0 },
};

export const PAID_STATUSES = ['APPROVED', 'COMPLETE', 'PROTEST'] as const;

export interface HotmartEvent {
  eventId: string;
  event: string;
  kind: HotmartKind;
  status: string;
  rank: number;
  transactionId: string | null;
  email: string | null;
  name: string | null;
  productId: string | null;
  productName: string | null;
  offerCode: string | null;
  priceValue: number | null;
  priceCurrency: string | null;
  paymentType: string | null;
  src: string | null;
  sck: string | null;
  approvedAt: string | null;
}

type Obj = Record<string, unknown>;
const obj = (v: unknown): Obj => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Obj) : {});
const str = (v: unknown, max = 200): string | null => {
  if (typeof v === 'number') return String(v);
  const s = cleanText(v, max);
  return s || null;
};
const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v)) ? Number(v) : null);
const isoFromMs = (v: unknown): string | null => {
  const n = num(v);
  if (n === null || n <= 0) return null;
  const d = new Date(n > 1e12 ? n : n * 1000);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

export function parseHotmartEvent(payload: unknown): HotmartEvent | null {
  const root = obj(payload);
  const event = str(root.event, 60)?.toUpperCase();
  if (!event) return null;
  const info = EVENTS[event] ?? { kind: 'ignored' as const, status: event, rank: 0 };

  const data = obj(root.data);
  const purchase = obj(data.purchase);
  const buyer = obj(data.buyer);
  const product = obj(data.product);
  const price = obj(purchase.price);
  const fullPrice = obj(purchase.full_price);
  const payment = obj(purchase.payment);
  const origin = obj(purchase.origin);
  const offer = obj(purchase.offer);

  const transactionId = str(purchase.transaction, 80);
  const emailRaw = buyer.email ?? obj(data.subscriber).email;
  const email = emailRaw ? normalizeEmail(emailRaw) || null : null;

  const eventId =
    str(root.id, 120) ??
    `${event}:${transactionId ?? email ?? 'sin-id'}:${str(root.creation_date, 20) ?? ''}`;

  return {
    eventId,
    event,
    kind: info.kind,
    status: info.status,
    rank: info.rank,
    transactionId,
    email,
    name: str(buyer.name, 120),
    productId: str(product.id, 40),
    productName: str(product.name, 200),
    offerCode: str(offer.code, 60),
    priceValue: num(price.value) ?? num(fullPrice.value),
    priceCurrency: str(price.currency_value, 10) ?? str(fullPrice.currency_value, 10),
    paymentType: str(payment.type, 40),
    src: str(origin.src, 100),
    sck: str(origin.sck, 100),
    approvedAt: isoFromMs(purchase.approved_date),
  };
}

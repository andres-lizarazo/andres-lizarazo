import { describe, expect, it } from 'vitest';
import { parseHotmartEvent } from '../functions/_lib/hotmart';
import approved from './fixtures/hotmart-approved.json';
import abandoned from './fixtures/hotmart-abandoned.json';

describe('parseHotmartEvent', () => {
  it('normaliza una compra aprobada', () => {
    const ev = parseHotmartEvent(approved)!;
    expect(ev.kind).toBe('paid');
    expect(ev.status).toBe('APPROVED');
    expect(ev.rank).toBe(3);
    expect(ev.transactionId).toBe('HP1234567890');
    expect(ev.email).toBe('comprador.prueba@example.com');
    expect(ev.name).toBe('Laura Gómez');
    expect(ev.priceValue).toBe(19);
    expect(ev.priceCurrency).toBe('USD');
    expect(ev.src).toBe('linkedin');
    expect(ev.sck).toBe('abc123def456');
    expect(ev.productId).toBe('4321098');
    expect(ev.approvedAt).toBe(new Date(1762214400000).toISOString());
    expect(ev.eventId).toBe(approved.id);
  });

  it('detecta carrito abandonado', () => {
    const ev = parseHotmartEvent(abandoned)!;
    expect(ev.kind).toBe('abandoned');
    expect(ev.email).toBe('lead@example.com');
    expect(ev.transactionId).toBe(null);
  });

  it('reembolso tiene más prioridad que aprobado', () => {
    const refund = parseHotmartEvent({ ...approved, id: 'x', event: 'PURCHASE_REFUNDED' })!;
    expect(refund.kind).toBe('revoked');
    expect(refund.rank).toBeGreaterThan(parseHotmartEvent(approved)!.rank);
  });

  it('ignora eventos desconocidos sin romperse', () => {
    const ev = parseHotmartEvent({ event: 'SUBSCRIPTION_CANCELLATION', data: {} })!;
    expect(ev.kind).toBe('ignored');
    expect(ev.eventId).toContain('SUBSCRIPTION_CANCELLATION');
  });

  it('devuelve null si no hay evento', () => {
    expect(parseHotmartEvent({})).toBe(null);
    expect(parseHotmartEvent('texto')).toBe(null);
  });
});

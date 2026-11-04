import { describe, expect, it, vi } from 'vitest';
import { toCsv, csvCell } from '../functions/_lib/csv';
import { timingSafeEqual, sha256Hex } from '../functions/_lib/http';
import { upsertContact, updateContact } from '../functions/_lib/brevo';
import { buildCheckoutUrl } from '../src/lib/checkout';
import type { Env } from '../functions/_lib/types';

describe('csv', () => {
  it('neutraliza fórmulas y escapa comillas', () => {
    expect(csvCell('=HYPERLINK("x")')).toBe(`"'=HYPERLINK(""x"")"`);
    expect(csvCell('+57 300')).toBe("'+57 300");
    expect(csvCell('a,b')).toBe('"a,b"');
    expect(csvCell(null)).toBe('');
  });
  it('genera CSV con BOM y encabezados', () => {
    const out = toCsv([{ a: 1, b: 'ñ' }]);
    expect(out.startsWith('﻿a,b\r\n1,ñ')).toBe(true);
  });
});

describe('http', () => {
  it('timingSafeEqual', () => {
    expect(timingSafeEqual('secreto', 'secreto')).toBe(true);
    expect(timingSafeEqual('secreto', 'secretO')).toBe(false);
    expect(timingSafeEqual('', 'x')).toBe(false);
  });
  it('sha256Hex', async () => {
    expect(await sha256Hex('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  });
});

describe('checkout', () => {
  it('agrega src, sck y prellenado', () => {
    const url = new URL(buildCheckoutUrl('https://pay.hotmart.com/X123?off=abc', { src: 'linked in', sck: 'abc123', email: 'a@b.co', name: 'Ana' }));
    expect(url.searchParams.get('off')).toBe('abc');
    expect(url.searchParams.get('src')).toBe('linked_in');
    expect(url.searchParams.get('sck')).toBe('abc123');
    expect(url.searchParams.get('email')).toBe('a@b.co');
    expect(url.searchParams.get('name')).toBe('Ana');
  });
  it('ignora email inválido y no rompe con base inválida', () => {
    expect(new URL(buildCheckoutUrl('https://pay.hotmart.com/X', { email: 'malo' })).searchParams.has('email')).toBe(false);
    expect(buildCheckoutUrl('no-url', { src: 'x' })).toBe('no-url');
  });
});

describe('brevo', () => {
  const env = { BREVO_API_KEY: 'k' } as Env;

  it('no llama a la API si no hay API key', async () => {
    const f = vi.fn();
    const r = await upsertContact({} as Env, { email: 'a@b.co', attributes: {}, listIds: [] }, f as unknown as typeof fetch);
    expect(r.ok).toBe(false);
    expect(f).not.toHaveBeenCalled();
  });

  it('reintenta errores 5xx y luego tiene éxito', async () => {
    const f = vi.fn()
      .mockResolvedValueOnce(new Response('err', { status: 502 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    const r = await upsertContact(env, { email: 'a@b.co', attributes: { FIRSTNAME: 'Ana', X: null }, listIds: [3, null] }, f as unknown as typeof fetch);
    expect(r.ok).toBe(true);
    expect(f).toHaveBeenCalledTimes(2);
    const body = JSON.parse(f.mock.calls[0][1].body);
    expect(body).toEqual({ email: 'a@b.co', attributes: { FIRSTNAME: 'Ana' }, listIds: [3], updateEnabled: true });
  });

  it('no reintenta errores 4xx', async () => {
    const f = vi.fn().mockResolvedValue(new Response('{"code":"invalid_parameter"}', { status: 400 }));
    const r = await upsertContact(env, { email: 'a@b.co', attributes: {}, listIds: [] }, f as unknown as typeof fetch);
    expect(r.ok).toBe(false);
    expect(r.status).toBe(400);
    expect(f).toHaveBeenCalledTimes(1);
  });

  it('updateContact sin cambios no llama a la API', async () => {
    const f = vi.fn();
    expect((await updateContact(env, 'a@b.co', { unlinkListIds: [null] }, f as unknown as typeof fetch)).ok).toBe(true);
    expect(f).not.toHaveBeenCalled();
  });
});

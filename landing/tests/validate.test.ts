import { describe, expect, it } from 'vitest';
import { isValidEmail, parseLeadInput, cleanText } from '../functions/_lib/validate';

const base = { name: 'Ana María', email: 'Ana@Gmail.com ', consent: 'on', form_id: 'gratis', anon_id: 'abc123def456', utm_source: 'linkedin' };

describe('parseLeadInput', () => {
  it('acepta un lead válido y normaliza el email', () => {
    const r = parseLeadInput(base);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.email).toBe('ana@gmail.com');
      expect(r.data.name).toBe('Ana María');
      expect(r.data.utm.source).toBe('linkedin');
      expect(r.data.anonId).toBe('abc123def456');
    }
  });

  it('rechaza sin autorización de datos', () => {
    expect(parseLeadInput({ ...base, consent: '' })).toEqual({ ok: false, error: 'consent' });
  });

  it('rechaza nombres vacíos o con links', () => {
    expect(parseLeadInput({ ...base, name: ' ' })).toEqual({ ok: false, error: 'name' });
    expect(parseLeadInput({ ...base, name: 'Gana dinero https://spam.io' })).toEqual({ ok: false, error: 'name' });
  });

  it('rechaza emails inválidos o desechables', () => {
    expect(parseLeadInput({ ...base, email: 'no-es-email' })).toEqual({ ok: false, error: 'email' });
    expect(parseLeadInput({ ...base, email: 'x@mailinator.com' })).toEqual({ ok: false, error: 'email' });
  });

  it('descarta anon_id con formato raro', () => {
    const r = parseLeadInput({ ...base, anon_id: '<script>' });
    expect(r.ok && r.data.anonId).toBe(null);
  });
});

describe('helpers', () => {
  it('cleanText quita caracteres de control y recorta', () => {
    expect(cleanText('  hola\u0000 mundo  ', 20)).toBe('hola mundo');
    expect(cleanText('a'.repeat(50), 10)).toHaveLength(10);
    expect(cleanText(42, 10)).toBe('');
  });
  it('isValidEmail', () => {
    expect(isValidEmail('persona@empresa.com.co')).toBe(true);
    expect(isValidEmail('persona@empresa')).toBe(false);
  });
});

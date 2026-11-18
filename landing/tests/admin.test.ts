import { describe, expect, it } from 'vitest';
import { formatMoney, pct } from '../src/scripts/admin';

describe('panel /admin: formatos', () => {
  it('porcentaje con un decimal y sin dividir por cero', () => {
    expect(pct(1, 3)).toBe('33,3%');
    expect(pct(5, 5)).toBe('100%');
    expect(pct(3, 0)).toBe('—');
  });

  it('dinero por moneda, con respaldo si el código no es válido', () => {
    expect(formatMoney(19, 'USD')).toMatch(/19/);
    expect(formatMoney(19, 'USD')).toMatch(/US\$|USD|\$/);
    expect(formatMoney(null, 'usd')).toMatch(/0/);
    expect(formatMoney(1234.4, 'NO-VALIDA')).toBe('NO-VALIDA 1.234');
    expect(formatMoney(10, null)).toMatch(/10/);
  });
});

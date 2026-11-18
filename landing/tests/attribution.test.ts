import { describe, expect, it } from 'vitest';
import { sourceFromReferrer } from '../src/lib/attribution';

describe('sourceFromReferrer', () => {
  it('reconoce buscadores como orgánico', () => {
    expect(sourceFromReferrer('https://www.google.com/')).toEqual({ source: 'google', medium: 'organico' });
    expect(sourceFromReferrer('https://www.google.com.co/search?q=sql')).toEqual({ source: 'google', medium: 'organico' });
    expect(sourceFromReferrer('https://www.bing.com/search?q=x')?.source).toBe('bing');
    expect(sourceFromReferrer('https://duckduckgo.com/')?.medium).toBe('organico');
  });
  it('reconoce redes sociales', () => {
    expect(sourceFromReferrer('https://www.linkedin.com/feed/')).toEqual({ source: 'linkedin', medium: 'social' });
    expect(sourceFromReferrer('https://lnkd.in/abc')?.source).toBe('linkedin');
    expect(sourceFromReferrer('https://l.instagram.com/?u=x')?.source).toBe('instagram');
    expect(sourceFromReferrer('https://t.co/xyz')?.source).toBe('x');
    expect(sourceFromReferrer('https://m.youtube.com/watch?v=1')?.source).toBe('youtube');
    expect(sourceFromReferrer('https://www.tiktok.com/@a')?.source).toBe('tiktok');
  });
  it('ignora dominios desconocidos, el propio y valores inválidos', () => {
    expect(sourceFromReferrer('https://blog.cualquiera.com/post')).toBe(null);
    expect(sourceFromReferrer('https://rutaanalista.com/blog', 'rutaanalista.com')).toBe(null);
    expect(sourceFromReferrer('no es url')).toBe(null);
    expect(sourceFromReferrer('')).toBe(null);
    expect(sourceFromReferrer(null)).toBe(null);
  });
  it('no confunde dominios parecidos', () => {
    expect(sourceFromReferrer('https://notgoogle.com/')).toBe(null);
    expect(sourceFromReferrer('https://googleapis.com.evil.io/')).toBe(null);
  });
});

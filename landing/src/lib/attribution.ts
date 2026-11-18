// Deduce la fuente del tráfico a partir del referrer cuando el enlace no trae UTM.
// Así el embudo distingue Google (orgánico) y redes sociales del tráfico directo.

export interface ReferrerSource {
  source: string;
  medium: 'organico' | 'social';
}

const RULES: { test: RegExp; source: string; medium: ReferrerSource['medium'] }[] = [
  { test: /(^|\.)google\.[a-z.]+$/, source: 'google', medium: 'organico' },
  { test: /(^|\.)bing\.com$/, source: 'bing', medium: 'organico' },
  { test: /(^|\.)duckduckgo\.com$/, source: 'duckduckgo', medium: 'organico' },
  { test: /(^|\.)search\.yahoo\.com$|(^|\.)yahoo\.com$/, source: 'yahoo', medium: 'organico' },
  { test: /(^|\.)ecosia\.org$/, source: 'ecosia', medium: 'organico' },
  { test: /(^|\.)linkedin\.com$|(^|\.)lnkd\.in$/, source: 'linkedin', medium: 'social' },
  { test: /(^|\.)instagram\.com$/, source: 'instagram', medium: 'social' },
  { test: /(^|\.)facebook\.com$|(^|\.)fb\.me$/, source: 'facebook', medium: 'social' },
  { test: /(^|\.)t\.co$|(^|\.)twitter\.com$|(^|\.)x\.com$/, source: 'x', medium: 'social' },
  { test: /(^|\.)youtube\.com$|(^|\.)youtu\.be$/, source: 'youtube', medium: 'social' },
  { test: /(^|\.)tiktok\.com$/, source: 'tiktok', medium: 'social' },
  { test: /(^|\.)whatsapp\.com$|(^|\.)wa\.me$/, source: 'whatsapp', medium: 'social' },
];

/** Devuelve la fuente conocida del referrer, o null si es desconocido, propio o inválido. */
export function sourceFromReferrer(referrer: string | null | undefined, ownHost?: string): ReferrerSource | null {
  if (!referrer) return null;
  let host: string;
  try {
    host = new URL(referrer).hostname.toLowerCase();
  } catch {
    return null;
  }
  if (ownHost && host === ownHost.toLowerCase()) return null;
  for (const r of RULES) if (r.test.test(host)) return { source: r.source, medium: r.medium };
  return null;
}

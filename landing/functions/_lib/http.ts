export function json(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers },
  });
}

export function redirect(location: string, status = 303): Response {
  return new Response(null, { status, headers: { location, 'cache-control': 'no-store' } });
}

/** Comparación en tiempo constante (evita ataques de temporización al validar tokens). */
export function timingSafeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const ab = enc.encode(a);
  const bb = enc.encode(b);
  const len = Math.max(ab.length, bb.length);
  let diff = ab.length ^ bb.length;
  for (let i = 0; i < len; i++) diff |= (ab[i] ?? 0) ^ (bb[i] ?? 0);
  return diff === 0;
}

export async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function clientIp(request: Request): string {
  return request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '0.0.0.0';
}

export function country(request: Request): string | null {
  const cf = (request as unknown as { cf?: { country?: string } }).cf;
  return cf?.country ?? null;
}

/** Lee el cuerpo como JSON o como formulario. Devuelve null si es inválido o muy grande. */
export async function readBody(request: Request, maxBytes = 16_384): Promise<Record<string, string> | null> {
  const text = await request.text();
  if (text.length > maxBytes) return null;
  const type = request.headers.get('content-type') || '';
  try {
    if (type.includes('application/json')) {
      const obj = JSON.parse(text) as unknown;
      if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return null;
      const out: Record<string, string> = {};
      for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
        if (typeof v === 'string') out[k] = v;
        else if (typeof v === 'number' || typeof v === 'boolean') out[k] = String(v);
      }
      return out;
    }
    const params = new URLSearchParams(text);
    const out: Record<string, string> = {};
    params.forEach((v, k) => (out[k] = v));
    return out;
  } catch {
    return null;
  }
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

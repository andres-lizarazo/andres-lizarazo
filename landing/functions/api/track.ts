// POST /api/track — registra eventos del embudo (clic en comprar, descargas).
import type { Env } from '../_lib/types';
import { readBody, country } from '../_lib/http';
import { cleanText, EVENT_TYPES } from '../_lib/validate';
import { insertEvent } from '../_lib/db';

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const raw = await readBody(request, 4096);
  const type = cleanText(raw?.type, 40);
  if (!raw || !EVENT_TYPES.has(type)) return new Response(null, { status: 204 });
  const anon = cleanText(raw.anon_id, 40);
  try {
    await insertEvent(env, {
      type,
      anonId: /^[a-z0-9]{6,40}$/i.test(anon) ? anon : null,
      path: cleanText(raw.path, 200) || null,
      utm: {
        source: cleanText(raw.utm_source, 100) || null,
        medium: cleanText(raw.utm_medium, 100) || null,
        campaign: cleanText(raw.utm_campaign, 100) || null,
        content: cleanText(raw.utm_content, 100) || null,
      },
      referrer: cleanText(raw.referrer, 300) || null,
      country: country(request),
    });
  } catch (e) {
    console.error('track_error', (e as Error).message);
  }
  return new Response(null, { status: 204 });
};

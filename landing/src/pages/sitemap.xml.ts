import type { APIRoute } from 'astro';
import { site } from '../config/site';

const pages = ['/', '/gratis', '/privacidad', '/terminos'];

export const GET: APIRoute = () => {
  const urls = pages
    .map((p) => `<url><loc>${new URL(p, site.url).toString().replace(/\/$/, p === '/' ? '/' : '')}</loc></url>`)
    .join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, {
    headers: { 'content-type': 'application/xml' },
  });
};

import type { APIRoute } from 'astro';
import { site } from '../config/site';
import { getPosts } from '../lib/blog';

const pages = ['/', '/gratis', '/blog', '/privacidad', '/terminos'];

export const GET: APIRoute = async () => {
  const posts = await getPosts();
  const entries = [
    ...pages.map((p) => ({ loc: new URL(p, site.url).toString().replace(/\/$/, p === '/' ? '/' : ''), lastmod: null as string | null })),
    ...posts.map((p) => ({ loc: new URL(`/blog/${p.id}`, site.url).toString(), lastmod: (p.data.updated ?? p.data.date).toISOString().slice(0, 10) })),
  ];
  const urls = entries.map((e) => `<url><loc>${e.loc}</loc>${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ''}</url>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, {
    headers: { 'content-type': 'application/xml' },
  });
};

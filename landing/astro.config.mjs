// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Sitio estático: Cloudflare Pages sirve el HTML y las Pages Functions (carpeta /functions) atienden /api/*.
export default defineConfig({
  site: process.env.SITE_URL || 'https://rutaanalista.com',
  output: 'static',
  trailingSlash: 'never',
  build: {
    format: 'file', // /gratis.html -> servido como /gratis (sin barra final)
    inlineStylesheets: 'always', // CSS dentro del HTML: una petición menos antes de pintar
  },
  vite: {
    plugins: [tailwindcss()],
  },
});

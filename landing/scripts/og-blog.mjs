// Genera la imagen para compartir (Open Graph, 1200x630) de cada artículo del blog.
// Uso:  npm run og:blog            -> crea solo las que faltan
//       npm run og:blog -- --all   -> las vuelve a crear todas (por ejemplo, si cambiaste un título)
// Salida: public/og/blog/<slug>.png. Si un artículo no tiene imagen, la página usa /og.png.
// Requiere Playwright (npm i -D playwright && npx playwright install chromium).
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
const ROOT = new URL('..', import.meta.url).pathname;
const BLOG = join(ROOT, 'src/blog');
const OUT = join(ROOT, 'public/og/blog');
const ALL = process.argv.includes('--all');

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

function frontmatter(md) {
  const block = md.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
  const get = (key) => block.match(new RegExp(`^${key}:\\s*"?(.*?)"?\\s*$`, 'm'))?.[1];
  return { title: get('title') ?? '', minutes: get('readingMinutes'), draft: get('draft') === 'true' };
}

// El título largo se corta en el primer paréntesis o dos puntos para que se lea en miniatura.
function shortTitle(title) {
  const cut = title.split(/\s\(|:\s/)[0];
  return cut.length >= 25 ? cut : title;
}

function html({ title, minutes }) {
  const t = shortTitle(title);
  const size = t.length > 70 ? 54 : t.length > 50 ? 62 : 70;
  return `<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;font-family:Inter,ui-sans-serif,system-ui,"Segoe UI",Roboto,Arial,sans-serif;background:#0c1a2e;color:#fff;position:relative;overflow:hidden}
.glow{position:absolute;inset:0;background:radial-gradient(700px 380px at 95% -5%,rgba(15,118,110,.7),transparent 60%),radial-gradient(520px 300px at -5% 110%,rgba(250,204,21,.22),transparent 60%)}
.wrap{position:relative;padding:60px 72px;height:100%;display:flex;flex-direction:column}
.top{display:flex;align-items:center;justify-content:space-between}
.logo{display:flex;align-items:center;gap:14px;font-weight:800;font-size:30px}.logo b{color:#facc15}
.tag{font-size:22px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#facc15}
h1{margin-top:auto;font-size:${size}px;line-height:1.06;font-weight:900;letter-spacing:-.02em;max-width:1000px;text-wrap:balance}
.foot{margin-top:36px;display:flex;gap:14px;align-items:center}
.pill{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.18);padding:10px 18px;border-radius:999px;font-size:22px;font-weight:700;color:#e2e8f0}
.url{margin-left:auto;font-size:24px;font-weight:700;color:#94a3b8}
</style></head><body><div class="glow"></div><div class="wrap">
<div class="top"><div class="logo"><svg width="44" height="44" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#facc15"/><path d="M8 22l5-6 4 3 7-9" fill="none" stroke="#0c1a2e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="24" cy="10" r="2.4" fill="#0c1a2e"/></svg><span>Ruta<b>Analista</b></span></div><span class="tag">Blog</span></div>
<h1>${esc(t)}</h1>
<div class="foot"><span class="pill">Guía práctica${minutes ? ` · ${esc(minutes)} min` : ''}</span><span class="pill">Con ejemplos reales</span><span class="url">rutaanalista.com/blog</span></div>
</div></body></html>`;
}

let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  console.error('Falta Playwright. Instálalo con: npm i -D playwright && npx playwright install chromium');
  process.exit(1);
}

mkdirSync(OUT, { recursive: true });
const posts = readdirSync(BLOG).filter((f) => f.endsWith('.md'));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
let created = 0;
for (const file of posts) {
  const slug = file.replace(/\.md$/, '');
  const target = join(OUT, `${slug}.png`);
  const fm = frontmatter(readFileSync(join(BLOG, file), 'utf8'));
  if (fm.draft || (!ALL && existsSync(target))) continue;
  await page.setContent(html(fm));
  await page.screenshot({ path: target });
  created++;
  console.log(`✔ ${slug}.png`);
}
await browser.close();
console.log(`${created} imagen(es) creada(s) en public/og/blog/`);

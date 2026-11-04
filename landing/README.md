# Ruta Analista: landing + captura de leads + venta del kit

Embudo completo para vender un producto digital de USD 19:

```
Tráfico (LinkedIn, TikTok, YouTube…) ──► /gratis (lead magnet) ──► /gracias (descarga + oferta)
                                     └─► / (página de venta) ──► Hotmart (pago y entrega) ──► /compra-exitosa
Formulario ─► /api/subscribe ─► Cloudflare D1 (base de datos) ─► Brevo (emails automáticos)
Hotmart ─► /api/webhooks/hotmart ─► D1 (compras) ─► Brevo (compradores fuera de la secuencia de venta)
```

| Pieza | Herramienta | Costo |
|---|---|---|
| Sitio | Astro + Tailwind (estático, Lighthouse 100) | Gratis |
| Hosting + API | Cloudflare Pages + Pages Functions | Gratis |
| Base de datos | Cloudflare D1 (SQLite) | Gratis |
| Anti-bots | Cloudflare Turnstile + honeypot + límite por IP | Gratis |
| Email marketing | Brevo (300 emails/día gratis) | Gratis → ~USD 9/mes al crecer |
| Cobro y entrega | Hotmart (PSE, Nequi, tarjetas, PayPal, afiliados) | ~9,9% + USD 0,50 por venta |
| Dominio | Cloudflare Registrar | ~USD 10/año |

## Estructura

```
src/config/site.ts        ← precio, link de Hotmart, bonus, testimonios (empieza aquí)
src/content/es.ts         ← todo el texto de la página de venta
src/content/testimonials.ts
src/components/           ← secciones de la página
src/pages/                ← /, /gratis, /gracias, /compra-exitosa, /privacidad, /terminos
src/scripts/track.ts      ← UTM, id anónimo, link de pago decorado, eventos
functions/api/            ← subscribe, track, webhooks/hotmart, admin (stats, export, resync)
schema.sql                ← tablas de la base de datos
public/descargas/         ← lead magnet gratis (PDF + base SQLite + CSV)
marketing/                ← emails, calendario de contenido, Hotmart, afiliados y plan de lanzamiento
tests/ · scripts/e2e.mjs  ← pruebas
```

> **Importante:** este repositorio es público. **Nunca subas aquí el kit pagado.** Los archivos del kit van solo a Hotmart.

## Despliegue paso a paso (≈ 1 hora)

### 1. Cuentas

Crea cuenta en [Cloudflare](https://dash.cloudflare.com), [Brevo](https://www.brevo.com) y [Hotmart](https://hotmart.com). Compra tu dominio en Cloudflare → Registrar (por ejemplo `rutaanalista.com`; verifica que esté libre).

### 2. Base de datos D1

```bash
cd landing
npm install
npx wrangler login
npx wrangler d1 create ruta-analista-db
```

Copia el `database_id` que te muestra en `wrangler.toml` y crea las tablas:

```bash
npm run db:remote
```

### 3. Cloudflare Pages

1. Dashboard → **Workers & Pages → Create → Pages → Connect to Git**, y elige este repositorio.
2. Rama de producción: la que uses (por ejemplo `main`). **Root directory:** `landing`.
3. Build command: `npm run build`. Output: `dist`.
4. **Variables de entorno** (Settings → Variables and Secrets):

| Nombre | Tipo | Valor |
|---|---|---|
| `PUBLIC_HOTMART_CHECKOUT_URL` | Texto | Link de pago de Hotmart |
| `SITE_URL` | Texto | `https://rutaanalista.com` |
| `PUBLIC_TURNSTILE_SITE_KEY` | Texto | Site key de Turnstile (paso 5) |
| `PUBLIC_CF_ANALYTICS_TOKEN` | Texto | Token de Web Analytics (opcional) |
| `PUBLIC_META_PIXEL_ID` | Texto | Solo cuando hagas anuncios |
| `BREVO_API_KEY` | **Secreto** | Brevo → SMTP & API → API Keys |
| `BREVO_LIST_LEADS` / `BREVO_LIST_BUYERS` / `BREVO_LIST_ABANDONED` | Texto | IDs numéricos de tus listas en Brevo |
| `HOTMART_HOTTOK` | **Secreto** | Hottok de Hotmart (sección Webhook) |
| `ADMIN_TOKEN` | **Secreto** | Una clave larga aleatoria (mínimo 16 caracteres) |
| `TURNSTILE_SECRET_KEY` | **Secreto** | Secret key de Turnstile |
| `IP_HASH_SALT` | **Secreto** | Otra cadena aleatoria |

Para generar claves aleatorias:

```bash
openssl rand -hex 24
```

5. **Custom domains:** agrega tu dominio.

### 4. Brevo

1. **Senders, Domains & Dedicated IPs → Domains:** agrega tu dominio y autentícalo (SPF, DKIM, DMARC). Si el dominio está en Cloudflare, Brevo puede crear los registros automáticamente. **Sin este paso, tus correos llegan a spam.**
2. **Contacts → Settings → Contact attributes:** crea `UTM_SOURCE` (texto), `UTM_CAMPAIGN` (texto), `COMPRADOR` (booleano) y `FECHA_COMPRA` (fecha). `FIRSTNAME` ya existe.
3. **Contacts → Lists:** crea las listas `Leads`, `Compradores` y `Carrito abandonado`, y copia sus IDs a las variables.
4. **Automations:** crea 3 flujos con el disparador "contacto agregado a la lista" y pega los textos de `marketing/emails/`.

### 5. Turnstile (anti-bots)

Cloudflare → **Turnstile → Add site** con tu dominio y modo **Managed**. Copia la site key y la secret key a las variables.

### 6. Hotmart

Sigue `marketing/configuracion-hotmart.md`: producto, checkout, redirección a `/compra-exitosa`, webhook a `/api/webhooks/hotmart` (versión 2.0.0) y compra de prueba.

### 7. Verifica

```bash
# Resumen (leads, compras, embudo por fuente)
curl -H "Authorization: Bearer TU_ADMIN_TOKEN" https://rutaanalista.com/api/admin/stats

# Exportar a CSV (leads | purchases | events | funnel)
curl -H "Authorization: Bearer TU_ADMIN_TOKEN" "https://rutaanalista.com/api/admin/export.csv?table=leads" -o leads.csv

# Reintentar la sincronización con Brevo de lo que haya quedado pendiente
curl -X POST -H "Authorization: Bearer TU_ADMIN_TOKEN" https://rutaanalista.com/api/admin/resync
```

## Desarrollo local

```bash
cd landing
npm install
cp .dev.vars.example .dev.vars     # secretos locales de prueba
npm run db:local                   # crea las tablas en la D1 local
npm run build && npm run preview   # http://127.0.0.1:8788 con las Functions
```

`npm run dev` sirve solo las páginas (más rápido para editar texto y diseño), sin `/api`.

## Pruebas

```bash
npm test          # pruebas unitarias (validación, webhook, CSV, Brevo, link de pago)
npm run check     # tipos de Astro
npx tsc -p functions
npm run e2e       # punta a punta contra npm run preview (requiere Playwright)
```

La prueba e2e cubre:

- el formulario en el celular;
- la atribución por UTM;
- el link de pago decorado;
- los duplicados;
- el honeypot;
- el envío sin JavaScript;
- el webhook (firma, idempotencia, reembolso, eventos desordenados y carrito abandonado);
- el panel de administración.

## Cómo funciona por dentro

- **No se pierden leads:** el lead se guarda primero en D1 y después se envía a Brevo en segundo plano, con 3 reintentos. Si Brevo falla, queda `esp_synced = 0` y `/api/admin/resync` lo reintenta.
- **Webhook seguro:**
  - compara el hottok en tiempo constante;
  - procesa cada evento una sola vez (tabla `webhook_events`);
  - guarda la compra y la marca del evento en una sola transacción;
  - un evento atrasado nunca "devuelve" el estado de la compra (por ejemplo, un APPROVED que llega después de un REFUNDED se ignora).
- **Habeas Data (Ley 1581 de 2012):**
  - checkbox de autorización que no viene marcado, con la fecha y la versión del texto aceptado guardadas en `leads`;
  - la IP solo se guarda como hash con sal;
  - el carrito abandonado solo dispara emails a quien ya había autorizado como lead.
- **CSV seguro:** las celdas que empiezan por `=`, `+`, `-` o `@` se neutralizan para que nadie pueda inyectar fórmulas en tu Excel.
- **Atribución:** primer contacto (UTM o `?ref=`) en `localStorage`. El link de Hotmart lleva `src` (fuente) y `sck` (id anónimo) para unir cada compra con su origen.

## Blog: cómo publicar un artículo

Los artículos están en `src/blog/`, uno por archivo `.md`. El nombre del archivo es la URL: `src/blog/mi-articulo.md` → `/blog/mi-articulo`.

```markdown
---
title: "Título con la palabra clave (máx. 110 caracteres)"
description: "Resumen de 70 a 170 caracteres; es lo que aparece en Google."
date: 2026-11-04
keyword: "palabra clave principal"
readingMinutes: 6
draft: false          # true = no se publica
---

Texto en Markdown. Los bloques ```sql se resaltan solos.
```

Cada artículo ya trae automáticamente:

- datos estructurados para Google (`Article` y `BreadcrumbList`);
- caja de autor;
- botón al regalo gratis arriba y formulario de captura al final (`form_id = blog-<url>`);
- 2 artículos relacionados;
- entrada en el sitemap.

Si quieres un llamado intermedio dentro del texto, usa este bloque HTML:

```html
<div class="cta-inline">
<p><strong>Texto del llamado.</strong></p>
<a href="/gratis?utm_source=blog&utm_medium=articulo&utm_campaign=mi-articulo">Descargar gratis →</a>
</div>
```

**Atribución:** si alguien llega sin UTM, la fuente se deduce del referrer (Google → `google / organico`, LinkedIn → `linkedin / social`…). Así el embudo por fuente separa el tráfico orgánico del directo.

**Ideas para los próximos artículos:** "SQL vs Excel para análisis de datos", "Power BI desde cero: tu primer dashboard", "Cómo prepararte para una prueba técnica de analista", "Qué es un análisis de cohortes" y "Preguntas de entrevista de Excel".

## Antes de publicar: afirmaciones que debes confirmar

El texto usa información de tu README de GitHub. Confirma que todo sea exacto o ajústalo en `src/content/es.ts` y en `marketing/`:

- [ ] "Más de 5 años en datos", "BI & Analytics Manager", "clientes en Estados Unidos", "equipo de analítica en Bogotá".
- [ ] Resultados: +30% en ventas de una categoría, −20% en costos por mermas, 100M+ registros en Google Cloud/BigQuery.
- [ ] Frases que implican que revisas o evalúas trabajo de analistas (bonus de lanzamiento, email 2 y algunos ganchos del calendario). Si no es tu caso, reescríbelas.
- [ ] Bonus de lanzamiento (sesión grupal en vivo para los primeros 100). Si no lo vas a hacer, pon `launchBonus.enabled = false` en `src/config/site.ts`.
- [ ] Correo de contacto `hola@rutaanalista.com` y dominio final.
- [ ] Tu foto en `public/img/andres.jpg` (480x480) y `author.photo` en `site.ts`.
- [ ] Testimonios: solo reales y con permiso por escrito.

## Próximos pasos técnicos (cuando haya tracción)

- Página `/en` en inglés (la estructura de contenido ya está separada en `src/content/`).
- Blog con Astro Content Collections para SEO.
- Order bump y upsell (configuración en Hotmart, sin código).
- Pruebas A/B del título: duplica `index.astro` y reparte el tráfico con un parámetro de la campaña.

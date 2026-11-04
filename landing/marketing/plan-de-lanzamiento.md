# Plan de lanzamiento y crecimiento: Ruta Analista

## La meta en números

| Concepto | Valor |
|---|---|
| Meta | 1.000 ventas × USD 19 = **USD 19.000 brutos** |
| Neto por venta (después de Hotmart ≈ 9,9% + 0,50) | ≈ USD 16,6 → **≈ USD 16.600 netos** |
| Conversión realista de visita a compra | 1–3% |
| Visitas necesarias (con 2%) | ≈ 50.000 en 6–12 meses (≈ 140–280 al día) |
| Ventas al día para llegar en 12 meses | ≈ 3 |

**Cómo llegar más rápido sin más tráfico (subir el ticket promedio):**

- Order bump de USD 9 aceptado por el 30% → +USD 2,7 por comprador.
- Upsell de USD 49 (revisión de CV grupal o curso en video) aceptado por el 5% → +USD 2,45.
- Ticket promedio ≈ USD 24 → **la meta se logra con ≈ 790 compradores**.

## Fase 0 · Montaje (semana 0) — ≈ USD 10

- [ ] Comprar el dominio (Cloudflare Registrar, ~USD 10/año).
- [ ] Desplegar la landing (ver `README.md`).
- [ ] Brevo: crear el remitente con correo del dominio, autenticar el dominio (SPF, DKIM, DMARC), crear las listas y las 3 automatizaciones.
- [ ] Hotmart: crear el producto, configurar el webhook y probar con una compra real + reembolso.
- [ ] Optimizar tu perfil de LinkedIn:
  - Titular: "BI & Analytics Manager | Te ayudo a conseguir tu primer empleo en datos".
  - Sección Destacado: `/gratis?utm_source=linkedin&utm_medium=destacado`.
  - Banner con el mensaje del kit.
- [ ] Revisar y confirmar todas las afirmaciones sobre ti en la landing y en los emails (lista en `README.md`).

## Fase 1 · Validación (semanas 1–2) — USD 0

**Objetivo:** confirmar que la gente quiere esto antes de invertir más.

1. Publica el lead magnet (semana 1 del calendario).
2. **Beta testers:** consigue 10–15 personas que estén buscando su primer empleo en datos. Dales el kit gratis a cambio de feedback en una llamada de 15 minutos y un testimonio honesto.

   Mensaje sugerido:
   > Hola [nombre], vi que estás buscando entrar al mundo de los datos. Armé un kit con ruta de estudio, ejercicios SQL, proyectos de portafolio y CV. Antes de lanzarlo busco 10 personas que lo prueben gratis y me den feedback honesto en una llamada de 15 minutos. ¿Te interesa?

3. Mide:

| Métrica | Meta | Si no se cumple |
|---|---|---|
| Opt-in en `/gratis` | ≥ 30% | Cambia el título y la promesa del lead magnet |
| Apertura de emails | ≥ 40% | Revisa la autenticación del dominio y los asuntos |
| Respuestas al email 1 ("¿en qué punto estás?") | ≥ 5% | Más personalización; ese dato te dice qué vender |
| Beta testers que terminan la semana 1 | ≥ 50% | El kit es muy largo o confuso: simplifica el inicio |

## Fase 2 · Lanzamiento (semanas 3–4)

- Lanza a la lista con la secuencia de emails (versión A del email 6, con bonus real).
- 1 post de lanzamiento en LinkedIn + testimonios de los beta testers.
- Activa los testimonios en la landing (`showTestimonials: true` en `src/config/site.ts`).

**Meta del lanzamiento:** 1–3% de la lista compra en 14 días. Con 500 leads son 5–15 ventas. Parece poco, pero valida todo el sistema.

## Fase 3 · Motor de crecimiento (meses 2–6)

Ordenados por costo y por impacto esperado:

1. **Contenido orgánico constante** (LinkedIn + videos cortos + 1 YouTube semanal). Es el motor principal y es gratis.
2. **Programa de afiliados** (ver `guia-afiliados.md`). Invita a 5 creadores por semana.
3. **SEO:** el blog ya tiene 10 artículos (`/blog`), cada uno con formulario de captura e imagen para compartir. Sigue con 1 artículo por semana (cómo publicarlo e ideas en `README.md`), apuntando a búsquedas de cola larga en español:
   - "preguntas de entrevista SQL"
   - "cómo ser analista de datos sin experiencia"
   - "proyectos de portafolio para analista de datos"
   - "CV analista de datos ejemplo"
   - "salario analista de datos Colombia" / "… México"
   - "SQL vs Excel para análisis de datos"
4. **Comunidades:** aporta valor en grupos de datos en Discord, Telegram, Facebook y Reddit en español. Comparte ejercicios, no links. Pon el link solo cuando te lo pidan.
5. **Universidades y semilleros:** ofrece charlas gratis ("Cómo conseguir tu primer empleo en datos") en facultades de Ingeniería Industrial, Administración y Economía. Usa un cupón propio para medir.
6. **Colaboraciones:** lives con creadores de Excel, Power BI y carrera; entrevistas en podcasts de tecnología y empleo.
7. **Anuncios pagados**, solo cuando el orgánico demuestre que la lista convierte (≥ 1% de lista a compra):
   - Meta Ads a `/gratis` con USD 5–10 al día y un video corto que ya haya funcionado orgánicamente.
   - Meta: costo por lead < USD 0,60. Con 2% de conversión, eso es un costo por venta de ≈ USD 30 y **pierdes plata** solo con el producto de USD 19. Por eso los anuncios tienen sentido cuando ya existen el order bump y el upsell, o cuando el costo por lead baja de USD 0,35.

## Fase 4 · Escalar (meses 6–12)

- **Versión en inglés** del kit y de la landing (`/en`), con el mismo producto en Hotmart en inglés (o Lemon Squeezy si el checkout de Hotmart convierte mal en EE.UU.).
- **Escalera de productos:**

| Producto | Precio | Formato |
|---|---|---|
| Kit Ruta Analista | USD 19 | Listo |
| Pack entrevistas en inglés | USD 9 | Listo: order bump (ver `order-bump.md`) |
| Curso en video "Proyecto de portafolio paso a paso" | USD 49 | Upsell |
| Revisión de CV + portafolio 1 a 1 | USD 79–149 | Servicio con cupos limitados |
| Cohorte de 6 semanas con acompañamiento | USD 199–299 | Programa en vivo |

## Panel de control (sin programar)

**Lo más simple:** abre `https://rutaanalista.com/admin` desde el computador o el celular y entra con tu `ADMIN_TOKEN`. Ahí ves:

- compradores frente a la meta de 1.000;
- ingresos;
- leads;
- conversión;
- el embudo por fuente.

También descargas los CSV.

Si prefieres trabajar los datos en una hoja de Google Sheets **privada**:

```
=IMPORTDATA("https://rutaanalista.com/api/admin/export.csv?table=funnel&token=TU_ADMIN_TOKEN")
```

Tablas disponibles: `funnel`, `leads`, `purchases` y `events`. También puedes conectar Power BI con el conector Web usando la misma URL.

**Revisa cada lunes:**

- Leads de la semana por fuente.
- Compras y reembolsos.
- Fuente con mejor conversión de lead a compra (pon más esfuerzo ahí).
- Leads pendientes de sincronizar con Brevo (si hay, ejecuta `/api/admin/resync`).

## La cuenta de tu gato

Recomendación: **no mezclar audiencias por ahora**, pero sí aprovecharla de dos formas:

1. **Mascota de la marca:** el gato puede aparecer en tus videos de datos ("mi gato revisa tu SQL"). Humaniza el contenido, lo hace memorable y es difícil de copiar. Prueba 2–3 videos y mide si retienen más.
2. **Segunda línea de producto (fase 2):** con el mismo sistema (landing + Brevo + Hotmart) puedes lanzar un producto para dueños de gatos, como un planner de salud y gastos del gato en Google Sheets + PDF imprimible (USD 7–9). Úsala como experimento barato cuando Ruta Analista ya camine sola.

## Otras ideas de producto validables con el mismo sistema

1. **Kit Excel para emprendedores:** control de ventas, inventario y utilidad en Google Sheets con dashboard (USD 15–19).
2. **Plantillas Power BI para pymes:** dashboard de ventas listo para conectar + guía (USD 29–49).
3. **Banco de casos de negocio para entrevistas de analista** (USD 12).
4. **Finanzas personales en Google Sheets** (USD 9–12). Público enorme, pero muy competido.
5. **Planner para dueños de gatos** (USD 7–9), con la cuenta de tu gato como canal.

Para validar cualquiera: lanza un lead magnet gratis de ese tema en `/gratis-<tema>` y mide el opt-in y las respuestas antes de crear el producto completo.

# Configuración de Hotmart (paso a paso)

Hotmart cobra, entrega el producto por email, gestiona reembolsos y maneja afiliados. Cobra aproximadamente 9,9% + USD 0,50 por venta; confirma la tarifa vigente en tu panel.

## 1. Cuenta

- [ ] Crea tu cuenta en hotmart.com como **Productor**.
- [ ] Completa tus datos y verifica tu identidad (cédula). Puedes vender como persona natural.
- [ ] Registra la cuenta bancaria en Colombia donde recibirás los pagos.
- [ ] Habla con un contador sobre el RUT y la declaración de estos ingresos ante la DIAN.

## 2. Producto

- [ ] **Tipo:** producto digital. Usa el área de miembros de Hotmart (Hotmart Club) y sube allí los archivos del kit, organizados por módulo:
  1. Empieza aquí (guía de la ruta de 8 semanas + checklist)
  2. SQL: 60 ejercicios + base de datos
  3. Proyectos de portafolio (3)
  4. CV y LinkedIn
  5. Entrevistas: 100 preguntas
- [ ] **Nombre:** Kit Ruta Analista: tu primer empleo como Analista de Datos
- [ ] **Precio:** USD 19 (Hotmart muestra el valor convertido a la moneda de cada comprador).
- [ ] **Garantía:** 7 días.
- [ ] **Idioma:** español. Categoría: Educación / Tecnología.
- [ ] **Página de ventas:** `https://rutaanalista.com`
- [ ] **Imagen del producto:** [`imagenes/portada-kit.png`](imagenes/portada-kit.png) (cuadrada, 1080 × 1080).
- [ ] **Descripción del producto** (cópiala tal cual; Hotmart la muestra en el área de compra y en el mercado de afiliados):

> **Kit Ruta Analista: tu primer empleo como Analista de Datos**
>
> Un plan de 8 semanas con todo lo que necesitas para pasar de "estoy aprendiendo" a "estoy listo para postular":
>
> - **Ruta de 8 semanas** con checklist imprimible: qué estudiar cada semana y qué ignorar.
> - **60 ejercicios SQL resueltos** con una base de datos de e-commerce (8.528 pedidos): de SELECT a funciones de ventana, cohortes y RFM.
> - **3 proyectos de portafolio guiados** (ventas, inventario y marketing) con consultas, dashboards en Excel y plantillas de README para GitHub.
> - **CV en español e inglés** compatible con ATS, guía de LinkedIn, mensajes para reclutadores y tracker de postulaciones.
> - **100 preguntas de entrevista** con respuestas modelo: técnicas, de negocio y de comportamiento.
>
> Hecho por un BI & Analytics Manager. Acceso inmediato y garantía de 7 días: si no te sirve, te devolvemos el dinero.

## 3. Checkout

- [ ] **Métodos de pago:** activa tarjeta de crédito, PayPal, PSE, Nequi y Efecty (Colombia), y los medios locales de los demás países que tengas disponibles.
- [ ] **Página de agradecimiento:** en la configuración del checkout, redirige a `https://rutaanalista.com/compra-exitosa`.
- [ ] **Personalización:** pon el logo y un color acorde (amarillo `#facc15` / azul oscuro `#0c1a2e`).
- [ ] Copia el **link de pago** y ponlo en Cloudflare como `PUBLIC_HOTMART_CHECKOUT_URL` (luego vuelve a desplegar).

### Order bump (producto de USD 9, ya listo)

- [ ] Configura el "Pack de entrevistas en inglés" como order bump siguiendo [`order-bump.md`](order-bump.md) (textos listos para pegar).
- [ ] Ojo: según Hotmart, **PSE no está disponible con order bump** (tarjeta y PayPal sí). Si muchos de tus compradores usan PSE, activa el order bump solo cuando hayas medido la proporción de cada medio de pago.

## 4. Webhook (para que tu base de datos registre las compras)

- [ ] Ve a **Herramientas → Webhook (API y notificaciones)**.
- [ ] Crea una configuración con la URL `https://rutaanalista.com/api/webhooks/hotmart` y la **versión 2.0.0**.
- [ ] Marca los eventos: compra aprobada, compra completa, cancelada, reembolsada, chargeback, en disputa, expirada, boleto impreso, retrasada y **abandono de carrito**.
- [ ] Copia tu **hottok** (Hotmart lo muestra en esa misma sección) y guárdalo en Cloudflare como el secreto `HOTMART_HOTTOK`.
- [ ] Usa el botón de **enviar prueba** de Hotmart y verifica que la respuesta sea 200. Luego revisa `https://rutaanalista.com/api/admin/stats` con tu token.

> Verifica en la documentación oficial de Hotmart (developers.hotmart.com) que los nombres de los eventos y los campos `purchase.origin.src` / `purchase.origin.sck` sigan iguales. El código los lee de forma tolerante, pero conviene confirmarlo con el envío de prueba.

## 5. Atribución (saber de dónde vienen las ventas)

La landing ya agrega al link de pago:

- `src` = fuente del visitante (linkedin, tiktok, email…)
- `sck` = id anónimo del visitante (une la compra con su registro)
- `email` y `name` para prellenar el checkout si la persona ya se registró

Confirma en Hotmart que el checkout acepte esos parámetros de prellenado. Si alguno dejara de funcionar, no rompe nada: solo no se prellena.

## 6. Píxeles (solo cuando hagas anuncios)

- [ ] En Hotmart → tu producto → **Píxel de conversión**, agrega tu píxel de Meta (y el de TikTok si usas TikTok Ads). Así Meta recibe el evento de compra.
- [ ] Pon el mismo ID en Cloudflare como `PUBLIC_META_PIXEL_ID` para que la landing envíe `PageView`, `Lead` e `InitiateCheckout`.

## 7. Afiliados

Mira `guia-afiliados.md`.

## Prueba final antes de lanzar

- [ ] Haz una compra real con tu propia tarjeta y luego pide el reembolso. Verifica que:
  - [ ] llega el correo de acceso de Hotmart;
  - [ ] te redirige a `/compra-exitosa`;
  - [ ] la compra aparece en `/api/admin/export.csv?table=purchases` como APPROVED y luego REFUNDED;
  - [ ] en Brevo entras a la lista Compradores y luego sales.

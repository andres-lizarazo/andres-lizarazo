// Configuración central del sitio. Cambia aquí precio, links y banderas sin tocar las páginas.

const env = import.meta.env;

export const site = {
  name: 'Ruta Analista',
  url: env.SITE ?? 'https://rutaanalista.com',
  locale: 'es',
  contactEmail: 'hola@rutaanalista.com', // usa un correo de tu dominio (también es el remitente en Brevo)

  author: {
    name: 'Andrés Lizarazo',
    role: 'BI & Analytics Manager',
    city: 'Bogotá, Colombia',
    linkedin: 'https://linkedin.com/in/andreslizarazo',
    // Pon tu foto en public/img/andres.jpg (cuadrada, 480x480) y cambia esto a '/img/andres.jpg'.
    photo: null as string | null,
  },

  product: {
    name: 'Kit Ruta Analista',
    tagline: 'Tu primer empleo como Analista de Datos',
    price: 19,
    currency: 'USD',
    guaranteeDays: 7,
    // Link de pago de Hotmart (Hotmart > Productos > tu producto > Links de venta).
    checkoutUrl: env.PUBLIC_HOTMART_CHECKOUT_URL || 'https://pay.hotmart.com/REEMPLAZAR',
  },

  // Bonus de lanzamiento: SOLO actívalo si vas a cumplirlo. Desactívalo cuando se llenen los cupos.
  launchBonus: {
    enabled: true,
    spots: 100,
    title: 'Bonus de lanzamiento',
    text: 'Los primeros 100 compradores entran a una sesión grupal en vivo (60 min) donde reviso CVs y portafolios con la lista de chequeo que uso con mi equipo.',
  },

  // Muestra testimonios solo cuando tengas reales (de beta testers con permiso).
  showTestimonials: false,

  turnstileSiteKey: env.PUBLIC_TURNSTILE_SITE_KEY || '',
  metaPixelId: env.PUBLIC_META_PIXEL_ID || '',
  cfAnalyticsToken: env.PUBLIC_CF_ANALYTICS_TOKEN || '',

  // Versión del texto de autorización de datos (súbela si cambias el texto del checkbox).
  consentVersion: '2026-11-v1',

  leadMagnet: {
    title: '15 ejercicios SQL de entrevistas reales',
    files: [
      { label: 'Ejercicios + soluciones (PDF)', href: '/descargas/15-ejercicios-sql-entrevista.pdf' },
      { label: 'Base de datos de práctica (SQLite)', href: '/descargas/tienda-practica.sqlite' },
      { label: 'Datos en CSV (para Excel o Sheets)', href: '/descargas/tienda-practica-csv.zip' },
    ],
  },
} as const;

export type Site = typeof site;

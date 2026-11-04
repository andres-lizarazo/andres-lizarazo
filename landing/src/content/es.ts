// Todo el texto de la página de venta en un solo lugar.
// Regla: nada de urgencia falsa, nada de promesas de empleo garantizado, solo afirmaciones verificables.
import { site } from '../config/site';

const price = `$${site.product.price}`;

export const es = {
  meta: {
    title: 'Kit Ruta Analista: consigue tu primer empleo como Analista de Datos',
    description:
      'Ruta de 8 semanas, 60 ejercicios SQL resueltos, 3 proyectos de portafolio, CV en español e inglés y 100 preguntas de entrevista. Por un BI & Analytics Manager. $19, acceso inmediato.',
  },

  hero: {
    eyebrow: 'Para quien empieza en datos o viene de otra carrera',
    title: 'Deja de acumular cursos. Arma el portafolio que te consigue entrevistas como Analista de Datos.',
    subtitle:
      'Una ruta de 8 semanas con 60 ejercicios SQL resueltos, 3 proyectos reales y tu CV listo para empresas de Latam y EE.UU. Hecho por un BI & Analytics Manager que trabaja con clientes de Estados Unidos.',
    cta: `Quiero el kit por ${price}`,
    secondary: '¿Aún no? Descarga gratis 15 ejercicios SQL de entrevistas',
    trust: ['Pago seguro con Hotmart', 'Tarjeta, PSE, Nequi o PayPal', `Garantía de ${site.product.guaranteeDays} días`, 'Acceso inmediato'],
  },

  problem: {
    title: '¿Te suena?',
    items: [
      'Terminaste cursos de SQL, Excel y Power BI, pero al leer una oferta de empleo no sabes si estás listo.',
      'Tu CV dice “conocimientos en SQL y Power BI”, igual que el de otros 300 candidatos.',
      'Envías postulaciones y nadie responde. No sabes qué está fallando.',
      'Te da miedo la prueba técnica. Y la entrevista en inglés, ni hablar.',
    ],
    insight:
      'El problema no eres tú. Los cursos enseñan herramientas, pero las empresas contratan a quien demuestra que resuelve problemas de negocio con datos. Eso se demuestra con un portafolio, no con certificados.',
  },

  includes: {
    title: 'Qué incluye el kit',
    subtitle: 'Todo lo que necesitas para pasar de “estoy estudiando” a “aquí está mi trabajo”.',
    items: [
      {
        title: 'Ruta de 8 semanas',
        text: 'Qué estudiar cada semana, qué ignorar por ahora y en qué momento empezar a postular. Sin rodeos.',
        tag: 'PDF',
      },
      {
        title: '60 ejercicios SQL resueltos',
        text: 'De SELECT a funciones de ventana y casos de negocio, sobre una base de datos de e-commerce para practicar de verdad.',
        tag: 'PDF + SQL + base de datos',
      },
      {
        title: '3 proyectos de portafolio guiados',
        text: 'Ventas, inventario y marketing. Preguntas de negocio, solución en SQL, dashboard en Excel y plantilla de README para GitHub.',
        tag: 'Datos + Excel + plantillas',
      },
      {
        title: 'CV y LinkedIn que pasan filtros',
        text: 'Plantillas de CV en español e inglés compatibles con ATS, guía para tu perfil de LinkedIn y mensajes para reclutadores.',
        tag: 'Word + guía',
      },
      {
        title: '100 preguntas de entrevista',
        text: 'SQL, Excel, BI, negocio y preguntas de comportamiento en inglés (método STAR), con respuestas modelo.',
        tag: 'PDF',
      },
      {
        title: 'Checklist antes de postular',
        text: 'Revisa en 10 minutos si tu CV, tu portafolio y tu LinkedIn están listos. Imprímelo y táchalo.',
        tag: 'PDF imprimible',
      },
    ],
  },

  about: {
    title: 'Hola, soy Andrés',
    paragraphs: [
      'Soy Ingeniero Industrial y llevo más de 5 años en datos, en roles comerciales, de analítica y de ingeniería de datos. Hoy soy BI & Analytics Manager: trabajo con clientes en Estados Unidos y con un equipo de analítica en Bogotá.',
      'Empecé con el negocio y luego aprendí los datos. Por eso este kit no te enseña herramientas sueltas: te enseña a usar SQL y dashboards para responder las preguntas que de verdad hace una empresa.',
    ],
    results: [
      { value: '+30%', label: 'en ventas de una categoría de e-commerce con una estrategia que propuse y ejecuté' },
      { value: '−20%', label: 'en costos por mermas de inventario mejorando cómo se registraban los daños' },
      { value: '100M+', label: 'registros procesados en pipelines en Google Cloud y BigQuery' },
    ],
  },

  how: {
    title: 'Cómo funciona',
    steps: [
      { title: 'Compras una sola vez', text: `${price} USD. Sin suscripciones. Pagas con tarjeta, PSE, Nequi, PayPal u otros medios según tu país.` },
      { title: 'Recibes el acceso al instante', text: 'Hotmart te envía un correo con el acceso a todos los archivos. Descárgalos y son tuyos.' },
      { title: 'Sigues la ruta y postulas', text: 'Semana a semana: practicas SQL, armas 3 proyectos, ajustas tu CV y llegas a la entrevista con algo que mostrar.' },
    ],
  },

  forWhom: {
    yesTitle: 'Es para ti si…',
    yes: [
      'Estás empezando en datos o vienes de otra carrera (ingeniería, administración, economía, contabilidad…).',
      'Ya hiciste cursos, pero no sabes cómo demostrar lo que sabes.',
      'Quieres trabajar en una empresa de tu país o de forma remota para EE.UU.',
      'Prefieres practicar con casos reales en vez de ver horas de video.',
    ],
    noTitle: 'No es para ti si…',
    no: [
      'Buscas un curso en video de 40 horas desde cero.',
      'Esperas conseguir trabajo sin practicar ni postular.',
      'Ya eres analista con experiencia (te va a quedar corto).',
    ],
  },

  pricing: {
    title: 'Todo el kit, un solo pago',
    compare: 'Un bootcamp de datos puede costar cientos o miles de dólares. Este kit cuesta menos que una cena y te da un plan concreto.',
    items: [
      'Ruta de 8 semanas',
      '60 ejercicios SQL resueltos + base de datos',
      '3 proyectos de portafolio con datos y plantillas',
      'CV en español e inglés + guía de LinkedIn',
      '100 preguntas de entrevista con respuestas',
      'Checklist antes de postular',
      'Actualizaciones futuras del kit sin costo',
    ],
    cta: `Comprar el kit por ${price}`,
    note: 'Pago único en USD. Hotmart te muestra el valor en tu moneda local.',
  },

  guarantee: {
    title: `Garantía de ${site.product.guaranteeDays} días`,
    text: `Descárgalo, revísalo con calma y, si sientes que no es para ti, pides el reembolso desde Hotmart dentro de los ${site.product.guaranteeDays} días. Sin preguntas.`,
  },

  faq: {
    title: 'Preguntas frecuentes',
    items: [
      {
        q: '¿Necesito experiencia previa?',
        a: 'No necesitas experiencia laboral en datos. Sí te ayuda haber visto lo básico de Excel. La ruta empieza en SQL desde cero y sube de nivel poco a poco.',
      },
      {
        q: '¿Necesito saber inglés?',
        a: 'No. Todo el kit está en español. Incluye un CV en inglés y preguntas de entrevista en inglés para cuando quieras postular a empresas de EE.UU.',
      },
      {
        q: '¿Qué programas necesito?',
        a: 'Solo programas gratuitos: DB Browser for SQLite (o cualquier editor SQL), Excel o Google Sheets y, si quieres, Power BI Desktop. Te explico cómo instalarlos.',
      },
      {
        q: '¿Cómo recibo el kit?',
        a: 'Apenas se aprueba tu pago, Hotmart te envía un correo con el acceso. Si pagas en efectivo (por ejemplo Efecty), llega cuando se confirme el pago.',
      },
      {
        q: '¿Qué medios de pago aceptan?',
        a: 'Tarjeta de crédito o débito, PayPal y medios locales como PSE y Nequi en Colombia. Hotmart te muestra los disponibles en tu país.',
      },
      {
        q: '¿Es un pago único?',
        a: 'Sí. Pagas una vez y los archivos son tuyos, incluidas las actualizaciones futuras del kit.',
      },
      {
        q: '¿Me garantiza un empleo?',
        a: 'No, y desconfía de quien te lo prometa. Lo que sí te da es un plan claro, práctica real y un portafolio para que tus postulaciones tengan muchas más posibilidades.',
      },
      {
        q: '¿Sirve si no vivo en Colombia?',
        a: 'Sí. Está pensado para toda Latinoamérica y para quien quiera trabajar remoto con empresas de EE.UU.',
      },
    ],
  },

  finalCta: {
    title: 'En 8 semanas puedes tener portafolio, CV y práctica para tu primera entrevista.',
    text: 'O puedes seguir sumando cursos. Tú decides.',
    cta: `Quiero el kit por ${price}`,
  },

  leadForm: {
    nameLabel: 'Tu nombre',
    emailLabel: 'Tu mejor email',
    consent:
      'Autorizo el tratamiento de mis datos para recibir el material y correos sobre carrera en datos, según la política de privacidad. Puedo darme de baja cuando quiera.',
    submit: 'Envíamelos gratis',
    sending: 'Enviando…',
    errors: {
      name: 'Escribe tu nombre.',
      email: 'Revisa tu email, parece que tiene un error.',
      consent: 'Necesitamos tu autorización para enviarte el material.',
      generic: 'No pudimos registrarte. Intenta de nuevo en un momento.',
      rate: 'Demasiados intentos. Espera unos minutos.',
      captcha: 'No pudimos verificar que eres una persona. Recarga la página e intenta de nuevo.',
    },
  },
};

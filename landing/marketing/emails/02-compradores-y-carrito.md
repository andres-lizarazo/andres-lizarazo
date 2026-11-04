# Emails para compradores y carrito abandonado (Brevo)

## Compradores

**Disparador:** el contacto entra a la lista **Compradores**. Lo hace el webhook de Hotmart cuando la compra se aprueba.
Hotmart ya envía por su cuenta el correo con el acceso. Estos emails sirven para que la persona **use** el kit, porque quien lo usa no pide reembolso, deja testimonio y lo recomienda.

### C1 · Inmediato

**Asunto:** Empieza por aquí (tu plan para esta semana)
**Preheader:** 3 pasos para que el kit no se quede en descargas.

Hola {{ contact.FIRSTNAME }},

¡Gracias por confiar en el Kit Ruta Analista! Hotmart te envió un correo aparte con el acceso. Si no lo ves, búscalo en Promociones o Spam con la palabra "Hotmart".

Tu plan para esta semana:

1. **Hoy (15 min):** abre la guía "Ruta de 8 semanas" y lee la semana 1.
2. **Mañana:** instala DB Browser for SQLite y abre `tienda.sqlite`.
3. **Esta semana:** resuelve los ejercicios 1 al 10.

Bloquea 1 hora al día en tu calendario. La constancia vale más que la intensidad.

[SI HAY BONUS] La sesión grupal en vivo será el [FECHA]. Te enviaré el enlace unos días antes.

Si algo no funciona, responde este correo.

Andrés

### C2 · Día 7

**Asunto:** ¿Cómo vas? (y un favor de 2 minutos)

Hola {{ contact.FIRSTNAME }},

Ya pasó una semana. ¿Cómo vas con la ruta?

Te pido un favor: responde este correo con estas 3 respuestas cortas:

1. ¿En qué punto estabas antes del kit?
2. ¿Qué es lo que más te ha servido hasta ahora?
3. ¿Lo recomendarías? ¿A quién?

Con tu permiso, puedo usar tu respuesta (con tu nombre y la inicial de tu apellido) en la página del kit. Si prefieres que no, dímelo y queda solo entre nosotros.

Andrés

### C3 · Día 14

**Asunto:** Gana dinero recomendando el kit
**Preheader:** 40% de comisión por cada venta.

Hola {{ contact.FIRSTNAME }},

Si el kit te está sirviendo y conoces a otras personas que quieren entrar al mundo de los datos, puedes recomendarlo y **ganar el 40% de cada venta**.

Funciona con el programa de afiliados de Hotmart:

1. Entra aquí: [LINK DE AFILIACIÓN DE HOTMART]
2. Hotmart te da tu enlace personal.
3. Cada vez que alguien compre con tu enlace, Hotmart te paga la comisión.

O si solo quieres compartirlo: https://rutaanalista.com/?utm_source=referido&utm_medium=email

Andrés

---

## Carrito abandonado

**Disparador:** el contacto entra a la lista **Carrito abandonado**. El webhook de Hotmart `PURCHASE_OUT_OF_SHOPPING_CART` lo agrega **solo si ya era lead (con autorización) y no ha comprado**.
**Salida:** si `COMPRADOR` es verdadero, salir del flujo. Después del email A2, saca al contacto de la lista.

### A1 · 1 hora después

**Asunto:** ¿Se quedó algo a medias?
**Preheader:** Por si tuviste un problema con el pago.

Hola {{ contact.FIRSTNAME }},

Vi que empezaste a comprar el Kit Ruta Analista pero no terminaste. A veces pasa por el medio de pago, así que te dejo esto por si te sirve:

- En Colombia puedes pagar con **PSE** o **Nequi** si tu tarjeta no acepta compras internacionales.
- También puedes usar **PayPal** o pagar en efectivo, según tu país.

Puedes retomar aquí: https://rutaanalista.com/?utm_source=email&utm_medium=carrito&utm_campaign=a1#precio

Si tuviste otro problema, respóndeme y te ayudo.

Andrés

### A2 · 24 horas después

**Asunto:** Una pregunta rápida

Hola {{ contact.FIRSTNAME }},

Solo quería preguntarte: ¿hubo algo que te hizo dudar del kit?

Si es el precio, la duda de si es para tu nivel o cualquier otra cosa, respóndeme. Te contesto personalmente.

Y recuerda que tienes 7 días de garantía: si no te sirve, te devuelven el dinero.

https://rutaanalista.com/?utm_source=email&utm_medium=carrito&utm_campaign=a2#precio

Andrés

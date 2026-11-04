# Secuencia de bienvenida para leads (Brevo)

**Disparador:** el contacto entra a la lista **Leads** (lo hace `/api/subscribe`).
**Salida:** antes de cada email de venta (4, 5 y 6) agrega en Brevo una condición: *si `COMPRADOR` es verdadero → salir del flujo*.
**Remitente:** Andrés de Ruta Analista `<hola@rutaanalista.com>`. Usa un nombre de persona: mejora la apertura.
**Variables de Brevo:** `{{ contact.FIRSTNAME }}`. El enlace de baja lo agrega Brevo en el pie.

Reglas de estilo: texto plano o casi plano (sin diseños pesados: llegan menos a Promociones), un solo enlace principal por email y párrafos cortos.

---

## Email 1 · Día 0 (inmediato)

**Asunto:** Tus 15 ejercicios SQL (y cómo sacarles provecho)
**Preheader:** Ábrelos hoy, te toma 5 minutos empezar.

Hola {{ contact.FIRSTNAME }},

Aquí están tus ejercicios:

👉 PDF con los 15 ejercicios y soluciones: https://rutaanalista.com/descargas/15-ejercicios-sql-entrevista.pdf
👉 Base de datos para practicar: https://rutaanalista.com/descargas/tienda-practica.sqlite
👉 Los mismos datos en CSV: https://rutaanalista.com/descargas/tienda-practica-csv.zip

Para que no se queden en tu carpeta de descargas:

1. Abre la base con DB Browser for SQLite (gratis) o en sqliteonline.com.
2. Haz los 4 primeros hoy. Son fáciles y te van a dar impulso.
3. Intenta cada uno 10 minutos antes de mirar la solución.

Soy Andrés: Ingeniero Industrial y BI & Analytics Manager. Trabajo con clientes en Estados Unidos y con un equipo de analítica en Bogotá. Durante los próximos días te voy a enviar lo que me hubiera gustado saber cuando empecé en datos.

Una pregunta: **¿en qué punto estás hoy?** Responde este correo con una línea, por ejemplo: "estoy aprendiendo SQL", "ya hice cursos pero no me llaman" o "trabajo en otra área y quiero cambiarme". Leo todas las respuestas.

Andrés

P.D. Si este correo llegó a Promociones o Spam, muévelo a tu bandeja principal para no perderte los siguientes.

---

## Email 2 · Día 1

**Asunto:** De Ingeniero Industrial a BI Manager (lo que nadie me dijo)
**Preheader:** No fue por saber más herramientas.

Hola {{ contact.FIRSTNAME }},

Cuando empecé en datos creía que me faltaba aprender más herramientas: otro curso de Python, otro de Power BI, otra certificación.

Me equivoqué.

Lo que cambió mi carrera fue entender que **a las empresas no les importa tu herramienta, les importa tu respuesta**. Uno de mis primeros resultados fue hacer crecer 30% las ventas de una categoría de e-commerce. No fue gracias a un dashboard bonito: hice la pregunta correcta (¿qué estamos dejando de vender y por qué?) y respondí con datos.

Por eso, cuando reviso el trabajo de un analista no pregunto "¿sabes SQL?". Pregunto:

- ¿Qué problema de negocio resolviste?
- ¿Qué encontraste en los datos?
- ¿Qué recomendaste y qué pasó después?

Si tu portafolio responde esas tres preguntas, ya estás por delante del 90% de los candidatos.

Mañana te cuento cómo armar un proyecto así.

Andrés

---

## Email 3 · Día 2

**Asunto:** El proyecto de portafolio que sí te consigue entrevistas
**Preheader:** Spoiler: no es el Titanic.

Hola {{ contact.FIRSTNAME }},

Casi todos los portafolios junior se parecen: Titanic, Netflix, Iris. Un reclutador ve el mismo proyecto 50 veces por semana.

Un proyecto que llama la atención tiene esta estructura:

1. **Contexto de negocio:** "Soy analista de una tienda online que vende en 6 países".
2. **Pregunta concreta:** "¿Por qué crecieron las ventas pero no la utilidad?"
3. **Análisis con SQL:** consultas limpias y comentadas en GitHub.
4. **Hallazgo:** "Tecnología vende mucho pero deja 21% de margen; Belleza deja 58%".
5. **Recomendación:** "Mover presupuesto de anuncios hacia las categorías de mayor margen".
6. **Dashboard:** una sola página que un gerente entienda en 30 segundos.

Fíjate que el SQL es solo el paso 3. Lo que te diferencia son los pasos 1, 2, 4 y 5.

Si quieres probarlo hoy, usa la base de datos que te envié: tiene ventas, clientes y márgenes. Plantéate la pregunta del punto 2 e intenta responderla.

Mañana te cuento algo que preparé para que no tengas que armar todo esto desde cero.

Andrés

---

## Email 4 · Día 3 (oferta)

**Asunto:** Te presento el Kit Ruta Analista
**Preheader:** Ruta de 8 semanas, 60 ejercicios, 3 proyectos y tu CV listo.

Hola {{ contact.FIRSTNAME }},

Durante años vi a personas muy capaces quedarse atascadas en la etapa de "sigo estudiando". No por falta de talento, sino por falta de un plan y de algo que mostrar.

Por eso armé el **Kit Ruta Analista**:

- **Ruta de 8 semanas:** qué estudiar cada semana, qué ignorar y cuándo empezar a postular.
- **60 ejercicios SQL resueltos** (los 15 que tienes son una muestra) sobre una base completa con ventas, inventario y marketing.
- **3 proyectos de portafolio guiados**: ventas, inventario y marketing. Cada uno con preguntas de negocio, solución en SQL, dashboard en Excel y plantilla de README para tu GitHub.
- **CV en español e inglés** compatible con filtros ATS, guía de LinkedIn y mensajes para reclutadores.
- **100 preguntas de entrevista** con respuestas modelo, incluidas preguntas de comportamiento en inglés.
- **Checklist** para revisar todo antes de postular.

Cuesta **$19 USD**, en un solo pago. Puedes pagar con tarjeta, PSE, Nequi, PayPal u otros medios según tu país.

Y tienes **7 días de garantía**: si lo revisas y no es para ti, pides el reembolso en Hotmart sin dar explicaciones.

👉 Ver el kit completo: https://rutaanalista.com/?utm_source=email&utm_medium=secuencia&utm_campaign=d3_oferta#precio

[SOLO SI EL BONUS ESTÁ ACTIVO] **Bonus de lanzamiento:** los primeros 100 compradores entran a una sesión grupal en vivo donde reviso CVs y portafolios.

Andrés

---

## Email 5 · Día 5 (objeciones)

**Asunto:** "No tengo experiencia, ¿me sirve?"
**Preheader:** Las 4 dudas que más me escriben.

Hola {{ contact.FIRSTNAME }},

Estas son las preguntas que más recibo sobre el kit, con respuestas honestas:

**"No tengo experiencia en datos."**
Para eso está hecho. La ruta empieza en SQL desde cero, y los proyectos son justamente tu experiencia demostrable.

**"No sé inglés."**
Todo el kit está en español. El CV y las preguntas en inglés son para cuando quieras apuntar a empresas de EE.UU.

**"No tengo tiempo."**
La ruta está pensada para 1 hora al día. Es mejor 1 hora diaria que 8 horas un sábado.

**"¿Me garantiza un empleo?"**
No, y desconfía de quien te lo prometa. Lo que sí te da es un plan claro, práctica real y un portafolio que hace que tus postulaciones tengan muchas más posibilidades.

Y si después de verlo sientes que no es para ti, tienes 7 días para pedir tu dinero de vuelta.

👉 https://rutaanalista.com/?utm_source=email&utm_medium=secuencia&utm_campaign=d5_objeciones#precio

Andrés

---

## Email 6 · Día 7 — elige UNA versión

### Versión A: lanzamiento (úsala solo si el bonus realmente se cierra)

**Asunto:** Se cierra el bonus de lanzamiento
**Preheader:** Después de hoy, el kit sigue disponible pero sin la sesión en vivo.

Hola {{ contact.FIRSTNAME }},

Un aviso corto: el bonus de lanzamiento del Kit Ruta Analista (la sesión grupal en vivo donde reviso CVs y portafolios) se cierra [FECHA REAL / cuando lleguemos a 100 compradores].

Después de eso, el kit sigue disponible al mismo precio, pero sin la sesión.

👉 https://rutaanalista.com/?utm_source=email&utm_medium=secuencia&utm_campaign=d7_cierre#precio

Andrés

### Versión B: siempre activa (sin fecha límite)

**Asunto:** ¿Sigues pensándolo?
**Preheader:** Una forma simple de decidir.

Hola {{ contact.FIRSTNAME }},

Si todavía estás pensando si el kit es para ti, te propongo hacer la cuenta así:

Si te ayuda a conseguir tu primer empleo en datos aunque sea **un mes antes**, ¿cuánto vale ese mes de salario?

Y si no te sirve, tienes 7 días para pedir el reembolso. El riesgo es mío, no tuyo.

👉 https://rutaanalista.com/?utm_source=email&utm_medium=secuencia&utm_campaign=d7_decision#precio

Andrés

---

## Email 7 · Día 10 (paso al newsletter)

**Asunto:** Lo que viene (y una pregunta)
**Preheader:** Desde ahora, un correo por semana.

Hola {{ contact.FIRSTNAME }},

Desde ahora te voy a escribir **una vez por semana**, normalmente los martes, con una idea práctica para avanzar en tu carrera en datos: un ejercicio, una plantilla o algo que veo en el trabajo real.

Para que te sirva de verdad, ayúdame con esto: **¿qué es lo que más te cuesta hoy?**

- Aprender SQL
- Armar el portafolio
- El CV y LinkedIn
- Las entrevistas
- Otra cosa

Responde con una palabra. Con tus respuestas decido de qué escribo.

Andrés

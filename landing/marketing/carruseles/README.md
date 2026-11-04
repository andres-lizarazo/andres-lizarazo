# Carruseles para LinkedIn (listos para publicar)

**Formato:** PDF de 1080 × 1350 px.

**Cómo publicarlos:** en LinkedIn → **Crear publicación → Agregar un documento**, sube el PDF y ponle un título corto. Luego pega el texto del post.

Todos los números vienen de la base de práctica gratis (Andina Market) y se verificaron ejecutando las consultas.

**Después de publicar:**

- Responde cada comentario con la palabra clave usando el mensaje de abajo, y envía el link por mensaje privado.
- Contesta todo en la primera hora.
- No pongas el link en el post: el link va en el mensaje privado o en el primer comentario.

**Mensaje para quien comenta la palabra clave:**

> ¡Hola, [nombre]! Aquí tienes los 15 ejercicios SQL con la base de datos y las soluciones: https://rutaanalista.com/gratis?utm_source=linkedin&utm_medium=carrusel
> Si te trabas en alguno, escríbeme por aquí.

---

## 1. Cinco errores de SQL en pruebas técnicas (día 2)

**Archivo:** [`carrusel-1-errores-sql.pdf`](carrusel-1-errores-sql.pdf) · **Título del documento:** 5 errores de SQL en pruebas técnicas

**Texto del post:**

> Estos 5 errores de SQL hacen que una consulta "funcione" pero dé un número equivocado. 👇
>
> Los probé con una base de datos de una tienda online de práctica, y la diferencia no es pequeña:
>
> → Contar pedidos en vez de clientes: casi el doble.
> → Un JOIN que duplica el costo de envío: +17% inventado.
> → No filtrar pedidos cancelados: +15% de ventas que nunca existieron.
>
> En una prueba técnica, cualquiera de estos te puede costar el proceso. En el trabajo, una mala decisión.
>
> ¿Cuál has cometido? El del JOIN es el más traicionero: no da error, solo un número inflado.
>
> Si quieres practicar con la misma base de datos, comenta **SQL** y te envío 15 ejercicios gratis con soluciones.

---

## 2. Cómo explicar un análisis a un gerente en 3 frases (día 9)

**Archivo:** [`carrusel-2-explicar-a-un-gerente.pdf`](carrusel-2-explicar-a-un-gerente.pdf) · **Título:** Cómo explicar un análisis en 3 frases

**Texto del post:**

> El mejor análisis no sirve si nadie entiende qué hacer con él.
>
> La fórmula que uso para presentar cualquier análisis en 15 segundos:
>
> 1️⃣ Qué pasó (con un número y una referencia)
> 2️⃣ Por qué pasó
> 3️⃣ Qué recomiendo hacer
>
> El método, las consultas y los supuestos quedan listos para cuando pregunten. Pero la conclusión va primero.
>
> En el carrusel tienes un ejemplo completo, del "así no" al "así sí".
>
> ¿Tú cómo presentas tus análisis? Si quieres practicar con datos reales, comenta **SQL** y te envío 15 ejercicios gratis.

---

## 3. Ocho semanas para tu primer empleo en datos (día 23)

**Archivo:** [`carrusel-3-ruta-8-semanas.pdf`](carrusel-3-ruta-8-semanas.pdf) · **Título:** 8 semanas para tu primer empleo en datos

**Texto del post:**

> Si hoy empezara de cero para conseguir mi primer empleo en datos, haría esto:
>
> Semanas 1–3: SQL de verdad (con preguntas de negocio).
> Semanas 4–6: 3 proyectos de portafolio: ventas, operaciones y marketing.
> Semana 7: CV de una página, LinkedIn y 10 postulaciones con un mensaje.
> Semana 8: entrevistas, historias STAR y un simulacro grabado.
>
> 1 hora al día. Sin machine learning. Sin coleccionar certificados.
>
> No es una promesa de empleo: es un orden que funciona.
>
> Comenta **RUTA** y te envío gratis los 15 ejercicios SQL para empezar la semana 1.

**Mensaje para quien comenta RUTA:** usa el mismo mensaje de arriba, cambiando `utm_medium=carrusel` por `utm_medium=carrusel-ruta`. Así sabrás cuántos leads trajo este post.

---

## 4. Cuatro funciones de ventana que te preguntan en entrevistas (día 29)

**Archivo:** [`carrusel-4-funciones-de-ventana.pdf`](carrusel-4-funciones-de-ventana.pdf) · **Título:** 4 funciones de ventana para entrevistas

**Texto del post:**

> Las funciones de ventana son el tema de SQL que más separa a quien "sabe lo básico" de quien está listo para trabajar como analista.
>
> Las 4 que más aparecen en pruebas técnicas:
>
> → ROW_NUMBER: top N por grupo
> → RANK / DENSE_RANK: rankings con empates
> → LAG: comparar con el periodo anterior
> → SUM() OVER: acumulados y % del total
>
> En el carrusel tienes cada una con una consulta que puedes ejecutar.
>
> Y si quieres la explicación completa, está en el blog: https://rutaanalista.com/blog/funciones-de-ventana-sql
>
> Comenta **SQL** y te envío 15 ejercicios gratis para practicarlas con una base de datos real.

---

## Cómo crear más carruseles

Los generó un script en Python a partir de los datos de práctica. Está en el paquete de fuentes del kit, fuera de este repositorio: `build_carruseles.py` y `render_slides.cjs`.

También puedes recrearlos en Canva con el mismo estilo:

- **Colores:**
  - fondo azul oscuro `#0c1a2e`;
  - amarillo `#facc15`;
  - verde azulado `#0f766e`;
  - fondo claro `#fbfaf7`.
- **Estructura:** portada oscura, una idea por lámina y un llamado final oscuro con la palabra clave.

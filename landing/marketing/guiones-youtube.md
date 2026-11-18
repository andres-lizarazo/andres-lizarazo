# Guiones de los 4 videos largos de YouTube

Son los videos de los días 6, 13, 20 y 27 del [calendario](calendario-contenido-30-dias.md).

Cada guion trae lo siguiente:
- 3 títulos para elegir;
- texto para la miniatura;
- qué preparar;
- el guion por bloques, con tiempos;
- la descripción lista para pegar, con capítulos;
- 3 cortes para Shorts, Reels o TikTok.

Los números salen de la base gratis de Andina Market (`public/descargas/tienda-practica.sqlite`), y cada consulta se ejecutó para verificarlos. El video 4 es la excepción: usa los datos del proyecto de inventario del kit pagado.

**Reglas para todos los videos:**

- **Primeros 30 segundos:** resultado o promesa, nunca "hola, bienvenidos a mi canal".
- **No leas el guion palabra por palabra.** Úsalo como mapa y habla con tus palabras.
- **Muestra la pantalla:** SQL en DB Browser for SQLite con letra grande (zoom 150%).
- **Llamado a la acción a mitad y al final:** siempre el mismo, los 15 ejercicios gratis.
- **Graba en bloque:** prepara los 4 videos en una tarde y edita con cortes simples.

---

## Video 1 (día 6): "Resuelvo 5 preguntas SQL de entrevista en vivo"

**Títulos (elige uno):**

1. Resuelvo 5 preguntas SQL de entrevista en vivo (con datos reales)
2. 5 preguntas de SQL que te hacen en una entrevista de analista de datos
3. Prueba técnica de SQL: así se resuelve paso a paso

**Miniatura:** captura de una consulta SQL + texto grande "5 PREGUNTAS SQL" + tu cara con expresión de concentración.

**Prepara:** la base `tienda-practica.sqlite` abierta en DB Browser y los ejercicios 3, 7, 9, 12 y 15 del PDF gratis.

### Guion

**0:00 – Gancho (30 s)**
"Estas 5 preguntas de SQL aparecen, con distintas palabras, en casi todas las pruebas técnicas de analista de datos. Las voy a resolver en vivo con una base de datos de una tienda online de 8.528 pedidos, y al final te digo cómo practicar con la misma base, gratis."

**0:30 – La base de datos (1 min)**
Muestra las 5 tablas: `clientes`, `pedidos`, `detalle_pedido`, `productos` y `categorias`. Explica que la venta válida es un pedido entregado o enviado, y que el ingreso es `cantidad × precio_unitario × (1 − descuento)`. "Definir esto antes de escribir una línea es lo primero que hace un analista."

**1:30 – Pregunta 1, fácil: pedidos por estado y su porcentaje (2 min)**
Escribe la consulta del ejercicio 3: `GROUP BY estado` con un porcentaje sobre el total.
- **Resultado:** 87,4% entregados, 6,1% cancelados, 5,6% devueltos.
- **Mensaje:** "Este 12% de cancelados y devueltos es el que muchos se olvidan de filtrar cuando calculan ventas."

**3:30 – Pregunta 2, intermedia: clientes que nunca compraron (3 min)**
Ejercicio 7: `LEFT JOIN` + `WHERE p.pedido_id IS NULL`.
- **Resultado:** 572 clientes registrados que nunca hicieron un pedido.
- **Explica:** por qué un `JOIN` normal no sirve aquí. Muestra la alternativa con `NOT EXISTS`.
- **Remata:** "En el trabajo, esta lista va directo al equipo de marketing para una campaña de reactivación."

**6:30 – Llamado a la acción a mitad del video (20 s)**
"Si quieres practicar mientras ves, los 15 ejercicios con esta base de datos y las soluciones están gratis en el link de la descripción."

**7:00 – Pregunta 3, intermedia: margen bruto por categoría (3 min)**
Ejercicio 9: 4 tablas unidas, margen = (ingreso − costo) / ingreso.
- **Resultado:** Belleza tiene el mayor margen (57,9%) y Tecnología el menor (20,3%), aunque es de las que más vende.
- **Mensaje de negocio:** "Vender más no siempre es ganar más."

**10:00 – Pregunta 4, avanzada: top 3 productos de cada categoría (3 min)**
Ejercicio 12: CTE + `ROW_NUMBER() OVER (PARTITION BY categoria ORDER BY ingreso DESC)`.
- **Explica** por qué no se puede filtrar `puesto <= 3` en el mismo `WHERE`.
- **Menciona** la diferencia con `RANK` en caso de empates.

**13:00 – Pregunta 5, avanzada: Pareto 80/20 (3 min)**
Ejercicio 15: ingreso acumulado con `SUM() OVER (ORDER BY ingreso DESC)`.
- **Resultado:** 30 de los 64 productos generan el 80% del ingreso.
- **Giro interesante:** "No siempre es 80/20. Aquí es más bien 47/80, y eso también es un hallazgo: el ingreso está menos concentrado de lo que se suele creer."

**16:00 – Cierre (1 min)**
"Si te trabaste en alguna, es normal: las funciones de ventana son lo que más filtra en las pruebas. Practica las 15 con la misma base de datos, gratis, en el link de la descripción. Y si quieres el plan completo de 8 semanas, con 60 ejercicios, proyectos y CV, también está ahí."

### Descripción

```text
Resuelvo 5 preguntas de SQL de entrevista para analista de datos, en vivo y con una base de datos real de e-commerce (8.528 pedidos).

📥 Descarga gratis la base de datos y los 15 ejercicios con soluciones:
https://rutaanalista.com/gratis?utm_source=youtube&utm_medium=descripcion&utm_campaign=video-5-preguntas

📚 Funciones de ventana explicadas: https://rutaanalista.com/blog/funciones-de-ventana-sql

Capítulos
0:00 Las 5 preguntas
0:30 La base de datos
1:30 Pedidos por estado (fácil)
3:30 Clientes que nunca compraron (LEFT JOIN)
7:00 Margen por categoría
10:00 Top 3 por categoría (ROW_NUMBER)
13:00 Pareto 80/20 (SUM OVER)
16:00 Cómo practicar
```

**Cortes para videos cortos:** "572 clientes nunca compraron: así los encuentras", "Vender más no es ganar más (margen por categoría)" y "Top 3 por grupo en 30 segundos".

---

## Video 2 (día 13): "Proyecto de portafolio completo: ventas de e-commerce"

**Títulos:**

1. Proyecto de portafolio para analista de datos: de cero a dashboard
2. Así haría mi primer proyecto de análisis de datos (SQL + Excel)
3. Análisis de ventas de e-commerce paso a paso: proyecto completo

**Miniatura:** un dashboard simple con "+79%" en grande, y el texto "PROYECTO COMPLETO".

**Prepara:**
- la base gratis;
- una hoja de Excel o Power BI vacía;
- el README de ejemplo de [proyectos de portafolio](https://rutaanalista.com/blog/proyectos-portafolio-analista-de-datos).

### Guion

**0:00 – Gancho (30 s)**
"Un reclutador ve decenas de portafolios con el Titanic. Hoy te muestro un proyecto que se parece al trabajo real: una tienda online cuyas ventas crecieron 79% en un año, y la pregunta incómoda de si ese crecimiento fue rentable."

**0:30 – La estructura de un buen proyecto (2 min)**
Contexto → preguntas → SQL → hallazgos con números → recomendaciones → dashboard. "El SQL es solo el paso 3."

**2:30 – Preguntas de negocio (1 min)**
Escríbelas en pantalla:
1. ¿Cuánto crecimos y por qué?
2. ¿Qué categorías generan ingreso y cuáles margen?
3. ¿Qué meses concentran las ventas?

**3:30 – SQL: crecimiento año contra año (4 min)**
Ingreso, pedidos, clientes y ticket promedio por año.

| | 2024 | 2025 | Variación |
|---|---|---|---|
| Ingreso | 174.927 | 313.958 | +79% |
| Pedidos | 2.775 | 4.757 | +71% |
| Clientes | 1.488 | 2.427 | +63% |
| Ticket promedio | 63,04 | 66,00 | +4,7% |

**Mensaje:** "El crecimiento viene sobre todo de más clientes y más pedidos, no de un ticket más alto."

**7:30 – Llamado a la acción a mitad del video (20 s)**
"Esta base de datos es gratis, con 15 ejercicios resueltos. Link en la descripción: haz el proyecto conmigo."

**8:00 – SQL: margen por categoría (4 min)**
- **Margen total:** subió de 37,5% en 2024 a 40,8% en 2025.
- **Pero:** Tecnología, la segunda categoría en ingreso de 2025, deja solo 22,0% de margen.
- **Pregunta abierta:** "¿Es por los descuentos? No: el descuento promedio es de apenas 1,7% en Tecnología. Es el costo de los productos. Ese es el tipo de matiz que diferencia un análisis."

**12:00 – Estacionalidad (2 min)**
Ingreso por mes. Noviembre de 2025 fue el mejor mes de la serie (41.720), seguido de diciembre. "Recomendación: preparar inventario y campañas desde octubre."

**14:00 – El dashboard (4 min)**
Construye en vivo 4 elementos:
- KPI de ingreso con su variación;
- línea de ingreso mensual;
- barras de margen por categoría ordenadas;
- tabla de ticket promedio.

"Si tiene más de 5 elementos, nadie entiende el mensaje."

**18:00 – Recomendaciones y README (2 min)**
Tres recomendaciones concretas, y cómo escribir el README con los hallazgos arriba.

**20:00 – Cierre (1 min)**
"Publica este proyecto en GitHub y en LinkedIn esta semana. En el Kit Ruta Analista tienes este proyecto y otros dos (inventario y marketing) guiados paso a paso, con el dashboard listo para adaptar. Link en la descripción."

### Descripción

```text
Proyecto de portafolio completo para analista de datos: análisis de ventas de una tienda online con SQL y un dashboard, de la pregunta de negocio a las recomendaciones.

📥 Base de datos gratis para hacer el proyecto conmigo:
https://rutaanalista.com/gratis?utm_source=youtube&utm_medium=descripcion&utm_campaign=video-proyecto-ventas

📚 7 ideas de proyectos y cómo presentarlos: https://rutaanalista.com/blog/proyectos-portafolio-analista-de-datos
🧰 Kit Ruta Analista (3 proyectos guiados): https://rutaanalista.com/?utm_source=youtube&utm_medium=descripcion&utm_campaign=video-proyecto-ventas

Capítulos
0:00 El proyecto
0:30 Estructura de un buen proyecto
2:30 Preguntas de negocio
3:30 Crecimiento año contra año
8:00 Margen por categoría
12:00 Estacionalidad
14:00 Dashboard
18:00 Recomendaciones y README
```

**Cortes:** "+79% en ventas… ¿y el margen?", "El dashboard que se entiende en 30 segundos" y "Cómo escribir el README de tu proyecto".

---

## Video 3 (día 20): "CV de analista de datos que pase el ATS"

**Títulos:**

1. CV de analista de datos: cómo pasar el filtro ATS (español e inglés)
2. Arreglo un CV de analista de datos en vivo: antes y después
3. El CV que te consigue entrevistas como analista de datos

**Miniatura:** un CV tachado en rojo a la izquierda y uno limpio a la derecha, con el texto "ANTES / DESPUÉS".

**Prepara:**
- un CV de ejemplo ficticio con errores típicos (dos columnas, barras de habilidad, funciones en vez de logros);
- la plantilla del kit;
- el artículo [CV de analista de datos](https://rutaanalista.com/blog/cv-analista-de-datos).

### Guion

**0:00 – Gancho (30 s)**
"Tu CV tiene dos lectores: un software que lo filtra antes de que lo vea una persona, y una persona que le da unos segundos. Hoy arreglo un CV en vivo para que pase los dos."

**0:30 – Cómo funciona un ATS (2 min)**
Extrae texto, busca palabras clave y lee mal las columnas, los íconos y los cuadros de texto.

**2:30 – El CV de ejemplo y sus 5 problemas (3 min)**
- dos columnas;
- barras de "nivel de SQL";
- "Responsable de informes";
- no hay proyectos;
- el mismo perfil para todo.

**5:30 – Arreglo 1: estructura (2 min)**
Una columna, títulos estándar y los proyectos antes que la experiencia si no tienes experiencia en datos.

**7:30 – Arreglo 2: logros con la fórmula (4 min)**
Fórmula: verbo + qué hiciste + herramienta + resultado. Reescribe 3 frases en vivo, con los ejemplos de la tabla de antes y después del artículo.

**11:30 – Llamado a la acción a mitad del video (20 s)**
"Si no tienes proyectos para tu CV, empieza con la base de datos gratis: link abajo."

**12:00 – Arreglo 3: palabras clave de la oferta (3 min)**
Toma una oferta real (anónima), subraya las 5 palabras que más se repiten y muestra dónde van en el CV.

**15:00 – La versión en inglés (3 min)**
Diferencias:
- sin foto ni datos personales;
- 1 página;
- verbos en pasado;
- "Open to remote, US time zones".

Traduce dos logros en vivo.

**18:00 – Checklist final y cierre (2 min)**
Repasa el checklist del artículo. Cierre: "Las plantillas en español e inglés compatibles con ATS, la guía de LinkedIn y los mensajes para reclutadores están en el Kit Ruta Analista. Link en la descripción."

### Descripción

```text
Cómo hacer un CV de analista de datos que pase el filtro ATS: arreglo un CV en vivo, con logros medibles, palabras clave y la versión en inglés para trabajos remotos.

📚 Guía completa con ejemplos: https://rutaanalista.com/blog/cv-analista-de-datos
📥 Base de datos gratis para tu primer proyecto de portafolio:
https://rutaanalista.com/gratis?utm_source=youtube&utm_medium=descripcion&utm_campaign=video-cv
🧰 Plantillas de CV ES/EN (Kit Ruta Analista): https://rutaanalista.com/?utm_source=youtube&utm_medium=descripcion&utm_campaign=video-cv

Capítulos
0:00 Los dos lectores de tu CV
0:30 Cómo funciona un ATS
2:30 Los 5 problemas del CV
5:30 Estructura
7:30 Logros con números
12:00 Palabras clave
15:00 Versión en inglés
18:00 Checklist
```

**Cortes:** "La fórmula para escribir un logro en tu CV", "Por qué las barras de nivel de SQL te perjudican" y "CV para Estados Unidos: 3 diferencias".

---

## Video 4 (día 27): "Proyecto de inventario: dónde se pierde la plata"

> Este video usa los datos del **proyecto 2 del kit** (inventario de 3 bodegas), no la base gratis. Es una muestra del contenido pagado. Enséñalo completo, pero aclara que la base de datos de este proyecto viene en el kit.

**Títulos:**

1. Proyecto de inventario para analista de datos: dónde se pierde la plata
2. Análisis de mermas con SQL: el proyecto de portafolio que nadie hace
3. Así se analiza un inventario con datos (proyecto completo)

**Miniatura:** gráfico de una línea que baja con el texto "4,2% → 1,9%" y "MERMAS".

**Prepara:** la base del proyecto de inventario del kit y la guía del proyecto 2.

### Guion

**0:00 – Gancho (30 s)**
"En este proyecto, una cadena de retail (ficticia, pero con datos realistas) perdía más del 4% de su inventario en daños y faltantes. Cambió una sola cosa en el proceso y la pérdida bajó a menos de la mitad. Hoy te muestro cómo se mide eso con datos, y por qué este tipo de proyecto te diferencia en una entrevista."

**0:30 – Por qué un proyecto de operaciones (1 min)**
"Casi todos los portafolios son de ventas o de películas. Uno de operaciones muestra que entiendes procesos y costos, y eso lo buscan las empresas de retail, logística y manufactura."

**1:30 – Conceptos (2 min)**
- **Tasa de merma** = unidades perdidas / unidades recibidas.
- **Días de inventario** = stock actual / venta diaria promedio.
- **Por qué la tasa y no las unidades:** una bodega más grande siempre pierde más unidades.

**3:30 – SQL: merma por bodega, categoría y motivo (5 min)**
Recorre las consultas del proyecto: agregación por bodega y motivo, y tasa sobre unidades recibidas.

**8:30 – Llamado a la acción a mitad del video (20 s)**
"Si quieres practicar SQL antes de un proyecto como este, los 15 ejercicios gratis están en la descripción."

**9:00 – El antes y después del cambio de proceso (4 min)**
- La tasa de merma pasó de 4,18% a 1,87% después del cambio en el registro de daños.
- **Lección para la entrevista:** cómo presentar el impacto de una mejora sin exagerar, comparando periodos equivalentes y diciendo qué más pudo influir.

**13:00 – Riesgo de quiebre de stock (3 min)**
Días de inventario por producto y bodega: 25 combinaciones tienen menos de 15 días de inventario. Así se arma la lista de reposición priorizada.

**16:00 – Dashboard y recomendaciones (3 min)**
Elementos:
- KPI de tasa de merma con su tendencia;
- barras por bodega;
- tabla de reposición.

Tres recomendaciones con un responsable cada una.

**19:00 – Cierre (1 min)**
"Este proyecto, con su base de datos, las consultas, el dashboard en Excel y la plantilla de README, está en el Kit Ruta Analista junto con el de ventas y el de marketing. Link en la descripción."

### Descripción

```text
Proyecto de portafolio de operaciones para analista de datos: análisis de mermas e inventario con SQL, el antes y después de un cambio de proceso, y una lista de reposición priorizada.

🧰 Proyecto completo con base de datos y dashboard (Kit Ruta Analista):
https://rutaanalista.com/?utm_source=youtube&utm_medium=descripcion&utm_campaign=video-inventario
📥 15 ejercicios SQL gratis para practicar antes:
https://rutaanalista.com/gratis?utm_source=youtube&utm_medium=descripcion&utm_campaign=video-inventario

Capítulos
0:00 El problema
0:30 Por qué un proyecto de operaciones
1:30 Tasa de merma y días de inventario
3:30 SQL: merma por bodega y motivo
9:00 Antes y después del cambio de proceso
13:00 Riesgo de quiebre de stock
16:00 Dashboard y recomendaciones
```

**Cortes:** "Por qué medir tasas y no unidades", "Cómo presentar el impacto de una mejora sin exagerar" y "La lista de reposición en 30 segundos".

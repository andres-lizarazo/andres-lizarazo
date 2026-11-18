---
title: "Proyectos de portafolio para analista de datos: 7 ideas y cómo presentarlos"
description: "Ideas de proyectos de portafolio que se parecen al trabajo real de un analista de datos, la estructura que hace que destaquen y cómo publicarlos en GitHub."
date: 2026-11-04
keyword: "proyectos de portafolio analista de datos"
readingMinutes: 8
---

Un reclutador ve decenas de portafolios por semana, y muchos tienen los mismos proyectos: Titanic, Netflix, Iris. No están mal para aprender, pero no te diferencian. Un buen **proyecto de portafolio para analista de datos** se parece al trabajo real: parte de una pregunta de negocio, la responde con datos y termina en una recomendación.

En este artículo te dejo la estructura que hace que un proyecto destaque, 7 ideas concretas y cómo publicarlo para que lo vean.

## La estructura de un proyecto que llama la atención

1. **Contexto de negocio (2–3 frases).** "Eres analista de una tienda online que vende en 6 países. Las ventas crecieron, pero la gerencia no sabe si el crecimiento es rentable."
2. **Preguntas concretas (3–5).** "¿Qué categorías generan ingreso y cuáles generan margen?"
3. **SQL limpio y comentado.** Que se pueda leer y reproducir.
4. **Hallazgos con números.** "Tecnología es la segunda categoría en ventas, pero deja el margen más bajo." Mejor aún con el porcentaje exacto.
5. **Recomendaciones accionables.** Qué harías, por qué y cómo lo medirías.
6. **Un dashboard de una página** que se entienda en 30 segundos.

Fíjate en que el SQL es solo el punto 3. Lo que te diferencia son el contexto, los hallazgos y las recomendaciones.

### Ejemplo: de la pregunta a la consulta

Pregunta: *¿qué categorías generan ingreso y cuáles generan margen?* Con la base de práctica de Andina Market:

```sql
SELECT c.nombre AS categoria,
       ROUND(SUM(d.cantidad * d.precio_unitario * (1 - d.descuento)), 0) AS ingreso,
       ROUND(100.0 * SUM(d.cantidad * (d.precio_unitario * (1 - d.descuento) - pr.costo))
             / SUM(d.cantidad * d.precio_unitario * (1 - d.descuento)), 1) AS margen_pct
FROM pedidos p
JOIN detalle_pedido d ON d.pedido_id = p.pedido_id
JOIN productos pr     ON pr.producto_id = d.producto_id
JOIN categorias c     ON c.categoria_id = pr.categoria_id
WHERE p.estado IN ('entregado', 'enviado')
GROUP BY c.nombre
ORDER BY ingreso DESC;
```

El resultado cuenta una historia: hay categorías que venden mucho y dejan poco margen. Ese contraste es el corazón de un buen proyecto.

## 7 ideas de proyectos de portafolio

### 1. Ventas: ¿crecemos bien?
Evolución mensual de ingreso, pedidos y ticket promedio. Mezcla de categorías, margen por categoría, efecto de los descuentos. **Recomendación típica:** ajustar descuentos según el margen de cada categoría.

### 2. Inventario: ¿dónde se pierde la plata?
Tasa de merma (unidades perdidas sobre unidades recibidas) por bodega, categoría y motivo; el antes y el después de un cambio de proceso; productos con pocos días de inventario. **Muestra:** que entiendes operaciones y que cuantificas el impacto de una mejora.

### 3. Marketing: ¿dónde invertir el próximo dólar?
Costo de adquisición (CAC) por canal, tasa de recompra, cohortes de retención y valor del cliente (LTV). **El hallazgo que buscan:** un canal barato puede traer clientes que no vuelven.

### 4. Retención y abandono de clientes
¿Cuántos clientes compraron una vez y nunca más? ¿Cuánto tarda la segunda compra? ¿Qué diferencia a quienes vuelven? Ideal para practicar funciones de ventana como `LAG` y `ROW_NUMBER`.

### 5. Segmentación RFM
Clasifica a los clientes por Recencia, Frecuencia y Monto con `NTILE(4)`. Propón una acción distinta para cada segmento: premiar a los mejores, reactivar a los dormidos.

### 6. Logística y tiempos de entrega
Si consigues datos de envíos (hay datasets públicos de e-commerce), analiza los tiempos de entrega por ciudad y transportadora y su relación con las devoluciones o las calificaciones.

### 7. Calidad de datos
Toma un dataset "sucio", encuentra duplicados, valores faltantes e inconsistencias, y mide cuánto cambian las métricas después de limpiarlo. Pocos lo hacen y es exactamente lo que valoran los equipos de datos.

<div class="cta-inline">
<p><strong>¿No tienes datos para empezar?</strong> Descarga gratis la base de Andina Market (clientes, pedidos y productos) con 15 ejercicios SQL resueltos.</p>
<a href="/gratis?utm_source=blog&utm_medium=articulo&utm_campaign=portafolio">Descargar la base de datos gratis →</a>
</div>

## Dónde conseguir datos

- **Datasets ficticios pero realistas**, como la base de práctica de este blog. Tienen la ventaja de que puedes compartirlos sin problemas.
- **Datos abiertos de gobierno:** muchos países de Latinoamérica tienen portales de datos abiertos con información de comercio, transporte o salud.
- **Repositorios públicos de datasets** (por ejemplo, Kaggle). Elige los que tengan contexto de negocio y evita los más repetidos.
- **Tu propio trabajo**, solo si anonimizas todo y tienes permiso. Nunca publiques datos de tu empresa.

## Cómo publicarlo para que lo vean

### En GitHub

1. Un repositorio por proyecto, con un nombre claro: `analisis-ventas-ecommerce`.
2. Un `README.md` con este orden: contexto, preguntas, hallazgos (con números), recomendaciones, captura del dashboard y cómo reproducirlo.
3. Las consultas en un archivo `.sql` comentado.
4. Fija (*pin*) tus mejores 3 repositorios en tu perfil.

Una plantilla mínima de README:

```text
# Análisis de ventas de e-commerce: ¿crecemos bien?

## Contexto
## Preguntas de negocio
## Hallazgos principales (con números)
## Recomendaciones
## Dashboard
## Cómo reproducirlo
```

### En LinkedIn

Publica un post por proyecto: la pregunta, 3 hallazgos con números, una recomendación y una imagen del dashboard. Agrega los proyectos en las secciones **Proyectos** y **Destacado** de tu perfil. Un post con un análisis real hace más por tu búsqueda que diez certificados.

## Cómo presentar tu proyecto en una entrevista (en 2 minutos)

Tarde o temprano te van a decir: "Cuéntame de un proyecto que hayas hecho". Esa pregunta es una oportunidad enorme si la preparas, porque tú eliges el tema. Usa esta estructura:

1. **El problema (15 segundos):** "Quería entender si el crecimiento de una tienda online era rentable."
2. **Los datos y el método (30 segundos):** "Trabajé con 8.500 pedidos en SQL: crucé pedidos, productos y costos, y calculé ingreso y margen por categoría y por mes."
3. **El hallazgo principal (30 segundos):** "La segunda categoría en ventas era la de menor margen, así que una parte del crecimiento venía con poca rentabilidad."
4. **La recomendación (20 segundos):** "Propuse revisar los descuentos en esa categoría y medir el margen semanal en un dashboard."
5. **Lo que aprendiste o harías distinto (15 segundos):** "Si tuviera más tiempo, separaría el efecto de los descuentos del efecto del costo."

Practícalo en voz alta hasta que te salga natural, sin leerlo. Y prepárate para las preguntas de seguimiento: "¿por qué elegiste esa métrica?", "¿qué supuestos hiciste?", "¿cómo validaste los datos?". Si el proyecto es tuyo, esas preguntas son fáciles.

## Cuántos proyectos necesitas y en qué orden hacerlos

**Tres proyectos bien hechos** son suficientes para empezar a postular. Más que la cantidad, importa que cubran áreas distintas del negocio. Un orden que funciona:

1. **Ventas** primero, porque es el más intuitivo y te obliga a dominar JOINs, agregaciones y fechas.
2. **Operaciones** (inventario o logística) después, porque muestra que entiendes procesos y costos.
3. **Marketing o clientes** al final, porque usa conceptos más avanzados como cohortes, CAC y LTV. Si quieres adelantarte, aquí te explico el [análisis de cohortes con SQL](/blog/analisis-de-cohortes-sql) y las [métricas de negocio que debes dominar](/blog/metricas-de-negocio-analista-de-datos).

Si ya sabes a qué industria quieres llegar (banca, retail, salud, logística), adapta al menos uno de los proyectos a esa industria. Un reclutador de una empresa de logística va a prestar mucha más atención a un análisis de tiempos de entrega que a uno de películas.

## Errores comunes

- **Proyectos sin pregunta.** "Exploré el dataset" no es un proyecto; "descubrí por qué cayeron las ventas" sí.
- **Hallazgos sin números.** "Las ventas mejoraron bastante" no convence; "+79% año contra año" sí.
- **Dashboards recargados.** Si tiene 15 gráficos, nadie entiende el mensaje. Cuatro o cinco elementos bien elegidos son suficientes.
- **Copiar un proyecto ajeno.** En la entrevista te van a preguntar por qué tomaste cada decisión. Tienes que poder responder.

## Preguntas frecuentes

**¿Sirven los proyectos con datos ficticios?**
Sí, siempre que sean realistas y lo digas con claridad en el README. Lo que se evalúa es tu forma de pensar: la pregunta, el método, el hallazgo y la recomendación. Un dataset ficticio bien construido, con contexto de negocio, es mejor que uno real sin pregunta.

**¿Tengo que usar Python?**
No para un primer rol de analista. SQL y una herramienta de visualización (Excel, Power BI o Tableau) son suficientes para proyectos sólidos. Si ya sabes Python, úsalo en uno de los proyectos para mostrarlo, pero no a costa de la claridad.

**¿Excel, Power BI o Tableau para el dashboard?**
Usa la herramienta que más aparezca en las ofertas de tu país y de tu industria. En muchas empresas de Latinoamérica es Power BI o Excel. Lo importante es que el dashboard responda la pregunta del proyecto en una sola vista. Si no sabes cuál elegir, aquí comparo [SQL y Excel para análisis de datos](/blog/sql-vs-excel-analisis-de-datos).

**¿Cuánto tiempo toma un proyecto?**
Con una hora diaria, entre una y dos semanas por proyecto. El primero tarda más; el tercero suele salir en la mitad del tiempo.

## Siguiente paso

Elige una de las 7 ideas y empieza esta semana con la [base de datos gratis](/gratis?utm_source=blog&utm_medium=articulo&utm_campaign=portafolio). Si te falta práctica de SQL, empieza por las [preguntas de entrevista SQL](/blog/preguntas-entrevista-sql-analista-de-datos).

Y si prefieres hacerlo con guía, el [Kit Ruta Analista](/?utm_source=blog&utm_medium=articulo&utm_campaign=portafolio) incluye 3 proyectos completos (ventas, inventario y marketing) con consultas, dashboards en Excel y plantillas de README.

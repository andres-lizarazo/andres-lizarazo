---
title: "Análisis de cohortes con SQL paso a paso (con datos reales para practicar)"
description: "Qué es un análisis de cohortes, cómo calcular la retención de clientes con SQL y cómo leer e interpretar la tabla de cohortes en una entrevista o en tu trabajo."
date: 2026-11-04
keyword: "analisis de cohortes sql"
readingMinutes: 9
---

"¿Los clientes que conseguimos en diciembre vuelven a comprar?" Esa pregunta parece sencilla, pero no se responde con un total de ventas. Se responde con un **análisis de cohortes**, una de las herramientas más útiles de un analista de datos y una pregunta frecuente en las pruebas técnicas de roles de marketing, producto y e-commerce.

En esta guía lo construimos paso a paso con SQL, usando la base de práctica de Andina Market, una tienda online ficticia con 8.528 pedidos. [Descárgala gratis aquí](/gratis?utm_source=blog&utm_medium=articulo&utm_campaign=cohortes) y ejecuta cada consulta mientras lees.

## Qué es una cohorte (y por qué no basta con el total)

Una **cohorte** es un grupo de clientes que comparten un punto de partida. Lo más común es agruparlos por el mes de su primera compra: todos los que compraron por primera vez en enero de 2024 forman la cohorte 2024-01.

El análisis de cohortes sigue a cada grupo en el tiempo y responde: de los clientes que empezaron en ese mes, **¿qué porcentaje volvió a comprar 1, 2, 3 o 6 meses después?**

¿Por qué no basta con mirar las ventas totales? Porque el total mezcla clientes nuevos con clientes antiguos. Las ventas pueden crecer porque estás comprando mucho tráfico nuevo mientras los clientes antiguos se van sin hacer ruido. Las cohortes separan esos dos efectos.

## Paso 1: la primera compra de cada cliente

Todo empieza por definir el punto de partida. Usamos solo pedidos válidos (entregados o enviados), porque un pedido cancelado no convierte a nadie en cliente.

```sql
WITH primera AS (
  SELECT cliente_id, MIN(fecha_pedido) AS primera_compra
  FROM pedidos
  WHERE estado IN ('entregado', 'enviado')
  GROUP BY cliente_id
)
SELECT strftime('%Y-%m', primera_compra) AS cohorte, COUNT(*) AS clientes_nuevos
FROM primera
GROUP BY cohorte
ORDER BY cohorte
LIMIT 6;
```

El resultado te dice el tamaño de cada cohorte: 44 clientes nuevos en enero de 2024, 72 en febrero, 97 en marzo. Ese tamaño será el denominador de la retención.

**Ojo con una decisión que parece menor:** ¿la cohorte se define por la fecha de registro o por la primera compra? Depende de la pregunta. Para retención de compradores, usa la primera compra. Para activación de usuarios registrados, la fecha de registro. En una entrevista, decir en voz alta esta decisión suma puntos.

## Paso 2: cuántos meses después de su primera compra volvió cada cliente

Ahora calculamos, para cada pedido, cuántos meses pasaron desde la primera compra del cliente. El truco es convertir cada fecha a un número de meses (`año × 12 + mes`) y restar.

```sql
WITH primera AS (
  SELECT cliente_id, MIN(fecha_pedido) AS primera_compra
  FROM pedidos
  WHERE estado IN ('entregado', 'enviado')
  GROUP BY cliente_id
),
actividad AS (
  SELECT p.cliente_id,
         strftime('%Y-%m', f.primera_compra) AS cohorte,
         (CAST(strftime('%Y', p.fecha_pedido) AS INTEGER) * 12 + CAST(strftime('%m', p.fecha_pedido) AS INTEGER))
       - (CAST(strftime('%Y', f.primera_compra) AS INTEGER) * 12 + CAST(strftime('%m', f.primera_compra) AS INTEGER)) AS mes_n
  FROM pedidos p
  JOIN primera f ON f.cliente_id = p.cliente_id
  WHERE p.estado IN ('entregado', 'enviado')
)
SELECT cohorte, mes_n, COUNT(DISTINCT cliente_id) AS clientes_activos
FROM actividad
WHERE cohorte = '2024-01'
GROUP BY cohorte, mes_n
ORDER BY mes_n
LIMIT 8;
```

`mes_n = 0` es el mes de la primera compra (siempre el 100% de la cohorte). `mes_n = 1` es el mes siguiente, y así sucesivamente. De los 44 clientes de enero de 2024, 6 volvieron a comprar en febrero.

¿Por qué `COUNT(DISTINCT cliente_id)` y no `COUNT(*)`? Porque un cliente puede hacer dos pedidos en el mismo mes y solo debe contar una vez como activo. Este es uno de los errores más comunes en las pruebas técnicas.

En otras bases de datos la resta de meses se escribe distinto: en PostgreSQL puedes usar `DATE_PART` sobre `AGE()` o la misma fórmula de año × 12 + mes, y en BigQuery `DATE_DIFF(fecha, primera, MONTH)`.

<div class="cta-inline">
<p><strong>Practica con la misma base:</strong> 15 ejercicios SQL de entrevista con soluciones explicadas, incluidos LAG, top N por grupo y Pareto.</p>
<a href="/gratis?utm_source=blog&utm_medium=articulo&utm_campaign=cohortes">Descargar los ejercicios gratis →</a>
</div>

## Paso 3: la tabla de cohortes con porcentajes

La forma clásica de presentar el análisis es una tabla con una fila por cohorte y una columna por mes. Con `SUM(condición)` contamos cuántos clientes cumplen cada caso (en SQLite una comparación vale 1 o 0), y dividimos por el tamaño de la cohorte.

```sql
WITH primera AS (
  SELECT cliente_id, MIN(fecha_pedido) AS primera_compra
  FROM pedidos
  WHERE estado IN ('entregado', 'enviado')
  GROUP BY cliente_id
),
actividad AS (
  SELECT DISTINCT p.cliente_id,
         strftime('%Y-%m', f.primera_compra) AS cohorte,
         (CAST(strftime('%Y', p.fecha_pedido) AS INTEGER) * 12 + CAST(strftime('%m', p.fecha_pedido) AS INTEGER))
       - (CAST(strftime('%Y', f.primera_compra) AS INTEGER) * 12 + CAST(strftime('%m', f.primera_compra) AS INTEGER)) AS mes_n
  FROM pedidos p
  JOIN primera f ON f.cliente_id = p.cliente_id
  WHERE p.estado IN ('entregado', 'enviado')
)
SELECT cohorte,
       SUM(mes_n = 0) AS clientes,
       ROUND(100.0 * SUM(mes_n = 1) / SUM(mes_n = 0), 1) AS mes_1,
       ROUND(100.0 * SUM(mes_n = 2) / SUM(mes_n = 0), 1) AS mes_2,
       ROUND(100.0 * SUM(mes_n = 3) / SUM(mes_n = 0), 1) AS mes_3,
       ROUND(100.0 * SUM(mes_n = 6) / SUM(mes_n = 0), 1) AS mes_6
FROM actividad
WHERE cohorte BETWEEN '2024-01' AND '2024-12'
GROUP BY cohorte
ORDER BY cohorte;
```

Aquí el `DISTINCT` en el CTE `actividad` garantiza una fila por cliente y mes, así que cada `SUM` cuenta clientes y no pedidos. En PostgreSQL o BigQuery escribirías `COUNT(*) FILTER (WHERE mes_n = 1)` o `COUNTIF(mes_n = 1)`.

Un fragmento del resultado:

| Cohorte | Clientes | Mes 1 | Mes 2 | Mes 3 | Mes 6 |
|---|---|---|---|---|---|
| 2024-01 | 44 | 13,6% | 11,4% | 13,6% | 6,8% |
| 2024-07 | 105 | 29,5% | 17,1% | 20,0% | 3,8% |
| 2024-11 | 215 | 24,2% | 11,6% | 12,1% | 4,7% |
| 2024-12 | 255 | 18,4% | 18,4% | 19,2% | 9,8% |

## Cómo leer la tabla de cohortes

Una tabla de cohortes se lee en tres direcciones, y cada una responde una pregunta distinta:

1. **Por fila (horizontal):** cómo se comporta una cohorte en el tiempo. La retención suele caer rápido al principio y luego estabilizarse. Si la curva se aplana en un nivel razonable, tienes una base de clientes leales.
2. **Por columna (vertical):** si las cohortes nuevas retienen mejor o peor que las antiguas en el mismo momento de su vida. Es la forma de ver si un cambio en el producto o en el servicio mejoró la retención.
3. **Por diagonal:** meses del calendario. Si todas las cohortes suben en la misma diagonal, hubo un efecto del calendario (una temporada, una promoción), no una mejora de los clientes.

**Con estos datos:** la cohorte de noviembre de 2024 es la segunda más grande del año (215 clientes, temporada de fin de año), pero al sexto mes retiene solo el 4,7%, cuando varias cohortes del mismo año superan el 10%. Es una pista que vale la pena investigar: los clientes que llegan por promociones de temporada suelen volver menos. Antes de concluir, revisa si la cohorte de noviembre de 2025 muestra lo mismo en sus primeros meses y de qué canales vinieron esos clientes. Una recomendación razonable sería evaluar las campañas de temporada por el valor que esos clientes dejan después, no solo por las ventas del mes.

## Paso 4: retención por canal de adquisición

La pregunta que más le importa al equipo de marketing: **¿qué canal trae clientes que vuelven?** Aquí usamos otra métrica muy común, la recompra en 90 días.

```sql
WITH primera AS (
  SELECT cliente_id, MIN(fecha_pedido) AS primera_compra
  FROM pedidos
  WHERE estado IN ('entregado', 'enviado')
  GROUP BY cliente_id
),
segunda AS (
  SELECT f.cliente_id, f.primera_compra,
         MIN(p.fecha_pedido) AS segunda_compra
  FROM primera f
  LEFT JOIN pedidos p ON p.cliente_id = f.cliente_id
                     AND p.estado IN ('entregado', 'enviado')
                     AND p.fecha_pedido > f.primera_compra
  GROUP BY f.cliente_id, f.primera_compra
)
SELECT c.canal_adquisicion AS canal,
       COUNT(*) AS clientes,
       ROUND(100.0 * SUM(julianday(s.segunda_compra) - julianday(s.primera_compra) <= 90) / COUNT(*), 1) AS recompra_90d_pct
FROM segunda s
JOIN clientes c ON c.cliente_id = s.cliente_id
WHERE s.primera_compra <= '2025-09-30'
GROUP BY c.canal_adquisicion
ORDER BY recompra_90d_pct DESC;
```

Dos detalles que muestran criterio:

- **El `LEFT JOIN`** conserva a los clientes que nunca volvieron. Con un `JOIN` normal desaparecerían y la recompra saldría inflada.
- **El filtro `primera_compra <= '2025-09-30'`** deja fuera a los clientes que todavía no han tenido 90 días para volver (los datos terminan en diciembre de 2025). Sin ese filtro, las cohortes recientes bajarían el promedio de forma injusta. Esto se llama **censura por la derecha** y es de las cosas que un entrevistador espera que notes.

El resultado: los clientes que llegan por referidos recompran en 90 días en un 58,5% de los casos, y los de TikTok en un 34,0%. Un canal puede traer muchos clientes baratos que no vuelven; por eso la retención se mira junto con el costo de adquisición.

## Errores comunes en un análisis de cohortes

1. **Contar pedidos en vez de clientes.** Usa `COUNT(DISTINCT cliente_id)` o una tabla con una fila por cliente y mes.
2. **Incluir pedidos cancelados o devueltos** en la definición de la primera compra.
3. **Comparar cohortes que no han madurado.** La cohorte de diciembre de 2025 todavía no puede tener retención al mes 6.
4. **Olvidar el tamaño de la cohorte.** Un 30% de retención en una cohorte de 10 clientes es ruido; muéstralo siempre junto al número de clientes.
5. **Presentar solo la tabla.** La tabla es el insumo; el hallazgo y la recomendación son el análisis.

## Cómo presentarlo en una entrevista o en tu trabajo

Una estructura de tres frases que funciona:

> "Agrupé a los clientes por el mes de su primera compra y medí qué porcentaje volvió a comprar en los meses siguientes. La cohorte de noviembre fue la segunda más grande del año, pero al sexto mes retiene menos de la mitad que las mejores cohortes. Recomiendo evaluar las campañas de fin de año por el valor de los clientes a 6 meses, no solo por las ventas del mes."

Si lo vas a mostrar en un dashboard, el formato más claro es un mapa de calor: la tabla de cohortes con colores más intensos donde la retención es mayor. En Excel lo haces con formato condicional; en Power BI, con una matriz y formato condicional por valor.

## Siguiente paso

Las cohortes combinan casi todo lo que te evalúan en SQL: CTE, JOINs, fechas y agregaciones condicionales. Si quieres reforzar las bases, repasa las [funciones de ventana en SQL](/blog/funciones-de-ventana-sql) y las [preguntas de entrevista SQL más comunes](/blog/preguntas-entrevista-sql-analista-de-datos).

Y si quieres convertir esto en un proyecto de portafolio, el [Kit Ruta Analista](/?utm_source=blog&utm_medium=articulo&utm_campaign=cohortes) incluye un proyecto de marketing completo con cohortes, CAC, LTV y recomendaciones por canal.

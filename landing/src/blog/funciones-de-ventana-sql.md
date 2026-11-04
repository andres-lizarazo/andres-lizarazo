---
title: "Funciones de ventana en SQL explicadas con ejemplos (ROW_NUMBER, RANK, LAG y SUM OVER)"
description: "Qué son las funciones de ventana en SQL, cómo funcionan PARTITION BY y ORDER BY, y ejemplos prácticos de ROW_NUMBER, RANK, LAG, LEAD y acumulados."
date: 2026-11-04
keyword: "funciones de ventana sql"
readingMinutes: 7
---

Las **funciones de ventana** son el tema de SQL que más separa a alguien que "sabe lo básico" de alguien listo para trabajar como analista. Aparecen en casi todas las pruebas técnicas: top N por grupo, crecimiento mes a mes, acumulados, días entre compras.

En esta guía te explico la idea de fondo y te dejo ejemplos que puedes ejecutar con la base de práctica de Andina Market, una tienda online ficticia. [Descárgala gratis aquí](/gratis?utm_source=blog&utm_medium=articulo&utm_campaign=ventanas) y ábrela con DB Browser for SQLite.

## La idea en una frase

Una función de ventana **calcula sobre un grupo de filas relacionadas, pero sin colapsarlas**. Con `GROUP BY` obtienes una fila por grupo; con una función de ventana cada fila conserva su detalle y además recibe un resultado calculado sobre su "ventana".

La sintaxis general es:

```text
FUNCION(...) OVER (
  PARTITION BY columnas   -- define los grupos (opcional)
  ORDER BY columnas       -- define el orden dentro del grupo (opcional)
  ROWS BETWEEN ...        -- define el marco de filas (opcional)
)
```

- **PARTITION BY** divide las filas en grupos, como un GROUP BY que no colapsa.
- **ORDER BY** ordena las filas dentro de cada grupo. Lo necesitan las funciones de ranking y las de "fila anterior/siguiente".
- **El marco (ROWS BETWEEN)** dice qué filas entran en el cálculo, por ejemplo "las 2 anteriores y la actual" para un promedio móvil.

## 1. Total del grupo en cada fila: SUM() OVER (PARTITION BY ...)

Pregunta: ¿qué participación tiene cada categoría en el ingreso total?

```sql
WITH por_categoria AS (
  SELECT c.nombre AS categoria,
         SUM(d.cantidad * d.precio_unitario * (1 - d.descuento)) AS ingreso
  FROM pedidos p
  JOIN detalle_pedido d ON d.pedido_id = p.pedido_id
  JOIN productos pr     ON pr.producto_id = d.producto_id
  JOIN categorias c     ON c.categoria_id = pr.categoria_id
  WHERE p.estado IN ('entregado', 'enviado')
  GROUP BY c.nombre
)
SELECT categoria,
       ROUND(ingreso, 0) AS ingreso,
       ROUND(100.0 * ingreso / SUM(ingreso) OVER (), 1) AS participacion_pct
FROM por_categoria
ORDER BY ingreso DESC;
```

`SUM(ingreso) OVER ()`, con la ventana vacía, es el total de todas las filas, repetido en cada una. Sin subconsultas.

## 2. Numerar y rankear: ROW_NUMBER, RANK y DENSE_RANK

Las tres asignan una posición según un orden. La diferencia está en los empates:

| Valores | ROW_NUMBER | RANK | DENSE_RANK |
|---|---|---|---|
| 100 | 1 | 1 | 1 |
| 100 | 2 | 1 | 1 |
| 80 | 3 | 3 | 2 |

### El clásico: top 3 por grupo

```sql
WITH ventas AS (
  SELECT c.nombre AS categoria, pr.nombre AS producto,
         SUM(d.cantidad * d.precio_unitario * (1 - d.descuento)) AS ingreso
  FROM pedidos p
  JOIN detalle_pedido d ON d.pedido_id = p.pedido_id
  JOIN productos pr     ON pr.producto_id = d.producto_id
  JOIN categorias c     ON c.categoria_id = pr.categoria_id
  WHERE p.estado IN ('entregado', 'enviado')
  GROUP BY c.nombre, pr.producto_id, pr.nombre
), ranking AS (
  SELECT *, ROW_NUMBER() OVER (PARTITION BY categoria ORDER BY ingreso DESC) AS puesto
  FROM ventas
)
SELECT categoria, puesto, producto, ROUND(ingreso, 0) AS ingreso
FROM ranking
WHERE puesto <= 3
ORDER BY categoria, puesto;
```

¿Por qué el CTE? Porque **no puedes filtrar una función de ventana en el mismo WHERE**: las ventanas se calculan después del WHERE (en el paso del SELECT). Por eso se calcula primero y se filtra en la consulta externa.

<div class="cta-inline">
<p><strong>Practica con datos reales:</strong> 15 ejercicios SQL de entrevista, incluidos top N por grupo, LAG y Pareto, con base de datos y soluciones explicadas.</p>
<a href="/gratis?utm_source=blog&utm_medium=articulo&utm_campaign=ventanas">Descargar los ejercicios gratis →</a>
</div>

## 3. Comparar con la fila anterior: LAG y LEAD

`LAG(columna)` trae el valor de la fila anterior según el orden; `LEAD(columna)`, el de la siguiente. Son perfectas para variaciones y tiempos entre eventos.

### Crecimiento mes a mes

```sql
WITH mensual AS (
  SELECT strftime('%Y-%m', p.fecha_pedido) AS mes,
         SUM(d.cantidad * d.precio_unitario * (1 - d.descuento)) AS ingreso
  FROM pedidos p
  JOIN detalle_pedido d ON d.pedido_id = p.pedido_id
  WHERE p.estado IN ('entregado', 'enviado')
  GROUP BY mes
)
SELECT mes,
       ROUND(ingreso, 0) AS ingreso,
       ROUND(LAG(ingreso) OVER (ORDER BY mes), 0) AS mes_anterior,
       ROUND(100.0 * (ingreso / LAG(ingreso) OVER (ORDER BY mes) - 1), 1) AS variacion_pct
FROM mensual
ORDER BY mes;
```

El primer mes sale en NULL porque no tiene mes anterior: es correcto, no un error. Para comparar con el mismo mes del año pasado usarías `LAG(ingreso, 12)`, siempre que no falten meses en la serie.

### Días hasta la siguiente compra de cada cliente

```sql
WITH compras AS (
  SELECT cliente_id, fecha_pedido,
         LEAD(fecha_pedido) OVER (PARTITION BY cliente_id ORDER BY fecha_pedido, pedido_id) AS siguiente
  FROM pedidos
  WHERE estado = 'entregado'
)
SELECT ROUND(AVG(julianday(siguiente) - julianday(fecha_pedido)), 1) AS dias_promedio_entre_compras
FROM compras
WHERE siguiente IS NOT NULL;
```

Aquí `PARTITION BY cliente_id` hace que `LEAD` no "salte" de un cliente a otro. `julianday` es de SQLite; en PostgreSQL basta con restar fechas y en BigQuery se usa `DATE_DIFF`.

## 4. Acumulados y promedios móviles: el marco de la ventana

Cuando una función de agregación lleva `ORDER BY` dentro del `OVER`, por defecto se acumula desde la primera fila hasta la actual.

```sql
WITH mensual AS (
  SELECT strftime('%Y-%m', p.fecha_pedido) AS mes,
         SUM(d.cantidad * d.precio_unitario * (1 - d.descuento)) AS ingreso
  FROM pedidos p
  JOIN detalle_pedido d ON d.pedido_id = p.pedido_id
  WHERE p.estado IN ('entregado', 'enviado') AND p.fecha_pedido >= '2025-01-01'
  GROUP BY mes
)
SELECT mes,
       ROUND(ingreso, 0) AS ingreso,
       ROUND(SUM(ingreso) OVER (ORDER BY mes), 0) AS acumulado_anio,
       ROUND(AVG(ingreso) OVER (ORDER BY mes ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 0) AS promedio_movil_3m
FROM mensual
ORDER BY mes;
```

- `SUM(...) OVER (ORDER BY mes)` es el ingreso acumulado del año.
- `ROWS BETWEEN 2 PRECEDING AND CURRENT ROW` limita el promedio a los últimos 3 meses, lo que suaviza la temporada.

## 5. Dividir en grupos iguales: NTILE

`NTILE(4)` reparte las filas en 4 grupos del mismo tamaño (cuartiles). Es la base de la segmentación RFM:

```sql
WITH gasto AS (
  SELECT p.cliente_id, SUM(d.cantidad * d.precio_unitario * (1 - d.descuento)) AS monto
  FROM pedidos p
  JOIN detalle_pedido d ON d.pedido_id = p.pedido_id
  WHERE p.estado IN ('entregado', 'enviado')
  GROUP BY p.cliente_id
)
SELECT NTILE(4) OVER (ORDER BY monto DESC) AS cuartil,
       COUNT(*) OVER () AS clientes_total,
       cliente_id,
       ROUND(monto, 2) AS monto
FROM gasto
ORDER BY monto DESC
LIMIT 5;
```

## Errores comunes con funciones de ventana

1. **Filtrar la ventana en el WHERE.** No se puede: calcula en un CTE y filtra afuera.
2. **Olvidar PARTITION BY.** Sin él, `LAG` mezcla clientes o categorías distintos.
3. **ORDER BY con empates.** Si dos filas tienen la misma fecha, el orden es arbitrario. Agrega una columna de desempate (por ejemplo, el id).
4. **Confundir el marco por defecto.** Con `ORDER BY`, `SUM() OVER` acumula; sin `ORDER BY`, da el total del grupo.

## Cómo explicarlo en una entrevista

> "Una función de ventana calcula sobre un grupo de filas relacionadas sin colapsarlas. PARTITION BY define los grupos y ORDER BY el orden dentro de cada uno. La uso para rankings como el top 3 por categoría, para comparar con el periodo anterior con LAG y para acumulados."

Dilo con un ejemplo de un proyecto tuyo y la respuesta pasa de correcta a memorable.

## Siguiente paso

Lo que te prepara es practicar. Descarga los [15 ejercicios SQL gratis](/gratis?utm_source=blog&utm_medium=articulo&utm_campaign=ventanas) y repasa las [preguntas de entrevista SQL más comunes](/blog/preguntas-entrevista-sql-analista-de-datos). Cuando domines las ventanas, aplícalas a un caso completo con el [análisis de cohortes con SQL](/blog/analisis-de-cohortes-sql).

El [Kit Ruta Analista](/?utm_source=blog&utm_medium=articulo&utm_campaign=ventanas) tiene 60 ejercicios resueltos, con un bloque completo de fechas y funciones de ventana, cohortes, RFM y LTV.

---
title: "Preguntas de entrevista SQL para Analista de Datos (con respuestas y ejemplos)"
description: "Las preguntas de SQL que más aparecen en entrevistas y pruebas técnicas de Analista de Datos, con respuestas claras y consultas que puedes practicar."
date: 2026-11-04
keyword: "preguntas de entrevista sql"
readingMinutes: 7
---

Si estás buscando tu primer empleo como Analista de Datos, casi seguro te van a evaluar en SQL. A veces es una conversación ("¿cuál es la diferencia entre WHERE y HAVING?"), y a veces es una prueba técnica con una base de datos y 45 minutos para responder preguntas de negocio.

En este artículo te dejo las **preguntas de entrevista SQL** que más aparecen, cómo responderlas y, lo más importante, **consultas reales que puedes ejecutar**. Todos los ejemplos usan la base de datos de práctica de Andina Market, una tienda online ficticia con clientes, pedidos y productos. Puedes [descargarla gratis aquí](/gratis?utm_source=blog&utm_medium=articulo&utm_campaign=preguntas-sql).

Las tablas que vamos a usar son:

| Tabla | Qué tiene |
|---|---|
| `clientes` | cliente_id, nombre, email, ciudad, pais, fecha_registro, canal_adquisicion |
| `pedidos` | pedido_id, cliente_id, fecha_pedido, estado, metodo_pago, pais_envio |
| `detalle_pedido` | pedido_id, producto_id, cantidad, precio_unitario, descuento |
| `productos` | producto_id, nombre, categoria_id, precio, costo, activo |
| `categorias` | categoria_id, nombre |

## 1. ¿Cuál es la diferencia entre WHERE y HAVING?

**WHERE filtra filas antes de agrupar; HAVING filtra grupos después del GROUP BY.** Es la pregunta más clásica y conviene responderla con un ejemplo:

```sql
-- Clientes con 5 o más pedidos entregados
SELECT c.nombre, COUNT(*) AS pedidos
FROM pedidos p
JOIN clientes c ON c.cliente_id = p.cliente_id
WHERE p.estado = 'entregado'          -- filtra filas (pedidos)
GROUP BY c.cliente_id, c.nombre
HAVING COUNT(*) >= 5                  -- filtra grupos (clientes)
ORDER BY pedidos DESC
LIMIT 5;
```

Si pones `COUNT(*) >= 5` en el WHERE, la consulta falla: en ese momento todavía no existen los grupos.

## 2. ¿Qué tipos de JOIN existen y cuándo usas cada uno?

- **INNER JOIN:** solo las filas que tienen pareja en ambas tablas.
- **LEFT JOIN:** todas las filas de la tabla izquierda, con NULL donde no hay pareja.
- **FULL OUTER JOIN:** todo de ambos lados.
- **CROSS JOIN:** todas las combinaciones posibles.

El caso que más preguntan es **encontrar registros sin pareja**, por ejemplo clientes que nunca compraron:

```sql
SELECT c.cliente_id, c.nombre, c.fecha_registro
FROM clientes c
LEFT JOIN pedidos p ON p.cliente_id = c.cliente_id
WHERE p.pedido_id IS NULL
ORDER BY c.fecha_registro
LIMIT 5;
```

Cuenta como punto extra mencionar que también se puede hacer con `NOT EXISTS`, que es más seguro que `NOT IN` cuando la subconsulta puede traer NULLs.

## 3. ¿Qué diferencia hay entre COUNT(*), COUNT(columna) y COUNT(DISTINCT columna)?

`COUNT(*)` cuenta filas, `COUNT(columna)` cuenta los valores que no son NULL y `COUNT(DISTINCT columna)` cuenta valores únicos.

Esto importa muchísimo cuando unes tablas. Si juntas `pedidos` con `detalle_pedido`, cada pedido aparece una vez **por producto**. Entonces `COUNT(*)` te da líneas, no pedidos:

```sql
SELECT COUNT(*) AS lineas,
       COUNT(DISTINCT p.pedido_id) AS pedidos
FROM pedidos p
JOIN detalle_pedido d ON d.pedido_id = p.pedido_id
WHERE p.estado = 'entregado';
```

Este es, probablemente, el error más común en las pruebas técnicas. Si lo explicas sin que te lo pregunten, el entrevistador lo nota.

## 4. ¿Cómo calculas un porcentaje del total?

Por ejemplo: qué porcentaje de los pedidos está en cada estado.

```sql
SELECT estado,
       COUNT(*) AS pedidos,
       ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM pedidos), 1) AS porcentaje
FROM pedidos
GROUP BY estado
ORDER BY pedidos DESC;
```

Dos detalles que suman puntos: multiplicar por `100.0` (con decimal) para evitar la división entera, y que el denominador tenga **el mismo filtro** que el numerador.

<div class="cta-inline">
<p><strong>¿Quieres practicar estas consultas?</strong> Descarga gratis la base de datos de Andina Market y 15 ejercicios de entrevista con soluciones explicadas.</p>
<a href="/gratis?utm_source=blog&utm_medium=articulo&utm_campaign=preguntas-sql">Descargar los 15 ejercicios gratis →</a>
</div>

## 5. ¿Cuál es el orden lógico de ejecución de una consulta?

El orden en que **se ejecuta** no es el orden en que se escribe:

1. `FROM` y `JOIN`
2. `WHERE`
3. `GROUP BY`
4. `HAVING`
5. `SELECT`
6. `ORDER BY`
7. `LIMIT`

Por eso no puedes usar un alias del SELECT dentro del WHERE, pero sí en el ORDER BY. Si conoces este orden, entiendes la mitad de los errores de SQL.

## 6. ¿Qué es un CTE y para qué sirve?

Un CTE (*Common Table Expression*) es una consulta con nombre que defines con `WITH` y que luego usas como si fuera una tabla. Sirve para **dividir un problema en pasos**.

Ejemplo clásico de entrevista: el ticket promedio por método de pago. La trampa es que primero necesitas el total **por pedido** y después el promedio:

```sql
WITH totales AS (
  SELECT p.pedido_id, p.metodo_pago,
         SUM(d.cantidad * d.precio_unitario * (1 - d.descuento)) AS total
  FROM pedidos p
  JOIN detalle_pedido d ON d.pedido_id = p.pedido_id
  WHERE p.estado = 'entregado'
  GROUP BY p.pedido_id, p.metodo_pago
)
SELECT metodo_pago, COUNT(*) AS pedidos, ROUND(AVG(total), 2) AS ticket_promedio
FROM totales
GROUP BY metodo_pago
ORDER BY ticket_promedio DESC;
```

Si promedias directamente las líneas del detalle, obtienes el promedio por producto, no por pedido. Explicar este cambio de "grano" (el nivel de detalle de cada fila) en voz alta es de lo que más impresiona en una entrevista.

## 7. ¿Qué son las funciones de ventana?

Son funciones que calculan sobre un grupo de filas relacionadas **sin colapsarlas**: cada fila conserva su detalle y recibe un resultado. Las más preguntadas son `ROW_NUMBER`, `RANK`, `DENSE_RANK`, `LAG`, `LEAD` y `SUM() OVER`.

El ejercicio estrella es el **top N por grupo**: los 3 productos con más ingreso dentro de cada categoría.

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

Escribí una guía completa sobre este tema: [funciones de ventana en SQL explicadas con ejemplos](/blog/funciones-de-ventana-sql).

## 8. ¿Diferencia entre ROW_NUMBER, RANK y DENSE_RANK?

Con empates en el valor que ordena:

- `ROW_NUMBER`: 1, 2, 3 (nunca empata)
- `RANK`: 1, 1, 3 (deja un hueco)
- `DENSE_RANK`: 1, 1, 2 (sin hueco)

Si te piden "los 3 mejores incluyendo empates", la respuesta es `DENSE_RANK`.

## 9. ¿Cómo encuentras duplicados?

Agrupando por las columnas que definen el duplicado y filtrando con `HAVING COUNT(*) > 1`. En datos reales casi siempre hay que **normalizar** primero:

```sql
SELECT LOWER(TRIM(email)) AS email_normalizado, COUNT(*) AS registros
FROM clientes
GROUP BY LOWER(TRIM(email))
HAVING COUNT(*) > 1
ORDER BY registros DESC
LIMIT 5;
```

En la base de práctica hay clientes registrados dos veces con el mismo email escrito distinto (mayúsculas, espacios). Detectarlo antes de calcular métricas es exactamente lo que hace un buen analista.

## 10. ¿Cómo calculas el crecimiento mes a mes?

Con `LAG`, que trae el valor de la fila anterior:

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
       ROUND(100.0 * (ingreso / LAG(ingreso) OVER (ORDER BY mes) - 1), 1) AS variacion_pct
FROM mensual
ORDER BY mes;
```

`strftime` es de SQLite. En PostgreSQL usarías `DATE_TRUNC('month', fecha)` y en BigQuery `DATE_TRUNC(fecha, MONTH)`. Mencionar que conoces las diferencias entre motores da confianza.

## Cómo responder en la prueba técnica (más allá del SQL)

1. **Pregunta la definición de la métrica.** ¿El ingreso incluye pedidos cancelados? ¿Descuentos? ¿Envío? Preguntarlo no es debilidad: es lo que hace un analista.
2. **Piensa en voz alta.** Di qué tablas necesitas y cuál es el grano del resultado antes de escribir.
3. **Valida tu resultado.** Revisa si el número tiene sentido: ¿el total cuadra?, ¿hay NULLs?, ¿duplicaste filas con un JOIN?
4. **Cierra con negocio.** No termines en el número: "Tecnología vende mucho pero deja el menor margen; revisaría su estrategia de descuentos".

## Siguiente paso

Leer preguntas ayuda, pero lo que te prepara es **resolverlas tú**. Descarga gratis los [15 ejercicios SQL de entrevista](/gratis?utm_source=blog&utm_medium=articulo&utm_campaign=preguntas-sql), con la base de datos y las soluciones explicadas paso a paso.

Para seguir preparándote: cómo es una [prueba técnica de analista de datos](/blog/prueba-tecnica-analista-de-datos) con un caso resuelto, las [preguntas de entrevista de Excel](/blog/preguntas-entrevista-excel-analista-de-datos) que más se repiten y el [análisis de cohortes con SQL](/blog/analisis-de-cohortes-sql), un clásico de las pruebas de e-commerce.

Y si quieres el camino completo (60 ejercicios, 3 proyectos de portafolio, CV y preparación de entrevistas), mira el [Kit Ruta Analista](/?utm_source=blog&utm_medium=articulo&utm_campaign=preguntas-sql).

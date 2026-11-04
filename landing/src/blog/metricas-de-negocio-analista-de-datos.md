---
title: "Métricas de negocio que todo analista de datos debe dominar (con SQL para calcularlas)"
description: "Ingreso, ticket promedio, margen, recompra, cancelación, CAC, LTV y retención: qué significan, cómo se calculan con SQL y los errores que más confunden en entrevistas."
date: 2026-11-04
keyword: "metricas de negocio analista de datos"
readingMinutes: 7
---

Saber SQL te permite sacar números. Saber **métricas de negocio** te permite saber cuáles importan y qué significan. Esa diferencia es la que más notan los gerentes cuando trabajan con un analista, y la que más se evalúa en las preguntas de caso de una entrevista.

En esta guía repasamos las métricas que aparecen en casi cualquier empresa que vende algo: qué significan, cómo calcularlas con SQL y en qué errores caen hasta los analistas con experiencia. Los ejemplos usan la base de práctica de Andina Market, una tienda online ficticia que puedes [descargar gratis aquí](/gratis?utm_source=blog&utm_medium=articulo&utm_campaign=metricas).

## Antes de calcular: define qué cuenta como venta

La primera pregunta de cualquier métrica no es la fórmula, es la definición. ¿Un pedido cancelado es venta? ¿Y uno devuelto? ¿El ingreso es antes o después de descuentos? ¿Incluye el envío?

No hay una respuesta universal, pero sí una regla: **escribe la definición y úsala siempre igual**. En los ejemplos de este artículo:

- **Venta** = pedido en estado entregado o enviado.
- **Ingreso** = cantidad × precio unitario × (1 − descuento), sin el costo de envío.

Muchas discusiones en las empresas ("mi reporte dice una cosa y el tuyo otra") se deben a definiciones distintas, no a errores de cálculo.

## Las métricas de ventas

### Ingreso, pedidos, ticket promedio y margen

```sql
WITH pedidos_validos AS (
  SELECT p.pedido_id, p.cliente_id,
         SUM(d.cantidad * d.precio_unitario * (1 - d.descuento)) AS monto,
         SUM(d.cantidad * pr.costo) AS costo
  FROM pedidos p
  JOIN detalle_pedido d ON d.pedido_id = p.pedido_id
  JOIN productos pr     ON pr.producto_id = d.producto_id
  WHERE p.estado IN ('entregado', 'enviado')
    AND p.fecha_pedido BETWEEN '2025-01-01' AND '2025-12-31'
  GROUP BY p.pedido_id, p.cliente_id
)
SELECT ROUND(SUM(monto), 0)                         AS ingreso,
       COUNT(*)                                     AS pedidos,
       COUNT(DISTINCT cliente_id)                   AS clientes,
       ROUND(SUM(monto) / COUNT(*), 2)              AS ticket_promedio,
       ROUND(100.0 * (SUM(monto) - SUM(costo)) / SUM(monto), 1) AS margen_bruto_pct
FROM pedidos_validos;
```

En 2025, Andina Market facturó 313.958 dólares en 4.757 pedidos de 2.427 clientes, con un ticket promedio de 66 dólares y un margen bruto de 40,8%.

- **Ticket promedio** (*average order value*, AOV) = ingreso / número de pedidos. Fíjate en que se calcula a nivel de pedido: por eso el CTE suma primero el detalle de cada pedido. Si promedias las líneas del detalle, obtienes otra cosa.
- **Margen bruto** = (ingreso − costo de los productos) / ingreso. Una empresa puede crecer en ventas y perder margen si crece con descuentos o con productos de bajo margen.

**Error común:** decir "el margen subió 5%" cuando pasó de 35% a 40%. Eso es una subida de **5 puntos porcentuales**, que equivale a un aumento relativo de 14%. Confundirlos es de los errores que más se notan en una entrevista.

### Tasa de cancelación y de devolución

```sql
SELECT ROUND(100.0 * SUM(estado = 'cancelado') / COUNT(*), 1) AS cancelacion_pct,
       ROUND(100.0 * SUM(estado = 'devuelto')  / COUNT(*), 1) AS devolucion_pct
FROM pedidos
WHERE fecha_pedido BETWEEN '2025-01-01' AND '2025-12-31';
```

En 2025, el 6,0% de los pedidos se canceló y el 5,8% se devolvió. Son métricas de calidad de la operación: si suben, algo está fallando en el pago, el inventario, la descripción de los productos o la entrega.

## Las métricas de clientes

### Tasa de recompra

¿Qué porcentaje de los clientes compró más de una vez?

```sql
WITH compras AS (
  SELECT cliente_id, COUNT(*) AS pedidos
  FROM pedidos
  WHERE estado IN ('entregado', 'enviado')
  GROUP BY cliente_id
)
SELECT COUNT(*) AS clientes,
       SUM(pedidos >= 2) AS repiten,
       ROUND(100.0 * SUM(pedidos >= 2) / COUNT(*), 1) AS tasa_recompra_pct
FROM compras;
```

El 58% de los clientes de Andina Market compró dos veces o más en los dos años de datos. Esta métrica depende mucho del periodo: en una ventana de 30 días siempre será más baja que en una de 2 años, así que compara siempre con el mismo periodo.

### Retención

La retención responde: de los clientes que empezaron en un momento, ¿qué porcentaje sigue comprando después? Se analiza con **cohortes**, y te lo explico paso a paso en [análisis de cohortes con SQL](/blog/analisis-de-cohortes-sql). Es la métrica que dice si un negocio es sano a largo plazo: crecer con clientes que no vuelven obliga a comprar tráfico nuevo sin parar.

<div class="cta-inline">
<p><strong>Calcula estas métricas tú mismo:</strong> base de datos de Andina Market + 15 ejercicios SQL de entrevista con soluciones, gratis.</p>
<a href="/gratis?utm_source=blog&utm_medium=articulo&utm_campaign=metricas">Descargar gratis →</a>
</div>

## Las métricas de marketing

### Costo de adquisición (CAC)

**CAC = inversión en marketing de un canal / clientes nuevos que trajo ese canal.**

Un ejemplo con números ilustrativos: si inviertes 2.000 dólares en anuncios en un mes y consigues 80 clientes nuevos, tu CAC es de 25 dólares. La base de práctica gratis no incluye la inversión en publicidad, así que aquí el cálculo es conceptual; en una empresa real esa información viene de las plataformas de anuncios o de finanzas.

Dos cuidados: usa solo **clientes nuevos** (no todos los que compraron) y decide si incluyes costos fijos como salarios del equipo o agencias. Lo importante es ser consistente.

### Valor del cliente (LTV)

El *lifetime value* estima cuánto deja un cliente durante toda su relación con la empresa. La forma más simple y honesta de empezar es el **LTV histórico**: lo que ya dejaron, en promedio, los clientes de cada canal. Mejor aún si lo calculas sobre el margen y no sobre el ingreso, porque el margen es lo que realmente paga el costo de adquisición.

```sql
WITH ingreso_cliente AS (
  SELECT p.cliente_id,
         SUM(d.cantidad * d.precio_unitario * (1 - d.descuento)) AS ingreso,
         SUM(d.cantidad * (d.precio_unitario * (1 - d.descuento) - pr.costo)) AS margen
  FROM pedidos p
  JOIN detalle_pedido d ON d.pedido_id = p.pedido_id
  JOIN productos pr     ON pr.producto_id = d.producto_id
  WHERE p.estado IN ('entregado', 'enviado')
  GROUP BY p.cliente_id
)
SELECT c.canal_adquisicion AS canal,
       COUNT(*) AS clientes,
       ROUND(AVG(i.ingreso), 2) AS ingreso_por_cliente,
       ROUND(AVG(i.margen), 2)  AS margen_por_cliente
FROM ingreso_cliente i
JOIN clientes c ON c.cliente_id = i.cliente_id
GROUP BY c.canal_adquisicion
ORDER BY margen_por_cliente DESC;
```

Los clientes que llegan por email dejan en promedio cerca de 69 dólares de margen, y los de TikTok cerca de 42. Con el CAC de cada canal, puedes calcular la relación **LTV / CAC**: cuántas veces recuperas lo que te costó conseguir al cliente. Una regla práctica muy citada es buscar una relación de 3 o más, aunque depende del negocio.

**Cuidado al comparar canales:** los clientes antiguos han tenido más tiempo para comprar. Si un canal es reciente, su LTV histórico saldrá más bajo aunque sus clientes sean igual de buenos. Para una comparación justa, mide a todos en la misma ventana, por ejemplo el margen de los primeros 6 meses de cada cliente.

### Tasa de conversión

**Conversión = personas que hicieron la acción / personas que tuvieron la oportunidad.** Por ejemplo, compras / visitas a la tienda, o registros / visitas a una página. El denominador es lo que más se presta a confusiones: ¿visitas o visitantes únicos? ¿Todas las páginas o solo la de producto? Defínelo antes de comparar.

## Cómo hablar de métricas en una entrevista

Cuando te pregunten por una métrica, una buena respuesta tiene tres partes:

1. **Definición:** qué mide y cómo se calcula.
2. **Para qué sirve:** qué decisión ayuda a tomar.
3. **Trampas:** qué puede hacer que el número engañe.

Por ejemplo:

> "El ticket promedio es el ingreso dividido entre el número de pedidos. Sirve para saber si los clientes compran más por pedido, por ejemplo después de una estrategia de productos complementarios. La trampa es que puede subir solo porque subieron los precios, así que lo miro junto con las unidades por pedido."

## Errores comunes con métricas

1. **No definir qué es una venta** y mezclar pedidos cancelados.
2. **Promediar porcentajes** de grupos con tamaños distintos. Suma numeradores y denominadores por separado.
3. **Confundir puntos porcentuales con porcentaje.**
4. **Comparar periodos distintos**: un mes de 31 días con uno de 28, o una temporada alta con una baja. Compara con el mismo mes del año anterior cuando hay estacionalidad.
5. **Mirar una métrica sola.** El ingreso puede subir mientras el margen cae; los clientes nuevos pueden subir mientras la retención empeora.

## Siguiente paso

Las métricas cobran sentido cuando las calculas sobre datos reales. Descarga la [base de práctica gratis](/gratis?utm_source=blog&utm_medium=articulo&utm_campaign=metricas), calcula cada métrica de este artículo y escribe una conclusión de tres frases. Luego practica un caso completo con la guía de [prueba técnica de analista de datos](/blog/prueba-tecnica-analista-de-datos).

El [Kit Ruta Analista](/?utm_source=blog&utm_medium=articulo&utm_campaign=metricas) incluye un proyecto de marketing completo con inversión por canal, CAC, LTV, cohortes y recomendaciones de presupuesto.

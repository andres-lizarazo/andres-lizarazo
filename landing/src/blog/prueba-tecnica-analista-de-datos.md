---
title: "Prueba técnica de analista de datos: qué te van a pedir y cómo prepararte"
description: "Los 4 tipos de prueba técnica para analista de datos (SQL en vivo, caso para la casa, Excel y presentación), cómo resolverlas paso a paso y un ejemplo resuelto con SQL."
date: 2026-11-04
keyword: "prueba tecnica analista de datos"
readingMinutes: 7
---

Pasaste el filtro del CV y la primera entrevista. Ahora llega el correo: "El siguiente paso es una prueba técnica". Para muchas personas es el momento de más nervios del proceso, y también el que más candidatos descarta. La buena noticia es que **las pruebas técnicas de analista de datos se parecen mucho entre sí**, así que se pueden preparar.

En esta guía te explico los formatos más comunes, qué evalúan de verdad y cómo resolver un caso típico paso a paso, con SQL que puedes ejecutar en la base de práctica de Andina Market ([descárgala gratis aquí](/gratis?utm_source=blog&utm_medium=articulo&utm_campaign=prueba-tecnica)).

## Los 4 formatos más comunes

### 1. SQL en vivo (30 a 60 minutos)

Te comparten un esquema de tablas y te piden escribir consultas mientras alguien te observa, en una plataforma de código o en un documento compartido. Suelen ser de 3 a 6 preguntas de dificultad creciente: agregaciones, JOINs, top N por grupo, variación mes a mes.

**Qué evalúan:** que domines lo básico sin buscar en internet, que pienses en voz alta y cómo reaccionas cuando algo no sale.

### 2. Caso para la casa (*take-home*, 2 a 7 días)

Te envían un dataset (CSV, Excel o acceso a una base) y una pregunta de negocio abierta: "Las ventas de noviembre subieron. ¿Qué pasó y qué recomiendas?". Entregas un documento, un notebook o una presentación corta.

**Qué evalúan:** criterio para elegir qué analizar, calidad de las conclusiones y comunicación. El SQL o las fórmulas son el medio, no el fin.

### 3. Prueba de Excel

Común en roles de análisis comercial, financiero u operativo. Tablas dinámicas, `BUSCARX` o `INDICE` + `COINCIDIR`, `SUMAR.SI.CONJUNTO`, limpieza de datos y a veces un gráfico. Te dejo las preguntas típicas en [preguntas de entrevista de Excel para analista de datos](/blog/preguntas-entrevista-excel-analista-de-datos).

### 4. Presentación del caso

Muchas empresas te piden presentar tu caso para la casa en 10 a 20 minutos ante el equipo. Aquí se decide mucho: **cómo explicas** importa tanto como lo que encontraste.

## Qué evalúan realmente (más allá del código)

1. **Que entiendas la pregunta antes de responder.** Aclarar supuestos es una señal de experiencia, no de inseguridad.
2. **Calidad de los datos.** ¿Revisaste duplicados, nulos, pedidos cancelados? Un analista que confía ciegamente en los datos es un riesgo.
3. **Conclusiones con números.** "Las ventas subieron por más clientes" es una opinión; "+49% de clientes activos con un ticket casi igual" es un hallazgo.
4. **Recomendaciones accionables.** Qué haría el negocio con tu análisis.
5. **Comunicación.** Que alguien sin conocimientos técnicos entienda tu conclusión en un minuto.

## Ejemplo resuelto: "¿por qué subieron las ventas de noviembre?"

Supongamos que el caso dice: *"El ingreso de noviembre de 2025 fue mucho mayor que el de noviembre de 2024. La gerencia quiere entender por qué."*

### Paso 1: aclarar y revisar los datos

Antes de calcular nada, revisa la calidad. Por ejemplo, la distribución de estados de los pedidos:

```sql
SELECT estado, COUNT(*) AS pedidos, ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) AS pct
FROM pedidos
GROUP BY estado
ORDER BY pedidos DESC;
```

El 6,1% de los pedidos está cancelado y el 5,6% devuelto. Decide (y escribe en tu entrega) cuáles cuentas como venta. Aquí usamos entregados y enviados. También vale la pena revisar nulos y duplicados en las tablas de clientes: en esta base, por ejemplo, hay clientes sin ciudad registrada. Mencionarlo, aunque no cambie la conclusión, muestra rigor.

### Paso 2: descomponer el ingreso

La forma más poderosa de explicar un cambio en ventas es descomponerlo:

> **Ingreso = clientes activos × pedidos por cliente × ticket promedio**

Si sabes cuál de los tres factores cambió, sabes dónde buscar.

```sql
WITH pedidos_validos AS (
  SELECT p.pedido_id, p.cliente_id, strftime('%Y-%m', p.fecha_pedido) AS mes,
         SUM(d.cantidad * d.precio_unitario * (1 - d.descuento)) AS monto
  FROM pedidos p
  JOIN detalle_pedido d ON d.pedido_id = p.pedido_id
  WHERE p.estado IN ('entregado', 'enviado')
  GROUP BY p.pedido_id, p.cliente_id, mes
)
SELECT mes,
       ROUND(SUM(monto), 0)                          AS ingreso,
       COUNT(DISTINCT cliente_id)                    AS clientes,
       ROUND(1.0 * COUNT(*) / COUNT(DISTINCT cliente_id), 2) AS pedidos_por_cliente,
       ROUND(SUM(monto) / COUNT(*), 2)               AS ticket_promedio
FROM pedidos_validos
WHERE mes IN ('2024-11', '2025-11')
GROUP BY mes
ORDER BY mes;
```

| Mes | Ingreso | Clientes | Pedidos por cliente | Ticket promedio |
|---|---|---|---|---|
| 2024-11 | 27.882 | 395 | 1,18 | 59,83 |
| 2025-11 | 41.720 | 587 | 1,13 | 63,12 |

Lectura: el ingreso creció cerca de 50%. Casi todo se explica por **más clientes activos** (+49%); el ticket subió un poco (+5,5%) y la frecuencia bajó levemente.

### Paso 3: ¿clientes nuevos o recurrentes?

"Más clientes" puede significar dos cosas muy distintas: más adquisición o mejor retención. Separémoslo:

```sql
WITH pedidos_validos AS (
  SELECT p.pedido_id, p.cliente_id, strftime('%Y-%m', p.fecha_pedido) AS mes,
         SUM(d.cantidad * d.precio_unitario * (1 - d.descuento)) AS monto
  FROM pedidos p
  JOIN detalle_pedido d ON d.pedido_id = p.pedido_id
  WHERE p.estado IN ('entregado', 'enviado')
  GROUP BY p.pedido_id, p.cliente_id, mes
),
primera AS (
  SELECT cliente_id, MIN(fecha_pedido) AS primera_compra
  FROM pedidos
  WHERE estado IN ('entregado', 'enviado')
  GROUP BY cliente_id
)
SELECT v.mes,
       CASE WHEN strftime('%Y-%m', f.primera_compra) = v.mes THEN 'nuevo' ELSE 'recurrente' END AS tipo_cliente,
       COUNT(DISTINCT v.cliente_id) AS clientes,
       ROUND(SUM(v.monto), 0) AS ingreso
FROM pedidos_validos v
JOIN primera f ON f.cliente_id = v.cliente_id
WHERE v.mes IN ('2024-11', '2025-11')
GROUP BY v.mes, tipo_cliente
ORDER BY v.mes, tipo_cliente;
```

El resultado cambia la historia: los clientes **nuevos** pasaron de 215 a 266 (+24%), pero los **recurrentes** pasaron de 180 a 321 (+78%). En noviembre de 2025, los recurrentes ya generan más ingreso que los nuevos.

### Paso 4: la conclusión en tres frases

> "El ingreso de noviembre creció cerca de 50% frente al año anterior, y casi todo el crecimiento viene de tener más clientes activos, no de un ticket más alto. El factor principal son los clientes recurrentes, que crecieron 78%, mientras que los nuevos crecieron 24%. Recomiendo proteger lo que está funcionando en retención (email, recompra) y revisar por qué la adquisición crece más lento."

Fíjate en la estructura: **qué pasó, por qué pasó y qué hacer**. Es la misma que sirve para cualquier caso.

<div class="cta-inline">
<p><strong>Practica con la misma base de datos:</strong> 15 ejercicios SQL de entrevista con soluciones explicadas, gratis.</p>
<a href="/gratis?utm_source=blog&utm_medium=articulo&utm_campaign=prueba-tecnica">Descargar los ejercicios →</a>
</div>

## Cómo prepararte en 2 semanas

**Semana 1: SQL sin ayuda.** Resuelve 3 o 4 ejercicios al día con un cronómetro y sin buscar en internet. Prioriza JOINs, agregaciones con `CASE WHEN`, top N por grupo con `ROW_NUMBER` y variaciones con `LAG`. Repasa las [preguntas de entrevista SQL más comunes](/blog/preguntas-entrevista-sql-analista-de-datos) y las [funciones de ventana](/blog/funciones-de-ventana-sql).

**Semana 2: casos completos.** Haz dos casos para la casa de principio a fin con un dataset que no conozcas, incluyendo una presentación de 5 láminas. Grábate presentando y escúchate: ¿se entiende la conclusión en el primer minuto?

## Consejos para cada formato

**SQL en vivo**

- Piensa en voz alta: "Primero voy a sacar el ingreso por pedido y luego lo agrupo por mes".
- Empieza por una versión simple que funcione y luego mejórala.
- Si te bloqueas, dilo y explica qué intentarías. Un entrevistador valora el razonamiento aunque la consulta no quede perfecta.
- Revisa el resultado: ¿tiene sentido el número? ¿Se duplicaron filas con el JOIN?

**Caso para la casa**

- No te pases del tiempo sugerido; entregar a tiempo también se evalúa.
- Pon la conclusión al principio, no al final.
- Escribe tus supuestos: qué estados contaste como venta, cómo trataste los nulos.
- Menos es más: 3 hallazgos bien sustentados valen más que 15 gráficos.

**Presentación**

- Una idea por lámina, con un título que sea la conclusión ("Los clientes recurrentes explican el crecimiento"), no el tema ("Clientes").
- Termina con recomendaciones y próximos pasos, incluyendo qué analizarías con más tiempo.
- Prepara respuestas para "¿qué harías distinto?" y "¿qué tan seguro estás de este número?".

## Errores que te descartan

1. **Responder otra pregunta.** Si te preguntan por qué subieron las ventas, no entregues un análisis general de la empresa.
2. **No revisar la calidad de los datos.** Contar pedidos cancelados como ventas es un error grave en un caso de negocio.
3. **Gráficos sin mensaje.** Cada gráfico debe responder algo.
4. **Copiar código sin entenderlo.** En la presentación te van a preguntar por qué usaste cada paso.
5. **No dar una recomendación.** El análisis termina en una acción, no en una tabla.

## Siguiente paso

La mejor preparación es resolver casos con datos reales. Empieza con los [15 ejercicios SQL gratis](/gratis?utm_source=blog&utm_medium=articulo&utm_campaign=prueba-tecnica) y prueba el [análisis de cohortes con SQL](/blog/analisis-de-cohortes-sql), que aparece con frecuencia en los casos de e-commerce y marketing.

El [Kit Ruta Analista](/?utm_source=blog&utm_medium=articulo&utm_campaign=prueba-tecnica) incluye 60 ejercicios SQL resueltos, 3 proyectos completos que funcionan como práctica de caso para la casa y 100 preguntas de entrevista con respuestas modelo.

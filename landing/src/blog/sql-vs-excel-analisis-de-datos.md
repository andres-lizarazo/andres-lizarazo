---
title: "SQL vs Excel para análisis de datos: cuándo usar cada uno (con el mismo ejemplo en los dos)"
description: "Diferencias reales entre SQL y Excel para un analista de datos: volumen, reproducibilidad y colaboración. El mismo análisis en ambos y cuál aprender primero."
date: 2026-11-04
keyword: "sql vs excel"
readingMinutes: 7
---

"¿Aprendo SQL o me quedo con Excel?" Es una de las preguntas más comunes de quien quiere entrar al mundo de los datos, y la respuesta corta es: **necesitas los dos, pero para cosas distintas**. Un analista de datos usa SQL para sacar y transformar datos, y Excel (o Google Sheets) para explorar rápido, hacer modelos pequeños y compartir resultados con personas que viven en hojas de cálculo.

En este artículo te explico las diferencias que importan en el trabajo, resolvemos el mismo análisis en ambos y te digo por dónde empezar. Los ejemplos de SQL usan la base de práctica de Andina Market, que puedes [descargar gratis aquí](/gratis?utm_source=blog&utm_medium=articulo&utm_campaign=sql-vs-excel).

## La diferencia de fondo

**Excel** es una herramienta para trabajar con datos que *ves*: cada celda está a la vista, puedes escribir una fórmula, arrastrarla y ver el resultado al instante. Es ideal para explorar, para cálculos rápidos y para modelos donde alguien quiere "jugar" con supuestos.

**SQL** es un lenguaje para pedirle datos a una base de datos. No ves las filas una por una: describes *qué* quieres ("el ingreso por país en 2025") y la base de datos lo calcula. Es ideal para volúmenes grandes, para datos que viven en sistemas de la empresa y para análisis que se repiten.

| Criterio | Excel / Google Sheets | SQL |
|---|---|---|
| Volumen de datos | Cómodo hasta decenas o cientos de miles de filas; el límite técnico es 1.048.576 filas por hoja | Millones o miles de millones de filas |
| Dónde están los datos | En el archivo | En la base de datos de la empresa (la fuente oficial) |
| Reproducibilidad | Difícil de auditar: fórmulas dispersas, pasos manuales | La consulta es el registro exacto de lo que hiciste |
| Colaboración | Versiones por correo ("final_v3_ahora_si.xlsx") | Una consulta compartida en un repositorio o herramienta de BI |
| Velocidad para explorar | Muy alta para datos pequeños | Alta cuando ya sabes la pregunta |
| Modelos de supuestos | Excelente (escenarios, sensibilidad) | No es su fuerte |
| Quién lo usa | Casi toda la empresa | Analistas, ingenieros y equipos de datos |

## El mismo análisis en los dos

Pregunta de negocio: **¿cuánto ingreso generó cada país en 2024 y en 2025?**

### En Excel

1. Exportas los pedidos y su detalle a una hoja (si el sistema lo permite y no supera el límite de filas).
2. Si vienen en dos tablas, cruzas pedidos con su detalle usando `BUSCARX` (`XLOOKUP` en inglés) o Power Query.
3. Creas una columna de ingreso: `=cantidad * precio_unitario * (1 - descuento)`.
4. Insertas una **tabla dinámica**: países en filas, año en columnas, suma de ingreso en valores.
5. Filtras los pedidos cancelados y devueltos.

Funciona, y para una pregunta de una sola vez puede ser lo más rápido. El problema aparece el mes siguiente, cuando hay que repetirlo con datos nuevos y nadie recuerda si se filtraron los cancelados.

### En SQL

```sql
SELECT p.pais_envio AS pais,
       ROUND(SUM(CASE WHEN p.fecha_pedido < '2025-01-01' THEN d.cantidad * d.precio_unitario * (1 - d.descuento) END), 0) AS ingreso_2024,
       ROUND(SUM(CASE WHEN p.fecha_pedido >= '2025-01-01' THEN d.cantidad * d.precio_unitario * (1 - d.descuento) END), 0) AS ingreso_2025
FROM pedidos p
JOIN detalle_pedido d ON d.pedido_id = p.pedido_id
WHERE p.estado IN ('entregado', 'enviado')
GROUP BY p.pais_envio
ORDER BY ingreso_2025 DESC;
```

Esta consulta hace lo mismo que la tabla dinámica: el `JOIN` reemplaza al `BUSCARX`, el `WHERE` es el filtro y las dos columnas con `CASE WHEN` son las columnas de año. La diferencia es que todo queda escrito: cualquier persona puede leer exactamente qué se filtró y repetirlo el mes siguiente con un clic.

El resultado muestra que Colombia pasó de unos 70.000 a casi 124.000 dólares y México duplicó su ingreso. Ese hallazgo es el mismo en Excel y en SQL; lo que cambia es el costo de repetirlo y de confiar en él.

<div class="cta-inline">
<p><strong>¿Quieres probarlo?</strong> Descarga la base de Andina Market (también en CSV para abrirla en Excel) y 15 ejercicios SQL con soluciones.</p>
<a href="/gratis?utm_source=blog&utm_medium=articulo&utm_campaign=sql-vs-excel">Descargar gratis →</a>
</div>

## Cuándo usar Excel

- **Exploración rápida** de un archivo que te mandaron.
- **Modelos de supuestos:** "¿qué pasa con el margen si el costo de envío sube 10%?". Las hojas de cálculo son imbatibles para escenarios.
- **Entregables para el negocio**, cuando la persona que lo recibe trabaja en Excel y quiere filtrar o ajustar por su cuenta.
- **Datos pequeños que no están en ninguna base**, como una lista de metas comerciales o un presupuesto.
- **Revisión puntual:** validar a mano 20 filas para entender un caso raro.

## Cuándo usar SQL

- **Los datos viven en una base de datos** (casi siempre en empresas medianas y grandes).
- **El volumen es grande** o va a crecer.
- **El análisis se repite** cada semana o cada mes.
- **Necesitas cruzar varias tablas:** clientes, pedidos, productos, campañas.
- **Otros tienen que confiar en el número:** una consulta se puede revisar línea por línea.
- **Alimentas un dashboard** en Power BI, Tableau o Looker Studio, que normalmente se conecta a una consulta o vista.

## En el trabajo real se usan juntos

Un flujo muy común en un equipo de análisis:

1. **SQL** para extraer y transformar: una consulta que entrega una tabla limpia y agregada.
2. **Excel o la herramienta de BI** para visualizar, explorar y presentar.
3. **Excel** otra vez cuando alguien del negocio pide "el archivo" para hacer sus propios cálculos.

Por eso las ofertas de analista piden los dos. Saber SQL no te exime de Excel, y dominar Excel no reemplaza a SQL cuando los datos están en una base de datos.

## ¿Cuál aprender primero?

Si ya usas Excel con cierta soltura (tablas dinámicas, `BUSCARX`, `SUMAR.SI.CONJUNTO`), **empieza por SQL**: es la habilidad que más filtra en las pruebas técnicas y la que más te diferencia de otros candidatos. Si nunca has usado tablas dinámicas, dedica primero una o dos semanas a Excel, porque te ayuda a entender agregaciones, y luego pasa a SQL.

Una buena forma de aprender SQL si vienes de Excel es traducir lo que ya sabes:

| En Excel | En SQL |
|---|---|
| Filtro | `WHERE` |
| Tabla dinámica | `GROUP BY` con `SUM`, `COUNT`, `AVG` |
| Filtro sobre el resultado de la tabla dinámica | `HAVING` |
| `BUSCARV` / `BUSCARX` | `JOIN` |
| `SI` / `SI.CONJUNTO` | `CASE WHEN` |
| `CONTAR.SI.CONJUNTO` | `SUM(CASE WHEN ... THEN 1 ELSE 0 END)` o `COUNT` con `WHERE` |
| Ordenar | `ORDER BY` |
| Quitar duplicados | `DISTINCT` |
| Columna calculada | Expresión en el `SELECT` |

## ¿Y Python?

Python (con pandas) es una tercera herramienta muy útil para automatizar, limpiar datos complejos o hacer estadística. Pero para un primer empleo de analista de datos, **SQL y Excel sólidos pesan más** que un Python a medias. Lo recomendable es sumarlo después, cuando ya tengas proyectos con SQL. Lo explico con más detalle en [cómo ser analista de datos sin experiencia](/blog/como-ser-analista-de-datos-sin-experiencia).

## Errores de quien viene de Excel al aprender SQL

1. **Querer ver todas las filas.** En SQL trabajas con agregaciones; usa `LIMIT` para mirar una muestra.
2. **Olvidar que el `JOIN` puede duplicar filas.** Si una tabla tiene varias filas por clave, los totales se inflan. En Excel, `BUSCARV` solo trae la primera coincidencia y esconde ese problema.
3. **Filtrar con `WHERE` lo que es de `HAVING`.** `WHERE` filtra filas antes de agrupar; `HAVING`, grupos después de agrupar.
4. **No guardar las consultas.** Una consulta guardada y comentada es tu documentación.

## Siguiente paso

Si vienes de Excel, la mejor forma de empezar con SQL es resolver preguntas de negocio reales. Descarga los [15 ejercicios gratis](/gratis?utm_source=blog&utm_medium=articulo&utm_campaign=sql-vs-excel) y repasa las [preguntas de entrevista de Excel](/blog/preguntas-entrevista-excel-analista-de-datos) y de [SQL](/blog/preguntas-entrevista-sql-analista-de-datos) que más se repiten.

El [Kit Ruta Analista](/?utm_source=blog&utm_medium=articulo&utm_campaign=sql-vs-excel) incluye 60 ejercicios SQL resueltos y 3 proyectos con dashboards en Excel, para que practiques las dos herramientas con los mismos datos.

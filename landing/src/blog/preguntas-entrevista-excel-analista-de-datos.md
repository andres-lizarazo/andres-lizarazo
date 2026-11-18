---
title: "Preguntas de entrevista de Excel para analista de datos (con respuestas y fórmulas)"
description: "Las preguntas de Excel que más aparecen en entrevistas de analista de datos: BUSCARX, tablas dinámicas, SUMAR.SI.CONJUNTO, Power Query, fechas y errores comunes."
date: 2026-11-04
keyword: "preguntas de entrevista excel"
readingMinutes: 8
---

Aunque el puesto diga "SQL" y "Power BI", casi todas las empresas siguen trabajando en Excel. Por eso muchas entrevistas de analista de datos incluyen preguntas o una prueba práctica de Excel, sobre todo en roles de análisis comercial, financiero y de operaciones.

Aquí tienes las **preguntas de entrevista de Excel** que más se repiten, con la respuesta que da un candidato preparado y la fórmula para practicarla. Uso los nombres de las funciones en español y entre paréntesis su nombre en inglés, porque muchas empresas trabajan con Excel en inglés.

> **Nota sobre el separador:** según la configuración regional de tu computador, los argumentos se separan con punto y coma (`;`) o con coma (`,`). En este artículo uso punto y coma.

## Búsquedas y cruces de tablas

### 1. ¿Qué diferencia hay entre BUSCARV y BUSCARX?

`BUSCARV` (`VLOOKUP`) busca un valor en la primera columna de un rango y devuelve una columna a la derecha, indicada por un número. Tiene tres limitaciones: no busca hacia la izquierda, se rompe si insertas columnas (porque el número de columna queda fijo) y por defecto hace coincidencia aproximada si olvidas el último argumento.

`BUSCARX` (`XLOOKUP`, disponible en Excel 365 y 2021) resuelve las tres: indicas la columna de búsqueda y la de resultado por separado, busca en cualquier dirección, hace coincidencia exacta por defecto y permite un valor si no encuentra nada.

```text
=BUSCARX(A2; Productos[producto_id]; Productos[precio]; "No encontrado")
```

**Respuesta que suma puntos:** "Uso BUSCARX cuando está disponible; si la empresa tiene una versión anterior, uso INDICE con COINCIDIR".

### 2. ¿Cómo funciona INDICE + COINCIDIR?

`COINCIDIR` (`MATCH`) devuelve la posición de un valor en una lista, e `INDICE` (`INDEX`) devuelve el valor que está en esa posición de otra lista. Juntas hacen lo mismo que `BUSCARX` y funcionan en cualquier versión de Excel.

```text
=INDICE(Productos[precio]; COINCIDIR(A2; Productos[producto_id]; 0))
```

El `0` al final significa coincidencia exacta. Olvidarlo es uno de los errores más comunes.

### 3. ¿Qué haces si una búsqueda devuelve #N/D?

Primero investigo por qué: un espacio extra, un número guardado como texto o un código que de verdad no existe. Solo después decido cómo mostrarlo. `SI.ERROR` (`IFERROR`) sirve para presentar un resultado limpio, pero usarlo por defecto esconde problemas de datos.

```text
=SI.ERROR(BUSCARX(A2; Productos[producto_id]; Productos[precio]); "Revisar")
```

Mostrar "Revisar" en lugar de 0 evita que un error se convierta en un número falso dentro de un total.

## Agregaciones y tablas dinámicas

### 4. ¿Cómo sumas con varias condiciones?

Con `SUMAR.SI.CONJUNTO` (`SUMIFS`). Primero va el rango a sumar y luego pares de rango y condición:

```text
=SUMAR.SI.CONJUNTO(Ventas[ingreso]; Ventas[pais]; "Colombia"; Ventas[fecha]; ">="&FECHA(2025;1;1))
```

Sus parientes son `CONTAR.SI.CONJUNTO` (`COUNTIFS`) y `PROMEDIO.SI.CONJUNTO` (`AVERAGEIFS`). En SQL, esto equivale a un `SUM` con `WHERE` o con `CASE WHEN`; lo explico en [SQL vs Excel para análisis de datos](/blog/sql-vs-excel-analisis-de-datos).

### 5. ¿Para qué sirve una tabla dinámica y qué puedes hacer con ella?

Resume grandes cantidades de datos sin fórmulas: agrupar por una o varias dimensiones (país, mes, categoría), sumar, contar o promediar, y filtrar. Lo que distingue a un candidato con práctica:

- **Mostrar valores como** porcentaje del total, de la fila o diferencia respecto al periodo anterior.
- **Agrupar fechas** por mes, trimestre o año.
- **Segmentaciones** (*slicers*) para filtrar de forma visual.
- **Actualizar** la tabla cuando cambian los datos, idealmente con los datos en formato de tabla (Ctrl + T) para que el rango crezca solo.

### 6. ¿Por qué no se debe promediar porcentajes?

Porque cada porcentaje tiene una base distinta. Si una tienda convierte 50% de 10 visitas y otra 10% de 1.000 visitas, el promedio simple da 30%, pero la conversión real del total es (5 + 100) / 1.010 ≈ 10,4%. Lo correcto es sumar numeradores y denominadores por separado y dividir al final. Es una pregunta clásica para ver si entiendes los datos, no solo la herramienta.

### 7. ¿Cómo cuentas valores únicos?

En Excel 365, con la función `UNICOS` (`UNIQUE`):

```text
=CONTARA(UNICOS(Pedidos[cliente_id]))
```

En versiones anteriores, con una tabla dinámica agregando los datos al modelo de datos y usando "Recuento distinto". La opción **Datos → Quitar duplicados** también existe, pero modifica los datos originales: haz una copia antes.

## Fechas y texto

### 8. ¿Cómo agrupas ventas por mes si tienes la fecha completa?

Varias opciones: agrupar fechas dentro de la tabla dinámica, crear una columna con el primer día del mes o con el texto del mes.

```text
=FIN.MES(A2; -1) + 1
=TEXTO(A2; "aaaa-mm")
```

`FIN.MES` (`EOMONTH`) con `-1` devuelve el último día del mes anterior; sumándole 1 obtienes el primer día del mes de la fecha. Es mejor que el texto porque sigue siendo una fecha y se ordena bien. Ojo: los códigos de formato de `TEXTO` dependen del idioma (en Excel en inglés es `"yyyy-mm"`).

### 9. ¿Cómo limpias texto que viene de un sistema?

- `ESPACIOS` (`TRIM`) quita espacios sobrantes.
- `MAYUSC` / `MINUSC` / `NOMPROPIO` normalizan mayúsculas.
- `IZQUIERDA`, `DERECHA` y `EXTRAE` (`MID`) cortan partes de un texto.
- `TEXTOANTES` y `TEXTODESPUES` (`TEXTBEFORE` / `TEXTAFTER`, Excel 365) separan por un delimitador. Por ejemplo, el dominio de un correo:

```text
=TEXTODESPUES(MINUSC(ESPACIOS(A2)); "@")
```

- `VALOR` (`VALUE`) convierte números guardados como texto, una causa frecuente de búsquedas que fallan.

<div class="cta-inline">
<p><strong>Practica con datos de una tienda real (ficticia):</strong> la base de Andina Market también viene en CSV para abrirla en Excel, junto con 15 ejercicios SQL resueltos.</p>
<a href="/gratis?utm_source=blog&utm_medium=articulo&utm_campaign=excel">Descargar gratis →</a>
</div>

## Lógica y análisis

### 10. ¿Cómo clasificas valores en rangos?

Con `SI.CONJUNTO` (`IFS`), más legible que varios `SI` anidados:

```text
=SI.CONJUNTO(B2>=100; "Alto"; B2>=50; "Medio"; VERDADERO; "Bajo")
```

El último par con `VERDADERO` funciona como "en cualquier otro caso". Para muchas categorías es mejor una tabla de rangos y una búsqueda aproximada, porque se mantiene más fácil.

### 11. ¿Qué diferencia hay entre referencias relativas, absolutas y mixtas?

- `A1` es relativa: cambia al copiar la fórmula.
- `$A$1` es absoluta: no cambia (útil para un tipo de cambio o una meta fija).
- `$A1` o `A$1` son mixtas: fijan solo la columna o solo la fila (útil para tablas de doble entrada).

La tecla F4 alterna entre los tipos. Parece básico, pero en una prueba práctica en vivo se nota de inmediato quién lo domina.

### 12. Tienes las ventas en una hoja y las metas en otra. ¿Cómo calculas el cumplimiento por vendedor?

1. Convierto ambas hojas en tablas (Ctrl + T).
2. En la tabla de metas, traigo las ventas de cada vendedor con `SUMAR.SI.CONJUNTO` (no con `BUSCARX`, porque cada vendedor tiene muchas ventas).
3. Calculo el cumplimiento como ventas / meta, con formato de porcentaje.
4. Uso formato condicional para resaltar quién está por debajo del 80%.
5. Reviso casos raros: vendedores sin meta, metas en cero (división por cero) y nombres escritos distinto en las dos hojas.

El paso 5 es el que separa a un analista de alguien que solo sabe fórmulas.

## Herramientas avanzadas

### 13. ¿Qué es Power Query y cuándo lo usas?

Power Query (en la pestaña Datos → Obtener y transformar) sirve para importar, limpiar y combinar datos con pasos que quedan guardados y se repiten con un clic. Lo uso cuando:

- recibo el mismo reporte cada semana y siempre hago la misma limpieza;
- tengo que combinar muchos archivos de una carpeta;
- necesito transformar columnas en filas (*unpivot*) para analizar.

Es la misma lógica de Power BI, así que aprenderlo te sirve en las dos herramientas.

### 14. ¿Qué son las funciones de matriz dinámica?

En Excel 365, funciones como `FILTRAR` (`FILTER`), `ORDENAR` (`SORT`) y `UNICOS` (`UNIQUE`) devuelven varios resultados que se "derraman" en las celdas vecinas.

```text
=ORDENAR(FILTRAR(Ventas; Ventas[pais]="Colombia"); 3; -1)
```

Esta fórmula muestra las ventas de Colombia ordenadas de mayor a menor por la tercera columna. Reemplaza muchos filtros manuales y se actualiza sola.

### 15. ¿Qué gráfico usarías para mostrar…?

- **Una tendencia en el tiempo:** líneas.
- **Una comparación entre categorías:** barras horizontales, ordenadas de mayor a menor.
- **La composición de un total:** barras apiladas al 100%. Evita los gráficos de torta con más de 3 o 4 partes.
- **La relación entre dos variables:** dispersión.

La respuesta completa incluye por qué: "elijo el gráfico según la pregunta que tiene que responder, y le pongo un título que diga la conclusión".

## Cómo prepararte para la prueba práctica

1. **Practica con datos reales**, no con listas de 10 filas. Usa un dataset de miles de filas para acostumbrarte a tablas dinámicas y búsquedas.
2. **Cronométrate.** Muchas pruebas de Excel duran 30 a 60 minutos.
3. **Revisa tus totales.** Antes de entregar, compara el total de tu tabla dinámica con la suma de la columna original.
4. **Deja el archivo ordenado:** una hoja de datos, una de cálculos y una de resultados, con títulos claros.
5. **Prepara la explicación.** Te van a preguntar qué hiciste y por qué.

## Siguiente paso

Excel y SQL se complementan: practica las dos con los mismos datos. Descarga la [base de práctica gratis](/gratis?utm_source=blog&utm_medium=articulo&utm_campaign=excel) (incluye la versión CSV) y repasa las [preguntas de entrevista SQL](/blog/preguntas-entrevista-sql-analista-de-datos) y cómo prepararte para la [prueba técnica de analista de datos](/blog/prueba-tecnica-analista-de-datos).

El [Kit Ruta Analista](/?utm_source=blog&utm_medium=articulo&utm_campaign=excel) incluye 3 proyectos con dashboards en Excel construidos con fórmulas, listos para tu portafolio.

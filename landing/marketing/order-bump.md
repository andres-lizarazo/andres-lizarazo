# Order bump: Pack de entrevistas en inglés (USD 9)

El *order bump* es una casilla que aparece en el checkout de Hotmart, justo antes de pagar: "Sí, agrega esto a mi compra". Lo acepta una parte de los compradores sin que tengas que conseguir más visitas.

**Por qué importa:** si el 30% lo agrega, el ticket promedio sube unos USD 2,7 por comprador. Junto con un upsell futuro de USD 49, la meta de USD 19.000 baja de 1.000 a unos 790 compradores.

## El producto

**Pack de entrevistas en inglés para Analistas de Datos** (archivo: `Pack-Entrevistas-Ingles-v1.zip`, fuera de este repo):

- **PDF:**
  - Plan de práctica de 7 días.
  - 3 versiones de "Tell me about yourself".
  - 50 preguntas en inglés con respuestas modelo y la clave en español de cada una:
    - de comportamiento (STAR)
    - técnicas (SQL/BI)
    - casos de negocio
    - trabajo remoto
    - salario y cierre
  - Frases para explicar datos en inglés.
  - 15 falsos amigos.
  - Guion de simulacro de 30 minutos con rúbrica.
  - 4 plantillas de email.
- **`flashcards.csv`:** para importar en Anki o Quizlet.
- **`mis-historias-STAR.docx`:** plantilla para escribir tus propias historias.

## Configuración en Hotmart

1. Crea un **segundo producto** en Hotmart: "Pack de entrevistas en inglés para Analistas de Datos", USD 9, garantía de 7 días. Sube el contenido del zip al área de miembros.
2. En el producto principal (Kit Ruta Analista) → **Checkout → Order Bump**: agrega el pack.
3. Pega estos textos en la caja del order bump:

**Título:**
> Sí, agrega el Pack de entrevistas en inglés por USD 9

**Descripción:**
> 50 preguntas reales de entrevista en inglés con respuestas modelo, frases para explicar datos, los falsos amigos que más delatan a los hispanohablantes y un simulacro guiado de 30 minutos. Ideal si apuntas a trabajo remoto con EE.UU.

**Imagen:** [`imagenes/portada-pack-ingles.png`](imagenes/portada-pack-ingles.png) (cuadrada, 1080 × 1080). Úsala también como imagen del producto del pack.

4. **Medios de pago:** según Hotmart, **PSE no está disponible con order bump** (tarjeta y PayPal sí). Revisa en tu panel qué porcentaje de compradores paga con PSE:
   - Si es bajo, activa el order bump para todos.
   - Si es alto, prueba durante 2 semanas y compara la conversión del checkout antes y después. Si cae, desactívalo y vende el pack por email (abajo).

## Venta por email (para quienes no lo agregaron)

Agrégalo a la automatización de compradores en Brevo, 3 días después de la compra, con la condición *no tiene el pack*. Para eso, crea en Brevo el atributo `PACK_INGLES` y márcalo a mano o con una segunda integración.

**Asunto:** ¿Y la entrevista en inglés?

> Hola {{ contact.FIRSTNAME }},
>
> Si estás apuntando a trabajo remoto con empresas de EE.UU., la entrevista en inglés suele pesar tanto como la parte técnica.
>
> Armé un pack corto para eso: 50 preguntas reales con respuestas modelo, frases para explicar datos en inglés y un simulacro guiado de 30 minutos. Cuesta USD 9: [LINK DE PAGO DEL PACK]
>
> Andrés

## Cómo medirlo

En Hotmart → Reportes, mira el **% de aceptación del order bump** (compras con bump / compras del kit). Una buena referencia para empezar es 20–35%. Si es menor, prueba otro título: el beneficio concreto ("trabajo remoto con EE.UU.") suele funcionar mejor que la lista de contenidos.

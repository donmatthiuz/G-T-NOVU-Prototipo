# Guía visual NOVU

## Propósito

NOVU debe sentirse cercano sin ser infantil, tecnológico sin ser críptico y financiero sin ser frío. La interfaz conserva la estructura del prototipo original y adopta el lenguaje editorial de `Reinvención Grupo 3.pdf`.

## Principios

### Claridad

Una acción principal por vista, lenguaje simple y decisiones progresivas. Los usuarios no deben interpretar iconos ambiguos ni comparar cifras sin contexto.

### Progreso

Mostrar avances, próximos hitos y acciones pequeñas. El ahorro se comunica como hábito alcanzable, no como una meta distante.

### Confianza

Explicar por qué se solicita información, respaldar cada decisión financiera y distinguir claramente acciones personales, grupales y familiares.

## Identidad extraída de la presentación

- Índigo `#22229F`: acción principal, navegación y titulares.
- Azul `#134294`: profundidad y marca.
- Violeta `#5D3E9F`: copiloto, progreso y acento secundario.
- Magenta `#B43461`: transición y énfasis.
- Coral `#D51A30`: cierre del gradiente y llamadas puntuales.
- Tinta `#171C23`, lienzo `#F8F8FC` y borde `#DED9EE` sostienen las superficies.
- Gradiente NOVU: `#22229F → #5D3E9F → #B43461 → #D51A30`.
- No usar la paleta de G&T como identidad de interfaz.

## Tipografía

Poppins es la única familia tipográfica. Bold se usa en títulos, cifras y botones; Medium en etiquetas; Regular en texto funcional. El texto funcional nunca baja de 12 px y el cuerpo base es 16 px.

## Layout móvil

- Base de diseño: 375 × 812 px.
- Margen lateral: 20 px.
- Escala de espaciado: múltiplos de 4 px.
- Objetivo táctil mínimo: 48 × 48 px.
- Tarjetas: radios de 16–24 px, borde violeta muy sutil y sombra ligera solo cuando ayuda a separar niveles.
- Navegación inferior: cinco destinos como máximo, con icono SVG y etiqueta visible.

## Componentes

### Button

Primary aparece una sola vez por pantalla y usa el gradiente NOVU. Secondary acompaña o permite volver. Estados móviles: Default, Pressed y Disabled. Altura mínima: 48 px.

### Badge

Comunica estado o modalidad en una a tres palabras. Nunca depende únicamente del color.

### Progress

Siempre muestra monto actual y meta junto con la barra. Al 100% cambia al color de éxito.

### Goal Card

Resume una meta personal, reto grupal o fondo familiar. La tarjeta completa es táctil y contiene una sola acción final.

### Process Header

Unifica las fases 3–6 del onboarding con el gradiente NOVU, una etiqueta textual del paso y seis segmentos de progreso. Debe ocupar el borde superior completo, conservar el radio de la pantalla y dejar 16 px antes del contenido.

### Personal Goal Hero

Presenta el avance principal de una meta con porcentaje escrito, anillo, barra, saldo restante y fecha estimada. Todos los datos son propiedades editables; no usar capturas raster para esta tarjeta.

### Group Plan Components

El plan de reto grupal usa un resumen de avance y una tabla de integrantes editables. Cada fila combina nombre, aporte, barra con porcentaje y puntos; el avance se expresa también como número. Las acciones Aportar, Retirar e Historial usan iconos SVG reales.

### Iconografía

- Usar una sola familia vectorial de trazo regular; la implementación actual reutiliza Simple Design System.
- Tamaños base: 16 px para contenido compacto, 20 px para navegación y acciones, 24 px para avatares o estados destacados.
- Usar `color/icon/default` en estado neutro y `color/icon/brand` para selección o énfasis.
- Mantener etiqueta visible en navegación. En tarjetas, el texto cercano aporta el nombre accesible.
- El icono se centra dentro del contenedor de color existente; el color de fondo no reemplaza el significado del vector.
- No usar cajas vacías, emojis, caracteres de fuente ni mezclar familias de iconos.

## Accesibilidad y contenido

- Contraste mínimo WCAG AA para texto normal.
- Estados distintos por color y texto.
- No usar emojis como iconos funcionales.
- No usar cajas vacías o caracteres que dependan de fuentes faltantes.
- Cantidades en quetzales con separadores: `Q 1,250`.
- Votaciones familiares deben explicar quién vota, qué se decide y cuándo cierra.
- Retos grupales deben dejar claro que el objetivo es compartido pero las cuentas son separadas.

## Evitar

- Más de una acción primaria por vista.
- Gradientes en todas las tarjetas.
- Colores o nombres de token G&T dentro del sistema visual.
- Sombras pesadas, bordes negros o exceso de píldoras.
- Texto menor de 12 px.
- Mensajes genéricos como “algo salió mal” sin explicar recuperación.

## Interacción

- La pantalla debe poder entenderse por jerarquía, iconos, estados y acciones; no añadir párrafos que expliquen su propia función.
- Conservar explicaciones solo cuando evitan una decisión financiera equivocada.
- Flujo hacia adelante: transición lateral izquierda.
- Regreso: transición lateral derecha.
- Cambio de sección: disolución breve.
- El tab activo de navegación no ejecuta una navegación redundante.

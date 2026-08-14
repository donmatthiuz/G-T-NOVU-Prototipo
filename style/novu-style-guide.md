# Guía visual NOVU

## Propósito

NOVU debe sentirse cercano sin ser infantil, tecnológico sin ser críptico y bancario sin ser frío. Cada pantalla explica el siguiente paso, pone los montos en contexto y hace visible el progreso.

## Principios

### Claridad

Una acción principal por vista, lenguaje simple y decisiones progresivas. Los usuarios no deben interpretar iconos ambiguos ni comparar cifras sin contexto.

### Progreso

Mostrar avances, próximos hitos y acciones pequeñas. El ahorro se comunica como hábito alcanzable, no como una meta distante.

### Confianza

Explicar por qué se solicita información, respaldar cada decisión financiera y distinguir claramente acciones personales, grupales y familiares.

## Identidad

- Azul G&T `#0058A4`: confianza, navegación y acciones secundarias.
- Azul NOVU `#1E4393`: acción principal y marca.
- Púrpura NOVU `#5B3986`: acento y momentos de inteligencia/copiloto.
- Rojo NOVU `#D51A30`: identidad y celebraciones puntuales; no usar como error por defecto.
- Amarillo G&T `#FDBB33`: advertencias y énfasis limitados.
- Gradiente NOVU: reservado para portada, marca, progreso destacado o celebración.

## Tipografía

Montserrat se usa en títulos y cifras protagonistas. Inter se usa en interfaz, párrafos, etiquetas y botones. El texto funcional nunca baja de 12 px; el cuerpo recomendado es 15 px.

## Layout móvil

- Base de diseño: 375 × 812 px.
- Margen lateral: 20 px.
- Escala de espaciado: múltiplos de 4 px.
- Objetivo táctil mínimo: 48 × 48 px.
- Tarjetas: radio de 20 px, borde sutil y sombra ligera solo cuando ayuda a separar niveles.
- Navegación inferior: cinco destinos como máximo, con icono SVG y etiqueta visible.

## Componentes

### Button

Primary aparece una sola vez por pantalla. Secondary acompaña o permite volver. Estados móviles: Default, Pressed y Disabled. Altura mínima: 48 px.

### Badge

Comunica estado o modalidad en una a tres palabras. Nunca depende únicamente del color.

### Progress

Siempre muestra monto actual y meta junto con la barra. Al 100% cambia al color de éxito.

### Goal Card

Resume una meta personal, reto grupal o fondo familiar. La tarjeta completa es táctil y contiene una sola acción final.

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

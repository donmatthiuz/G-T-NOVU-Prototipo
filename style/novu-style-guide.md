# Guía visual NOVU — v3.0.0

## Propósito

NOVU debe sentirse cercano sin ser infantil, tecnológico sin ser críptico y financiero sin ser frío. Esta versión reemplaza la dirección visual 2.0.0 (basada en `Reinvención Grupo 3.pdf`) por la extraída de `referencias/segundoprototipo/`: paleta más vívida, gradiente protagonista, tipografía más "chunky" e insignias de ícono circulares. La estructura del prototipo original — su recorrido, arquitectura de información y decisiones de interacción — no cambia; solo cambia cómo se ve.

## Fuente de esta versión

- `referencias/segundoprototipo/portada.jpeg` — pantalla de bienvenida, tema oscuro.
- `referencias/segundoprototipo/iniciosesion/` — pantalla de inicio de sesión, tema oscuro.
- `referencias/segundoprototipo/flujometa/1.jpeg`–`7.jpeg` — flujo de configuración de meta, tema claro.

Los valores exactos (hex, tamaños) están en `novu-tokens.yaml`. Son estimaciones cuidadosas a partir de capturas JPEG, no un muestreo de píxel exacto.

## Estrategia de tema: dos contextos, no un toggle

La referencia no usa un solo modo — usa oscuro para la entrada (Portada, Inicio de sesión) y claro para el resto (flujo de meta, y por extensión toda la app restylada). Se preserva esa intención como **dos contextos de superficie fijos**, cada pantalla pertenece a uno solo:

| Contexto | Dónde | Fondo | Texto principal |
|---|---|---|---|
| `dark` | Portada, Inicio de sesión | `#0E0B22` | Blanco `#FFFFFF` |
| `light` | Todo lo demás (flujo de meta y el resto de la app restylada) | `#FBFAFF` / `#FFFFFF` | Tinta `#17142B` |

No alternar un mismo componente entre ambos contextos. Un botón primario, por ejemplo, usa el mismo gradiente en los dos, pero el fondo que lo rodea cambia.

## Principios

Se mantienen los tres principios de 2.0.0 — Claridad, Progreso, Confianza — sin cambios; ver la sección homónima más abajo. Lo que cambia es el vocabulario visual con el que se expresan.

### Claridad

Una acción principal por vista, lenguaje simple y decisiones progresivas.

### Progreso

Mostrar avances, próximos hitos y acciones pequeñas.

### Confianza

Explicar por qué se solicita información, respaldar cada decisión financiera y distinguir acciones personales, grupales y familiares.

## Identidad visual v3.0.0

- Índigo `#4B2FE0`, violeta `#8B2FE0` y magenta `#E91C7A` forman el gradiente NOVU (`135deg`, índigo → violeta → magenta). Reemplaza el gradiente de 4 paradas 2.0.0 (índigo/azul/violeta/magenta/coral) — se retira el coral, no aparece en la referencia nueva.
- El gradiente es ahora el tratamiento por defecto de **todo** botón primario, no una excepción ocasional.
- Insignias de ícono: círculo completo (`radius.icon_badge: 999`), fondo `soft_violet` o `soft_pink`, ícono de línea centrado — reemplaza el cuadrado redondeado de 8 px de 2.0.0.
- Tarjetas: radio `lg = 20px` (antes 16), sombra `card_light`/`card_dark` según contexto.
- Botones: forma píldora completa (`radius.full`) en el 100% de los casos, alto `52px` (antes 48; el mínimo táctil de 48 px se mantiene como piso, no como altura por defecto).
- No usar la paleta de G&T como identidad de interfaz — regla heredada, sigue vigente.

## Logo e íconos de referencia: recorte real, no aproximación

El logo NOVU y los íconos de `Portada`, `Inicio de sesión` y `05 · Ingresos` no se redibujan a mano ni se aproximan con una librería de íconos genérica — se recortan directamente de los JPEG en `referencias/segundoprototipo/` (ImageMagick, fondo vuelto transparente) y se suben a Figma con la herramienta de subida de assets, usando el `imageHash` resultante en fills `IMAGE` propios. Siguen siendo nodos editables en tamaño y posición; lo que no se aproxima es el color ni la forma del ícono en sí. Usar este método cuando la referencia trae un logo o ilustración con gradiente/detalle que una librería de íconos de línea no puede igualar — no para íconos genéricos (flecha, chevron, campana, etc.), donde reconstruir con la librería conectada sigue siendo preferible por quedar editable de verdad (color, trazo, tamaño vía variantes).

## Tipografía

Poppins sigue siendo la única familia — no hay evidencia en la referencia de un tipo distinto; el efecto "chunky" de los titulares se logra con Bold/ExtraBold a tamaños mayores (`heading_h1` pasa de 24 a 26px/800). Medium en etiquetas, Regular en texto funcional. El texto funcional nunca baja de 12 px; el cuerpo base sigue en 16 px.

## Layout móvil

Sin cambios respecto a 2.0.0:

- Base de diseño: 375 × 812 px.
- Margen lateral: 20 px.
- Escala de espaciado: múltiplos de 4 px.
- Objetivo táctil mínimo: 48 × 48 px.
- Navegación inferior: cinco destinos como máximo, con ícono SVG y etiqueta visible.

## Componentes

### Button

Primary aparece una sola vez por pantalla, forma píldora completa, gradiente NOVU, alto 52 px, texto blanco Bold. Secondary acompaña o permite volver: píldora con borde (violeta sobre fondo claro, blanco sobre fondo oscuro), sin relleno. Estados: Default, Pressed, Disabled.

### Badge

Sin cambios de comportamiento respecto a 2.0.0: comunica estado o modalidad en una a tres palabras, nunca depende únicamente del color. Colores actualizados a la paleta v3.

### Progress / Process Header

El patrón de barra segmentada de 2.0.0 se conserva estructuralmente — no se rediseña desde cero — pero adopta la paleta nueva: segmento activo con relleno de gradiente, segmentos pendientes en `soft_violet`. La referencia (`flujometa/1-3.jpeg`) usa una fila de guiones/píldoras; `flujometa/4-5.jpeg` usa círculos numerados con check — se estandariza en el primer patrón (guiones) por ser mayoritario en la referencia y más liviano de mantener en los componentes existentes.

### Goal Card

Sin cambios de comportamiento. Insignia de ícono ahora circular; borde de selección violeta con check relleno cuando aplica (ver `flujometa/1.jpeg`).

### Personal Goal Hero / Group Plan Components

Sin cambios de comportamiento; heredan la paleta v3 (gradiente, radios, sombras) al restylar.

### Iconografía

- Se mantiene una sola familia vectorial de trazo regular (Simple Design System) — la referencia mezcla algunos íconos ilustrados/a color en `flujometa/2-3.jpeg`, pero se estandariza en íconos de línea para no romper la regla de familia única ya establecida en 2.0.0.
- Tamaños base sin cambios: 16 / 20 / 24 px.
- Insignia contenedora ahora circular (ver Identidad visual).

## Pantallas nuevas replicadas 1:1

`Portada` (ex `01 · Bienvenida`) e `Inicio de sesión` (pantalla nueva, no existía en el flujo replicado) se reconstruyen fieles a `portada.jpeg` e `iniciosesion/*.jpeg`: tema oscuro, logo N en gradiente, tarjetas de feature 2×2, biometría en login. Ver `docs/functional-prototype.md` para nodos e IDs.

## Reemplazo de 02–06 con `flujometa`

Las 7 imágenes de `flujometa/` cubren dos secuencias de pasos distintas (`Paso X de 5` en 1–5, `Paso X de 4` en 6–7, con los pasos 3–4 de esa segunda secuencia sin imagen de referencia). Interpretación aplicada, documentada aquí para que sea fácil de corregir si no es la intención:

- Secuencia de 5 pasos (imágenes 1–5) → reemplaza directamente `02 · Elegí tu meta` a `06 · Plan generado`, en orden.
- Secuencia de 4 pasos (imágenes 6–7, con 3–4 sin referencia) → se trata como material de referencia adicional para el patrón de formulario largo (campo + ícono + etiqueta numerada), reutilizable al restylar otras pantallas de formulario (`14 · Crear reto grupal`, `21 · Crear fondo familiar`, etc.), no como pantallas nuevas insertadas en la secuencia principal.
- Ninguna imagen de referencia muestra el resultado de "Plan generado" (monto sugerido, plazo, Modo Temporada); esa pantalla se diseña extendiendo el lenguaje visual v3 sin una imagen fuente directa.

Detalle pantalla por pantalla y nodos en `docs/functional-prototype.md`.

## Accesibilidad y contenido

- Contraste mínimo WCAG AA para texto normal — verificado: blanco sobre `#0E0B22` y sobre las paradas del gradiente supera 4.5:1 en ambos casos.
- Estados distintos por color y texto.
- No usar emojis como íconos funcionales.
- No usar cajas vacías o caracteres que dependan de fuentes faltantes.
- Cantidades en quetzales con separadores: `Q 1,250`.

## Evitar

- Más de una acción primaria por vista.
- Alternar contexto claro/oscuro dentro de una misma pantalla.
- Colores o nombres de token G&T dentro del sistema visual.
- Mezclar íconos de línea con íconos ilustrados a color.
- Texto menor de 12 px.

## Migración desde 2.0.0

- Los valores 2.0.0 quedan en `novu-tokens.yaml` bajo `deprecated_2_0_0` solo como referencia histórica de qué se reemplazó — no usar en trabajo nuevo.
- Toda pantalla existente del archivo (más allá de 02–06 y las nuevas Portada/Login) debe migrar sus fills sólidos y variables ligadas de la paleta 2.0.0 a la v3.0.0 al restylarse; ver bitácora de progreso en `plan/figma-progress.md` para el estado pantalla por pantalla de esa migración.

## Interacción

Sin cambios respecto a 2.0.0:

- La pantalla se entiende por jerarquía, íconos, estados y acciones; no se añaden párrafos que expliquen su propia función.
- Flujo hacia adelante: transición lateral izquierda. Regreso: transición lateral derecha. Cambio de sección: disolución breve.
- El tab activo de navegación no ejecuta una navegación redundante.

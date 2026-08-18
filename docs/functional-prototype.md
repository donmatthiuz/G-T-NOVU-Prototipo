# Especificación funcional — flujo original + presentación

Archivo: [NOVU en Figma](https://www.figma.com/design/vFm8Z8NqINCaW8YDb23hz5/NOVU?node-id=63-432)

Página: `08 · NOVU · Flujo original + Presentación` (`63:431`)

Punto de inicio principal: `01 · Portada` (`63:432`, `Flow 1`)

## Resultado validado

- 43 pantallas de 375 × 812 px: 31 de la réplica principal (`01`–`31`, con `01`–`07` reconstruidas en el header y contenido v3) + 8 sub-flujos de Verificación (KYC) (`07a`–`07h`) + 4 pantallas nuevas de entrada/biometría (`01a`–`01d`).
- 154 reacciones, 0 destinos externos o rotos.
- Paleta, tipografía y patrones de componente migrados por completo a la v3.0.0 extraída de `referencias/segundoprototipo/` — ver [Migración a la paleta v3](#migración-a-la-paleta-v3-segundoprototipo) y `style/novu-tokens.yaml` / `style/novu-style-guide.md`. No queda ningún fill ni gradiente de la paleta 2.0.0 en el archivo (verificado nodo por nodo).
- El logo NOVU y los íconos de Portada, Inicio de sesión e Ingresos son recortes reales de las imágenes de referencia (subidos como fills `IMAGE` editables, no capturas de pantalla pegadas), no aproximaciones con otra librería de íconos — ver [Assets reales de referencia](#assets-reales-de-referencia).
- 71 controles pequeños conservan su apariencia pero usan hotspots de al menos 48 × 48 px.
- El registro/KYC (pantalla 7) abre cuatro sub-flujos independientes con pantallas propias: DPI, selfie, contacto/contraseña y comprobante de domicilio.
- La tarjeta principal de Plan personal y el resumen/tabla del Plan (Reto Grupal) son componentes editables, no imágenes raster.
- Historial del reto, Historial de aportaciones y Fondo familiar (aportes) — pantallas 18, 29 y 27 — no contienen fills `IMAGE`.
- Las 10 pantallas con Bottom Navigation comparten exactamente la misma posición, tamaño e insignia NOVU central; ver [Consistencia de Bottom Navigation](#consistencia-de-bottom-navigation).
- El original permanece intacto en `Legacy · Prototipo original` (`0:1`).

## Migración a la paleta v3 (`segundoprototipo`)

Origen: `referencias/segundoprototipo/portada.jpeg`, `iniciosesion/`, `flujometa/1-7.jpeg`. Especificación completa en `style/novu-tokens.yaml` y `style/novu-style-guide.md`.

- **Fundamentos**: los valores de las variables primitivas de color (`NOVU · Presentación · Primitives`) se actualizaron a la paleta v3 (índigo `#4B2FE0`, violeta `#8B2FE0`, magenta `#E91C7A`; se retiró el coral, sin equivalente en la referencia nueva). Esto propagó el cambio automáticamente a todo lo que ya estaba bien ligado a variable en las 39 pantallas existentes al momento de la migración.
- **Gradiente de marca**: de 4 paradas (índigo/violeta/magenta/coral) a 3 (índigo/violeta/magenta), actualizado en el componente `Button` y luego barrido en todas las pantallas — ningún fill ni parada de gradiente de la paleta vieja sobrevive en el archivo.
- **`01 · Portada`** (mismo nodo que la antigua `01 · Bienvenida`, `63:432`) y **`01a · Inicio de sesión`** (nueva, `210:440`): reconstruidas 1:1 desde la referencia, tema oscuro (`#0E0B22`), logo N y todos sus íconos recortados directamente de la referencia — ver [Assets reales de referencia](#assets-reales-de-referencia).
- **`01b`–`01d` · Verificación biométrica** (nuevas): los 3 métodos de biometría de Inicio de sesión (Huella, Reconocimiento facial, Face ID) abren cada uno su propia pantalla en vez de no hacer nada al tocarlos.
- **`02`–`06`**: reemplazadas por completo con el contenido de `flujometa/1-5.jpeg` (secuencia "Paso X de 5"). Las imágenes `flujometa/6-7.jpeg` muestran una segunda secuencia incompleta ("Paso X de 4", sin pasos 3-4) — se usaron como referencia del patrón de formulario largo, no como pantallas nuevas insertadas. Ninguna imagen de referencia cubre un resultado de "plan generado" con montos; `06` se diseñó como pantalla de transición al coach ("¡Genial, ya casi estamos listos!") extendiendo el lenguaje v3, y su CTA lleva directo a `07 · Verificación (KYC)`.
- **Resto del archivo (`08`–`31`, `07a`–`07h`)**: barrido masivo de recoloreo (fills, strokes y paradas de gradiente) de cada hex de la paleta 2.0.0 a su equivalente v3 más cercano, más una corrección puntual del componente `Button/Secondary` (su borde seguía en índigo viejo). 1.464 nodos visitados, 494 fills y 111 strokes corregidos en total entre las dos pasadas.
- **`07 · Verificación (KYC)`**: el restyle inicial solo recoloreó el `Process Header` (gradiente 6/6) que traía; en una corrección posterior se reemplazó ese header por el mismo patrón de `02`–`06` (fondo claro, flecha, wordmark en gradiente, titular y subtítulo centrados) para que la transición entre pantallas sea consistente. Copy original conservado ("Un último paso" + el texto de la Cuenta Digital G&T). El `Process Header` como componente sigue existiendo con sus 4 variantes, pero ya no tiene ninguna instancia activa en la réplica.
- Iconografía, componentes (Button, Badge, Progress, Goal Card, Bottom Navigation, Personal Goal Hero, Group Plan Components) y estructura de navegación **no cambiaron** — la migración es de color/tipografía/tratamiento visual, no de arquitectura de información, salvo el contenido explícitamente reemplazado en `02`–`06` y el header de `07`.

## Assets reales de referencia

El logo N y varios íconos se habían reconstruido a mano con componentes de Simple Design System — no coincidían con la referencia en forma ni color. Corrección: se recortaron los assets reales de los JPEG de `segundoprototipo` (ImageMagick, fondo vuelto transparente) y se subieron a Figma como fills `IMAGE` propios, editables en tamaño y posición igual que cualquier otro nodo — no son capturas de pantalla pegadas.

- **Portada**: logo N y wordmark `NOVU` recortados (antes: logo reutilizado del badge de Bottom Nav, con un fondo blanco circular que no está en la referencia). Los 4 íconos de tarjeta (Metas, Plan, Progreso, Coach) recortados 1:1 en vez de Target/Clipboard/Trending up/Message circle de Simple Design System. Botón "Ya tengo cuenta": borde y texto corregidos a magenta (la referencia usa magenta ahí específicamente, no el violeta del resto de los botones Secondary).
- **Inicio de sesión**: mismo logo recortado; fila de biometría ampliada de 2 a 3 columnas con los íconos reales (Huella, Reconocimiento facial, Face ID) en vez de una aproximación con Lock.
- **`05 · Ingresos`**: los 5 íconos de radio (cohete, calendario, gráfico, bandera, reloj) reemplazados por los recortes reales de `flujometa/4.jpeg`.

## Secuencia principal testeada

`Portada → Elegí tu meta → Motivación → Situación financiera → Horizonte → Coach (plan) → Verificación/KYC → Plan personal`

`01 · Portada` tiene dos salidas: "Empezar" hacia `02 · Elegí tu meta`, y "Ya tengo cuenta" hacia `01a · Inicio de sesión`, cuyo botón "Ingresar" conserva el atajo original directo a `08 · Plan personal`. Las tres opciones de biometría de `01a` llevan cada una a su propia pantalla (`01b`–`01d`), que "escanean" solas (`AFTER_TIMEOUT`, 1.4 s) y también terminan en `08 · Plan personal`.

Dentro del paso Verificación/KYC, cada una de las cuatro filas abre y cierra su propio sub-flujo (ver [Sub-flujos de Verificación (KYC)](#sub-flujos-de-verificación-kyc)) antes de volver a la pantalla 7; la secuencia principal no cambia de destino final.

## Inventario pantalla por pantalla

| # | Pantalla | Nodo | Funcionalidad conservada |
|---:|---|---|---|
| 1 | Portada | `63:432` | Presenta NOVU (tema oscuro) e inicia una meta o entra con cuenta existente. |
| 1a | Inicio de sesión | `210:440` | Correo/teléfono + contraseña, biometría (Huella, Reconocimiento facial, Face ID), enlace a registro. |
| 1b | Verificación — Huella | `239:374` | Escaneo simulado de huella; avanza sola a los 1.4 s. |
| 1c | Verificación — Reconocimiento facial | `239:390` | Escaneo simulado facial; avanza sola a los 1.4 s. |
| 1d | Verificación — Face ID | `239:406` | Escaneo simulado Face ID; avanza sola a los 1.4 s. |
| 2 | Elegí tu meta | `63:438` | Selecciona una categoría de meta entre 6 opciones y continúa. |
| 3 | Detalle de la meta | `63:482` | Selección múltiple de motivaciones para el objetivo elegido. |
| 4 | Chat con el copiloto | `63:513` | Radio de situación financiera actual (base para el plan). |
| 5 | Ingresos | `63:555` | Radio de horizonte temporal para lograr la meta. |
| 6 | Plan generado | `63:581` | Transición al coach NOVU antes de continuar a verificación. |
| 7 | Verificación (KYC) | `63:618` | Abre cuatro sub-flujos independientes para identidad, rostro, contacto y comprobante — ver detalle abajo. |
| 8 | Plan personal | `63:662` | Consulta progreso y abre el retiro personal. |
| 9 | Retiro personal | `63:724` | Confirma o cancela el retiro sin perder contexto de impacto. |
| 10 | Tu Ritmo | `63:742` | Consulta racha, nivel, constancia y resumen semanal. |
| 11 | Copiloto | `63:778` | Revisa conversación, recomendaciones y preguntas rápidas. |
| 12 | Oportunidades | `63:822` | Presenta beneficios habilitados por meta, grupo y nivel. |
| 13 | Inicio | `63:874` | Abre meta personal, reto grupal, fondo familiar y resúmenes. |
| 14 | Crear reto grupal | `63:944` | Define nombre, monto, integrantes y frecuencia. |
| 15 | Resumen del reto | `63:994` | Confirma modalidad, objetivo, participantes y frecuencia. |
| 16 | Invitar al reto | `63:1017` | Comparte invitación y revisa integrantes pendientes. |
| 17 | Retiro del reto | `63:1053` | Solicita retirar monto y motivo del reto. |
| 18 | Historial del reto | `63:1063` | Filtra y consulta aportes de "Reto de Julio" con sus integrantes reales (Carlos, Ana, María, Tú/Diego). |
| 19 | Plan del reto | `63:1101` | Consulta progreso, ranking, aportes, retiro e historial. |
| 20 | Aportar al reto | `63:1151` | Selecciona cuenta, monto y descripción del aporte. |
| 21 | Crear fondo familiar | `63:1162` | Define nombre, aporte mínimo, aprobadores y administrador. |
| 22 | Resumen del fondo | `63:1212` | Confirma reglas de aporte, votación y administración. |
| 23 | Invitar al fondo | `63:1231` | Comparte invitación y revisa integrantes pendientes. |
| 24 | Votar solicitud | `63:1267` | Revisa una solicitud y emite voto. Punto alterno `Flow 2`. |
| 25 | Votaciones | `63:1325` | Consulta votos aprobados y libera el dinero. |
| 26 | Dinero liberado | `63:1356` | Confirma transferencia y saldo restante. |
| 27 | Fondo familiar — aportes | `63:1368` | Consulta progreso y abre aporte, retiro/voto e historial. |
| 28 | Solicitudes del fondo | `63:1411` | Aprueba, rechaza o crea una solicitud de retiro. |
| 29 | Historial de aportaciones | `63:1471` | Filtra aportes por período y miembro. |
| 30 | Solicitar retiro del fondo | `63:1511` | Captura monto y motivo para iniciar aprobación. |
| 31 | Aportar al fondo | `63:1521` | Selecciona cuenta, monto y descripción del aporte familiar. |

## Sub-flujos de Verificación (KYC)

Las cuatro filas de `07 · Verificación (KYC)` (`63:618`) son táctiles: cada una abre su propio sub-flujo en vez de aparecer pre-marcada como "Listo" sin acción detrás. Cada sub-flujo termina con un botón que regresa a la pantalla 7. Las pantallas de cámara usan un visor de pantalla completa (fondo oscuro inmersivo) con botón "Volver" y obturador circular; las de confirmación reutilizan el patrón de tarjeta con ícono, título y botones Primary/Secondary ya usado en pantallas como `09 · Retiro personal`.

| # | Pantalla | Nodo | Función | Destino(s) |
|---:|---|---|---|---|
| 7a | DPI — Frente | `126:419` | Visor de cámara con marco guía para el frente del DPI. | Volver → 7 · KYC. Obturador → 7b. |
| 7b | DPI — Reverso | `126:420` | Visor de cámara para el reverso del DPI. | Volver → 7a. Obturador → 7c. |
| 7c | DPI — Confirmación | `126:421` | Revisa las miniaturas de frente y reverso antes de continuar. | Usar estas fotos → 7 · KYC. Tomar de nuevo → 7a. |
| 7d | Selfie — Captura | `126:422` | Visor de cámara con óvalo guía para la verificación facial. | Volver → 7 · KYC. Obturador → 7e. |
| 7e | Selfie — Confirmación | `126:423` | Revisa la selfie capturada. | Usar esta foto → 7 · KYC. Tomar de nuevo → 7d. |
| 7f | Contacto y contraseña | `126:424` | Formulario con teléfono, correo, contraseña y confirmación de contraseña. | Guardar y continuar → 7 · KYC. |
| 7g | Comprobante — Captura | `126:425` | Visor de cámara con marco guía para la factura de luz o agua; incluye alternativa "Subir desde galería". | Volver → 7 · KYC. Obturador → 7h. |
| 7h | Comprobante — Confirmación | `126:426` | Revisa la miniatura del comprobante capturado. | Usar este comprobante → 7 · KYC. Tomar de nuevo → 7g. |

Las pantallas usan el prefijo `07a`–`07h` en vez de correrse dentro de la numeración `01`–`31` para no forzar una renumeración de todo el archivo por un cambio local a un solo paso del onboarding.

## Consistencia de Bottom Navigation

Las 10 pantallas que muestran la barra inferior — `08 · Plan personal`, `10 · Tu ritmo`, `11 · Copiloto`, `12 · Oportunidades`, `13 · Inicio`, `18 · Historial del reto`, `19 · Plan del reto`, `27 · Fondo familiar (aportes)`, `28 · Solicitudes del fondo` y `29 · Historial de aportaciones` — comparten:

- La misma caja: `x:20, y:745, 335 × 46 px`.
- Los mismos cinco destinos (Inicio, Metas, Copiloto, Ritmo, Menú) con sus hotspots de navegación centrados sobre el ícono real de cada uno.
- La misma insignia circular NOVU del centro (mismo asset de imagen, mismo trazo blanco de 3 px y la misma sombra) en las 10 pantallas.

Detalle de la causa y la corrección original en `plan/figma-progress.md` y `errors/figma-lessons.md`.

## Componentes del sistema

- Button: 6 variantes; gradiente Primary y borde Secondary migrados a la paleta v3, cascada automática a todas las instancias del componente.
- Badge: 8 variantes.
- Progress: 4 niveles con monto editable.
- Goal Card: 6 variantes para personal, grupo y familia.
- Bottom Navigation: 5 estados activos; posición, tamaño e insignia central verificados idénticos en las 10 pantallas que la usan.
- Process Header: 4 variantes (3/6–6/6); componente conservado en el archivo pero sin instancias activas en la réplica — `02`–`07` usan ahora el mismo header propio (flecha, wordmark, titular, subtítulo) acorde a la referencia v3, y `02`–`06` además muestran una fila de píldoras + "Paso X de 5".
- Personal Goal Hero: porcentaje, nombre, saldo y fecha editables; anillo, barra e icono vectoriales, gradiente v3.
- Group Challenge Hero: progreso y detalle editables; gradiente v3.
- Group Member Progress Table: aportes, avance y puntos de cada integrante representados por capas editables.
- Input Field (Simple Design System, reutilizado): usado en `07f · Contacto y contraseña`.
- Iconografía: familia vectorial consistente de Simple Design System en tamaños 16, 20 y 24 px.

Los componentes se reutilizan solo cuando caben en la composición original. No se fuerza una sustitución si cambia el orden, el tamaño útil o la lógica testeada.

## Iconografía funcional

- Navegación: Home, Target, Message circle, Trending up y Menu. El logo central NOVU se conserva en las barras de la réplica.
- Metas (`02 · Elegí tu meta`): Navigation, Book open, Briefcase, Home, Shield y Plus — reutilizados de la réplica original, sin reimportar.
- Motivación/situación financiera/horizonte (`03`–`05`): Briefcase, Target, Users, Clock, Trending up, More horizontal, Flag, Calendar, Star, Help circle.
- Copiloto: Message circle identifica las intervenciones de NOVU; el logo N reemplaza al mascot ilustrado de la referencia como insignia de "Tu coach NOVU" en `06 · Plan generado`.
- Progreso: Clock, Dollar sign y Award reemplazan los indicadores vacíos de racha, ahorro y nivel.
- Grupos y familia: User, File text, Check circle y Dollar sign identifican integrantes, solicitudes, liberación de dinero y aportes.
- Verificación (KYC): Credit card identifica el DPI, User la selfie, Lock el paso de contraseña y File text el comprobante de domicilio.
- Los contenedores de fondo originales permanecen para conservar jerarquía, contraste y composición; el vector se inserta centrado dentro de ellos.
- No se usan íconos ilustrados/a color mezclados con la familia de línea, aunque la referencia v3 los incluya en algunas tarjetas — se estandarizó en una sola familia por consistencia (ver `style/novu-style-guide.md`).

## Reglas UX aplicadas

- La pantalla comunica su función mediante jerarquía, controles y estados; no mediante texto que explique la propia pantalla.
- Se conservan aclaraciones únicamente cuando previenen una decisión financiera equivocada.
- Color nunca es el único indicador de estado.
- `02`–`07` comparten el mismo header (fondo claro, flecha, wordmark, titular y subtítulo centrados); el avance de `02`–`06` además se comunica con una fila de píldoras y texto ("Paso X de 5") — `07` es la pantalla de verificación, no un sexto paso de esa misma secuencia, así que no lleva fracción numerada.
- Los CTAs principales usan el gradiente v3 y un alto de 52 px (mínimo táctil 48 px).
- Las zonas táctiles de navegación, iconos y acciones compactas miden al menos 48 px sin alterar la composición visible.
- Las cuatro pantallas de captura de cámara del sub-flujo KYC (DPI × 2, selfie, comprobante) y las dos pantallas de entrada (`01 · Portada`, `01a · Inicio de sesión`) usan fondo oscuro de borde a borde — las únicas desviaciones intencionales del lienzo claro, replicando cómo se ven un visor de cámara real y la referencia de entrada v3 respectivamente.

# Bitácora de implementación en Figma

Archivo: [NOVU](https://www.figma.com/design/vFm8Z8NqINCaW8YDb23hz5/NOVU?node-id=0-1)

File key: `vFm8Z8NqINCaW8YDb23hz5`

Última actualización: 2026-08-15

## COMPLETADO — Migración a la paleta v3.0.0 (`segundoprototipo`)

Migración completa a partir de `referencias/segundoprototipo/` (ver `style/novu-tokens.yaml` v3.0.0 y `style/novu-style-guide.md` para la especificación). Resumen de lo hecho, en orden:

- [x] Extracción de paleta, tipografía y patrones de componente → `style/novu-tokens.yaml` + `style/novu-style-guide.md` v3.0.0.
- [x] Variables primitivas de color actualizadas en Figma (`NOVU · Presentación · Primitives`, `VariableCollectionId:30:88`) — cascada automática a todo lo que ya estaba correctamente ligado a variable.
- [x] Gradiente del componente `Button` (`36:2` Primary/Default, `36:6` Primary/Pressed) actualizado al nuevo gradiente de 3 paradas; borde y texto de `Button/Secondary` (`36:14`, `36:18`, `36:22`) corregidos en una segunda pasada — cascada automática a las 36+ instancias.
- [x] `01 · Portada` (antes `01 · Bienvenida`, mismo nodo `63:432`) reconstruida 1:1 desde `portada.jpeg`: tema oscuro, logo N flotante (reutiliza el asset raster ya canónico del badge de Bottom Nav, sin el fondo blanco circular), grilla 2×2 de tarjetas de feature, botones reposicionados.
- [x] `01a · Inicio de sesión` (nueva, `210:440`) construida 1:1 desde `iniciosesion/`: formulario, biometría (Huella/Face ID — sin ícono de huella dactilar disponible en la librería conectada, se usó Lock como aproximación), enlaces, insignia G&T.
- [x] Navegación Portada ⇄ Login conectada: "Ya tengo cuenta" va a Login (antes iba directo a Plan personal); "Ingresar" preserva el destino original (Plan personal); "Creala" salta a `02 · Elegí tu meta`.
- [x] `02 · Elegí tu meta`–`06 · Plan generado` reemplazadas por completo con `flujometa/1-5.jpeg` (secuencia "Paso X de 5"). `flujometa/6-7.jpeg` (segunda secuencia "Paso X de 4", incompleta) se usó como referencia de patrón de formulario, no como pantallas insertadas. `06` no tiene imagen fuente de "plan generado" con montos — se diseñó como transición al coach ("¡Genial, ya casi estamos listos!"), CTA hacia `07 · KYC`. Progreso propio (fila de píldoras + texto) reemplaza a `Process Header` en estas 5 pantallas; `Process Header` sigue en uso solo en `07 · KYC`.
- [x] Navegación interna `02→03→04→05→06→07` recableada de cero (los `remove()` de contenido viejo también borraron sus reacciones): back de cada pantalla a la anterior, Continuar a la siguiente, `06` con dos salidas ("Ver mi plan" y "Omitir por ahora") ambas a `07 · KYC`.
- [x] Restyle masivo de `07`–`31` + `07a`–`07h` (33 pantallas, construidas antes de que existiera la paleta v3): barrido de 1.464 nodos, remapeo tolerante (±0.01 por canal) de cada hex 2.0.0 a su equivalente v3 en fills, strokes y paradas de gradiente. Primera pasada: 488 fills + 110 strokes. Segunda pasada (gradientes de 4 paradas que la primera no tocó, más el borde de `Button/Secondary`): 6 fills + 1 stroke + 3 nodos de Secondary. Verificación final: 0 coincidencias de paleta vieja en las 40 pantallas.
- [x] Verificación estructural final: 40 pantallas, 141 reacciones, 0 destinos rotos.
- [x] `docs/functional-prototype.md`, `plan/implementation-plan.md` y `README.md` actualizados con el resultado final.

**Nota de alcance**: la migración es de color/tipografía/tratamiento visual sobre la estructura y navegación ya probadas — no se tocó la arquitectura de información de `07` en adelante, solo su paleta. El contenido de `02`–`06` sí cambió por instrucción explícita (reemplazo completo con `flujometa`).

## Foundations completados

Colecciones de variables:

- `NOVU · Presentación · Primitives` — `VariableCollectionId:30:88`
- `NOVU · Presentación · Color` — `VariableCollectionId:30:89`
- `NOVU · Size` — `VariableCollectionId:30:90`

Se crearon 55 variables locales, 8 estilos tipográficos Poppins, 2 estilos de efectos y 2 estilos de gradiente. La paleta usa exclusivamente los colores extraídos de la presentación; se eliminaron los nombres y valores G&T del sistema visual.

Páginas y nodos principales:

- `00 · Cover` — página `31:88`, raíz `32:2`
- `01 · Getting Started` — página `31:89`, raíz `32:90`
- `02 · Foundations` — página `31:90`, raíz `32:112`
- `03 · ——— COMPONENTS ———` — página `31:91`, raíz `32:223`
- `04 · Components` — página `31:92`, raíz `32:226`
- `05 · ——— UTILITIES ———` — página `31:93`, raíz `32:230`
- `06 · Utilities` — página `31:94`, raíz `32:233`

## Componentes completados

### Button

- Página `35:2`
- Documentación `35:3`
- Icono privado `35:10`
- Component set `36:26`
- 6 variantes: Style Primary/Secondary × State Default/Pressed/Disabled
- Propiedades: Label, Show icon, Icon swap
- Validación estructural y visual: aprobada

### Badge

- Página `39:2`
- Documentación `39:3`
- Component set `39:24`
- 8 variantes: Tone Brand/Success/Warning/Danger × Style Soft/Solid
- Propiedad: Label
- Validación estructural y visual: aprobada

### Progress

- Página `40:2`
- Documentación `40:3`
- Component set `40:32`
- 4 variantes: 25%, 50%, 75%, 100%
- Propiedades: Label, Amount
- Validación estructural y visual: aprobada

### Goal Card

- Página `41:2`
- Documentación `41:3`
- Component set `41:139`
- 6 variantes: Type Personal/Group/Family × State Active/Completed
- Propiedades: Title, Subtitle
- Compuesto con instancias de Badge y Progress
- Validación estructural y visual: aprobada

### Bottom Navigation

- Página `42:2`
- Documentación `42:3`
- Component set `42:163`
- 5 variantes: Active Home/Goals/Coach/Rhythm/Profile
- Cinco iconos SVG con etiqueta visible
- 25 instancias vectoriales reales en el componente maestro: 5 destinos × 5 estados
- Estados activos ligados a `color/icon/brand`; estados inactivos ligados a `color/icon/default`
- Validación estructural y visual: aprobada

### Process Header

- Página `94:2`
- Documentación `94:76`
- Component set `94:75`
- 4 variantes: Step 3 of 6, 4 of 6, 5 of 6 y 6 of 6
- Barra segmentada de seis fases; el paso también se expresa como texto
- Gradiente oficial NOVU, Poppins y geometría del header de Verificación/KYC
- Instancias aplicadas en Chat `96:246`, Ingresos `96:264`, Plan generado `96:282` y KYC `96:300`
- Validación estructural y visual: aprobada

### Personal Goal Hero

- Página `99:2`
- Documentación `99:19`
- Componente `99:3`
- Propiedades editables: Progress, Goal, Remaining y Estimate
- Anillo de avance, barra, divisor e icono de motocicleta reconstruidos como vectores editables
- Instancia en Plan personal `99:341`; reemplaza el bitmap `63:723`
- Validación estructural y visual: aprobada

### Group Plan Components

- Página `103:2`
- Documentación `103:3`
- `Group Challenge Hero` `103:11`: progreso y detalle editables, anillo y bandera vectoriales.
- `Group Member Progress Table` `104:2`: cuatro filas editables con monto, barra, porcentaje y puntos.
- Instancias en Plan (Reto Grupal): hero `105:329` y tabla `105:342`.
- Los iconos Retirar, Historial y las marcas NOVU de esa pantalla fueron sustituidos por SVG editables.
- Validación estructural y visual: aprobada.

## Exploración V2 anterior

Página `07 · NOVU V2 Screens`: `43:2`.

Pantallas principales:

- Inicio `43:6`
- Modalidades `43:40`
- Meta personal `43:104`
- Reto grupal `43:168`
- Fondo familiar `43:232`
- Copiloto `43:296`
- Ritmo `43:360`
- Menú `56:308`

Onboarding conservado del flujo original:

- Bienvenida `50:268` — punto de inicio `Flow 1`
- Elegir meta `50:271`
- Detalle de meta `50:274`
- Configurar con NOVU `50:277`
- Ingresos `50:280`
- Plan generado `50:283`
- Registro y verificación `50:286`

Acciones:

- Aporte grupal `55:284`
- Votación familiar `55:308`
- Aporte personal `56:287`

Validación final:

- 18 frames V2.
- 74 reacciones.
- 0 enlaces rotos.
- `Legacy · Prototipo original` conservado en la página `0:1`.

## Réplica del flujo original con estilo de la presentación

Página `08 · NOVU · Flujo original + Presentación`: `63:431`.

- Punto de inicio principal: `01 · Bienvenida` (`63:432`, `Flow 1`).
- 31 frames replicados pantalla por pantalla.
- 99 capas interactivas, 101 reacciones y 101 acciones.
- 0 destinos rotos; las 101 acciones apuntan a frames de la nueva página.
- 29 instancias de Button y una instancia de Badge reutilizadas.
- 67 zonas táctiles ampliadas a 48 px mediante hotspots invisibles.
- Poppins Bold, Medium y Regular en toda la réplica.
- 0 emojis funcionales y 0 nombres de token G&T.
- Foundations sincronizados con índigo `#22229F`, azul `#134294`, violeta `#5D3E9F`, magenta `#B43461` y coral `#D51A30`.
- Captura completa revisada sin pantallas faltantes ni contenido estructural roto.

### Iconografía aplicada al flujo

- Fuente: componentes vectoriales de la biblioteca conectada Simple Design System.
- Tamaños usados: 16 px en tarjetas y avatares compactos, 20 px en navegación y acciones, 24 px en solicitudes y avatares destacados.
- 99 instancias en la réplica: 40 iconos en 10 barras inferiores y 59 iconos semánticos en metas, chats, métricas, integrantes, aportes, retiros y votaciones.
- 25 instancias en el component set `Bottom Navigation` (`42:163`).
- 101 acciones preservadas, 30 destinos internos únicos, 0 destinos rotos y 0 controles interactivos menores de 48 × 48 px.
- Auditoría final: solo quedan sin instancia añadida los checkboxes KYC, botones con flecha existente y vectores originales ya visibles.

### Progreso del onboarding y tarjeta personal editable

- `04 · Chat con el copiloto`, `05 · Ingresos`, `06 · Plan generado` y `07 · Verificación (KYC)` comparten el component set `Process Header`.
- Las variantes muestran 3/6, 4/6, 5/6 y 6/6 mediante texto y seis segmentos; el color no es el único indicador.
- El área conversacional de Chat conserva su contenido completo mediante scroll vertical dentro de un viewport recortado.
- Los CTA y destinos del recorrido original no cambiaron.
- En `08 · Plan (Personal)`, la antigua captura raster fue sustituida por `Personal Goal Hero`, con datos y proporciones editables.
- Auditoría posterior: 31 pantallas, 101 reacciones, 30 destinos únicos y 0 destinos rotos.

### Plan de reto grupal editable

- `08 · Plan (Reto Grupal)` (`63:1101`) ya no contiene capas raster.
- El resumen de 58 %, la tabla de Carlos, Ana, María y Diego, y los iconos de acción se reconstruyeron como capas editables.
- Se preservan los 11 destinos de la pantalla: Aportar, Retirar, Historial y navegación inferior.
- Auditoría final de la pantalla: 0 `IMAGE` fills, 0 destinos rotos y Poppins en todos los textos.

### Renombrado de las 31 pantallas

- La página `08 · NOVU · Flujo original + Presentación` (`63:431`) tenía nombres de frame duplicados: `10 · Candado (Votar solicitud)` en 4 pantallas y `08 · Plan (Fondo Grupal - Aportes)` en 3 pantallas, además de numeración inconsistente (`012`, `013`, `014`).
- Las 31 pantallas se renombraron a un esquema único `01`–`31` alineado con el orden y los nombres de `docs/functional-prototype.md`. Ningún destino, reacción ni contenido visual cambió; solo la propiedad `name` de cada frame.

### Pantallas 18, 27 y 29: reemplazo de imágenes raster por capas editables

- **`29 · Historial de aportaciones`** (`63:1471`, Fondo Familiar): la lista de movimientos y el ícono "Total/Promedio" eran un único fill `IMAGE`. Se reconstruyeron como 3 encabezados de fecha, 5 tarjetas de transacción (avatar con inicial, nombre, etiqueta "Aporte", monto y hora) y un glifo vectorial de personas, conservando los montos y horarios originales.
- **`18 · Historial del reto`** (`63:1063`): tenía el mismo fill `IMAGE` clonado de la pantalla 29, incluido el copy — el título decía "Fondo Familia Perez" y listaba integrantes del fondo familiar en vez del reto grupal (arrastre del bug de clonado descrito en `errors/figma-lessons.md`). Se corrigió el título a "Reto de Julio" y el subtítulo a "Historial del Reto", y se reconstruyó la lista con los integrantes reales del reto (Carlos, Ana, María, Tú/Diego), tomados de `Group Member Progress Table` en `19 · Plan del reto` (`105:342`). Los montos (`Q1,450` total, `Q362.50` promedio) ya cuadraban con la suma de las filas y se conservaron.
- **`27 · Fondo familiar (aportes)`** (`63:1368`): dos fills `IMAGE` — el bloque de estadísticas (`Aportado este mes` / `Mi aporte total`) y la lista `Miembros del Fondo`. Se reconstruyeron con tarjetas editables (una con sparkline vectorial, otra con anillo de progreso `arcData` al 35 %, mismo patrón que `Personal Goal Hero`) y 4 filas de integrante con avatar, badge "Líder del fondo", monto y barra de progreso, siguiendo el patrón de `Group Member Progress Table`.
- Las tres pantallas quedan en 0 fills `IMAGE`, con Poppins y los colores de `NOVU · Presentación · Color` en todas las capas nuevas.

## Sub-flujos de Verificación (KYC)

`07 · Verificación (KYC)` (`63:618`) mostraba cuatro filas — DPI, cámara, contacto/contraseña, comprobante — ya marcadas "Listo" sin ninguna pantalla detrás. Se agregaron 8 pantallas nuevas (375 × 812 px) para que cada fila abra un sub-flujo real, y se conectaron las 4 filas de la tarjeta (`63:632`, `63:639`, `63:646`, `63:652`) con reacciones `ON_CLICK` hacia el primer paso de cada uno. Ningún nodo de la pantalla 7 cambió de apariencia.

Íconos: se importaron `Credit card` y `Camera` (nuevos en el archivo) desde Simple Design System; `Lock`, `User` y `File text` ya existían localmente de sesiones previas y se reutilizaron sin duplicar. `figma.importComponentSetByKeyAsync` deduplica por key — al importar `User`/`File text` de nuevo devolvió los component sets locales existentes en vez de crear copias.

Pantallas nuevas, en una fila propia de la página (`x: 0–3017`, `y: 3648`) para no interferir con la cuadrícula de las 31 pantallas originales:

- `07a · DPI — Frente` (`126:419`) y `07b · DPI — Reverso` (`126:420`): visor de cámara de pantalla completa (fondo `#1C1729`, el mismo tono que el scrim de las hojas inferiores existentes), marco guía punteado tipo tarjeta, obturador circular de 76 px.
- `07c · DPI — Confirmación` (`126:421`): tarjeta blanca con dos miniaturas (Frente/Reverso) lado a lado, cada una con el ícono Credit card.
- `07d · Selfie — Captura` (`126:422`): mismo visor, guía ovalada.
- `07e · Selfie — Confirmación` (`126:423`): tarjeta con una miniatura centrada (ícono User).
- `07f · Contacto y contraseña` (`126:424`): tarjeta con 4 instancias de `Input Field` (Teléfono, Correo electrónico, Contraseña, Confirmar contraseña — estas dos últimas con el valor enmascarado como `••••••••`, ya que el componente no tiene variante de contraseña) y un botón Primary.
- `07g · Comprobante — Captura` (`126:425`): visor con guía rectangular vertical y enlace secundario "Subir desde galería".
- `07h · Comprobante — Confirmación` (`126:426`): tarjeta con una miniatura ancha (ícono File text).

Las pantallas de confirmación y el formulario reutilizan el patrón de tarjeta de `09 · Retiro personal` / `20 · Aportar al reto`: fondo `#1C1729` de borde a borde, tarjeta blanca de radio 24 con sombra (`DROP_SHADOW`, radio 16, offset y4), Auto Layout vertical, insignia de ícono 28×28 (fondo `#DED9EE`, ícono 20×20) y botones Primary/Secondary de 48 px.

Navegación completa del sub-flujo: fila → captura 1 → captura 2 (solo DPI) → confirmación → `Usar foto(s)`/`Guardar y continuar` regresa a `07 · Verificación (KYC)`; `Tomar de nuevo` regresa a la primera captura del mismo sub-flujo; `Volver` en cada visor regresa al paso anterior o a la pantalla 7.

Corrección aplicada durante la construcción: los botones "Volver" de las 4 pantallas de cámara medían 32×32 px (mismo tamaño que la flecha "←" ya usada en el header con gradiente de la pantalla 02). Se añadió un hotspot invisible de 48×48 px centrado sobre cada uno, siguiendo la misma solución que `errors/figma-lessons.md` documenta para los 67 controles del flujo original.

Validación final del sub-flujo:

- 39 pantallas totales en la página (31 + 8), 130 capas interactivas, 132 reacciones, 0 destinos rotos, 38 destinos únicos.
- 71 controles por debajo del tamaño visible cuentan con hotspot ≥ 48 × 48 px (67 + 4 nuevos).
- 0 fills `IMAGE`; toda la construcción usa Auto Layout, variables de color existentes o los mismos valores sólidos ya usados en insignias de ícono comparables, y Poppins en el 100% de los textos nuevos.
- Capturas de las 8 pantallas revisadas una por una; se corrigió en el camino un título de dos líneas que se solapaba con el subtítulo en `07g` (`"Foto de tu factura de luz o agua"` → `"Foto de tu comprobante"`) y un label "NOVU" del status bar que se recortaba a "NOV" en las 4 pantallas de cámara.

## Consistencia de Bottom Nav en las 10 pantallas que la usan

Auditoría solicitada: revisar cada pantalla con barra de navegación inferior y asegurar que todas la tengan en la misma posición.

Pantallas con `Bottom Nav`: `08 · Plan personal`, `10 · Tu ritmo`, `11 · Copiloto`, `12 · Oportunidades`, `13 · Inicio`, `18 · Historial del reto`, `19 · Plan del reto`, `27 · Fondo familiar (aportes)`, `28 · Solicitudes del fondo`, `29 · Historial de aportaciones`.

Antes de corregir, la barra vivía en tres tamaños/posiciones distintos (`x:20` siempre igual, pero `y` entre 562 y 759, alto 46 o 49 px) y, más importante, los hotspots invisibles de navegación (los que realmente llevan la reacción `ON_CLICK`, no los íconos visibles) estaban en tres screens apilados verticalmente muy por debajo del frame de 812 px (hasta `y:1016`), fuera del viewport — es decir, esos 4–5 destinos de navegación existían pero no eran alcanzables. Una cuarta pantalla (`19 · Plan del reto`) tenía los 5 ítems visibles comprimidos a la izquierda y el logo NOVU circular desplazado al extremo derecho, en vez de centrado.

Causa raíz: `11 · Copiloto`, `12 · Oportunidades` y `13 · Inicio` usan Auto Layout vertical en el frame de pantalla; `Bottom Nav` y sus hotspots quedaron como hijos `layoutPositioning = AUTO`, así que su posición la decidía el alto del contenido de cada pantalla en vez de un ancla fija — por eso Copiloto (poco contenido) dejaba ~200 px muertos debajo de la barra. En `19 · Plan del reto`, `Bottom Nav` es Auto Layout horizontal (`SPACE_BETWEEN`) y eran sus 5 ítems + el logo los que tenían `layoutPositioning = AUTO`. Ver la lección nueva en `errors/figma-lessons.md` sobre por qué estas escrituras de posición fallan sin lanzar error.

Corrección aplicada:

- `Bottom Nav` normalizado a `x:20, y:745, width:335, height:46` en las 10 pantallas (antes: 3 con alto 49 px y offsets internos de ítem distintos).
- En Copiloto, Oportunidades e Inicio: `Bottom Nav` y sus hotspots pasaron a `layoutPositioning = ABSOLUTE` para anclarse al fondo sin importar el contenido de la pantalla.
- En Plan del reto: los 5 ítems y el logo NOVU pasaron a `ABSOLUTE` y se reposicionaron a los mismos `x` que usan las otras 9 pantallas (`0, 74.75, 153.5, 230.25, 307`); el logo volvió al centro (`146.5, -16`, mismo lugar que el círculo NOVU de las demás).
- Los hotspots de navegación de las 10 pantallas quedaron centrados sobre su ícono real (`slotCenter - 24`) a `y:749`, calculado por pantalla a partir de la posición live de sus propios ítems — no un valor fijo copiado a ciegas.
- Dos duplicados preexistentes (un hotspot de más apuntando a un destino ya cubierto por otro, en Copiloto y en Tu Ritmo) se dejaron con el mismo destino y la misma posición que su gemelo en vez de borrarlos o inventarles un destino nuevo.
- Dos hotspots ajenos a la barra (acciones de contenido en `19` y `27`, hacia `Aportar al reto`/`Aportar al fondo`) no se tocaron.

Validación final: 10/10 pantallas con `Bottom Nav` en la posición canónica, separación entre el primer y último ícono consistente (306.5–307.5 px, la variación residual es el ancho natural del texto de cada etiqueta), 0 destinos rotos.

**Corrección posterior — la insignia NOVU de `19 · Plan del reto` no era el mismo asset.** La revisión de posición dejó pasar que el círculo central de esa pantalla (`Logo / NOVU`, `105:859`) no era el nodo `Rectangle` con imagen que usan las otras 9 pantallas, sino un frame con 3 `VECTOR` reconstruidos a mano durante el trabajo de `Group Plan Components` (ver "Plan de reto grupal editable" arriba) — visualmente parecido pero con proporciones distintas del trazo de la "N". Se clonó el `Rectangle` de referencia (mismo `imageHash` `65db507d5aa7309f7ecb0af8079e11e7e79af0dc`, mismo trazo blanco de 3 px y sombra) a la posición `147, -16` dentro de `Bottom Nav` y se eliminó el frame vectorial. Las 10 pantallas quedaron con exactamente el mismo `imageHash` en la insignia central, verificado nodo por nodo.

## Estado recuperable

El ledger técnico temporal de la sesión está en `/tmp/design-system-state-novu-20260814.json`. La especificación funcional completa está en `docs/functional-prototype.md`.

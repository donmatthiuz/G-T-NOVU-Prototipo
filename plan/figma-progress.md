# Bitácora de implementación en Figma

Archivo: [NOVU](https://www.figma.com/design/vFm8Z8NqINCaW8YDb23hz5/NOVU?node-id=0-1)

File key: `vFm8Z8NqINCaW8YDb23hz5`

Última actualización: 2026-08-15

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

## Estado recuperable

El ledger técnico temporal de la sesión está en `/tmp/design-system-state-novu-20260814.json`. La especificación funcional completa está en `docs/functional-prototype.md`.

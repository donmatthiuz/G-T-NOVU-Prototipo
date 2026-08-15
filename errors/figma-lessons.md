# Errores y aprendizajes de Figma

## Consulta de propiedades en variantes

**Error:** `Can only get component property definitions of a component set or non-variant component`.

**Causa:** se intentó consultar `componentPropertyDefinitions` en cada hijo variante de Button.

**Solución:** consultar las definiciones únicamente en el `ComponentSetNode`; en cada variante validar `componentPropertyReferences` de textos e instancias.

**Resultado:** Button quedó validado con 6 variantes, propiedades compartidas y bindings correctos.

## Búsqueda de librerías

`search_design_system` no devolvió componentes compatibles para las búsquedas específicas de Button, Badge, Progress, Goal Card y navegación. Se decidió crear componentes locales NOVU porque las referencias remotas no compartían marca, tokens ni requisitos móviles.

## Reglas operativas verificadas

- Cambiar de página con `await figma.setCurrentPageAsync(page)`.
- Cargar cada fuente antes de mutar texto.
- Combinar variantes solo con `ComponentNode`.
- Reubicar manualmente los hijos después de `combineAsVariants`.
- Vincular fills, strokes, radios, padding y touch target a variables.
- Añadir propiedades a las variantes antes de combinarlas.
- Validar cada componente con metadata y captura de pantalla.
- No usar emojis como iconos funcionales; usar SVG o componentes de icono.

## Alineación de Auto Layout

**Error:** `Invalid enum value ... received 'END'` en `counterAxisAlignItems`.

**Causa:** Figma acepta `MIN`, `MAX`, `CENTER` o `BASELINE`, no `END`.

**Solución:** reemplazar `END` por `MAX`. La operación era atómica y no dejó nodos parciales.

## Fuente no cargada

**Error:** `Cannot use unloaded font "Montserrat Semi Bold"`.

**Causa:** un campo de monto seleccionó Montserrat con peso Semi Bold sin cargar esa combinación.

**Solución:** usar Montserrat Bold, ya presente en el sistema, y mantener Inter Semi Bold para controles.

## Navegación al mismo frame

**Error:** Figma rechazó una reacción `NAVIGATE` cuyo destino era el mismo frame de origen.

**Causa:** se intentó enlazar el tab activo de la navegación inferior consigo mismo.

**Solución:** el tab activo queda intencionalmente sin reacción; los otros cuatro tabs sí navegan. Resultado final: 35 hotspots válidos.

## Clonar frames no conserva interacciones

**Error:** al clonar las 31 pantallas a una página nueva, Figma creó correctamente las capas visuales pero dejó `0` reacciones en los clones.

**Causa:** `SceneNode.clone()` no replica de forma fiable las conexiones de prototipo entre páginas.

**Solución:** recorrer en paralelo cada árbol de origen y clon por índice de hijo, copiar las reacciones con `setReactionsAsync()` y reemplazar cada `destinationId` legado por el frame equivalente de la réplica.

**Resultado:** 99 capas interactivas, 101 reacciones, 101 destinos reescritos y 0 enlaces rotos.

## Punto de inicio del prototipo

**Error:** `PageNode.setFlowStartingPoint` no existe y `prototypeStartNode` es de solo lectura en la API disponible.

**Solución:** no forzar propiedades no soportadas. Después de reconstruir las reacciones, Figma reconoció automáticamente `01 · Bienvenida` como `Flow 1` y la pantalla de votación como `Flow 2`.

## Objetivos táctiles del flujo original

**Problema:** 67 capas interactivas originales medían menos de 48 px en alguno de sus ejes.

**Solución:** trasladar cada reacción a un hotspot invisible de al menos 48 × 48 px, centrado sobre el control original, sin cambiar la composición visible.

## Instancias nuevas dentro de frames con Auto Layout

**Error:** al añadir el header común a las pantallas 04–07, Figma lo colocó al final del contenido aunque se asignó `y = 0`.

**Causa:** las pantallas usan Auto Layout vertical; una instancia con `layoutPositioning = AUTO` ignora la coordenada libre y participa en el orden normal.

**Solución:** usar `layoutPositioning = ABSOLUTE` para el header, fijarlo en `x = 0`, `y = 0` e insertar un spacer de layout de 166 px antes del contenido. Así se conserva el header de borde a borde y el contenido empieza a 206 px.

## Asignar x/y a un hijo `AUTO` de Auto Layout falla en silencio (sin error)

**Error:** al normalizar la posición de `Bottom Nav` en `11 · Copiloto`, `12 · Oportunidades` y `13 · Inicio`, `node.y = 745` no lanzó ningún error, pero al releer `node.y` inmediatamente después seguía mostrando el valor viejo (562, 690, 759). Lo mismo pasó con los 5 ítems internos de `Bottom Nav` en `19 · Plan del reto` y con los hotspots de navegación de esas mismas pantallas.

**Causa:** a diferencia del caso anterior (que sí lanza error si el nodo no es hijo de Auto Layout), asignar `x`/`y` a un nodo con `layoutPositioning = AUTO` dentro de un padre con `layoutMode !== NONE` **no lanza excepción** — la escritura simplemente no tiene efecto, porque el Auto Layout sigue calculando la posición. Es fácil confundir esto con que el script "no hizo nada" en vez de identificar que el valor fue ignorado.

**Solución:** antes de asignar `x`/`y` a cualquier nodo, comprobar `node.parent.layoutMode`. Si no es `'NONE'`, asignar primero `node.layoutPositioning = 'ABSOLUTE'` (esto sí puede lanzar `Can only set layoutPositioning = ABSOLUTE if the parent node has layoutMode !== NONE`, así que conviene envolverlo en la misma comprobación, no en un try/catch ciego) y solo entonces fijar `x`/`y`. Tras cada escritura de posición, releer el valor en el mismo script para confirmar que se guardó — no asumir éxito solo porque no hubo excepción.

**Resultado:** las 10 pantallas con `Bottom Nav` quedaron con la barra en `x:20, y:745, 335×46` y sus hotspots alineados a cada ícono, con 0 destinos rotos.

## Opacidad en pinturas vinculadas a variables

**Problema:** la opacidad declarada dentro de una pintura blanca se perdió visualmente al vincular su color a `color/text/inverse`.

**Solución:** mantener el color vinculado a la variable y aplicar la transparencia mediante `SceneNode.opacity`. Esto se usa en el halo del paso y en los segmentos pendientes del Process Header.

## Componentes recién importados no se resuelven por ID en una llamada posterior

**Error:** `TypeError: cannot set property 'x' of null` y luego `TypeError: cannot read property 'createInstance' of null`.

**Causa:** se importaron dos component sets nuevos de Simple Design System (`Credit card`, `Camera`) con `figma.importComponentSetByKeyAsync` en una llamada de `use_figma`. En la siguiente llamada, `figma.getNodeByIdAsync(id)` con los IDs devueltos por esa importación resolvió a `null` — a diferencia de component sets que ya existían en el archivo de sesiones previas (`User`, `File text`), que sí se resolvieron sin problema. Los nodos recién creados por una importación de librería no parecen quedar consultables por ID de forma fiable en una ejecución de `use_figma` distinta a la que los creó.

**Solución:** volver a llamar `figma.importComponentSetByKeyAsync(key)` con la misma key al inicio de cada script que necesite instanciar ese ícono, y usar la referencia en memoria devuelta (no un ID guardado de una llamada previa). La API deduplica por key: si el component set ya existe en el archivo, la llamada devuelve el nodo local existente en vez de crear un duplicado, así que reimportar es seguro y barato incluso cuando ya está presente.

**Resultado:** `Credit card` y `Camera` quedaron disponibles para los sub-flujos de Verificación (KYC) sin nodos huérfanos ni duplicados.

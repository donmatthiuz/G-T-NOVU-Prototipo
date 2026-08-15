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

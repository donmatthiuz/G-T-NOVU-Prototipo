# NOVU — prototipo y sistema visual

NOVU es un copiloto de ahorro para jóvenes guatemaltecos, respaldado por G&T Continental. El producto convierte metas personales, retos grupales y fondos familiares en acciones claras, visibles y alcanzables.

## Entregable principal

- [Prototipo funcional: flujo original + estilo de la presentación](https://www.figma.com/design/vFm8Z8NqINCaW8YDb23hz5/NOVU?node-id=63-432)
- Página de trabajo: `08 · NOVU · Flujo original + Presentación` (`63:431`).
- El prototipo original se conserva sin cambios en `Legacy · Prototipo original`.
- `07 · NOVU V2 Screens` permanece como exploración anterior, no como entregable principal.

## Documentación local

- [`style/novu-style-guide.md`](style/novu-style-guide.md): principios, identidad y reglas de interfaz.
- [`style/novu-tokens.yaml`](style/novu-tokens.yaml): colores, tipografía, espaciado y radios.
- [`plan/implementation-plan.md`](plan/implementation-plan.md): alcance y fases de implementación.
- [`plan/figma-progress.md`](plan/figma-progress.md): bitácora recuperable de lo construido en Figma.
- [`errors/figma-lessons.md`](errors/figma-lessons.md): errores encontrados y soluciones.
- [`docs/functional-prototype.md`](docs/functional-prototype.md): funcionalidades, acciones y destinos del prototipo navegable.

## Dirección visual

El recorrido, la arquitectura de información y las decisiones de interacción se replican pantalla por pantalla desde el prototipo original testeado. El estilo visual está en su versión **v3.0.0**, extraída de `referencias/segundoprototipo/` (portada, inicio de sesión y flujo de meta de referencia) y documentada en `style/`: Poppins, gradiente índigo → violeta → magenta, tema oscuro en las pantallas de entrada (Portada, Inicio de sesión) y superficies claras en el resto de la app. Supera la v2.0.0 basada en `Reinvención Grupo 3.pdf`, conservada solo como referencia histórica dentro de `style/novu-tokens.yaml`. No se usan colores G&T como parte del sistema visual.

Los componentes nuevos se conservan cuando no cambian el flujo: Button, Badge, Progress, Goal Card, Bottom Navigation, Process Header y Personal Goal Hero — todos migrados a la paleta v3. `01 · Portada` y `01a · Inicio de sesión` (pantalla nueva) replican 1:1 la referencia; `02 · Elegí tu meta` a `06 · Plan generado` se reconstruyeron por completo con el contenido de la referencia; el resto del archivo conserva su arquitectura y solo actualizó su color.

## Estado

Al 15 de agosto de 2026 están terminados y validados los foundations, siete familias de componentes y la réplica funcional en paleta v3: 40 pantallas, 142 reacciones, dos puntos de inicio detectados por Figma, cero destinos rotos y cero placeholders funcionales vacíos. Verificación (KYC) abre un sub-flujo de captura y confirmación propio para cada uno de sus cuatro pasos (DPI, selfie, contacto/contraseña, comprobante); las 10 pantallas con Bottom Navigation comparten la misma posición, tamaño e insignia NOVU central; y no queda ningún color de la paleta 2.0.0 en el archivo — verificado nodo por nodo tras el restyle completo.

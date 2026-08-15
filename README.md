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

El recorrido, la arquitectura de información y las decisiones de interacción se replican pantalla por pantalla desde el prototipo original testeado. El estilo se toma exclusivamente de `referencias/novu_templates/Reinvención Grupo 3.pdf`: Poppins, superficies blancas, índigo, violeta, magenta, coral y el gradiente NOVU. No se usan colores G&T como parte del sistema visual.

Los componentes nuevos se conservan cuando no cambian el flujo: Button, Badge, Progress, Goal Card, Bottom Navigation, Process Header y Personal Goal Hero. En la réplica se insertaron 36 instancias de Button, una de Badge, cuatro headers de proceso, una tarjeta personal editable y 107 iconos vectoriales; los demás componentes siguen disponibles para extensiones compatibles.

## Estado

Al 15 de agosto de 2026 están terminados y validados los foundations, siete familias de componentes y la réplica funcional: 39 pantallas, 132 reacciones, dos puntos de inicio detectados por Figma, cero destinos rotos, 71 zonas táctiles ampliadas a un mínimo de 48 px y cero placeholders funcionales vacíos. Las fases 3–6 comparten un header con progreso, la tarjeta principal de Plan personal ya no depende de un bitmap, Verificación (KYC) abre un sub-flujo de captura y confirmación propio para cada uno de sus cuatro pasos (DPI, selfie, contacto/contraseña, comprobante) en vez de mostrarlos ya marcados como completos, y las 10 pantallas con Bottom Navigation comparten la misma posición, tamaño e insignia NOVU central.

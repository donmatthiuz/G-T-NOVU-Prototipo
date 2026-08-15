# Plan de implementación NOVU

## Objetivo

Replicar pantalla por pantalla el flujo original testeado, conservar su lógica y aplicar la identidad visual de `Reinvención Grupo 3.pdf`, reutilizando los componentes nuevos cuando no cambien el recorrido.

## Alcance funcional

1. Inicio y resumen de progreso.
2. Creación y seguimiento de una meta personal.
3. Selección entre meta personal, reto grupal y fondo familiar.
4. Reto grupal con objetivo compartido y cuentas separadas.
5. Fondo familiar con aportes y decisiones por votación.
6. Copiloto NOVU y recomendaciones accionables.
7. Ritmo de ahorro, oportunidades y próximos pasos.

## Fases

- [x] Descubrimiento del flujo original de 31 pantallas y 101 reacciones.
- [x] Extracción de paleta, tipografía y formas desde la presentación NOVU.
- [x] Variables, estilos y páginas de foundations en Figma.
- [x] Button, Badge, Progress y Goal Card.
- [x] Bottom Navigation.
- [x] Réplica 1:1 de las 31 pantallas originales, incluido registro/KYC.
- [x] Reconexión de las 101 acciones a destinos internos de la réplica.
- [x] Sustitución compatible por componentes reutilizables.
- [x] Eliminación de tokens visuales G&T y migración completa a Poppins.
- [x] Ampliación de 67 objetivos táctiles a 48 px.
- [x] QA final de componentes, pantallas y documentación.

## Criterios de terminación

- Variables semánticas y primitivas documentadas.
- Componentes con Auto Layout, variantes y propiedades editables.
- Flujo y estructura del prototipo original preservados pantalla por pantalla.
- Colores y estilo derivados exclusivamente de la presentación.
- Componentes nuevos usados solo cuando no alteran la composición probada.
- Prototipo original conservado y renombrado como legado.
- Capturas visuales y validación estructural sin solapamientos ni contenido cortado.
- README, guía visual, tokens, plan, progreso y errores guardados en el repositorio.

## Resultado

- 31 pantallas funcionales en la página `63:431`.
- 101 reacciones sin destinos rotos.
- `01 · Bienvenida` (`63:432`) registrado por Figma como `Flow 1`.
- Flujo probado preservado: Bienvenida → Meta → Detalle → NOVU → Ingresos → Plan → Registro → Meta personal.
- Ramas originales preservadas: reto grupal, fondo familiar, aportes, retiros, votación, copiloto, ritmo y oportunidades.

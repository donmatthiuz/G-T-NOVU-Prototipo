# Plan de implementación NOVU

## Objetivo

Replicar pantalla por pantalla el flujo original testeado, conservar su lógica y aplicar la identidad visual definida en `style/` (v3.0.0, extraída de `referencias/segundoprototipo/`; supera la v2.0.0 basada en `Reinvención Grupo 3.pdf`), reutilizando los componentes nuevos cuando no cambien el recorrido.

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
- [x] Sustitución de placeholders por 99 iconos vectoriales en las pantallas y 25 en Bottom Navigation.
- [x] Header común con progreso de seis fases en Chat, Ingresos, Plan generado y KYC.
- [x] Sustitución del bitmap principal de Plan personal por un componente editable.
- [x] Sustitución de todas las imágenes de Plan (Reto Grupal) por componentes y vectores editables.
- [x] Sub-flujos independientes de captura y confirmación para los cuatro pasos de Verificación (KYC): DPI, selfie, contacto/contraseña y comprobante de domicilio.
- [x] Consistencia de Bottom Navigation (posición, hotspots e insignia NOVU) en las 10 pantallas que la usan.
- [x] Migración a la paleta v3.0.0 (`segundoprototipo`): fundamentos, `01 · Portada`, `01a · Inicio de sesión` nueva, `02`–`06` reemplazadas por completo, y restyle del resto del archivo (`07`–`31`, `07a`–`07h`).
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

- 40 pantallas funcionales en la página `63:431` (31 de la réplica principal, con `01`–`06` reconstruidas en paleta v3 + 8 sub-flujos KYC + `01a · Inicio de sesión` nueva).
- 142 reacciones sin destinos rotos.
- Paleta v3.0.0 aplicada al 100% del archivo: 0 fills, strokes o paradas de gradiente de la paleta 2.0.0 sobreviven (verificado nodo por nodo tras dos pasadas de barrido sobre 1.464 nodos).
- Process Header con variantes 3/6–6/6; tras el reemplazo de `02`–`06`, su única instancia en uso queda en `07 · Verificación (KYC)`. `02`–`06` usan un indicador de progreso propio ("Paso X de 5") acorde a la referencia v3.
- Personal Goal Hero editable en Plan personal; el bitmap anterior fue eliminado.
- Plan (Reto Grupal) sin capas raster: resumen, tabla, acciones y marcas NOVU editables.
- Verificación (KYC) sin filas muertas: DPI, selfie, contacto/contraseña y comprobante abren cada uno un sub-flujo de captura y confirmación propio (pantallas `07a`–`07h`) y regresan a la pantalla 7.
- Bottom Navigation idéntica (posición, tamaño, hotspots e insignia NOVU) en las 10 pantallas que la usan.
- `01 · Portada` (`63:432`, antes "Bienvenida") registrada por Figma como `Flow 1`; conecta con `01a · Inicio de sesión`, pantalla nueva.
- Flujo probado preservado con contenido `02`–`06` renovado: Portada → Meta → Motivación → Situación financiera → Horizonte → Coach → Verificación → Plan personal.
- Ramas originales preservadas sin cambio de contenido, solo de paleta: reto grupal, fondo familiar, aportes, retiros, votación, copiloto, ritmo y oportunidades.

# Especificación funcional — flujo original + presentación

Archivo: [NOVU en Figma](https://www.figma.com/design/vFm8Z8NqINCaW8YDb23hz5/NOVU?node-id=63-432)

Página: `08 · NOVU · Flujo original + Presentación` (`63:431`)

Punto de inicio principal: `01 · Bienvenida` (`63:432`, `Flow 1`)

## Resultado validado

- 39 pantallas de 375 × 812 px: las 31 de la réplica principal más 8 pantallas de los sub-flujos de Verificación (KYC).
- 130 capas interactivas, 132 reacciones y 132 acciones.
- 0 destinos externos o rotos: todas las acciones apuntan a pantallas de la página nueva.
- 71 controles pequeños conservan su apariencia pero usan hotspots de al menos 48 × 48 px (67 del flujo original + 4 botones "Volver" de las nuevas pantallas de cámara).
- 107 instancias vectoriales de icono están integradas en las pantallas: 40 en las 10 barras inferiores y 67 en contexto.
- El componente maestro de Bottom Navigation contiene 25 instancias adicionales, distribuidas en sus 5 estados.
- Poppins es la única familia tipográfica de la réplica.
- No quedan emojis como iconos funcionales.
- El registro/KYC forma parte del recorrido principal y ahora abre cuatro sub-flujos independientes con pantallas propias: DPI, selfie, contacto/contraseña y comprobante de domicilio.
- Chat, Ingresos, Plan generado y KYC comparten un header con progreso visible de seis fases.
- La tarjeta principal de Plan personal es un componente editable, no una imagen raster.
- El resumen y la tabla del Plan (Reto Grupal) son componentes editables; sus acciones conservan los destinos testeados.
- Las 31 pantallas de la réplica principal tienen nombres de frame únicos (`01`–`31`); no quedan duplicados como los antiguos `10 · Candado (Votar solicitud)` o `08 · Plan (Fondo Grupal - Aportes)`. Las 8 pantallas de sub-flujos KYC usan el prefijo `07a`–`07h` para dejar explícita su relación con la pantalla 7 sin renumerar el resto.
- Historial del reto, Historial de aportaciones y Fondo familiar (aportes) — pantallas 18, 29 y 27 — no contienen fills `IMAGE`: sus listas, tarjetas de estadística e íconos son capas vectoriales y de texto editables.
- Las 10 pantallas con Bottom Navigation (8, 10, 11, 12, 13, 18, 19, 27, 28, 29) comparten exactamente la misma posición, tamaño e insignia NOVU central; ver [Consistencia de Bottom Navigation](#consistencia-de-bottom-navigation).
- El original permanece intacto en `Legacy · Prototipo original` (`0:1`).

## Secuencia principal testeada

`Bienvenida → Elegí tu meta → Detalle → Chat → Ingresos → Plan generado → Verificación/KYC → Plan personal`

El acceso para una persona con cuenta existente conserva el atajo de Bienvenida a Plan personal.

Dentro del paso Verificación/KYC, cada una de las cuatro filas abre y cierra su propio sub-flujo (ver [Sub-flujos de Verificación (KYC)](#sub-flujos-de-verificación-kyc)) antes de volver a la pantalla 7; la secuencia principal no cambia de destino final.

## Inventario pantalla por pantalla

| # | Pantalla | Nodo | Funcionalidad conservada |
|---:|---|---|---|
| 1 | Bienvenida | `63:432` | Inicia una meta o entra con una cuenta existente. |
| 2 | Elegí tu meta | `63:438` | Selecciona una categoría de meta y continúa. |
| 3 | Detalle de la meta | `63:482` | Define nombre, monto y prioridad. |
| 4 | Chat con el copiloto | `63:513` | Completa la configuración mediante preguntas y respuestas. |
| 5 | Ingresos | `63:555` | Registra ingreso, variabilidad y horizonte. |
| 6 | Plan generado | `63:581` | Revisa el aporte sugerido, plazo y Modo Temporada. |
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

Las cuatro filas de `07 · Verificación (KYC)` (`63:618`) son táctiles: cada una abre su propio sub-flujo en vez de aparecer pre-marcada como "Listo" sin acción detrás. Cada sub-flujo termina con un botón que regresa a la pantalla 7. Las pantallas de cámara usan un visor de pantalla completa (fondo oscuro inmersivo, igual que el scrim de las hojas inferiores) con botón "Volver" y obturador circular; las de confirmación reutilizan el patrón de tarjeta con ícono, título y botones Primary/Secondary ya usado en pantallas como `09 · Retiro personal`.

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
- Los mismos cinco destinos (Inicio, Metas, Copiloto, Ritmo, Menú) con sus hotspots de navegación centrados sobre el ícono real de cada uno, no sobre una posición aproximada.
- La misma insignia circular NOVU del centro (mismo asset de imagen, mismo trazo blanco de 3 px y la misma sombra) en las 10 pantallas.

Antes de esta revisión, tres pantallas (Copiloto, Oportunidades, Inicio) anclaban la barra según la altura de su propio contenido en vez de a una posición fija, dejando hasta 201 px de espacio muerto debajo en la más corta; una cuarta (Plan del reto) tenía los cinco íconos comprimidos y la insignia NOVU descentrada; y esa misma insignia de Plan del reto resultó ser un asset distinto (una reconstrucción vectorial de una sesión anterior) en vez del mismo círculo con imagen que usan las otras nueve. Detalle de la causa y la corrección en `plan/figma-progress.md` y `errors/figma-lessons.md`.

## Componentes del sistema

- Button: 6 variantes; 36 instancias presentes en la réplica (29 del flujo principal + 7 en los sub-flujos KYC: Primary/Secondary en las tres confirmaciones y un Primary en Contacto y contraseña).
- Badge: 8 variantes; una instancia presente en la réplica.
- Progress: 4 niveles con monto editable, disponible para evoluciones sin alterar el flujo.
- Goal Card: 6 variantes para personal, grupo y familia.
- Bottom Navigation: 5 estados activos; posición, tamaño e insignia central verificados idénticos en las 10 pantallas que la usan.
- Process Header: 4 variantes para las fases 3/6, 4/6, 5/6 y 6/6; aplicado en las pantallas 04–07.
- Personal Goal Hero: porcentaje, nombre, saldo y fecha editables; anillo, barra e icono vectoriales.
- Group Challenge Hero: progreso y detalle editables; anillo y bandera vectoriales.
- Group Member Progress Table: aportes, avance y puntos de cada integrante representados por capas editables.
- Input Field (Simple Design System, reutilizado): 4 instancias en `07f · Contacto y contraseña` (Teléfono, Correo electrónico, Contraseña, Confirmar contraseña).
- Iconografía: familia vectorial consistente de Simple Design System en tamaños 16, 20 y 24 px, enlazada a `color/icon/default` y `color/icon/brand`.

Los componentes se reutilizan solo cuando caben en la composición original. No se fuerza una sustitución si cambia el orden, el tamaño útil o la lógica testeada.

## Iconografía funcional

- Navegación: Home, Target, Message circle, Trending up y Menu. El logo central NOVU se conserva en las barras de la réplica.
- Metas: Navigation, Book open, Briefcase, Home, Shield y Plus distinguen cada categoría sin depender del color.
- Copiloto: Message circle identifica las intervenciones de NOVU en los tres recorridos conversacionales.
- Progreso: Clock, Dollar sign y Award reemplazan los indicadores vacíos de racha, ahorro y nivel.
- Grupos y familia: User, File text, Check circle y Dollar sign identifican integrantes, solicitudes, liberación de dinero y aportes.
- Verificación (KYC): Credit card identifica el DPI (insignia y las dos miniaturas frente/reverso), User la selfie, Lock el paso de contraseña y File text el comprobante de domicilio; Credit card y Camera se importaron nuevas a la librería local del archivo, las demás reutilizan componentes ya presentes.
- Los contenedores de fondo originales permanecen para conservar jerarquía, contraste y composición; el vector se inserta centrado dentro de ellos.
- No se sustituyeron checkboxes KYC, flechas de regreso ni vectores que ya comunicaban correctamente. Los checkboxes de la pantalla 7 se dejaron intactos: la fila completa ahora navega al sub-flujo correspondiente, pero su apariencia (incluida la insignia "Listo") no cambió.

## Reglas UX aplicadas

- La pantalla comunica su función mediante jerarquía, controles y estados; no mediante texto que explique la propia pantalla.
- Se conservan aclaraciones únicamente cuando previenen una decisión financiera equivocada.
- Color nunca es el único indicador de estado.
- El avance del onboarding se comunica con texto y una barra segmentada de seis fases.
- La conversación de la pantalla 04 usa scroll vertical para conservar el contenido bajo el header común.
- Los CTAs principales usan el gradiente de la presentación y un alto mínimo de 48 px.
- Las zonas táctiles de navegación, iconos y acciones compactas miden al menos 48 px sin alterar la composición visible.
- Las cuatro pantallas de captura de cámara (DPI × 2, selfie, comprobante) usan un fondo oscuro inmersivo de borde a borde — la única desviación intencional del lienzo claro — porque replica cómo se ve un visor de cámara real; las pantallas de confirmación que siguen vuelven de inmediato al fondo claro del resto del sistema.

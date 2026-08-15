# Especificación funcional — flujo original + presentación

Archivo: [NOVU en Figma](https://www.figma.com/design/vFm8Z8NqINCaW8YDb23hz5/NOVU?node-id=63-432)

Página: `08 · NOVU · Flujo original + Presentación` (`63:431`)

Punto de inicio principal: `01 · Bienvenida` (`63:432`, `Flow 1`)

## Resultado validado

- 31 pantallas de 375 × 812 px replicadas desde el prototipo original.
- 99 capas interactivas, 101 reacciones y 101 acciones.
- 0 destinos externos o rotos: todas las acciones apuntan a pantallas de la página nueva.
- 67 controles pequeños conservan su apariencia pero usan hotspots de al menos 48 × 48 px.
- Poppins es la única familia tipográfica de la réplica.
- No quedan emojis como iconos funcionales.
- El registro/KYC forma parte del recorrido principal.
- El original permanece intacto en `Legacy · Prototipo original` (`0:1`).

## Secuencia principal testeada

`Bienvenida → Elegí tu meta → Detalle → Chat → Ingresos → Plan generado → Verificación/KYC → Plan personal`

El acceso para una persona con cuenta existente conserva el atajo de Bienvenida a Plan personal.

## Inventario pantalla por pantalla

| # | Pantalla | Nodo | Funcionalidad conservada |
|---:|---|---|---|
| 1 | Bienvenida | `63:432` | Inicia una meta o entra con una cuenta existente. |
| 2 | Elegí tu meta | `63:438` | Selecciona una categoría de meta y continúa. |
| 3 | Detalle de la meta | `63:482` | Define nombre, monto y prioridad. |
| 4 | Chat con el copiloto | `63:513` | Completa la configuración mediante preguntas y respuestas. |
| 5 | Ingresos | `63:555` | Registra ingreso, variabilidad y horizonte. |
| 6 | Plan generado | `63:581` | Revisa el aporte sugerido, plazo y Modo Temporada. |
| 7 | Verificación (KYC) | `63:618` | Completa identidad, rostro, contacto y comprobante. |
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
| 18 | Historial del reto | `63:1063` | Filtra y consulta aportes del reto. |
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

## Componentes del sistema

- Button: 6 variantes; 29 instancias presentes en la réplica.
- Badge: 8 variantes; una instancia presente en la réplica.
- Progress: 4 niveles con monto editable, disponible para evoluciones sin alterar el flujo.
- Goal Card: 6 variantes para personal, grupo y familia.
- Bottom Navigation: 5 estados activos.

Los componentes se reutilizan solo cuando caben en la composición original. No se fuerza una sustitución si cambia el orden, el tamaño útil o la lógica testeada.

## Reglas UX aplicadas

- La pantalla comunica su función mediante jerarquía, controles y estados; no mediante texto que explique la propia pantalla.
- Se conservan aclaraciones únicamente cuando previenen una decisión financiera equivocada.
- Color nunca es el único indicador de estado.
- Los CTAs principales usan el gradiente de la presentación y un alto mínimo de 48 px.
- Las zonas táctiles de navegación, iconos y acciones compactas miden al menos 48 px sin alterar la composición visible.

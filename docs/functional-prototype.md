# Especificación funcional del prototipo NOVU V2

Archivo: [NOVU en Figma](https://www.figma.com/design/vFm8Z8NqINCaW8YDb23hz5/NOVU?node-id=43-2)

Página: `07 · NOVU V2 Screens` (`43:2`)

Punto de inicio: `V2/00 Bienvenida` (`50:268`)

Flujo de Figma: `Flow 1`

## Resultado validado

- 18 pantallas navegables.
- 74 reacciones de prototipo.
- 0 enlaces rotos.
- Navegación hacia adelante con `PUSH LEFT`.
- Regresos con `PUSH RIGHT`.
- Cambios de sección con `DISSOLVE`.
- Prototipo original preservado en `Legacy · Prototipo original`.

## Flujo de incorporación probado

La V2 conserva la secuencia del prototipo original que ya fue testeada:

| Paso | Pantalla | Acción principal | Destino |
|---|---|---|---|
| 0 | Bienvenida | Elegir mi meta | Elegir meta |
| 0b | Bienvenida | Ya tengo cuenta | Inicio |
| 1 | Elegir meta | Seleccionar Moto o Continuar | Detalle de meta |
| 2 | Detalle de meta | Hablar con NOVU | Configurar con NOVU |
| 3 | Configurar con NOVU | Continuar | Ingresos |
| 4 | Ingresos | Ver mi plan | Plan generado |
| 5 | Plan generado | Abrir mi Cuenta Dig&tal | Registro y verificación |
| 6 | Registro y verificación | Aceptar y activar | Meta personal |

Todos los pasos 1–6 incluyen regreso al paso anterior.

## Funcionalidades implementadas

### Bienvenida e inicio de sesión existente

Presenta la propuesta de NOVU y permite iniciar el recorrido de creación de meta. El acceso “Ya tengo cuenta” omite el onboarding y navega directamente al inicio.

### Selección de meta

Ofrece las categorías Moto, Estudios, Negocio, Vivienda, Emergencia y Otra meta. Moto aparece seleccionada en el recorrido probado y tanto la opción como el CTA continúan al detalle.

### Definición de meta

Muestra nombre, monto objetivo, fecha y prioridad con affordances de campo y selección. El CTA abre la configuración guiada con NOVU.

### Configuración conversacional

Conserva el patrón probado de preguntas y respuestas para concretar tipo de vehículo, uso y presupuesto. El contenido es breve y se entiende como conversación, sin instrucciones redundantes.

### Ingresos y Modo Temporada

Captura ingreso mensual, tipo de ingreso y horizonte. Al seleccionar ingreso variable se activa visualmente Modo Temporada antes de generar el plan.

### Plan generado

Resume meta, monto, aporte mensual, fecha objetivo y Modo Temporada. Desde aquí se inicia la apertura de Cuenta Dig&tal.

### Registro y verificación

Incluye documento de identidad, foto del rostro, datos personales y términos. Muestra progreso 3/4, estado de cada requisito y CTA de activación. Esta pantalla cubre el registro/KYC que faltaba en la primera versión V2.

### Inicio

Resume ahorro mensual, racha y meta principal. La tarjeta abre la meta personal; “Crear nueva meta” abre la selección de modalidad; “Ver todas” también lleva a modalidades.

### Modalidades de ahorro

Permite elegir:

- Personal → Meta personal.
- Reto grupal → Reto grupal.
- Fondo familiar → Fondo familiar.

### Meta personal

Muestra avance, próximo aporte, cuenta de origen y ajustes. “Aportar ahora” abre el formulario personal de Q 420; “Ajustar plan” vuelve a modalidades.

### Aporte personal

Confirma cuenta, monto y fecha. Al confirmar regresa a Meta personal. La pantalla conserva el contexto “Viaje a Atitlán”.

### Reto grupal

Muestra avance colectivo, participantes y aporte individual. Aclara de forma contextual que el objetivo es compartido y las cuentas permanecen separadas. “Aportar Q 250” abre el formulario grupal.

### Aporte grupal

Confirma cuenta, Q 250 y fecha. El equipo puede ver el aporte, pero no el saldo personal. Al confirmar regresa al reto.

### Fondo familiar

Muestra meta, avance y votación activa. “Revisar y votar” abre el detalle de solicitud.

### Votación familiar

Muestra solicitante, monto, motivo, cierre, votos registrados y opciones A favor/En contra. “Enviar voto” vuelve al fondo familiar.

### Copiloto NOVU

Presenta una oportunidad contextual, conversación breve, respuestas rápidas y CTA. Aplicar Q 60 o la recomendación completa lleva a Meta personal.

### Ritmo de ahorro

Resume total mensual, tendencia, barras semanales, mejor semana y oportunidad. “Ver plan del mes” abre Meta personal.

### Menú

Incluye cuenta y perfil, seguridad, notificaciones, ayuda, términos y privacidad. “Cerrar sesión” vuelve a Bienvenida.

### Navegación inferior

Inicio, Metas, Copiloto, Ritmo y Menú están conectados en las ocho pantallas principales. El tab activo no navega hacia sí mismo; los otros cuatro destinos usan hotspots de 75 × 84 px.

## Componentes reutilizados

- Button: 6 variantes y propiedades de etiqueta/icono.
- Badge: 8 variantes de tono y estilo.
- Progress: 4 niveles con monto editable.
- Goal Card: 6 variantes para personal, grupo y familia.
- Bottom Navigation: 5 estados activos.

## Criterios UX aplicados

- La interfaz evita explicar “qué hace la pantalla”; la estructura y los controles lo comunican.
- Se conservan únicamente aclaraciones financieras necesarias para prevenir errores.
- Objetivos táctiles de al menos 48 px.
- Montos con moneda y contexto.
- Estados comunicados por texto y color.
- Sin emojis como iconos funcionales.

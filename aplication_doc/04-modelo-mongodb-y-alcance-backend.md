# Etapa siguiente — Backend FastAPI y modelo MongoDB

Fecha de definición: 17 de agosto de 2026
Última actualización: 18 de agosto de 2026, después de `aed7b1f`

## Alcance

Este documento define el siguiente incremento, pero **no implementa** el backend ni la base de datos. El siguiente agente deberá construir una API FastAPI, persistencia MongoDB, almacenamiento privado de documentos KYC y pruebas de integración sin romper los contratos que ya consume el frontend.

Esta revisión incorpora los recorridos nuevos del prototipo:

- creación guiada de múltiples metas personales;
- creación de retos grupales y fondos familiares;
- resumen, invitaciones y activación de planes compartidos;
- conversación persistente con Copiloto NOVU;
- dashboard con una meta principal, listado completo de metas y actividad reciente.

## Principios de datos

- Identificadores internos: `ObjectId`; la API los serializa como texto.
- Fechas: UTC en BSON `Date`, nunca texto local.
- Dinero: entero en centavos (`amount_minor`) y moneda ISO 4217 (`GTQ`); nunca `float`.
- Correo y teléfono: conservar valor de presentación y versión normalizada para índices.
- Los estados siguen transiciones explícitas; el cliente no puede cambiarlos arbitrariamente.
- Borrado lógico mediante `deleted_at` en entidades financieras. Movimientos, votos y auditoría son append-only.
- Los binarios KYC van a almacenamiento de objetos privado. MongoDB guarda metadatos y claves, no imágenes ni PDF en base64.
- Toda mutación financiera genera un evento de auditoría inmutable.
- Los arreglos embebidos deben ser pequeños y acotados. Mensajes, aportes, miembros e invitaciones viven en colecciones separadas.
- Los saldos, conteos y porcentajes son proyecciones reconciliables; los movimientos son la fuente contable.

## Colecciones

### `users`

```json
{
  "_id": "ObjectId",
  "email": "diego@correo.com",
  "email_normalized": "diego@correo.com",
  "phone": "+50255123456",
  "phone_normalized": "+50255123456",
  "password_hash": "argon2id...",
  "profile": {
    "first_name": "Diego",
    "last_name": "López",
    "locale": "es-GT",
    "timezone": "America/Guatemala"
  },
  "preferences": {
    "primary_goal_id": "ObjectId|null"
  },
  "status": "pending_kyc | active | suspended | closed",
  "kyc_status": "draft | submitted | approved | rejected | needs_review",
  "created_at": "Date",
  "updated_at": "Date",
  "last_login_at": "Date|null"
}
```

Índices: únicos en `email_normalized` y `phone_normalized`; `{status: 1, created_at: -1}`.

`primary_goal_id` sólo controla la presentación. El servicio debe comprobar que la meta pertenece al usuario y está visible; si no, selecciona la meta activa actualizada más recientemente.

### `savings_profiles`

Guarda la capacidad declarada durante el registro separada del documento de identidad. El formulario es condicional y no solicita el mismo conjunto de campos para todos.

```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "income_pattern": "fixed | variable | mixed",
  "fixed_monthly_income_minor": "int|null",
  "variable_income_frequency": "weekly | biweekly | irregular | null",
  "safe_monthly_savings_minor": 25000,
  "currency": "GTQ",
  "answers_version": 1,
  "created_at": "Date",
  "updated_at": "Date"
}
```

Índice único `{user_id: 1}`.

Validación condicional:

- `fixed`: exige `fixed_monthly_income_minor` y no guarda frecuencia variable;
- `variable`: exige `variable_income_frequency` y **no solicita ni guarda ingreso mensual**;
- `mixed`: exige ingreso fijo mensual y frecuencia del componente variable;
- los tres recorridos exigen `safe_monthly_savings_minor`;
- montos mayores que cero, en centavos y dentro de límites razonables definidos por producto.

Este perfil es información financiera sensible. Sólo los servicios de planificación autorizados deben leerlo y cada actualización debe generar auditoría.

### `auth_sessions`

```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "refresh_token_hash": "sha256...",
  "device": { "user_agent": "...", "ip_hash": "..." },
  "created_at": "Date",
  "expires_at": "Date",
  "revoked_at": "Date|null"
}
```

Índices: `{user_id: 1, revoked_at: 1}` y TTL en `expires_at` con `expireAfterSeconds: 0`.

### `kyc_cases`

```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "status": "draft | submitted | approved | rejected | needs_review",
  "contact_snapshot": { "email": "...", "phone": "..." },
  "document_ids": ["ObjectId"],
  "provider": { "name": "manual|vendor", "reference": "...|null" },
  "review": {
    "reviewer_id": "ObjectId|null",
    "reason_code": "string|null",
    "notes_encrypted": "string|null",
    "reviewed_at": "Date|null"
  },
  "submitted_at": "Date|null",
  "created_at": "Date",
  "updated_at": "Date"
}
```

Índices: único parcial para un caso abierto por `user_id`; `{status: 1, submitted_at: 1}`.

### `media_assets`

```json
{
  "_id": "ObjectId",
  "owner_id": "ObjectId",
  "kyc_case_id": "ObjectId",
  "slot": "dpi_front | dpi_back | selfie | proof",
  "storage_key": "kyc/<user>/<uuid>",
  "mime_type": "image/jpeg",
  "size_bytes": 183421,
  "sha256": "hex",
  "source": "camera | upload",
  "scan_status": "pending | clean | rejected",
  "created_at": "Date",
  "purge_at": "Date|null"
}
```

Índices: único `{kyc_case_id: 1, slot: 1}`; `{scan_status: 1, created_at: 1}`; TTL opcional en `purge_at` después de aplicar la política legal de retención.

### `goals`

Una persona puede tener varias metas. El mismo documento conserva las respuestas acotadas del asistente de creación y el plan recomendado.

```json
{
  "_id": "ObjectId",
  "owner_id": "ObjectId",
  "client_creation_id": "uuid",
  "name": "Viaje a Antigua",
  "category": "travel | motorcycle | education | business | housing | emergency | other",
  "currency": "GTQ",
  "target_amount_minor": 200000,
  "saved_amount_minor": 125000,
  "planning_context": {
    "motivations": ["travel", "peace_of_mind", "professional_growth", "support_family"],
    "starting_point": "starting | occasional_saver | habitual_saver",
    "horizon": "3_months | 6_months | 1_year | flexible",
    "answers_version": 1
  },
  "recommendation": {
    "contribution_amount_minor": 18000,
    "contribution_frequency": "weekly | biweekly | monthly",
    "estimated_months": 7,
    "generated_by": "rules_v1 | copilot_v1",
    "generated_at": "Date"
  },
  "target_date": "Date|null",
  "status": "draft | active | paused | completed | cancelled",
  "activated_at": "Date|null",
  "completed_at": "Date|null",
  "created_at": "Date",
  "updated_at": "Date",
  "deleted_at": "Date|null"
}
```

Índices:

- `{owner_id: 1, status: 1, updated_at: -1}` para “Mis metas” y la meta principal;
- `{owner_id: 1, created_at: -1}` para historial;
- único parcial `{owner_id: 1, client_creation_id: 1}` para impedir dobles creaciones.

Reglas:

- `planning_context.motivations` acepta un conjunto pequeño sin duplicados.
- Una meta `active` requiere nombre, categoría, monto objetivo y recomendación válida.
- `saved_amount_minor` no se modifica desde CRUD: lo actualizan aportes y retiros.
- El porcentaje de avance se calcula en la respuesta; no se persiste como fuente de verdad.

### `shared_plans`

Unifica retos grupales y fondos familiares. Los campos de `rules` cambian según el tipo.

```json
{
  "_id": "ObjectId",
  "type": "group_challenge | family_fund",
  "name": "Reto de julio",
  "currency": "GTQ",
  "target_amount_minor": 500000,
  "balance_minor": 0,
  "created_by": "ObjectId",
  "expected_participants": 5,
  "rules": {
    "contribution_frequency": "weekly | biweekly | monthly | null",
    "minimum_contribution_minor": "int|null",
    "approval": {
      "mode": "all | majority | fixed_count | null",
      "required_votes": "int|null"
    },
    "administrator_id": "ObjectId|null"
  },
  "member_count": 1,
  "status": "draft | inviting | active | paused | completed | cancelled",
  "activated_at": "Date|null",
  "created_at": "Date",
  "updated_at": "Date",
  "deleted_at": "Date|null"
}
```

Índices: `{created_by: 1, created_at: -1}`, `{type: 1, status: 1}` y `{status: 1, updated_at: -1}`.

Validación condicional:

- `group_challenge`: exige monto objetivo, participantes y frecuencia; no exige votación de retiros.
- `family_fund`: exige aporte mínimo, administrador y regla de aprobación; el administrador debe ser miembro activo antes de activar.
- `balance_minor` y `member_count` son proyecciones, no valores editables por el cliente.

### `memberships`

```json
{
  "_id": "ObjectId",
  "shared_plan_id": "ObjectId",
  "user_id": "ObjectId",
  "role": "owner | admin | member",
  "status": "invited | active | declined | removed",
  "invitation_id": "ObjectId|null",
  "joined_at": "Date|null",
  "created_at": "Date",
  "updated_at": "Date"
}
```

Índice único `{shared_plan_id: 1, user_id: 1}`; `{user_id: 1, status: 1, updated_at: -1}` para listar planes.

El creador se registra inmediatamente como `owner/active`. Una invitación sólo crea o activa la membresía una vez.

### `plan_invitations`

Da persistencia a la etapa de invitación de los dos flujos compartidos.

```json
{
  "_id": "ObjectId",
  "shared_plan_id": "ObjectId",
  "inviter_id": "ObjectId",
  "invitee": {
    "user_id": "ObjectId|null",
    "channel": "email | phone | link",
    "destination_normalized": "string|null"
  },
  "role": "admin | member",
  "token_hash": "sha256...",
  "status": "pending | accepted | declined | expired | revoked",
  "expires_at": "Date",
  "accepted_at": "Date|null",
  "created_at": "Date",
  "updated_at": "Date",
  "purge_at": "Date|null"
}
```

Índices:

- `{token_hash: 1}` único;
- único parcial `{shared_plan_id: 1, "invitee.destination_normalized": 1}` para invitaciones `pending`;
- `{invitee.user_id: 1, status: 1, created_at: -1}`;
- TTL opcional en `purge_at` para limpieza posterior a la retención.

La expiración se comprueba al aceptar; el monitor TTL es asíncrono y no sustituye esa regla de negocio.

### `contributions`

```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "destination": {
    "type": "goal | shared_plan",
    "id": "ObjectId"
  },
  "amount_minor": 18000,
  "currency": "GTQ",
  "description": "Aporte semanal",
  "idempotency_key": "uuid",
  "status": "pending | posted | failed | reversed",
  "bank_reference": "string|null",
  "reverses_contribution_id": "ObjectId|null",
  "occurred_at": "Date",
  "created_at": "Date"
}
```

Índices: único `{user_id: 1, idempotency_key: 1}`; `{destination.id: 1, occurred_at: -1, _id: -1}`; `{user_id: 1, occurred_at: -1}`.

No se edita ni elimina un aporte publicado. Una corrección se representa con un reverso enlazado al original.

### `withdrawal_requests`

```json
{
  "_id": "ObjectId",
  "requester_id": "ObjectId",
  "source": { "type": "goal | shared_plan", "id": "ObjectId" },
  "amount_minor": 4500,
  "currency": "GTQ",
  "reason": "Café con amigos",
  "approval_snapshot": {
    "mode": "owner | all | majority | fixed_count",
    "required_votes": 2,
    "eligible_voter_ids": ["ObjectId"]
  },
  "status": "pending | approved | rejected | executed | cancelled",
  "created_at": "Date",
  "decided_at": "Date|null",
  "executed_at": "Date|null"
}
```

Índices: `{source.id: 1, status: 1, created_at: -1}` y `{requester_id: 1, created_at: -1}`.

La regla de aprobación se congela al solicitar para que un cambio posterior de miembros no altere una votación en curso.

### `votes`

```json
{
  "_id": "ObjectId",
  "withdrawal_request_id": "ObjectId",
  "voter_id": "ObjectId",
  "decision": "approve | reject",
  "comment": "string|null",
  "created_at": "Date"
}
```

Índice único `{withdrawal_request_id: 1, voter_id: 1}` para impedir votos dobles.

### `copilot_conversations`

```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "title": "Plan para ahorrar más",
  "context": {
    "type": "general | goal | shared_plan",
    "entity_id": "ObjectId|null"
  },
  "status": "active | archived",
  "message_count": 8,
  "last_message_at": "Date",
  "summary": {
    "text": "Resumen breve y acotado|null",
    "through_message_id": "ObjectId|null",
    "updated_at": "Date|null"
  },
  "created_at": "Date",
  "updated_at": "Date"
}
```

Índices: `{user_id: 1, status: 1, last_message_at: -1}` y `{context.entity_id: 1, updated_at: -1}`.

`summary` puede mantener contexto acotado, pero el historial completo nunca se embebe en la conversación.

### `copilot_messages`

```json
{
  "_id": "ObjectId",
  "conversation_id": "ObjectId",
  "sender": "user | assistant | system",
  "content": "Podrías subir tu aporte a Q 220 por semana.",
  "kind": "text | recommendation | action",
  "metadata": {
    "intent": "increase_savings|null",
    "related_entity_type": "goal | shared_plan | null",
    "related_entity_id": "ObjectId|null",
    "model": "string|null",
    "prompt_version": "string|null",
    "safety_status": "ok | blocked | review"
  },
  "client_message_id": "uuid|null",
  "created_at": "Date"
}
```

Índices:

- `{conversation_id: 1, created_at: -1, _id: -1}` para paginación por cursor;
- único parcial `{conversation_id: 1, client_message_id: 1}` cuando existe `client_message_id`;
- `{metadata.related_entity_id: 1, created_at: -1}` si se consulta desde una meta.

Los mensajes son append-only. Las sugerencias rápidas usan el mismo endpoint que el compositor. No guardar secretos, instrucciones internas del modelo ni PII financiera innecesaria en `metadata`.

### `activities`

Proyección de lectura para el dashboard: usuario, tipo, título, monto opcional, tono, referencia de dominio y fecha. No es la fuente contable.

Índice `{user_id: 1, occurred_at: -1, _id: -1}`.

### `audit_events`

Registro inmutable con actor, acción, entidad, resultado, request/correlation ID, hash de IP, metadatos sin secretos y fecha.

Índices: `{entity_type: 1, entity_id: 1, occurred_at: -1}` y `{actor_id: 1, occurred_at: -1}`.

## Relaciones principales

```text
users ──< auth_sessions
  │
  ├── savings_profiles
  ├──< kyc_cases ──< media_assets
  ├──< goals ──< contributions
  ├──< memberships >── shared_plans ──< plan_invitations
  │                                  ├──< contributions
  │                                  └──< withdrawal_requests ──< votes
  ├──< copilot_conversations ──< copilot_messages
  ├──< activities
  └──< audit_events
```

Las referencias permanecen manuales; MongoDB no impone claves foráneas. Cada servicio debe comprobar existencia, pertenencia y permisos antes de escribir.

## Estados y flujos de escritura

### Meta personal de cinco pasos

1. `POST /goals` crea una meta `draft` con `client_creation_id`.
2. `PATCH /goals/{id}` guarda respuestas parciales y permite reanudar el asistente.
3. `POST /goals/{id}/recommendation` calcula o recalcula el plan.
4. `POST /goals/{id}/activate` valida el documento completo y cambia `draft → active`.
5. `PUT /me/preferences/primary-goal` permite mostrarla en el resumen.

Estados: `draft → active → paused|completed|cancelled`; `paused → active|cancelled`. Una meta completada no vuelve a activarse sin una operación administrativa auditada.

### Reto grupal y fondo familiar

1. `POST /shared-plans` crea el plan `draft` y la membresía `owner/active`.
2. `PATCH /shared-plans/{id}` completa el formulario y genera el resumen.
3. `POST /shared-plans/{id}/invitations` crea invitaciones independientes.
4. `POST /shared-plans/{id}/activate` valida reglas y cambia `draft|inviting → active`.
5. Aceptar una invitación crea o activa exactamente una membresía.

Estados: `draft → inviting|active`; `inviting → active|cancelled`; `active → paused|completed|cancelled`; `paused → active|cancelled`.

### Copiloto NOVU

1. Se abre o crea una conversación para contexto general, meta o plan compartido.
2. El cliente envía texto o una sugerencia rápida con `client_message_id`.
3. El backend persiste el mensaje del usuario antes de solicitar la respuesta.
4. La respuesta del asistente se guarda como otro mensaje y actualiza la proyección de la conversación.
5. El historial se pagina por cursor; el frontend desplaza sólo el panel de mensajes.

Si el proveedor de IA falla, el mensaje del usuario permanece y la API devuelve un estado recuperable. Reintentar el mismo `client_message_id` no duplica el mensaje.

## Contrato del dashboard

El frontend actual consume `GET /v1/overview`. Para soportar varias metas sin una migración abrupta:

```json
{
  "profile": { "firstName": "Diego", "lastName": "López" },
  "personalGoal": { "id": "...", "name": "Viaje a Antigua" },
  "personalGoals": [
    { "id": "...", "name": "Viaje a Antigua", "progressPercent": 62 }
  ],
  "primaryGoalId": "...",
  "sharedPlans": [],
  "recentActivity": []
}
```

- En `/v1`, `personalGoal` se conserva temporalmente como alias de la meta principal.
- `personalGoals` es la colección canónica para “Mis metas”.
- En una futura `/v2`, se elimina el alias después de migrar el frontend.
- El endpoint compone proyecciones; no lee el historial contable completo en cada render.

## API FastAPI mínima

Base: `/v1`. Respuestas de error con `{ "code": "...", "detail": "...", "request_id": "..." }`.

### Autenticación y KYC

- `POST /auth/register` — multipart con `contact`, `savings_capacity` y cuatro assets; crea usuario, perfil de ahorro y caso KYC.
- `POST /auth/login`, `POST /auth/refresh` y `POST /auth/logout`.
- `GET /me`, `GET /kyc` y `POST /kyc/submit`.

### Metas y dashboard

- `GET /overview` — meta principal, metas, planes compartidos y actividad.
- `GET /goals`, `GET /goals/{id}`, `POST /goals`, `PATCH /goals/{id}` y borrado lógico.
- `POST /goals/{id}/recommendation` y `POST /goals/{id}/activate`.
- `PUT /me/preferences/primary-goal`.
- `POST /goals/{id}/contributions` y `POST /goals/{id}/withdrawals`.
- `GET /activities` paginado por cursor.

### Planes compartidos

- `GET /shared-plans`, `GET /shared-plans/{id}`, `POST /shared-plans`, `PATCH /shared-plans/{id}`.
- `POST /shared-plans/{id}/activate`.
- `GET|POST /shared-plans/{id}/invitations` y `DELETE /shared-plans/{id}/invitations/{invitation_id}`.
- `POST /invitations/{token}/accept` y `POST /invitations/{token}/decline`.
- `GET /shared-plans/{id}/members` y endpoints autorizados de rol/remoción.
- `POST /shared-plans/{id}/contributions`.
- CRUD de solicitudes de retiro y `PUT /withdrawals/{id}/vote`.

### Copiloto

- `GET|POST /copilot/conversations`.
- `GET /copilot/conversations/{id}/messages?cursor=...&limit=...`.
- `POST /copilot/conversations/{id}/messages` con `client_message_id`.
- `POST /copilot/conversations/{id}/archive`.

La respuesta de mensajes puede ser síncrona al inicio. Si se añade streaming, usar SSE y conservar el mismo modelo persistido.

## Validación de esquema

Cada colección nueva debe tener `$jsonSchema` versionado:

- `validationLevel: "strict"` y `validationAction: "error"` en colecciones nuevas;
- migraciones con `moderate` sólo durante un backfill controlado;
- enteros de 64 bits para montos, nunca `double`;
- enums para estados, tipos, roles y frecuencias;
- validación condicional de `shared_plans.rules` según `type`;
- límites de longitud para nombres, mensajes, motivos y arreglos embebidos.

La validación de MongoDB complementa, pero no sustituye, los modelos Pydantic ni la autorización del servicio.

## Reglas transaccionales

- MongoDB debe ejecutarse como replica set incluso en desarrollo; standalone no soporta transacciones multidocumento.
- Registro: usuario, perfil de ahorro, caso KYC y metadatos de assets se confirman juntos; un fallo elimina objetos recién cargados.
- Crear un plan confirma juntos el plan, la membresía del propietario y el evento de auditoría.
- Aceptar una invitación confirma juntos su estado, la membresía y `member_count`.
- Aportes: insertar movimiento y actualizar saldo dentro de una transacción.
- Retiros: validar saldo y autorización, registrar movimiento, actualizar saldo y cerrar solicitud en una transacción.
- Cada mutación monetaria exige `Idempotency-Key` y devuelve el resultado previo si se repite.
- `saved_amount_minor` y `balance_minor` deben reconciliarse desde movimientos.
- En el chat, `copilot_messages` es la fuente de verdad. `message_count` y el resumen pueden repararse de forma asíncrona.
- Las transacciones deben ser breves y reintentar errores transitorios o conflictos de escritura.

## Seguridad y privacidad

- Argon2id para contraseñas; nunca guardar contraseña ni refresh token en claro.
- Cookies `HttpOnly`, `Secure`, `SameSite=Lax/Strict`; protección CSRF cuando aplique.
- Cifrado administrado por KMS para objetos KYC y campos sensibles.
- URLs de documentos firmadas, breves y sólo para roles autorizados.
- Validar contenido real, tamaño, dimensiones y malware; no confiar en nombre o `Content-Type`.
- Rate limiting en login, registro, carga, biometría, invitaciones y chat.
- Tokens de invitación y sesión se almacenan sólo como hash.
- El Copiloto no ejecuta aportes, retiros ni cambios de meta sin confirmación explícita y endpoint autorizado.
- Logs sin contraseñas, tokens, DPI, documentos, conversaciones completas ni PII completa.
- Definir retención y eliminación compatible con obligaciones bancarias de Guatemala antes de producción.

## Estructura propuesta del backend

```text
backend/
├── app/
│   ├── main.py
│   ├── api/v1/              # routers
│   ├── core/                # configuración, seguridad y logging
│   ├── db/                  # cliente, validadores, índices y transacciones
│   ├── models/              # documentos Mongo
│   ├── schemas/             # modelos Pydantic
│   ├── repositories/        # persistencia
│   ├── services/            # auth, KYC, metas, planes, chat y movimientos
│   ├── integrations/        # proveedor IA y servicios externos
│   └── storage/             # interfaz S3-compatible
├── tests/
│   ├── unit/
│   ├── integration/
│   └── contract/
├── migrations/              # validadores, índices y backfills
├── pyproject.toml
└── docker-compose.yml       # API, Mongo replica set y storage
```

## Orden de implementación

1. Crear FastAPI, configuración, health checks y errores uniformes.
2. Conectar MongoDB asíncrono, crear validadores e índices idempotentes y levantar replica set.
3. Implementar auth y pruebas de contratos `/auth/*`.
4. Integrar almacenamiento privado y flujo KYC.
5. Evolucionar `/overview` e implementar metas múltiples, borradores, recomendación y activación.
6. Implementar planes, membresías, invitaciones y estados.
7. Implementar aportes, retiros, votos, proyecciones y reconciliación.
8. Implementar conversaciones y mensajes con paginación e idempotencia.
9. Sustituir `mockTransport` por `createFetchTransport` mediante `NEXT_PUBLIC_API_URL`.
10. Ejecutar pruebas unitarias, integración, contrato, seguridad, concurrencia y recuperación.

## Criterios de aceptación

- Ningún endpoint devuelve hashes, secretos, rutas internas o metadatos sensibles.
- Registro multipart acepta `savings_capacity` con validación distinta para ingresos fijos, variables o mixtos.
- El recorrido variable nunca exige ni persiste un ingreso mensual estimado.
- Sesión sobrevive recarga, expira y se puede revocar.
- Un usuario crea varias metas, reanuda un borrador y elige una meta principal.
- Repetir activación o creación con la misma llave no duplica una meta o plan.
- Reto grupal y fondo familiar aplican sus reglas específicas antes de activarse.
- Una invitación expirada, revocada o aceptada no crea otra membresía.
- El propietario conserva una membresía activa mientras el plan existe.
- Una mutación repetida con la misma llave no duplica dinero.
- Dos votos simultáneos del mismo usuario producen uno solo.
- Los saldos no quedan negativos bajo concurrencia.
- El chat pagina mensajes, conserva el orden y no duplica un envío reintentado.
- El historial largo del chat no aumenta sin límite el documento de conversación.
- Los cuatro archivos KYC quedan privados, validados y auditados.
- Validadores, índices únicos, TTL y consultas críticas se comprueban mediante tests.
- La suite del frontend continúa pasando al activar el transporte HTTP.

## Referencias oficiales de MongoDB

Las decisiones anteriores siguen estas guías oficiales:

- [Datos embebidos](https://www.mongodb.com/docs/manual/data-modeling/embedding/): para contextos pequeños leídos con la entidad, como las respuestas del asistente de metas.
- [Referencias entre documentos](https://www.mongodb.com/docs/manual/data-modeling/referencing/): para historiales y relaciones de alta cardinalidad, como mensajes, miembros y aportes.
- [Evitar arreglos sin límite](https://www.mongodb.com/docs/manual/data-modeling/design-antipatterns/unbounded-arrays/): justifica separar los mensajes de la conversación.
- [Transacciones](https://www.mongodb.com/docs/manual/core/transactions/) y [consideraciones de producción](https://www.mongodb.com/docs/manual/core/transactions-production-consideration/): respaldan las operaciones atómicas breves sobre replica set.
- [Validación de esquema](https://www.mongodb.com/docs/manual/core/schema-validation/): segunda barrera para tipos, campos obligatorios y estados válidos.

# Etapa siguiente — Backend FastAPI y modelo MongoDB

Fecha de definición: 17 de agosto de 2026

## Alcance

Este documento define el siguiente incremento, pero **no implementa** el backend ni la base de datos. El siguiente agente deberá construir una API FastAPI, persistencia MongoDB, almacenamiento privado de documentos KYC y pruebas de integración sin cambiar los contratos públicos que ya consume el frontend.

## Principios de datos

- Identificadores internos: `ObjectId`; la API los serializa como texto.
- Fechas: UTC en tipo BSON `Date`, nunca texto local.
- Dinero: entero en centavos (`amount_minor`) y moneda ISO 4217 (`GTQ`); nunca `float`.
- Correo y teléfono: conservar valor de presentación y una versión normalizada para índices.
- Borrado lógico en entidades financieras mediante `deleted_at`; los movimientos no se eliminan físicamente.
- Documentos KYC: los binarios van a almacenamiento de objetos privado. MongoDB guarda metadatos y claves, no imágenes ni PDF en base64.
- Toda mutación financiera genera un evento de auditoría inmutable.

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
  "status": "pending_kyc | active | suspended | closed",
  "kyc_status": "draft | submitted | approved | rejected | needs_review",
  "created_at": "Date",
  "updated_at": "Date",
  "last_login_at": "Date|null"
}
```

Índices: únicos en `email_normalized` y `phone_normalized`; `{status: 1, created_at: -1}`.

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

```json
{
  "_id": "ObjectId",
  "owner_id": "ObjectId",
  "name": "Viaje a Antigua",
  "category": "travel",
  "currency": "GTQ",
  "target_amount_minor": 200000,
  "saved_amount_minor": 125000,
  "weekly_contribution_minor": 18000,
  "target_date": "Date|null",
  "status": "active | completed | paused | cancelled",
  "created_at": "Date",
  "updated_at": "Date",
  "deleted_at": "Date|null"
}
```

Índices: `{owner_id: 1, status: 1, updated_at: -1}`.

### `shared_plans`

Unifica retos grupales y fondos familiares mediante `type: "group_challenge | family_fund"`. Incluye nombre, moneda, monto objetivo, saldo materializado, reglas de aporte/aprobación, estado, creador y fechas.

Índices: `{type: 1, status: 1}` y `{created_by: 1, created_at: -1}`.

### `memberships`

Relaciona usuario y plan compartido con `role: owner | admin | member`, estado de invitación y fecha de ingreso.

Índice único `{shared_plan_id: 1, user_id: 1}`; índice `{user_id: 1, status: 1}` para listar planes del usuario.

### `contributions`

Movimiento append-only con `user_id`, destino (`goal_id` o `shared_plan_id`), `amount_minor`, moneda, descripción, idempotency key, estado, referencia bancaria y fechas.

Índices: único `{user_id: 1, idempotency_key: 1}`; `{goal_id: 1, created_at: -1}`; `{shared_plan_id: 1, created_at: -1}`.

### `withdrawal_requests`

Solicitud de retiro personal o compartido: solicitante, destino, monto, motivo, impacto estimado, regla de aprobación congelada, estado y fechas.

Índices: `{shared_plan_id: 1, status: 1, created_at: -1}` y `{requester_id: 1, created_at: -1}`.

### `votes`

Voto append-only de una solicitud: `withdrawal_request_id`, `voter_id`, decisión, comentario y fecha.

Índice único `{withdrawal_request_id: 1, voter_id: 1}` para impedir votos dobles.

### `activities`

Proyección de lectura para el dashboard: usuario, tipo, título, monto opcional, tono, referencia de dominio y fecha. No es la fuente contable.

Índice `{user_id: 1, occurred_at: -1}`.

### `audit_events`

Registro inmutable con actor, acción, entidad, resultado, request/correlation ID, hash de IP, metadatos sin secretos y fecha.

Índices: `{entity_type: 1, entity_id: 1, occurred_at: -1}` y `{actor_id: 1, occurred_at: -1}`.

## Relaciones principales

```text
users ──< auth_sessions
  │
  ├──< kyc_cases ──< media_assets
  ├──< goals ──< contributions
  ├──< memberships >── shared_plans ──< contributions
  │                                  └──< withdrawal_requests ──< votes
  ├──< activities
  └──< audit_events
```

Las referencias permanecen manuales; MongoDB no impone claves foráneas. Cada servicio debe comprobar existencia, pertenencia y permisos antes de escribir.

## API FastAPI mínima

Base: `/v1`. Respuestas de error con `{ "code": "...", "detail": "...", "request_id": "..." }`.

### Autenticación y KYC

- `POST /auth/register` — multipart actual; crea usuario, caso KYC y cuatro assets.
- `POST /auth/login` — credenciales y sesión.
- `POST /auth/refresh` — rota refresh token.
- `POST /auth/logout` — revoca sesión.
- `GET /me` — perfil y estado KYC.
- `GET /kyc` — avance del caso propio.
- `POST /kyc/submit` — envía el caso a revisión si tiene los cuatro slots limpios.

### Producto

- `GET /overview` — contrato ya consumido por el frontend.
- CRUD de `/goals` y `POST /goals/{id}/withdrawals`.
- CRUD de `/shared-plans`, miembros e invitaciones.
- `POST /shared-plans/{id}/contributions`.
- CRUD de solicitudes de retiro y `PUT /withdrawals/{id}/vote`.
- `GET /activities` paginado por cursor.

## Reglas transaccionales

- Registro: usuario, caso KYC y metadatos de assets se confirman juntos; un fallo elimina objetos recién cargados.
- Aportes: insertar movimiento y actualizar saldo dentro de una transacción MongoDB.
- Retiros: validar saldo y autorización, registrar movimiento, actualizar saldo y cerrar solicitud en una transacción.
- Cada mutación monetaria exige `Idempotency-Key` y devuelve el resultado previo si se repite.
- `saved_amount_minor` es una proyección; la fuente de verdad es el historial de movimientos y debe poder reconciliarse.

## Seguridad y privacidad

- Argon2id para contraseñas; nunca guardar contraseña ni refresh token en claro.
- Cookies de sesión `HttpOnly`, `Secure`, `SameSite=Lax/Strict`; protección CSRF cuando aplique.
- Cifrado administrado por KMS para objetos KYC y campos sensibles.
- URLs de documentos firmadas, de vida corta y sólo para roles autorizados.
- Validar tipo real por contenido, tamaño, dimensiones y malware; no confiar en nombre o `Content-Type` del cliente.
- Rate limiting en login, registro, carga y biometría.
- Logs sin contraseñas, tokens, DPI, documentos ni PII completa.
- Política formal de retención y derecho de eliminación compatible con obligaciones bancarias de Guatemala antes de producción.

## Estructura propuesta del backend

```text
backend/
├── app/
│   ├── main.py
│   ├── api/v1/              # routers
│   ├── core/                # configuración, seguridad y logging
│   ├── db/                  # cliente, índices y transacciones
│   ├── models/              # documentos Mongo
│   ├── schemas/             # modelos Pydantic de entrada/salida
│   ├── repositories/        # persistencia
│   ├── services/            # auth, KYC, metas y movimientos
│   └── storage/             # interfaz S3-compatible
├── tests/
│   ├── unit/
│   ├── integration/
│   └── contract/
├── migrations/              # scripts versionados de índices/backfill
├── pyproject.toml
└── docker-compose.yml       # desarrollo: API, Mongo replica set y storage
```

MongoDB debe ejecutarse como replica set incluso en desarrollo para probar transacciones.

## Orden de implementación para el siguiente agente

1. Crear FastAPI, configuración por ambiente, health checks y manejo uniforme de errores.
2. Conectar MongoDB asíncrono, crear índices mediante migraciones idempotentes y levantar replica set local.
3. Implementar auth segura y pruebas de contratos `/auth/*`.
4. Integrar almacenamiento privado, validación de archivos y flujo KYC.
5. Implementar `/overview`, metas y actividades.
6. Implementar planes compartidos, aportes, retiros, votos y transacciones.
7. Sustituir `mockTransport` por `createFetchTransport` mediante `NEXT_PUBLIC_API_URL`.
8. Ejecutar pruebas unitarias, integración, contrato frontend/backend, seguridad y recuperación.

## Criterios de aceptación

- Ningún endpoint devuelve hashes, secretos, rutas internas o metadatos sensibles.
- Registro multipart del frontend funciona sin cambiar nombres de campos.
- Sesión sobrevive recarga, expira y se puede revocar.
- Repetir una mutación con la misma llave de idempotencia no duplica dinero.
- Dos votos simultáneos del mismo usuario producen uno solo.
- Saldos no quedan negativos bajo concurrencia.
- Los cuatro archivos KYC quedan privados, validados y auditados.
- Índices únicos, TTL y consultas críticas se validan mediante tests.
- La suite del frontend continúa pasando al activar el transporte HTTP.

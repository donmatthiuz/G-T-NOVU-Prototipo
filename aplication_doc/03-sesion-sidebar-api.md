# Etapa 3 — Sesión persistente, sidebar y contratos API

Fecha de cierre: 17 de agosto de 2026

## Resultado

La aplicación recuerda que una persona inició sesión, redirige al resumen al volver a entrar y permite cerrar la sesión desde el menú o el sidebar. El estado colapsado del sidebar también se conserva entre recargas. Ambos comportamientos están encapsulados en hooks y no dependen directamente de los componentes visuales.

## Sesión

- `useAuth` ofrece `login`, `register`, `logout`, estado de carga, error y sesión actual.
- Login, verificaciones biométricas demo y finalización del registro consumen el mismo contrato.
- La sesión mock dura 24 horas y se guarda bajo `novu.auth.session.v1`.
- Las sesiones vencidas o corruptas se descartan.
- Los cambios se sincronizan dentro de la pestaña y mediante el evento `storage` entre pestañas.
- Cerrar sesión limpia el almacenamiento incluso si el backend no responde.

La persistencia en `localStorage` es exclusiva del prototipo sin backend. En producción, FastAPI debe emitir una cookie `HttpOnly`, `Secure` y `SameSite` o usar un flujo OAuth/OIDC; no se debe conservar un token real de larga duración en almacenamiento accesible por JavaScript.

## Sidebar

La causa del fallo al ocultarlo era estructural: la copia de marca quedaba con `min-width: 122px` aunque su opacidad fuera cero, dentro de un sidebar colapsado a 88 px. Ese contenido podía recortar o desplazar el control que debía expandirlo.

La corrección:

- retira la copia de marca del layout de escritorio cuando está colapsado;
- conserva siempre visible y operable el botón de expansión;
- restablece la marca y navegación completas en el breakpoint móvil;
- mantiene controles de al menos 44 px, foco de teclado, `aria-expanded` y `aria-controls`;
- persiste la preferencia bajo `novu.ui.sidebar-collapsed.v1`.

## Contratos de backend preparados

`src/lib/api.ts` contiene implementaciones mock y HTTP intercambiables:

| Método | Ruta                | Propósito                              |
| ------ | ------------------- | -------------------------------------- |
| `GET`  | `/v1/overview`      | Resumen del usuario                    |
| `POST` | `/v1/auth/login`    | Inicio de sesión                       |
| `POST` | `/v1/auth/register` | Registro y documentos KYC en multipart |
| `POST` | `/v1/auth/logout`   | Cierre o revocación de sesión          |

`createFetchTransport` agrega URL base, JSON, `FormData`, autorización, errores HTTP y respuestas 204. Para conectar FastAPI se configura este transporte en lugar de `mockTransport`; los hooks y componentes mantienen su interfaz.

`createRegistrationFormData` envía `contact` como JSON y los archivos con las claves `dpiFront`, `dpiBack`, `selfie` y `proof`.

## Pruebas

- `tests/api.test.ts`: overview, rutas no implementadas, login y multipart de registro.
- `tests/session.test.ts`: persistencia, logout, expiración y preferencia del sidebar.
- `tests/setup.ts`: almacenamiento en memoria estable para el entorno jsdom de Node 24.

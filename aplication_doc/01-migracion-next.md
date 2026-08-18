# Etapa 1 — Migración del frontend a Next.js

Fecha de cierre: 17 de agosto de 2026

## Resultado

El frontend de NOVU dejó de usar Vite como arquitectura de ejecución y ahora funciona con Next.js 16, App Router, React 19 y TypeScript. Se conservaron la landing, la aplicación web, la identidad Poppins, la paleta índigo–violeta–magenta, el logo, el sidebar adaptable y todos los flujos simulados existentes.

Esta etapa sigue siendo exclusivamente frontend. No implementa backend, base de datos, persistencia de sesión, cámara real ni carga de archivos.

## Cambios de plataforma

- Se eliminó `vite.config.js`, `index.html`, `src/main.jsx` y los scripts `vite`, `vite build` y `vite preview`.
- El punto de entrada ahora es `src/app/page.tsx` y el layout global es `src/app/layout.tsx`.
- La metadata HTML se define mediante la API `Metadata` de Next.
- Los estilos globales se importan desde el layout y conservan las tres hojas existentes.
- Los assets que Vite servía desde `referencias/` se copiaron a `public/`, manteniendo sus URLs públicas.
- `App.jsx` y `NovuApp.jsx` se migraron a `LandingPage.tsx` y `NovuApp.tsx` como Client Components.
- El acceso a `window` se protege para que el prerender estático de Next no falle.

## Arquitectura resultante

```text
src/
├── app/
│   ├── layout.tsx           # layout raíz, metadata y CSS global
│   └── page.tsx             # ruta pública /
├── components/
│   ├── LandingPage.tsx      # landing y explorador de flujos
│   └── NovuApp.tsx          # prototipo web y navegación completa
├── data/
│   └── novu.ts              # snapshot estático tipado
├── hooks/
│   └── useNovuData.ts       # estado de carga/error y recarga intercambiable
├── lib/
│   └── api.ts               # contratos y transporte mock
├── types/
│   └── novu.ts              # tipos de dominio y transporte
├── styles.css
├── novu-app.css
└── web-shell.css
```

Los componentes visuales reutilizables existentes (`Brand`, `Button`, `Primary`, `AppHeader`, `Progress`, `FormScreen`, `AppNav`) se preservaron y ahora viven en TSX. No se dividió cada pantalla en un archivo independiente para evitar una reescritura riesgosa durante la migración; esa separación puede hacerse incrementalmente sin cambiar contratos.

## Datos locales, hooks y futura API

`src/data/novu.ts` contiene el resumen demo tipado: perfil, meta personal y actividad reciente. `useNovuData` inicializa la interfaz con ese snapshot y consulta `novuApi.getOverview()` mediante un contrato asíncrono. El dashboard ya consume este hook.

`src/lib/api.ts` define:

- `ApiTransport`: interfaz desacoplada del mecanismo de red.
- `mockTransport`: implementación local actual.
- `createNovuApi`: fábrica que permite inyectar otro transporte en pruebas o producción.
- `ApiError`: error con código de estado.
- Contrato inicial `GET /v1/overview`.

Cuando exista FastAPI, se deberá crear un transporte basado en `fetch` que implemente `ApiTransport` y pasarlo a `createNovuApi`. Los componentes y hooks no necesitarán conocer si los datos provienen de mocks o de HTTP.

## Scripts

```powershell
npm install
npm run dev
npm run lint
npm run typecheck
npm test
npm run build
npm run start
```

`npm run dev` inicia Next en modo desarrollo. `npm run build` genera la compilación optimizada y `npm run start` sirve esa compilación.

## Pruebas incorporadas

- `tests/api.test.ts`: valida el contrato de resumen, el aislamiento de referencias y el error explícito de rutas mock no implementadas.
- `tests/useNovuData.test.ts`: valida el snapshot inicial, la carga por el contrato API y la actividad reciente.

## Validación de cierre

Ejecutada sobre Node.js 24.19.0:

| Comando | Resultado |
| --- | --- |
| `npm run typecheck` | Correcto, sin errores |
| `npm test` | Correcto, 2 archivos y 3 pruebas |
| `npm run lint` | Correcto, 0 errores; 2 avisos no bloqueantes por el `<img>` local del logo |
| `npm run build` | Correcto; ruta `/` prerenderizada como contenido estático |

El logo conserva `<img>` para no alterar su recorte y presentación existentes durante esta migración. Los avisos `@next/next/no-img-element` son de optimización, no de funcionamiento.

## Fuera de alcance de esta etapa

- Captura real con cámara o permisos del navegador.
- Subida y previsualización de DPI, selfie o comprobante.
- Persistencia de autenticación o sesión.
- FastAPI, MongoDB o cualquier endpoint real.
- Persistencia de formularios, votos, aportes o retiros.
- Corrección funcional específica del sidebar más allá de preservar su comportamiento actual.

La siguiente etapa debe implementar captura/subida real y persistencia de sesión sobre estos contratos, antes de conectar FastAPI y MongoDB.

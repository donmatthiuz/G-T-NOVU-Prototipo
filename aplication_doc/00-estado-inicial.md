# Estado inicial del proyecto

Fecha de revisión: 17 de agosto de 2026.

## Producto

NOVU es un copiloto de ahorro para jóvenes guatemaltecos. El prototipo cubre metas personales, retos grupales, fondos familiares, verificación KYC y un copiloto con respuestas locales predeterminadas.

La fuente funcional y visual sigue siendo el archivo de Figma indicado en el README, especialmente la página `08 · NOVU · Flujo original + Presentación`. La identidad vigente usa Poppins y el gradiente índigo → violeta → magenta.

## Estado técnico encontrado

- Aplicación React construida con Vite.
- Landing page y aplicación web conviven en el mismo frontend.
- No existe backend ni base de datos.
- Los flujos se controlan mediante estado local de React.
- El dashboard web ya cuenta con navegación adaptable, vistas de metas, copiloto, ritmo, retos grupales, fondo familiar y KYC simulado.
- La captura de DPI, selfie y comprobante todavía es simulada; no consume cámara ni archivos reales.
- El inicio de sesión no está persistido.
- No existe aún una capa tipada para sustituir datos locales por API.
- No existe una suite automatizada de pruebas.

## Validación de la línea base

La línea base compila correctamente mediante `npm run build` antes de comenzar la migración.

## Próxima etapa

Migrar completamente a Next.js y TypeScript, separar componentes reutilizables, introducir hooks sobre datos estáticos, crear la abstracción `api.ts` y añadir pruebas. La etapa posterior implementará cámara, subida de archivos, persistencia local y la corrección final del sidebar.

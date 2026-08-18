# Etapa 2 — Registro con cámara y archivos reales

Fecha de cierre: 17 de agosto de 2026

## Resultado

El flujo KYC dejó de avanzar con capturas simuladas. DPI (frente y reverso), selfie y comprobante ahora aceptan archivos reales o pueden capturarse con la cámara del navegador. Cada archivo se valida y se presenta al usuario antes de marcar el paso como completo.

## Comportamiento implementado

- La cámara solicita permiso únicamente cuando el usuario pulsa el obturador.
- DPI y comprobante prefieren la cámara trasera; selfie usa la cámara frontal.
- La captura se convierte localmente en JPEG sin enviarse a ningún servicio.
- Todos los pasos de captura ofrecen carga de archivo como alternativa.
- DPI y selfie aceptan JPG, PNG o WebP.
- El comprobante también acepta PDF.
- El límite por archivo es 10 MB.
- Las vistas de revisión muestran la imagen, el nombre del archivo o el PDF seleccionado.
- Los pasos KYC sólo se completan después de aprobar la revisión; DPI exige frente y reverso.
- Los permisos denegados, navegadores sin cámara y archivos inválidos muestran un error en la misma pantalla y conservan la alternativa de carga.
- El formulario de contacto usa estado controlado y valida teléfono guatemalteco, correo, contraseña mínima y confirmación coincidente.

## Arquitectura reutilizable

- `src/hooks/useCameraCapture.ts`: ciclo de vida de `getUserMedia`, video, captura a canvas y cierre seguro de tracks.
- `src/lib/registration.ts`: reglas puras para validar archivos y datos de contacto.
- `CapturedMedia` conserva el `File`, la URL temporal de previsualización y si provino de cámara o carga.
- Las URLs temporales se revocan al reemplazar archivos o desmontar la aplicación.

La información permanece en memoria durante el flujo. Los binarios no se guardan en `localStorage`: cuando exista el backend deberán enviarse como `multipart/form-data` a almacenamiento privado mediante los contratos definidos en la etapa de API.

## Pruebas

`tests/registration.test.ts` cubre tipos admitidos, restricción del PDF, límite de 10 MB y validación de los cuatro campos de contacto.

## Restricciones del navegador

La cámara requiere `https://` o `localhost`. Si el permiso es denegado, el navegador no expone un stream y NOVU presenta la carga de archivo como alternativa funcional.

# Publicación automática desde `produ`

Un commit local no publica nada. Cada `git push origin produ` inicia dos procesos:

| Parte | Dónde se ejecuta | Comprobaciones antes de publicar |
| --- | --- | --- |
| Frontend | Integración Git de Netlify, sitio `novu-prototipo-gt` | ESLint, TypeScript, Vitest y build Next.js |
| Backend | GitHub Actions, workflow `Backend · produ` | Pytest y `/v1/health` después del despliegue en Cloud Run |

Ambos procesos son independientes. Un fallo no publica esa parte, y no revierte la otra. Los cambios entre frontend y backend deben mantener compatibilidad durante la actualización. Si hay varios pushes mientras Cloud Run se está publicando, GitHub deja terminar el despliegue en curso y conserva pendiente el más reciente.

## Secretos de GitHub

**No necesitás crear ningún secreto ni variable en GitHub para esta configuración.**

- Netlify ya tiene acceso al repositorio y su rama de producción es `produ`. La configuración está en `netlify.toml`. No se usa un token de Netlify desde GitHub Actions.
- GitHub se autentica con Google Cloud mediante Workload Identity Federation (OIDC), usando credenciales temporales. No se descarga ni guarda una clave JSON de cuenta de servicio.
- `novu-mongodb-uri` y `novu-api-gpt` permanecen en Secret Manager. La identidad de ejecución `novu-api` sigue accediendo a ellos; el workflow sólo referencia sus nombres y versiones.
- `infra/google-cloud/env.production.yaml` contiene la configuración pública y los datos de demostración. Es el archivo utilizado en CI. `env.local.yaml` permanece ignorado por Git y sólo afecta los despliegues manuales.

## Activación, una sola vez

1. Desde la raíz del repositorio, en una terminal con `gcloud` autenticado como administrador del proyecto, ejecutá:

   ```bash
   bash infra/google-cloud/setup-github-actions.sh
   ```

   El script crea la identidad `novu-github-deploy`, un pool OIDC propio de NOVU y el proveedor `produ`. Autoriza únicamente este repositorio, su propietario y el workflow de despliegue en `refs/heads/produ`, comprobando sus IDs numéricos. Le concede los permisos necesarios para publicar desde código fuente y usar las identidades existentes de compilación y ejecución. Puede volver a ejecutarse sin crear duplicados. La propagación de IAM puede tardar unos minutos.

2. En GitHub, verificá que **Settings → Actions → General** permita ejecutar workflows y usar las acciones de `actions` y `google-github-actions`. Si hay una política que las restringe, hay que habilitarlas. No se requiere dar permisos de escritura al contenido del repositorio: el workflow solicita `contents: read` e `id-token: write`.

3. Confirmá que Netlify conserve el repositorio conectado, la rama de producción `produ` y los builds activos. Estos tres valores se comprobaron al preparar esta configuración. No agregués otro workflow de Netlify: duplicaría los despliegues. No cambiés el estado a **Stopped builds**.

4. Revisá los cambios con `git diff` y agregá al commit los archivos de la automatización y las modificaciones de aplicación que quieras publicar. Incluí `.github/workflows/deploy-produ.yml`, `netlify.toml`, `infra/google-cloud/`, esta guía y los cambios del backend necesarios para Cloud Storage y el arranque. `env.local.yaml` queda excluido automáticamente. Conservá fuera del commit `.env`, credenciales, respaldos, `.venv` y archivos `__pycache__`.

5. Creá el commit y subilo a `produ`:

   ```bash
   git commit -m "Configura despliegues automáticos desde produ"
   git push origin produ
   ```

6. Revisá **GitHub → Actions → Backend · produ** y **Netlify → Deploys**. El backend debe terminar con `{"status":"ok"}`; el frontend debe publicar en `https://novu-prototipo-gt.netlify.app`. Probá el login con `diego@correo.com` / `novu2026`.

## Cambios posteriores

- **Código de frontend o backend:** commit y push a `produ`; no hace falta ejecutar las CLI de despliegue.
- **Configuración del backend:** editá `infra/google-cloud/env.production.yaml`, confirmá y subí el cambio. La app demo conserva `SEED_DEMO_DATA: "true"`.
- **Dominio del frontend:** actualizá `CORS_ORIGINS` en ese YAML.
- **Dirección del backend:** actualizá `NEXT_PUBLIC_API_URL` en `netlify.toml`. El valor es público y no lleva `/v1`.
- **Nueva versión de un secreto:** indicá `GCP_MONGODB_SECRET` o `GCP_OPENAI_SECRET` en `env` del workflow, por ejemplo `novu-api-gpt:2`. No copies el valor secreto al repositorio.

Fuentes: [Google: autenticación de GitHub Actions](https://github.com/google-github-actions/auth), [permisos de despliegue desde código fuente](https://docs.cloud.google.com/run/docs/deploying-source-code), [configuración de Netlify por archivo](https://docs.netlify.com/build/configure-builds/file-based-configuration/) y [control de builds en Netlify](https://docs.netlify.com/build/configure-builds/ignore-builds/).

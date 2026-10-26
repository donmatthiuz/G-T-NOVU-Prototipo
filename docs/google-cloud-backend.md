# Backend en Google Cloud, MongoDB Atlas y frontend en Netlify

La aplicación queda distribuida así:

| Componente | Alojamiento | Conexión |
| --- | --- | --- |
| Frontend Next.js existente | Netlify | `NEXT_PUBLIC_API_URL=https://…run.app` |
| API FastAPI de `backend/` | Google Cloud Run | Endpoints `/v1/*` por HTTPS |
| Base de datos `novu` | MongoDB Atlas | `MONGODB_URI` mediante Secret Manager |
| DPI, selfie y comprobantes | Bucket privado de Cloud Storage | `KYC_GCS_BUCKET`, identidad de Cloud Run |
| Clave del Copiloto | Secret Manager | Se inyecta como `API_GPT` sólo en FastAPI |

El navegador habla directamente con Cloud Run. La API conserva su autenticación Bearer y restringe los orígenes mediante CORS. El frontend ya usa `NEXT_PUBLIC_API_URL` en `src/lib/api.ts`, por lo que este cambio no requiere modificar pantallas ni crear un proxy en Netlify.

## 1. Preparar Google Cloud

Usá una terminal **Bash**, Google Cloud CLI instalada y una cuenta con permisos para crear recursos e identidades en el proyecto. También podés usar Cloud Shell con este repositorio clonado. Activá la facturación del proyecto. Los comandos de creación se ejecutan una vez; si ya existe un recurso, reutilizalo.

Desde la raíz del repositorio:

```bash
gcloud auth login
export GCP_PROJECT_ID="TU_ID_DE_PROYECTO"
export GCP_REGION="us-central1"
export KYC_BUCKET="${GCP_PROJECT_ID}-novu-kyc"
gcloud config set project "$GCP_PROJECT_ID"

gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  storage.googleapis.com \
  compute.googleapis.com

gcloud iam service-accounts create novu-api \
  --display-name="NOVU API - Cloud Run"

export RUNTIME_ACCOUNT="novu-api@${GCP_PROJECT_ID}.iam.gserviceaccount.com"
export PROJECT_NUMBER="$(gcloud projects describe "$GCP_PROJECT_ID" --format='value(projectNumber)')"

gcloud projects add-iam-policy-binding "$GCP_PROJECT_ID" \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role=roles/run.builder
```

El último permiso corresponde a la cuenta de compilación predeterminada de Cloud Build, separada de `novu-api`, que ejecutará la aplicación. Si tu organización usa otra cuenta de build, asignale `roles/run.builder` a esa identidad y adaptá el despliegue con `--build-service-account`.

Para despliegues posteriores, la cuenta que despliega necesita `roles/run.sourceDeveloper`, `roles/serviceusage.serviceUsageConsumer` y `roles/iam.serviceAccountUser` sobre la identidad de ejecución. Hacer pública la API requiere además permisos para cambiar su política IAM; el primer despliegue puede hacerlo el administrador del proyecto. Las políticas de una organización pueden restringir el acceso público. Referencia: [despliegue desde código fuente y permisos](https://docs.cloud.google.com/run/docs/deploying-source-code).

## 2. Preparar una IP fija para conectar Atlas

Atlas necesita autorizar la IP de salida de la API. Esta configuración usa Direct VPC egress y Cloud NAT para que esa IP sea estable; no necesitás habilitar acceso desde cualquier IP en Atlas.

```bash
gcloud compute networks create novu-network --subnet-mode=custom

gcloud compute networks subnets create novu-cloud-run \
  --network=novu-network \
  --region="$GCP_REGION" \
  --range=10.20.0.0/26

gcloud compute routers create novu-router \
  --network=novu-network \
  --region="$GCP_REGION"

gcloud compute addresses create novu-egress --region="$GCP_REGION"

gcloud compute routers nats create novu-nat \
  --router=novu-router \
  --region="$GCP_REGION" \
  --nat-custom-subnet-ip-ranges=novu-cloud-run \
  --nat-external-ip-pool=novu-egress

gcloud compute addresses describe novu-egress \
  --region="$GCP_REGION" --format='value(address)'
```

Copiá la IP del último comando. La subred `/26` debe estar libre en tu red. El script de despliegue ya envía todo el tráfico de salida por esta VPC y NAT. Mantené la misma región para subred, NAT y Cloud Run. Cloud NAT y la IP reservada tienen costos propios, incluso cuando la API no recibe solicitudes. Referencia: [IP de salida estática en Cloud Run](https://docs.cloud.google.com/run/docs/configuring/static-outbound-ip).

## 3. Crear MongoDB Atlas y obtener su URI

1. En [MongoDB Atlas](https://cloud.mongodb.com/), creá un proyecto y un cluster compatible con transacciones. Podés elegir Google Cloud y una región cercana a Cloud Run.
2. En **Security → Database & Network Access**, creá un **usuario de base de datos** para NOVU con contraseña. Es distinto de la cuenta con la que iniciás sesión en Atlas.
3. Asignale `readWrite` y `dbAdmin` sólo sobre la base `novu`. La API crea índices y validadores al iniciar y usa `collMod` en arranques posteriores; por eso sólo `readWrite` es insuficiente para esta implementación.
4. En la lista de acceso de red, agregá la IP de `novu-egress` como una entrada `/32`.
5. Si vas a migrar o probar desde tu computadora o Cloud Shell, agregá también su IP pública temporalmente. Retirala cuando termines. La IP del frontend de Netlify no necesita acceso a MongoDB.
6. En **Connect → Drivers → Python**, copiá la URI SRV y completá el usuario, contraseña y base:

```text
mongodb+srv://novu_api:CONTRASENA_CODIFICADA@TU_CLUSTER.mongodb.net/novu?retryWrites=true&w=majority&authSource=admin
```

Codificá los caracteres especiales del usuario y contraseña con percent encoding, por ejemplo `@` → `%40`. Conservá TLS y los hosts indicados por Atlas. No agregues `directConnection=true` ni `replicaSet=rs0`: esas opciones pertenecen al MongoDB local del entorno de desarrollo. PyMongo ya incluye la dependencia DNS necesaria para `mongodb+srv://`.

La base y las colecciones se crean al iniciar la API con los permisos indicados. `MONGODB_DATABASE` debe coincidir con `novu`. Si ya tenés datos, realizá la migración del siguiente apartado antes de arrancar el nuevo backend. Referencias: [conectar a Atlas](https://www.mongodb.com/docs/atlas/connect-to-database-deployment/), [usuarios de base de datos](https://www.mongodb.com/docs/atlas/security-add-mongodb-users/), [soporte de collMod](https://www.mongodb.com/docs/manual/reference/command/collmod/).

## 4. Trasladar los datos existentes, si querés conservarlos

Cambiar la URI no traslada automáticamente los datos. Si vas a empezar con una base vacía, podés pasar al apartado 5.

Instalá [MongoDB Database Tools](https://www.mongodb.com/docs/database-tools/installation/), usá una base destino vacía y detené las escrituras en la API anterior durante la copia final. Conservá un respaldo recuperable hasta validar el cambio.

Estos comandos solicitan las URIs sin dejarlas escritas en el historial de Bash:

```bash
mkdir -p backups
chmod 700 backups
read -r -s -p 'URI MongoDB de origen: ' SOURCE_MONGODB_URI
printf '\n'
read -r -s -p 'URI MongoDB Atlas de destino: ' ATLAS_MONGODB_URI
printf '\n'

mongodump --uri="$SOURCE_MONGODB_URI" --db=novu \
  --archive=backups/novu.archive.gz --gzip

mongorestore --uri="$ATLAS_MONGODB_URI" \
  --archive=backups/novu.archive.gz --gzip \
  --nsInclude='novu.*' --stopOnError

unset SOURCE_MONGODB_URI ATLAS_MONGODB_URI
```

Si la base de origen tiene otro nombre, ajustá `--db`, cambiá el filtro a `--nsInclude='NOMBRE_ORIGEN.*'` y usá `--nsFrom='NOMBRE_ORIGEN.*' --nsTo='novu.*'` al restaurar. No mezcles esta restauración con una base ya poblada: puede haber conflictos de claves e índices. Compará las cantidades de documentos por colección en origen y destino y verificá usuarios, metas, aportes y conversaciones. Los archivos KYC no están dentro de MongoDB; se trasladan por separado en el apartado 5. Referencias: [mongodump](https://www.mongodb.com/docs/database-tools/mongodump/), [mongorestore](https://www.mongodb.com/docs/database-tools/mongorestore/).

## 5. Crear el almacenamiento privado para documentos

```bash
gcloud storage buckets create "gs://$KYC_BUCKET" \
  --location="$GCP_REGION" \
  --uniform-bucket-level-access \
  --public-access-prevention

gcloud storage buckets add-iam-policy-binding "gs://$KYC_BUCKET" \
  --member="serviceAccount:$RUNTIME_ACCOUNT" \
  --role=roles/storage.objectUser
```

El backend usa las credenciales de su identidad de Cloud Run automáticamente; no necesitás descargar una clave JSON. El bucket permanece privado y no requiere CORS para el navegador, porque los archivos los sube FastAPI. Referencia: [autenticación de servicios en Cloud Run](https://docs.cloud.google.com/run/docs/securing/service-identity).

Si tenés archivos anteriores, exportá el contenido de su directorio configurado como `KYC_STORAGE_PATH`. El objeto de destino debe conservar exactamente el valor de `media_assets.storage_key`, por ejemplo `kyc/ID_USUARIO/archivo.jpg`:

```bash
# Suponiendo que backups/kyc-data contiene la carpeta interna kyc/ exportada.
gcloud storage rsync --recursive backups/kyc-data "gs://$KYC_BUCKET"
```

No dupliqués el prefijo `kyc/`. Para las filas migradas, actualizá `storage_provider` a `gcs` y `storage_bucket` al nombre del bucket después de verificar los objetos; `storage_key` conserva su valor. Estos dos campos son metadatos informativos y no cambian la estructura de las claves.

Cloud Run tiene un sistema de archivos efímero. La configuración ahora impide arrancar allí sin `KYC_GCS_BUCKET`, evitando guardar documentos en un disco que se pierde al reiniciar. Localmente, dejar esa variable vacía conserva el volumen Docker existente. Referencia: [contrato del contenedor](https://docs.cloud.google.com/run/docs/container-contract).

## 6. Guardar secretos del backend

En **Google Cloud → Secret Manager**, creá los siguientes secretos, cada uno inicialmente con la versión `1`:

| Nombre del secreto | Valor | Variable que recibe FastAPI |
| --- | --- | --- |
| `novu-mongodb-uri` | URI completa de Atlas del apartado 3 | `MONGODB_URI` |
| `novu-api-gpt` | Tu clave actual del Copiloto | `API_GPT` |

Ingresá los valores sin comillas ni saltos de línea. Después otorgá acceso a la identidad de la API:

```bash
gcloud secrets add-iam-policy-binding novu-mongodb-uri \
  --member="serviceAccount:$RUNTIME_ACCOUNT" \
  --role=roles/secretmanager.secretAccessor

gcloud secrets add-iam-policy-binding novu-api-gpt \
  --member="serviceAccount:$RUNTIME_ACCOUNT" \
  --role=roles/secretmanager.secretAccessor
```

No coloqués estos valores en Netlify, en variables `NEXT_PUBLIC_*`, en YAML versionado ni en el Dockerfile. El script referencia versiones concretas de los secretos. Cuando creés otra versión, indicá por ejemplo `GCP_MONGODB_SECRET=novu-mongodb-uri:2` o `GCP_OPENAI_SECRET=novu-api-gpt:2` al desplegar. Referencia: [secretos en Cloud Run](https://docs.cloud.google.com/run/docs/configuring/services/secrets).

## 7. Configurar y desplegar sólo FastAPI

```bash
cp infra/google-cloud/env.example.yaml infra/google-cloud/env.local.yaml
```

Editá `infra/google-cloud/env.local.yaml`:

```yaml
ENVIRONMENT: "production"
MONGODB_DATABASE: "novu"
API_PREFIX: "/v1"
CORS_ORIGINS: "https://novu-prototipo-gt.netlify.app"
KYC_GCS_BUCKET: "TU_ID_DE_PROYECTO-novu-kyc"
SEED_DEMO_DATA: "false"
OPENAI_MODEL: "gpt-5-mini"
OPENAI_MAX_OUTPUT_TOKENS: "1600"
```

Usá el nombre real del bucket, sin `gs://`. En `CORS_ORIGINS`, agregá los orígenes exactos desde donde vas a entrar: protocolo y dominio, sin ruta ni `/` final. Para varios dominios, separalos por comas dentro del mismo valor. Si tenés dominio personalizado, agregalo además del dominio de Netlify. Los Deploy Previews necesitan su origen explícito; no se habilitan con un asterisco en el nombre.

`SEED_DEMO_DATA=false` conserva los datos migrados y evita crear el usuario demo de contraseña conocida. Si querés una demostración con datos ficticios en una base separada, podés usar `true`; creará `diego@correo.com` / `novu2026`. Volver a `false` no borra los datos demo ya creados.

Desplegá:

```bash
bash infra/google-cloud/deploy.sh
```

El script lee `GCP_PROJECT_ID` y `GCP_REGION` de los pasos anteriores. Compila únicamente `backend/`, configura la identidad, secretos y salida por NAT, espera a que responda `/v1/health` y muestra la URL que debés poner en Netlify. El puerto lo proporciona Cloud Run mediante `PORT`; el contenedor también conserva el puerto local `8000` como valor predeterminado.

La API se publica por HTTPS para que pueda invocarla el navegador. Los endpoints de datos siguen exigiendo la sesión de la aplicación; no se requiere una cuenta Google para iniciar sesión en NOVU. `/docs` de FastAPI se desactiva en producción. El `docs/` de este repositorio contiene esta guía.

Opciones disponibles si cambiaste nombres o versiones:

| Variable del script | Valor predeterminado |
| --- | --- |
| `GCP_SERVICE` | `novu-api` |
| `GCP_RUNTIME_ACCOUNT` | `novu-api@PROYECTO.iam.gserviceaccount.com` |
| `GCP_NETWORK` | `novu-network` |
| `GCP_SUBNET` | `novu-cloud-run` |
| `GCP_ENV_FILE` | `infra/google-cloud/env.local.yaml` |
| `GCP_MONGODB_SECRET` | `novu-mongodb-uri:1` |
| `GCP_OPENAI_SECRET` | `novu-api-gpt:1` |

El despliegue usa hasta 3 instancias, 512 MiB por instancia y 8 solicitudes simultáneas por instancia. Ajustá estos límites según carga y conexiones de tu plan de Atlas. El timeout de solicitud es de 120 segundos. Los uploads siguen limitados a 10 MiB por archivo; en Cloud Run con HTTP/1 el multipart completo también debe caber en el límite de 32 MiB por solicitud.

## 8. Cambiar Netlify para usar el backend nuevo

En tu sitio existente de Netlify:

1. Abrí **Project configuration → Environment variables**.
2. Creá o editá **`NEXT_PUBLIC_API_URL`**.
3. Poné la URL de Cloud Run que imprimió el script, por ejemplo **`https://novu-api-XXXXXXXXXX-uc.a.run.app`**. Copiala de tu servicio; el ejemplo no es una URL real.
4. Usá el contexto **Production** y asegurate de que el alcance incluya **Builds**, si tu plan permite elegir alcances. Para previews configurá también su contexto y el CORS correspondiente.
5. Guardá y ejecutá **Deploys → Trigger deploy → Deploy project**. Si seguís viendo la URL vieja, volvé a desplegar limpiando la caché.

**No agregues `/v1` a `NEXT_PUBLIC_API_URL`**: la app ya lo agrega a cada endpoint. No uses `localhost`, la URL del frontend ni `/docs`.

Next.js incorpora las variables `NEXT_PUBLIC_*` al JavaScript durante `next build`. Guardar la variable sin reconstruir el sitio deja la URL anterior en los navegadores. La variable es pública y sólo contiene la dirección del servidor. Referencia: [variables de frameworks en Netlify](https://docs.netlify.com/build/frameworks/use-environment-variables-with-frameworks/).

Conservá la configuración de compilación que ya funciona en Netlify (`npm run build`, directorio base raíz y su integración Next.js). No necesitás mover el frontend ni cambiar DNS, redirects o rewrites para esta conexión directa. Eliminá cualquier variable antigua del proveedor anterior y cualquier copia de `API_GPT`, `MONGODB_URI` o credenciales del backend que hubieras configurado allí.

## 9. Verificar el recorrido completo

```bash
export BACKEND_URL="$(gcloud run services describe novu-api \
  --region="$GCP_REGION" --format='value(status.url)')"

curl --fail "$BACKEND_URL/v1/health"

curl -i -X OPTIONS "$BACKEND_URL/v1/auth/login" \
  -H 'Origin: https://novu-prototipo-gt.netlify.app' \
  -H 'Access-Control-Request-Method: POST' \
  -H 'Access-Control-Request-Headers: authorization,content-type'
```

Esperá `{"status":"ok"}` y en la segunda respuesta `access-control-allow-origin` con el dominio de tu frontend. Si tu dominio es otro, reemplazalo también en este comando.

En Netlify, abrí la app y verificá en **DevTools → Network** que login, overview, aportes y Copiloto apunten a `https://…run.app/v1/...`. Iniciá sesión con un usuario migrado, registrá un usuario de prueba con archivos ficticios y revisá que sus cuatro objetos existan en el bucket privado y sus filas en Atlas. Después desplegá otra revisión y comprobá que los objetos y datos sigan disponibles.

| Síntoma | Qué revisar |
| --- | --- |
| La app llama a `localhost:8000` o a la URL anterior | Variable de Netlify, contexto de Production y nuevo build |
| Respuesta 404 con `/v1/v1/...` | Quitá `/v1` del valor de `NEXT_PUBLIC_API_URL` |
| Error CORS | Dominio exacto del navegador en `CORS_ORIGINS`; redeploy del backend |
| 401 al iniciar después de cambiar servidor | Cerrá sesión y volvé a entrar; una sesión de otra base no existe en Atlas |
| Cloud Run no inicia o falla health | URI SRV, contraseña codificada, IP NAT autorizada en Atlas y salida `all-traffic` |
| `not authorized` / `collMod` | Roles `readWrite` y `dbAdmin` sobre `novu` |
| Registro falla con 403 de Storage | Bucket real y rol `storage.objectUser` sobre ese bucket |
| Copiloto falla | Acceso a `novu-api-gpt`, versión elegida del secreto y conectividad saliente |
| HTTP 413 al registrar | Tamaño por archivo y del multipart completo |

Consultá los logs del backend:

```bash
gcloud run services logs read novu-api --region="$GCP_REGION" --limit=100
```

## 10. Retirar el alojamiento anterior

Una vez validados los datos, archivos y el frontend contra Cloud Run:

1. Eliminá del proveedor anterior el servicio de API, el servicio MongoDB y sus volúmenes, conservando primero un respaldo comprobado.
2. Desactivá sus despliegues automáticos, webhooks e integraciones del repositorio.
3. Eliminá sus variables, tokens y credenciales de Netlify, del entorno local y de los secretos de CI. Revocá las credenciales que ya no se utilicen.
4. Quitá en Atlas el acceso temporal de la computadora usada para migrar y dejá autorizada la IP de NAT.
5. Verificá que no queden recursos facturándose en el alojamiento anterior.

Este cambio de código no elimina servicios de cuentas externas. El entorno local con Docker Compose sigue disponible para desarrollo: su MongoDB es local y no depende de ningún alojamiento remoto.

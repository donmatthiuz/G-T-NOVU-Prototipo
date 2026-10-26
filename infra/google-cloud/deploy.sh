#!/usr/bin/env bash
# Ejecutar desde cualquier directorio; consultar docs/google-cloud-backend.md.
set -euo pipefail

: "${GCP_PROJECT_ID:?Definí GCP_PROJECT_ID con el ID del proyecto de Google Cloud.}"

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "$SCRIPT_DIR/../.." && pwd)"
REGION="${GCP_REGION:-us-central1}"
SERVICE="${GCP_SERVICE:-novu-api}"
RUNTIME_ACCOUNT="${GCP_RUNTIME_ACCOUNT:-novu-api@$GCP_PROJECT_ID.iam.gserviceaccount.com}"
ENV_FILE="${GCP_ENV_FILE:-$SCRIPT_DIR/env.local.yaml}"
NETWORK="${GCP_NETWORK:-novu-network}"
SUBNET="${GCP_SUBNET:-novu-cloud-run}"
MONGODB_SECRET="${GCP_MONGODB_SECRET:-novu-mongodb-uri:1}"
OPENAI_SECRET="${GCP_OPENAI_SECRET:-novu-api-gpt:1}"

command -v gcloud >/dev/null || { echo "Instalá Google Cloud CLI o usá Cloud Shell." >&2; exit 1; }
if [[ ! -f "$ENV_FILE" ]]; then
  echo "Copiá infra/google-cloud/env.example.yaml a env.local.yaml y completá los valores." >&2
  exit 1
fi
if grep -q 'REEMPLAZAR_' "$ENV_FILE"; then
  echo "Reemplazá los valores pendientes en $ENV_FILE antes de desplegar." >&2
  exit 1
fi

# El primer despliegue manual hace público el servicio. CI conserva ese IAM.
ACCESS_FLAGS=()
if [[ "${GCP_MANAGE_PUBLIC_ACCESS:-true}" == "true" ]]; then
  ACCESS_FLAGS+=(--allow-unauthenticated)
fi

# El contexto contiene únicamente FastAPI. Cloud Build usa backend/Dockerfile.
gcloud run deploy "$SERVICE" \
  --project="$GCP_PROJECT_ID" \
  --region="$REGION" \
  --source="$REPO_ROOT/backend" \
  --service-account="$RUNTIME_ACCOUNT" \
  --env-vars-file="$ENV_FILE" \
  --update-secrets="MONGODB_URI=$MONGODB_SECRET,API_GPT=$OPENAI_SECRET" \
  --network="$NETWORK" \
  --subnet="$SUBNET" \
  --vpc-egress=all-traffic \
  --port=8080 \
  --cpu=1 \
  --memory=512Mi \
  --concurrency=8 \
  --min-instances=0 \
  --max-instances=3 \
  --timeout=120 \
  --ingress=all \
  "${ACCESS_FLAGS[@]}" \
  --startup-probe='httpGet.path=/v1/health,httpGet.port=8080,periodSeconds=10,timeoutSeconds=5,failureThreshold=24' \
  --quiet

BACKEND_URL="$(gcloud run services describe "$SERVICE" \
  --project="$GCP_PROJECT_ID" --region="$REGION" --format='value(status.url)')"
curl --fail --silent --show-error "$BACKEND_URL/v1/health"
printf '\nNetlify → NEXT_PUBLIC_API_URL=%s\nVolvé a compilar el frontend para aplicar la URL.\n' "$BACKEND_URL"

#!/usr/bin/env bash
# Preparación única: ejecutar con la cuenta administradora del proyecto.
# No genera claves JSON, no cambia el servicio y no publica código.
set -euo pipefail

command -v gcloud >/dev/null || { echo "Cargá Google Cloud CLI antes de continuar." >&2; exit 1; }

PROJECT_ID="adfasdfasfd-1899a"
REPOSITORY="donmatthiuz/G-T-NOVU-Prototipo"
REPOSITORY_ID="1333881924"
OWNER_ID="97419979"
POOL="novu-github"
PROVIDER="produ"
DEPLOY_ACCOUNT="novu-github-deploy@${PROJECT_ID}.iam.gserviceaccount.com"
RUNTIME_ACCOUNT="novu-api@${PROJECT_ID}.iam.gserviceaccount.com"
PROJECT_NUMBER="$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')"
BUILD_ACCOUNT="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

gcloud services enable iam.googleapis.com iamcredentials.googleapis.com sts.googleapis.com \
  --project="$PROJECT_ID" --quiet

if ! gcloud iam service-accounts describe "$DEPLOY_ACCOUNT" --project="$PROJECT_ID" >/dev/null 2>&1; then
  gcloud iam service-accounts create novu-github-deploy --project="$PROJECT_ID" \
    --display-name="NOVU - deploy de GitHub Actions" --quiet
fi

if ! gcloud iam workload-identity-pools describe "$POOL" \
  --project="$PROJECT_ID" --location=global >/dev/null 2>&1; then
  gcloud iam workload-identity-pools create "$POOL" --project="$PROJECT_ID" \
    --location=global --display-name="NOVU GitHub Actions" --quiet
fi

# IDs numéricos impiden que otra cuenta o un repositorio renombrado reutilicen el acceso.
# El workflow autorizado debe proceder exactamente de produ en este repositorio.
MAPPING="google.subject=assertion.sub,attribute.repository_id=assertion.repository_id,attribute.repository_owner_id=assertion.repository_owner_id,attribute.ref=assertion.ref,attribute.workflow_ref=assertion.workflow_ref"
CONDITION="assertion.repository_id == '${REPOSITORY_ID}' && assertion.repository_owner_id == '${OWNER_ID}' && assertion.ref == 'refs/heads/produ' && assertion.workflow_ref == '${REPOSITORY}/.github/workflows/deploy-produ.yml@refs/heads/produ'"

PROVIDER_COMMAND=create-oidc
if gcloud iam workload-identity-pools providers describe "$PROVIDER" \
  --project="$PROJECT_ID" --location=global --workload-identity-pool="$POOL" >/dev/null 2>&1; then
  PROVIDER_COMMAND=update-oidc
fi
gcloud iam workload-identity-pools providers "$PROVIDER_COMMAND" "$PROVIDER" \
  --project="$PROJECT_ID" --location=global --workload-identity-pool="$POOL" \
  --display-name="NOVU produ" --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-mapping="$MAPPING" --attribute-condition="$CONDITION" --quiet

gcloud iam service-accounts add-iam-policy-binding "$DEPLOY_ACCOUNT" \
  --project="$PROJECT_ID" --role=roles/iam.workloadIdentityUser \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL}/attribute.repository_id/${REPOSITORY_ID}" \
  --quiet >/dev/null

for role in roles/run.sourceDeveloper roles/serviceusage.serviceUsageConsumer; do
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:$DEPLOY_ACCOUNT" --role="$role" --condition=None --quiet >/dev/null
done

# Se permite usar sólo las identidades existentes de ejecución y compilación.
for account in "$RUNTIME_ACCOUNT" "$BUILD_ACCOUNT"; do
  gcloud iam service-accounts add-iam-policy-binding "$account" --project="$PROJECT_ID" \
    --member="serviceAccount:$DEPLOY_ACCOUNT" --role=roles/iam.serviceAccountUser --quiet >/dev/null
done

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$BUILD_ACCOUNT" --role=roles/run.builder \
  --condition=None --quiet >/dev/null

printf '\nGitHub Actions configurado para %s, rama produ.\n' "$REPOSITORY"
printf 'No necesitás crear secretos ni claves JSON en GitHub.\n'
printf 'La propagación de permisos puede tardar unos minutos.\n'

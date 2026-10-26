"""Archivos KYC privados: disco en desarrollo y Cloud Storage en Google Cloud."""

import asyncio
import logging
from functools import lru_cache
from pathlib import Path
from typing import Protocol

from google.api_core.exceptions import NotFound
from google.cloud import storage

from app.core.config import Settings


logger = logging.getLogger(__name__)


class KycStorage(Protocol):
    async def save(self, key: str, content: bytes, content_type: str) -> None: ...

    async def delete(self, key: str) -> None: ...


class LocalKycStorage:
    def __init__(self, root: Path) -> None:
        self.root = root

    async def save(self, key: str, content: bytes, content_type: str) -> None:
        def write() -> None:
            target = self.root / key
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(content)

        await asyncio.to_thread(write)

    async def delete(self, key: str) -> None:
        await asyncio.to_thread((self.root / key).unlink, missing_ok=True)


@lru_cache
def get_gcs_bucket(name: str) -> storage.Bucket:
    # Application Default Credentials: la identidad de Cloud Run, sin claves JSON.
    return storage.Client().bucket(name)


class GcsKycStorage:
    def __init__(self, bucket_name: str) -> None:
        self.bucket_name = bucket_name

    async def save(self, key: str, content: bytes, content_type: str) -> None:
        def upload() -> None:
            blob = get_gcs_bucket(self.bucket_name).blob(key)
            blob.upload_from_string(
                content,
                content_type=content_type,
                if_generation_match=0,
                timeout=30,
            )

        await asyncio.to_thread(upload)

    async def delete(self, key: str) -> None:
        def remove() -> None:
            try:
                get_gcs_bucket(self.bucket_name).blob(key).delete(timeout=30)
            except NotFound:
                pass

        await asyncio.to_thread(remove)


def create_kyc_storage(settings: Settings) -> KycStorage:
    if settings.kyc_gcs_bucket:
        return GcsKycStorage(settings.kyc_gcs_bucket)
    return LocalKycStorage(settings.kyc_storage_path)


async def cleanup_uploads(storage_backend: KycStorage, keys: list[str]) -> None:
    for key in keys:
        try:
            await storage_backend.delete(key)
        except Exception:
            # Intentá todos los archivos sin ocultar el error original del registro.
            logger.exception("No se pudo limpiar el archivo KYC %s", key)

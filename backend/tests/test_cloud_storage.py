import io
import json
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi import HTTPException, UploadFile
from google.api_core.exceptions import NotFound
from pydantic import ValidationError
from pymongo.errors import DuplicateKeyError
from starlette.datastructures import Headers

from app.core.config import Settings
from app.services import auth
from app.services.kyc_storage import GcsKycStorage, LocalKycStorage, cleanup_uploads


def test_cloud_run_rejects_ephemeral_kyc_storage(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("K_SERVICE", "novu-api")
    with pytest.raises(ValidationError, match="KYC_GCS_BUCKET"):
        Settings(_env_file=None, kyc_gcs_bucket=None)
    assert Settings(_env_file=None, kyc_gcs_bucket="private-kyc").kyc_gcs_bucket == "private-kyc"


@pytest.mark.asyncio
async def test_local_storage_keeps_existing_key_layout(tmp_path: Path) -> None:
    storage = LocalKycStorage(tmp_path)
    key = "kyc/user/document.jpg"
    await storage.save(key, b"image", "image/jpeg")
    assert (tmp_path / key).read_bytes() == b"image"
    await storage.delete(key)
    await storage.delete(key)
    assert not (tmp_path / key).exists()


@pytest.mark.asyncio
async def test_gcs_preserves_key_and_mime_without_public_acl(monkeypatch: pytest.MonkeyPatch) -> None:
    bucket = MagicMock()
    get_bucket = MagicMock(return_value=bucket)
    monkeypatch.setattr("app.services.kyc_storage.get_gcs_bucket", get_bucket)
    storage = GcsKycStorage("private-kyc")

    await storage.save("kyc/user/document.pdf", b"pdf", "application/pdf")

    get_bucket.assert_called_once_with("private-kyc")
    bucket.blob.assert_called_once_with("kyc/user/document.pdf")
    bucket.blob.return_value.upload_from_string.assert_called_once_with(
        b"pdf", content_type="application/pdf", if_generation_match=0, timeout=30
    )


@pytest.mark.asyncio
async def test_gcs_delete_accepts_missing_object(monkeypatch: pytest.MonkeyPatch) -> None:
    bucket = MagicMock()
    bucket.blob.return_value.delete.side_effect = NotFound("missing")
    monkeypatch.setattr("app.services.kyc_storage.get_gcs_bucket", lambda _: bucket)
    await GcsKycStorage("private-kyc").delete("kyc/user/missing.jpg")


@pytest.mark.asyncio
async def test_cleanup_attempts_all_objects_when_one_delete_fails() -> None:
    storage = MagicMock()
    storage.delete = AsyncMock(side_effect=[RuntimeError("storage unavailable"), None])
    await cleanup_uploads(storage, ["first", "second"])
    assert [call.args[0] for call in storage.delete.await_args_list] == ["first", "second"]


class FakeSession:
    async def __aenter__(self):
        return self

    async def __aexit__(self, *_):
        return False

    async def start_transaction(self):
        return self


@pytest.mark.asyncio
@pytest.mark.parametrize("failure", [None, "duplicate", "upload"])
async def test_registration_persists_cloud_metadata_or_cleans_up(
    monkeypatch: pytest.MonkeyPatch, failure: str | None
) -> None:
    settings = Settings(_env_file=None, kyc_gcs_bucket="private-kyc")
    storage = MagicMock()
    storage.save = AsyncMock()
    storage.delete = AsyncMock()
    if failure == "upload":
        storage.save.side_effect = [None, RuntimeError("storage unavailable")]
    monkeypatch.setattr(auth, "create_kyc_storage", lambda _: storage)
    create_session = AsyncMock(return_value="session-result")
    monkeypatch.setattr(auth, "create_session", create_session)
    monkeypatch.setattr(auth, "hash_password", lambda _: "hashed")
    database = MagicMock()
    database.client.start_session = MagicMock(return_value=FakeSession())
    for name in ["users", "savings_profiles", "kyc_cases", "audit_events"]:
        getattr(database, name).insert_one = AsyncMock()
    database.media_assets.insert_many = AsyncMock()
    if failure == "duplicate":
        database.users.insert_one.side_effect = DuplicateKeyError("email exists")
    uploads = {
        slot: UploadFile(
            io.BytesIO(b"image"),
            filename=f"{slot}.jpg",
            headers=Headers({"content-type": "image/jpeg"}),
        )
        for slot in ["dpiFront", "dpiBack", "selfie", "proof"]
    }
    args = (
        database,
        settings,
        json.dumps({"email": "test@example.com", "phone": "55123456", "password": "password123"}),
        json.dumps({
            "incomePattern": "variable",
            "variableIncomeFrequency": "irregular",
            "safeMonthlySavingsMinor": 25000,
        }),
        uploads,
        None,
        None,
    )

    if failure:
        with pytest.raises(HTTPException if failure == "duplicate" else RuntimeError) as error:
            await auth.register(*args)
        if failure == "duplicate":
            assert error.value.status_code == 409
        saved_keys = [call.args[0] for call in storage.save.await_args_list]
        if failure == "upload":
            saved_keys = saved_keys[:1]
        assert [call.args[0] for call in storage.delete.await_args_list] == saved_keys
        create_session.assert_not_awaited()
    else:
        assert await auth.register(*args) == "session-result"
        assets = database.media_assets.insert_many.await_args.args[0]
        assert len(assets) == 4
        assert all(asset["storage_provider"] == "gcs" for asset in assets)
        assert all(asset["storage_bucket"] == "private-kyc" for asset in assets)
        assert [asset["storage_key"] for asset in assets] == [
            call.args[0] for call in storage.save.await_args_list
        ]
        storage.delete.assert_not_awaited()

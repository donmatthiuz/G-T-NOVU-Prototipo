import json
import re
from datetime import UTC, datetime
from hashlib import sha256
from pathlib import Path
from typing import Any
from uuid import uuid4

from bson import Int64, ObjectId
from fastapi import HTTPException, UploadFile, status
from pymongo import ASCENDING
from pymongo.asynchronous.database import AsyncDatabase
from pymongo.errors import DuplicateKeyError

from app.core.config import Settings
from app.core.security import hash_ip, hash_password, issue_session_token, verify_password
from app.schemas.api import (
    AuthSessionResponse,
    LoginRequest,
    RegistrationContact,
    SavingsCapacity,
    UserProfileResponse,
)


ALLOWED_UPLOAD_TYPES = {
    "dpiFront": {"image/jpeg", "image/png", "image/webp"},
    "dpiBack": {"image/jpeg", "image/png", "image/webp"},
    "selfie": {"image/jpeg", "image/png", "image/webp"},
    "proof": {"image/jpeg", "image/png", "image/webp", "application/pdf"},
}


def normalize_phone(value: str) -> str:
    digits = re.sub(r"\D", "", value)
    if len(digits) == 8:
        digits = f"502{digits}"
    if len(digits) != 11 or not digits.startswith("502"):
        raise HTTPException(status_code=422, detail="Ingresá un teléfono válido de Guatemala.")
    return f"+{digits}"


def public_profile(user: dict[str, Any]) -> UserProfileResponse:
    profile = user.get("profile", {})
    first_name = profile.get("first_name", "Persona")
    last_name = profile.get("last_name", "")
    return UserProfileResponse(
        id=str(user["_id"]),
        first_name=first_name,
        full_name=f"{first_name} {last_name}".strip(),
        email=user["email"],
    )


async def create_session(
    database: AsyncDatabase[dict[str, Any]],
    settings: Settings,
    user: dict[str, Any],
    user_agent: str | None,
    ip: str | None,
) -> AuthSessionResponse:
    token, token_hash, expires_at = issue_session_token(settings.session_hours)
    now = datetime.now(UTC)
    await database.auth_sessions.insert_one(
        {
            "user_id": user["_id"],
            "access_token_hash": token_hash,
            "device": {"user_agent": (user_agent or "")[:300], "ip_hash": hash_ip(ip)},
            "created_at": now,
            "expires_at": expires_at,
            "revoked_at": None,
        }
    )
    await database.users.update_one({"_id": user["_id"]}, {"$set": {"last_login_at": now}})
    return AuthSessionResponse(access_token=token, expires_at=expires_at, user=public_profile(user))


async def login(
    database: AsyncDatabase[dict[str, Any]],
    settings: Settings,
    payload: LoginRequest,
    user_agent: str | None,
    ip: str | None,
) -> AuthSessionResponse:
    identifier = payload.identifier.strip().lower()
    query = (
        {"email_normalized": identifier}
        if "@" in identifier
        else {"phone_normalized": normalize_phone(identifier)}
    )
    user = await database.users.find_one(query)
    if not user or not verify_password(user["password_hash"], payload.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales incorrectas.")
    if user.get("status") != "active":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="La cuenta no está activa.")
    return await create_session(database, settings, user, user_agent, ip)


async def read_upload(upload: UploadFile, allowed: set[str], max_bytes: int) -> bytes:
    if upload.content_type not in allowed:
        raise HTTPException(status_code=422, detail=f"Tipo de archivo no permitido: {upload.filename}.")
    content = await upload.read(max_bytes + 1)
    if len(content) > max_bytes:
        raise HTTPException(status_code=413, detail=f"El archivo {upload.filename} supera 10 MB.")
    if not content:
        raise HTTPException(status_code=422, detail=f"El archivo {upload.filename} está vacío.")
    return content


async def register(
    database: AsyncDatabase[dict[str, Any]],
    settings: Settings,
    contact_json: str,
    savings_json: str,
    uploads: dict[str, UploadFile | None],
    user_agent: str | None,
    ip: str | None,
) -> AuthSessionResponse:
    try:
        contact = RegistrationContact.model_validate(json.loads(contact_json))
        savings = SavingsCapacity.model_validate(json.loads(savings_json))
    except (json.JSONDecodeError, ValueError) as error:
        raise HTTPException(status_code=422, detail=f"Datos de registro inválidos: {error}") from error

    missing = [slot for slot, upload in uploads.items() if upload is None]
    if missing:
        raise HTTPException(status_code=422, detail=f"Faltan documentos: {', '.join(missing)}.")

    file_data: dict[str, tuple[UploadFile, bytes]] = {}
    for slot, upload in uploads.items():
        assert upload is not None
        file_data[slot] = (
            upload,
            await read_upload(upload, ALLOWED_UPLOAD_TYPES[slot], settings.max_upload_bytes),
        )

    now = datetime.now(UTC)
    user_id, kyc_id = ObjectId(), ObjectId()
    email = str(contact.email).strip().lower()
    phone = normalize_phone(contact.phone)
    user = {
        "_id": user_id,
        "email": email,
        "email_normalized": email,
        "phone": phone,
        "phone_normalized": phone,
        "password_hash": hash_password(contact.password),
        "profile": {
            "first_name": "Persona",
            "last_name": "",
            "locale": "es-GT",
            "timezone": "America/Guatemala",
        },
        "preferences": {"primary_goal_id": None},
        "status": "active",
        "kyc_status": "draft",
        "created_at": now,
        "updated_at": now,
        "last_login_at": None,
    }
    asset_docs: list[dict[str, Any]] = []
    written_paths: list[Path] = []
    settings.kyc_storage_path.mkdir(parents=True, exist_ok=True)
    try:
        for slot, (upload, content) in file_data.items():
            extension = Path(upload.filename or "asset").suffix.lower()[:10]
            storage_key = f"kyc/{user_id}/{uuid4().hex}{extension}"
            target = settings.kyc_storage_path / storage_key
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(content)
            written_paths.append(target)
            asset_docs.append(
                {
                    "_id": ObjectId(),
                    "owner_id": user_id,
                    "kyc_case_id": kyc_id,
                    "slot": {
                        "dpiFront": "dpi_front",
                        "dpiBack": "dpi_back",
                        "selfie": "selfie",
                        "proof": "proof",
                    }[slot],
                    "storage_key": storage_key,
                    "mime_type": upload.content_type,
                    "size_bytes": len(content),
                    "sha256": sha256(content).hexdigest(),
                    "source": "upload",
                    "scan_status": "pending",
                    "created_at": now,
                    "purge_at": None,
                }
            )

        async with await database.client.start_session() as session:
            async with session.start_transaction():
                await database.users.insert_one(user, session=session)
                await database.savings_profiles.insert_one(
                    {
                        "user_id": user_id,
                        **{
                            **savings.model_dump(),
                            "fixed_monthly_income_minor": (
                                Int64(savings.fixed_monthly_income_minor)
                                if savings.fixed_monthly_income_minor is not None
                                else None
                            ),
                            "safe_monthly_savings_minor": Int64(
                                savings.safe_monthly_savings_minor
                            ),
                        },
                        "currency": "GTQ",
                        "answers_version": 1,
                        "created_at": now,
                        "updated_at": now,
                    },
                    session=session,
                )
                await database.kyc_cases.insert_one(
                    {
                        "_id": kyc_id,
                        "user_id": user_id,
                        "status": "draft",
                        "contact_snapshot": {"email": email, "phone": phone},
                        "document_ids": [asset["_id"] for asset in asset_docs],
                        "provider": {"name": "manual", "reference": None},
                        "submitted_at": None,
                        "created_at": now,
                        "updated_at": now,
                    },
                    session=session,
                )
                await database.media_assets.insert_many(asset_docs, session=session)
                await database.audit_events.insert_one(
                    {
                        "actor_id": user_id,
                        "action": "user.registered",
                        "entity_type": "user",
                        "entity_id": user_id,
                        "result": "success",
                        "metadata": {"ip_hash": hash_ip(ip)},
                        "occurred_at": now,
                    },
                    session=session,
                )
    except DuplicateKeyError as error:
        for path in written_paths:
            path.unlink(missing_ok=True)
        raise HTTPException(status_code=409, detail="El correo o teléfono ya está registrado.") from error
    except Exception:
        for path in written_paths:
            path.unlink(missing_ok=True)
        raise

    return await create_session(database, settings, user, user_agent, ip)

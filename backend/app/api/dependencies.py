from typing import Annotated, Any

from bson import ObjectId
from fastapi import Depends, Header, HTTPException, status
from pymongo.asynchronous.database import AsyncDatabase

from app.core.security import hash_token
from app.db.client import get_database


async def get_current_user(
    database: Annotated[AsyncDatabase[dict[str, Any]], Depends(get_database)],
    authorization: Annotated[str | None, Header()] = None,
) -> dict[str, Any]:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sesión requerida.")

    token = authorization.removeprefix("Bearer ").strip()
    session = await database.auth_sessions.find_one(
        {"access_token_hash": hash_token(token), "revoked_at": None}
    )
    if not session:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sesión inválida.")

    from datetime import UTC, datetime

    expires_at = session["expires_at"]
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=UTC)
    if expires_at <= datetime.now(UTC):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="La sesión expiró.")

    user = await database.users.find_one({"_id": ObjectId(session["user_id"]), "status": "active"})
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario no disponible.")
    return user


CurrentUser = Annotated[dict[str, Any], Depends(get_current_user)]
Database = Annotated[AsyncDatabase[dict[str, Any]], Depends(get_database)]


from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi import HTTPException

from app.core.config import Settings
from app.core.security import hash_password
from app.schemas.api import LoginRequest
from app.services import auth


@pytest.mark.asyncio
@pytest.mark.parametrize("identifier", ["diego@correo.com", "55123456"])
async def test_login_requires_only_password_not_kyc(monkeypatch, identifier):
    database = MagicMock()
    user = {"password_hash": hash_password("novu2026"), "status": "active", "kyc_status": "draft"}
    database.users.find_one = AsyncMock(return_value=user)
    session = AsyncMock(return_value="session-result")
    monkeypatch.setattr(auth, "create_session", session)

    result = await auth.login(
        database, Settings(_env_file=None),
        LoginRequest(identifier=identifier, password="novu2026"), None, None,
    )

    assert result == "session-result"
    session.assert_awaited_once()
    assert [call[0] for call in database.mock_calls] == ["users.find_one"]


@pytest.mark.asyncio
async def test_incorrect_password_does_not_create_session(monkeypatch):
    database = MagicMock()
    database.users.find_one = AsyncMock(return_value={
        "password_hash": hash_password("novu2026"), "status": "active",
    })
    session = AsyncMock()
    monkeypatch.setattr(auth, "create_session", session)

    with pytest.raises(HTTPException) as error:
        await auth.login(
            database, Settings(_env_file=None),
            LoginRequest(identifier="diego@correo.com", password="incorrecta"), None, None,
        )

    assert error.value.status_code == 401
    session.assert_not_awaited()

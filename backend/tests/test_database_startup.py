from unittest.mock import AsyncMock, MagicMock

import pytest
from pymongo.errors import OperationFailure, ServerSelectionTimeoutError

from app.db.client import wait_for_mongo


@pytest.mark.asyncio
async def test_startup_recovers_when_vpc_connection_becomes_available(monkeypatch):
    database = MagicMock()
    database.command = AsyncMock(side_effect=[
        ServerSelectionTimeoutError("network not ready"),
        ServerSelectionTimeoutError("network not ready"),
        {"ok": 1},
    ])
    sleep = AsyncMock()
    monkeypatch.setattr("app.db.client.asyncio.sleep", sleep)

    await wait_for_mongo(database)

    assert database.command.await_count == 3
    assert sleep.await_count == 2


@pytest.mark.asyncio
async def test_startup_stops_after_bounded_network_retries(monkeypatch):
    database = MagicMock()
    database.command = AsyncMock(side_effect=ServerSelectionTimeoutError("unreachable"))
    sleep = AsyncMock()
    monkeypatch.setattr("app.db.client.asyncio.sleep", sleep)

    with pytest.raises(ServerSelectionTimeoutError):
        await wait_for_mongo(database, attempts=3)

    assert database.command.await_count == 3
    assert sleep.await_count == 2


@pytest.mark.asyncio
async def test_authentication_errors_fail_without_network_retries(monkeypatch):
    database = MagicMock()
    database.command = AsyncMock(side_effect=OperationFailure("authentication failed", code=18))
    sleep = AsyncMock()
    monkeypatch.setattr("app.db.client.asyncio.sleep", sleep)

    with pytest.raises(OperationFailure):
        await wait_for_mongo(database)

    database.command.assert_awaited_once_with("ping")
    sleep.assert_not_awaited()

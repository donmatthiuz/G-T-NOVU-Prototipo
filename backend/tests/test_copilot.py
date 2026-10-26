import json
from datetime import UTC, datetime
from types import SimpleNamespace
from typing import Any
from unittest.mock import AsyncMock, MagicMock

import pytest
from bson import ObjectId
from fastapi import HTTPException

from app.core.config import Settings
from app.integrations.openai_copilot import (
    COPILOT_INSTRUCTIONS,
    render_financial_context,
    request_copilot_response,
)
from app.schemas.api import ConversationCreate, CopilotMessageCreate
from app.services import copilot
from app.services.copilot import (
    NOVU_PRODUCT_CATALOG,
    build_financial_context,
    create_conversation,
    list_conversations,
    list_messages,
    send_message,
)


def test_copilot_prompt_has_financial_safety_boundaries() -> None:
    assert "no podés ejecutar aportes" in COPILOT_INSTRUCTIONS
    assert "No inventés saldos" in COPILOT_INSTRUCTIONS
    assert "contraseñas" in COPILOT_INSTRUCTIONS
    assert "Guatemala" in COPILOT_INSTRUCTIONS
    assert "product_catalog" in COPILOT_INSTRUCTIONS


def test_financial_context_is_serialized_as_data() -> None:
    rendered = render_financial_context(
        {
            "goals": [{"name": "Viaje", "saved_amount_minor": 125_000}],
            "recent_contributions": [{"amount_minor": 18_000}],
        }
    )
    payload = json.loads(rendered.split("\n", 1)[1])

    assert payload["goals"][0]["saved_amount_minor"] == 125_000
    assert payload["recent_contributions"][0]["amount_minor"] == 18_000


def test_settings_accept_the_existing_api_gpt_name(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("API_GPT", "test-key")
    monkeypatch.delenv("API_OPENAI", raising=False)
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)

    settings = Settings(_env_file=None)

    assert settings.openai_api_key == "test-key"
    assert settings.openai_model == "gpt-5-mini"


def async_cursor(items: list[dict[str, Any]]) -> MagicMock:
    cursor = MagicMock()
    cursor.sort.return_value.limit.return_value.to_list = AsyncMock(return_value=items)
    return cursor


@pytest.mark.asyncio
async def test_financial_context_includes_withdrawals_and_product_catalog() -> None:
    user_id = ObjectId()
    database = MagicMock()
    database.savings_profiles.find_one = AsyncMock(
        return_value={"safe_monthly_savings_minor": 72_000}
    )
    database.goals.find.return_value = async_cursor([{"name": "Viaje"}])
    database.contributions.find.return_value = async_cursor(
        [{"amount_minor": 18_000, "status": "posted"}]
    )
    database.withdrawal_requests.find.return_value = async_cursor(
        [{"amount_minor": 12_000, "reason": "Transporte", "status": "executed"}]
    )
    database.activities.find.return_value = async_cursor(
        [{"type": "withdrawal", "amount_minor": -12_000}]
    )

    context = await build_financial_context(
        database,
        {"_id": user_id, "profile": {"first_name": "Diego"}, "status": "active"},
    )

    assert context["recent_withdrawals"][0]["reason"] == "Transporte"
    assert context["context_limits"]["withdrawals_returned"] == 1
    assert context["product_catalog"] == NOVU_PRODUCT_CATALOG


@pytest.mark.asyncio
async def test_conversation_persists_context_as_an_embedded_document() -> None:
    conversation_id = ObjectId()
    user_id = ObjectId()
    database = MagicMock()
    database.copilot_conversations.find_one = AsyncMock(return_value=None)
    database.copilot_conversations.insert_one = AsyncMock(
        return_value=SimpleNamespace(inserted_id=conversation_id)
    )
    database.copilot_messages.insert_one = AsyncMock()

    result = await create_conversation(
        database,
        {"_id": user_id, "profile": {"first_name": "Diego"}},
        ConversationCreate(context_type="general"),
    )

    document = database.copilot_conversations.insert_one.await_args.args[0]
    assert document["context"] == {"type": "general", "entity_id": None}
    assert "context.type" not in document
    assert "context.entity_id" not in document
    assert result.id == str(conversation_id)


@pytest.mark.asyncio
async def test_request_uses_context_without_storing_provider_state(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    captured: dict[str, Any] = {}

    class FakeResponses:
        async def create(self, **options: Any) -> Any:
            captured.update(options)
            return type("Response", (), {"output_text": " Vas en buen camino. "})()

    class FakeClient:
        def __init__(self, **_: Any) -> None:
            self.responses = FakeResponses()

    monkeypatch.setattr("app.integrations.openai_copilot.AsyncOpenAI", FakeClient)
    settings = Settings(
        _env_file=None,
        API_GPT="test-key",
        OPENAI_MODEL="gpt-5-mini",
    )

    answer = await request_copilot_response(
        settings,
        "user-123",
        {"goals": [{"name": "Viaje", "saved_amount_minor": 125_000}]},
        [{"role": "assistant", "content": "¿Qué querés revisar?"}],
        "¿Cómo voy?",
    )

    assert answer == "Vas en buen camino."
    assert captured["store"] is False
    assert captured["max_output_tokens"] == 1_600
    assert captured["reasoning"] == {"effort": "low"}
    assert captured["input"][-1] == {"role": "user", "content": "¿Cómo voy?"}
    assert captured["input"][1] == {
        "role": "assistant",
        "content": "¿Qué querés revisar?",
    }
    assert captured["safety_identifier"] != "user-123"


def stored_conversation(user_id: ObjectId) -> dict[str, Any]:
    return {
        "_id": ObjectId(), "user_id": user_id, "title": "Mi orientación financiera",
        "context": {"type": "general", "entity_id": None}, "message_count": 1,
        "last_message_at": datetime.now(UTC),
    }


@pytest.mark.asyncio
async def test_new_conversation_creates_distinct_chats_without_reusing_existing() -> None:
    database = MagicMock()
    ids = [ObjectId(), ObjectId()]
    database.copilot_conversations.insert_one = AsyncMock(
        side_effect=[SimpleNamespace(inserted_id=item) for item in ids]
    )
    database.copilot_messages.insert_one = AsyncMock()
    user = {"_id": ObjectId(), "profile": {"first_name": "Diego"}}

    first = await create_conversation(database, user, ConversationCreate(force_new=True))
    second = await create_conversation(database, user, ConversationCreate(force_new=True))

    assert first.id != second.id
    database.copilot_conversations.find_one.assert_not_called()
    greetings = database.copilot_messages.insert_one.await_args_list
    assert [call.args[0]["conversation_id"] for call in greetings] == ids
    assert first.title == "Nueva conversación"


@pytest.mark.asyncio
async def test_default_creation_still_resumes_existing_conversation() -> None:
    database = MagicMock()
    user = {"_id": ObjectId()}
    existing = stored_conversation(user["_id"])
    database.copilot_conversations.find_one = AsyncMock(return_value=existing)

    result = await create_conversation(database, user, ConversationCreate())

    assert result.id == str(existing["_id"])
    database.copilot_conversations.insert_one.assert_not_called()
    assert database.copilot_conversations.find_one.await_args.args[0]["user_id"] == user["_id"]


@pytest.mark.asyncio
async def test_history_is_paginated_and_scoped_to_the_authenticated_user() -> None:
    database = MagicMock()
    user_id = ObjectId()
    item = stored_conversation(user_id)
    cursor = MagicMock()
    cursor.sort.return_value = cursor
    cursor.skip.return_value = cursor
    cursor.limit.return_value = cursor
    cursor.to_list = AsyncMock(return_value=[item])
    database.copilot_conversations.find.return_value = cursor

    result = await list_conversations(database, user_id, page=2)

    assert result[0].id == str(item["_id"])
    database.copilot_conversations.find.assert_called_once_with({"user_id": user_id, "status": "active"})
    cursor.skip.assert_called_once_with(20)
    cursor.limit.assert_called_once_with(20)


@pytest.mark.asyncio
async def test_cannot_read_or_send_messages_in_another_users_conversation() -> None:
    database = MagicMock()
    database.copilot_conversations.find_one = AsyncMock(return_value=None)
    user = {"_id": ObjectId()}
    conversation_id = ObjectId()

    with pytest.raises(HTTPException) as read_error:
        await list_messages(database, str(conversation_id), user["_id"], None, 50)
    with pytest.raises(HTTPException) as send_error:
        await send_message(database, Settings(_env_file=None), str(conversation_id), user,
                           CopilotMessageCreate(content="Hola", client_message_id="client-1234"))

    assert read_error.value.status_code == send_error.value.status_code == 404
    assert database.copilot_conversations.find_one.await_args.args[0] == {
        "_id": conversation_id, "user_id": user["_id"],
    }
    database.copilot_messages.find.assert_not_called()
    database.copilot_messages.insert_one.assert_not_called()


@pytest.mark.asyncio
async def test_first_question_names_the_chat_and_provider_receives_only_its_history(monkeypatch) -> None:
    database = MagicMock()
    user = {"_id": ObjectId()}
    conversation = stored_conversation(user["_id"])
    database.copilot_conversations.find_one = AsyncMock(return_value=conversation)
    database.copilot_conversations.update_one = AsyncMock()
    database.copilot_messages.find_one = AsyncMock(return_value=None)
    database.copilot_messages.insert_one = AsyncMock(side_effect=[
        SimpleNamespace(inserted_id=ObjectId()), SimpleNamespace(inserted_id=ObjectId()),
    ])
    database.copilot_messages.find.return_value = async_cursor([
        {"sender": "assistant", "content": "Bienvenido a este chat."},
    ])
    monkeypatch.setattr(copilot, "build_financial_context", AsyncMock(return_value={}))
    provider = AsyncMock(return_value="Podés empezar con tu plan.")
    text = "  Quiero\n ahorrar para estudiar " + "mucho " * 20

    result = await send_message(database, Settings(_env_file=None), str(conversation["_id"]), user,
                                CopilotMessageCreate(content=text, client_message_id="client-1234"), provider)

    query = database.copilot_messages.find.call_args.args[0]
    assert query["conversation_id"] == conversation["_id"]
    assert provider.await_args.args[3] == [{"role": "assistant", "content": "Bienvenido a este chat."}]
    title_update = database.copilot_conversations.update_one.await_args_list[1]
    assert title_update.args[0] == {"_id": conversation["_id"], "message_count": 2}
    title = title_update.args[1]["$set"]["title"]
    assert len(title) == 80
    assert title.startswith("Quiero ahorrar para estudiar")
    assert title.endswith("…")
    assert result.assistant_message.content == "Podés empezar con tu plan."

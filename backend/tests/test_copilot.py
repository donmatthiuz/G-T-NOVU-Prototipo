import json
from types import SimpleNamespace
from typing import Any
from unittest.mock import AsyncMock, MagicMock

import pytest
from bson import ObjectId

from app.core.config import Settings
from app.integrations.openai_copilot import (
    COPILOT_INSTRUCTIONS,
    render_financial_context,
    request_copilot_response,
)
from app.schemas.api import ConversationCreate
from app.services.copilot import create_conversation


def test_copilot_prompt_has_financial_safety_boundaries() -> None:
    assert "no podés ejecutar aportes" in COPILOT_INSTRUCTIONS
    assert "No inventés saldos" in COPILOT_INSTRUCTIONS
    assert "contraseñas" in COPILOT_INSTRUCTIONS
    assert "Guatemala" in COPILOT_INSTRUCTIONS


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

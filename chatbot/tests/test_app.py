from fastapi.testclient import TestClient

from chatbot.app import app
from chatbot.config import get_settings
from chatbot.models import ChatRequest, ChatResponse
from chatbot.service import get_chat_service


class FakeChatService:
    async def reply(self, request: ChatRequest) -> ChatResponse:
        return ChatResponse(
            message=f"Respuesta para: {request.message}",
            response_id="resp_test_123",
            model="gpt-test",
        )


def test_health_does_not_expose_the_api_key() -> None:
    with TestClient(app) as client:
        response = client.get("/health")

    assert response.status_code == 200
    assert set(response.json()) == {"status", "api_key_configured"}


def test_chat_returns_the_response_and_conversation_id() -> None:
    app.dependency_overrides[get_chat_service] = lambda: FakeChatService()
    try:
        with TestClient(app) as client:
            response = client.post(
                "/chat",
                json={"message": "¿Cómo empiezo una meta de ahorro?"},
            )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json() == {
        "message": "Respuesta para: ¿Cómo empiezo una meta de ahorro?",
        "response_id": "resp_test_123",
        "model": "gpt-test",
    }


def test_chat_rejects_an_empty_message() -> None:
    with TestClient(app) as client:
        response = client.post("/chat", json={"message": "   "})

    assert response.status_code == 422


def test_chat_reports_missing_configuration(monkeypatch) -> None:
    monkeypatch.setenv("API_GPT", "")
    get_settings.cache_clear()
    get_chat_service.cache_clear()
    try:
        with TestClient(app) as client:
            response = client.post("/chat", json={"message": "Hola"})
    finally:
        get_settings.cache_clear()
        get_chat_service.cache_clear()

    assert response.status_code == 503
    assert response.json() == {
        "detail": "Falta API_GPT en el archivo .env de la raíz del proyecto."
    }

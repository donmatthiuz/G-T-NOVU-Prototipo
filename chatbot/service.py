from functools import lru_cache
from typing import Any

from openai import (
    APIConnectionError,
    APIStatusError,
    AsyncOpenAI,
    AuthenticationError,
    RateLimitError,
)

from .config import Settings, get_settings
from .models import ChatRequest, ChatResponse
from .prompts import NOVU_SYSTEM_PROMPT


class ChatbotServiceError(RuntimeError):
    """Error controlado al solicitar una respuesta al proveedor de IA."""

    def __init__(self, message: str, status_code: int = 502) -> None:
        super().__init__(message)
        self.status_code = status_code


class ChatService:
    def __init__(self, settings: Settings, client: AsyncOpenAI | None = None) -> None:
        self._settings = settings
        self._client = client or AsyncOpenAI(api_key=settings.api_key)

    async def reply(self, request: ChatRequest) -> ChatResponse:
        response_options: dict[str, Any] = {
            "model": self._settings.model,
            "instructions": NOVU_SYSTEM_PROMPT,
            "input": request.message,
            "max_output_tokens": self._settings.max_output_tokens,
            "reasoning": {"effort": "low"},
            "store": True,
        }
        if request.previous_response_id:
            response_options["previous_response_id"] = request.previous_response_id

        try:
            response = await self._client.responses.create(**response_options)
        except AuthenticationError as error:
            raise ChatbotServiceError(
                "La credencial de OpenAI no fue aceptada.", status_code=502
            ) from error
        except RateLimitError as error:
            raise ChatbotServiceError(
                "El asistente alcanzó temporalmente su límite de uso.",
                status_code=429,
            ) from error
        except APIConnectionError as error:
            raise ChatbotServiceError(
                "No fue posible conectar con el servicio de IA.", status_code=503
            ) from error
        except APIStatusError as error:
            raise ChatbotServiceError(
                "El servicio de IA no pudo completar la solicitud.", status_code=502
            ) from error

        answer = response.output_text.strip()
        if not answer:
            raise ChatbotServiceError(
                "El servicio de IA devolvió una respuesta vacía.", status_code=502
            )

        return ChatResponse(
            message=answer,
            response_id=response.id,
            model=response.model,
        )


@lru_cache
def get_chat_service() -> ChatService:
    return ChatService(get_settings())

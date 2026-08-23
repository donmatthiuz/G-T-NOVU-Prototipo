from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import (
    ChatbotConfigurationError,
    api_key_is_configured,
    get_settings,
)
from .models import ChatRequest, ChatResponse, HealthResponse
from .service import ChatbotServiceError, ChatService, get_chat_service

ChatServiceDependency = Annotated[ChatService, Depends(get_chat_service)]


def _allowed_origins() -> list[str]:
    try:
        return list(get_settings().allowed_origins)
    except ChatbotConfigurationError:
        return ["http://localhost:3000", "http://127.0.0.1:3000"]


app = FastAPI(
    title="NOVU Chatbot API",
    version="1.0.0",
    description="Backend conversacional de NOVU basado en OpenAI Responses API.",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins(),
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


@app.exception_handler(ChatbotConfigurationError)
async def configuration_error_handler(
    _request: Request,
    error: ChatbotConfigurationError,
) -> JSONResponse:
    return JSONResponse(status_code=503, content={"detail": str(error)})


@app.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    return HealthResponse(status="ok", api_key_configured=api_key_is_configured())


@app.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    service: ChatServiceDependency,
) -> ChatResponse:
    try:
        return await service.reply(request)
    except ChatbotConfigurationError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    except ChatbotServiceError as error:
        raise HTTPException(status_code=error.status_code, detail=str(error)) from error

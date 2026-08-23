from typing import Annotated

from pydantic import BaseModel, Field, StringConstraints

MessageText = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=1, max_length=4_000),
]


class ChatRequest(BaseModel):
    message: MessageText
    previous_response_id: str | None = Field(
        default=None,
        max_length=200,
        description="ID de la respuesta anterior para conservar el contexto.",
    )


class ChatResponse(BaseModel):
    message: str
    response_id: str
    model: str


class HealthResponse(BaseModel):
    status: str
    api_key_configured: bool

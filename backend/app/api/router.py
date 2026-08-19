from typing import Annotated

from fastapi import APIRouter, File, Form, Header, Query, Request, UploadFile, status

from app.api.dependencies import CurrentUser, Database
from app.core.config import get_settings
from app.core.security import hash_token
from app.schemas.api import (
    AuthSessionResponse,
    ConversationCreate,
    ConversationResponse,
    CopilotMessageCreate,
    CopilotTurnResponse,
    LoginRequest,
    MessagePage,
    OverviewResponse,
)
from app.services import auth, copilot, overview


router = APIRouter()


@router.get("/health", tags=["system"])
async def health(database: Database) -> dict[str, str]:
    await database.command("ping")
    return {"status": "ok"}


@router.post("/auth/login", response_model=AuthSessionResponse, tags=["auth"])
async def login(payload: LoginRequest, request: Request, database: Database) -> AuthSessionResponse:
    return await auth.login(
        database,
        get_settings(),
        payload,
        request.headers.get("user-agent"),
        request.client.host if request.client else None,
    )


@router.post(
    "/auth/register",
    response_model=AuthSessionResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["auth"],
)
async def register(
    request: Request,
    database: Database,
    contact: Annotated[str, Form()],
    savings_capacity: Annotated[str, Form()],
    dpiFront: Annotated[UploadFile | None, File()] = None,
    dpiBack: Annotated[UploadFile | None, File()] = None,
    selfie: Annotated[UploadFile | None, File()] = None,
    proof: Annotated[UploadFile | None, File()] = None,
) -> AuthSessionResponse:
    return await auth.register(
        database,
        get_settings(),
        contact,
        savings_capacity,
        {"dpiFront": dpiFront, "dpiBack": dpiBack, "selfie": selfie, "proof": proof},
        request.headers.get("user-agent"),
        request.client.host if request.client else None,
    )


@router.post("/auth/logout", status_code=status.HTTP_204_NO_CONTENT, tags=["auth"])
async def logout(
    database: Database,
    user: CurrentUser,
    authorization: Annotated[str, Header()],
) -> None:
    from datetime import UTC, datetime

    token = authorization.removeprefix("Bearer ").strip()
    await database.auth_sessions.update_one(
        {"user_id": user["_id"], "access_token_hash": hash_token(token)},
        {"$set": {"revoked_at": datetime.now(UTC)}},
    )


@router.get("/overview", response_model=OverviewResponse, tags=["dashboard"])
async def get_overview(database: Database, user: CurrentUser) -> OverviewResponse:
    return await overview.get_overview(database, user)


@router.get(
    "/copilot/conversations", response_model=list[ConversationResponse], tags=["copilot"]
)
async def get_conversations(database: Database, user: CurrentUser) -> list[ConversationResponse]:
    return await copilot.list_conversations(database, user["_id"])


@router.post(
    "/copilot/conversations",
    response_model=ConversationResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["copilot"],
)
async def post_conversation(
    payload: ConversationCreate, database: Database, user: CurrentUser
) -> ConversationResponse:
    return await copilot.create_conversation(database, user, payload)


@router.get(
    "/copilot/conversations/{conversation_id}/messages",
    response_model=MessagePage,
    tags=["copilot"],
)
async def get_messages(
    conversation_id: str,
    database: Database,
    user: CurrentUser,
    cursor: str | None = None,
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
) -> MessagePage:
    return await copilot.list_messages(database, conversation_id, user["_id"], cursor, limit)


@router.post(
    "/copilot/conversations/{conversation_id}/messages",
    response_model=CopilotTurnResponse,
    tags=["copilot"],
)
async def post_message(
    conversation_id: str,
    payload: CopilotMessageCreate,
    database: Database,
    user: CurrentUser,
) -> CopilotTurnResponse:
    return await copilot.send_message(
        database, get_settings(), conversation_id, user, payload
    )


from typing import Annotated, Literal

from fastapi import APIRouter, File, Form, Header, Query, Request, UploadFile, status

from app.api.dependencies import CurrentUser, Database
from app.core.config import get_settings
from app.core.security import hash_token
from app.schemas.api import (
    AuthSessionResponse,
    ContributionCreate,
    ContributionCreateResponse,
    ContributionPage,
    ConversationCreate,
    ConversationResponse,
    CopilotMessageCreate,
    CopilotTurnResponse,
    LoginRequest,
    MessagePage,
    OverviewResponse,
    WithdrawalCreate,
    WithdrawalExecutionResponse,
    WithdrawalPage,
    WithdrawalResponse,
    WithdrawalVoteCreate,
)
from app.services import auth, contributions, copilot, overview, withdrawals

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


@router.get("/contributions", response_model=ContributionPage, tags=["contributions"])
async def get_contributions(
    database: Database,
    user: CurrentUser,
    destination_type: Annotated[
        Literal["goal", "shared_plan"], Query(alias="destinationType")
    ],
    destination_id: Annotated[str, Query(alias="destinationId", min_length=24, max_length=24)],
) -> ContributionPage:
    return await contributions.list_contributions(
        database, user, destination_type, destination_id
    )


@router.post(
    "/contributions",
    response_model=ContributionCreateResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["contributions"],
)
async def post_contribution(
    payload: ContributionCreate, database: Database, user: CurrentUser
) -> ContributionCreateResponse:
    return await contributions.create_contribution(database, user, payload)


@router.get(
    "/shared-plans/{plan_id}/withdrawals",
    response_model=WithdrawalPage,
    tags=["withdrawals"],
)
async def get_withdrawals(
    plan_id: str, database: Database, user: CurrentUser
) -> WithdrawalPage:
    return await withdrawals.list_withdrawals(database, user, plan_id)


@router.post(
    "/shared-plans/{plan_id}/withdrawals",
    response_model=WithdrawalResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["withdrawals"],
)
async def post_withdrawal(
    plan_id: str,
    payload: WithdrawalCreate,
    database: Database,
    user: CurrentUser,
) -> WithdrawalResponse:
    return await withdrawals.create_withdrawal(database, user, plan_id, payload)


@router.get(
    "/withdrawals/{withdrawal_id}",
    response_model=WithdrawalResponse,
    tags=["withdrawals"],
)
async def get_withdrawal(
    withdrawal_id: str, database: Database, user: CurrentUser
) -> WithdrawalResponse:
    return await withdrawals.get_withdrawal(database, user, withdrawal_id)


@router.put(
    "/withdrawals/{withdrawal_id}/vote",
    response_model=WithdrawalResponse,
    tags=["withdrawals"],
)
async def put_withdrawal_vote(
    withdrawal_id: str,
    payload: WithdrawalVoteCreate,
    database: Database,
    user: CurrentUser,
) -> WithdrawalResponse:
    return await withdrawals.vote_withdrawal(database, user, withdrawal_id, payload)


@router.post(
    "/withdrawals/{withdrawal_id}/execute",
    response_model=WithdrawalExecutionResponse,
    tags=["withdrawals"],
)
async def post_withdrawal_execution(
    withdrawal_id: str, database: Database, user: CurrentUser
) -> WithdrawalExecutionResponse:
    return await withdrawals.execute_withdrawal(database, user, withdrawal_id)


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

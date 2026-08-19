import asyncio
from datetime import UTC, datetime
from typing import Any, Awaitable, Callable

from bson import ObjectId
from fastapi import HTTPException, status
from pymongo import DESCENDING
from pymongo.asynchronous.database import AsyncDatabase
from pymongo.errors import DuplicateKeyError

from app.core.config import Settings
from app.integrations.openai_copilot import COPILOT_PROMPT_VERSION, request_copilot_response
from app.schemas.api import (
    ConversationCreate,
    ConversationResponse,
    CopilotMessageCreate,
    CopilotMessageResponse,
    CopilotTurnResponse,
    MessagePage,
)


Provider = Callable[
    [Settings, str, dict[str, Any], list[dict[str, str]], str], Awaitable[str]
]


def parse_object_id(value: str, label: str = "identificador") -> ObjectId:
    if not ObjectId.is_valid(value):
        raise HTTPException(status_code=404, detail=f"{label.capitalize()} no encontrado.")
    return ObjectId(value)


def conversation_response(item: dict[str, Any]) -> ConversationResponse:
    context = item.get("context", {})
    return ConversationResponse(
        id=str(item["_id"]),
        title=item["title"],
        context_type=context.get("type", "general"),
        entity_id=str(context["entity_id"]) if context.get("entity_id") else None,
        message_count=item.get("message_count", 0),
        last_message_at=item["last_message_at"],
    )


def message_response(item: dict[str, Any]) -> CopilotMessageResponse:
    return CopilotMessageResponse(
        id=str(item["_id"]),
        sender=item["sender"],
        content=item["content"],
        kind=item.get("kind", "text"),
        created_at=item["created_at"],
    )


async def verify_conversation(
    database: AsyncDatabase[dict[str, Any]], conversation_id: str, user_id: ObjectId
) -> dict[str, Any]:
    conversation = await database.copilot_conversations.find_one(
        {"_id": parse_object_id(conversation_id, "conversación"), "user_id": user_id}
    )
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversación no encontrada.")
    return conversation


async def list_conversations(
    database: AsyncDatabase[dict[str, Any]], user_id: ObjectId
) -> list[ConversationResponse]:
    items = await database.copilot_conversations.find(
        {"user_id": user_id, "status": "active"}
    ).sort("last_message_at", DESCENDING).limit(20).to_list(length=20)
    return [conversation_response(item) for item in items]


async def create_conversation(
    database: AsyncDatabase[dict[str, Any]], user: dict[str, Any], payload: ConversationCreate
) -> ConversationResponse:
    entity_id = parse_object_id(payload.entity_id) if payload.entity_id else None
    query = {
        "user_id": user["_id"],
        "status": "active",
        "context.type": payload.context_type,
        "context.entity_id": entity_id,
    }
    existing = await database.copilot_conversations.find_one(query)
    if existing:
        return conversation_response(existing)

    now = datetime.now(UTC)
    conversation = {
        **query,
        "title": "Mi orientación financiera",
        "message_count": 1,
        "last_message_at": now,
        "summary": {"text": None, "through_message_id": None, "updated_at": None},
        "created_at": now,
        "updated_at": now,
    }
    result = await database.copilot_conversations.insert_one(conversation)
    conversation["_id"] = result.inserted_id
    first_name = user.get("profile", {}).get("first_name", "")
    await database.copilot_messages.insert_one(
        {
            "conversation_id": result.inserted_id,
            "sender": "assistant",
            "content": (
                f"¡Hola, {first_name}! Soy NOVU. Puedo orientarte usando tus metas y tu actividad "
                "registrada. ¿Qué querés revisar hoy?"
            ),
            "kind": "text",
            "metadata": {
                "model": None,
                "prompt_version": COPILOT_PROMPT_VERSION,
                "safety_status": "ok",
            },
            "client_message_id": None,
            "created_at": now,
        }
    )
    return conversation_response(conversation)


async def list_messages(
    database: AsyncDatabase[dict[str, Any]],
    conversation_id: str,
    user_id: ObjectId,
    cursor: str | None,
    limit: int,
) -> MessagePage:
    conversation = await verify_conversation(database, conversation_id, user_id)
    query: dict[str, Any] = {"conversation_id": conversation["_id"]}
    if cursor:
        query["_id"] = {"$lt": parse_object_id(cursor, "cursor")}
    items = await database.copilot_messages.find(query).sort("_id", DESCENDING).limit(
        limit + 1
    ).to_list(length=limit + 1)
    has_more = len(items) > limit
    items = items[:limit]
    next_cursor = str(items[-1]["_id"]) if has_more and items else None
    items.reverse()
    return MessagePage(items=[message_response(item) for item in items], next_cursor=next_cursor)


async def build_financial_context(
    database: AsyncDatabase[dict[str, Any]], user: dict[str, Any]
) -> dict[str, Any]:
    user_id = user["_id"]
    profile_task = database.savings_profiles.find_one({"user_id": user_id}, {"_id": 0, "user_id": 0})
    goals_task = database.goals.find(
        {"owner_id": user_id, "deleted_at": None},
        {
            "name": 1,
            "category": 1,
            "target_amount_minor": 1,
            "saved_amount_minor": 1,
            "recommendation": 1,
            "target_date": 1,
            "status": 1,
            "currency": 1,
        },
    ).sort("updated_at", DESCENDING).limit(20).to_list(length=20)
    contributions_task = database.contributions.find(
        {"user_id": user_id, "status": {"$in": ["posted", "reversed"]}},
        {"amount_minor": 1, "currency": 1, "description": 1, "status": 1, "occurred_at": 1, "destination": 1},
    ).sort("occurred_at", DESCENDING).limit(50).to_list(length=50)
    activities_task = database.activities.find(
        {"user_id": user_id}, {"title": 1, "type": 1, "amount_minor": 1, "occurred_at": 1}
    ).sort("occurred_at", DESCENDING).limit(30).to_list(length=30)
    savings, goals, contributions, activities = await asyncio.gather(
        profile_task, goals_task, contributions_task, activities_task
    )
    profile = user.get("profile", {})
    return {
        "person": {
            "first_name": profile.get("first_name"),
            "locale": profile.get("locale", "es-GT"),
            "timezone": profile.get("timezone", "America/Guatemala"),
            "account_status": user.get("status"),
        },
        "savings_profile": savings,
        "goals": goals,
        "recent_contributions": contributions,
        "recent_activity": activities,
        "context_limits": {
            "contributions_returned": len(contributions),
            "activities_returned": len(activities),
            "history_is_recent_sample": True,
        },
    }


async def send_message(
    database: AsyncDatabase[dict[str, Any]],
    settings: Settings,
    conversation_id: str,
    user: dict[str, Any],
    payload: CopilotMessageCreate,
    provider: Provider = request_copilot_response,
) -> CopilotTurnResponse:
    conversation = await verify_conversation(database, conversation_id, user["_id"])
    existing = await database.copilot_messages.find_one(
        {
            "conversation_id": conversation["_id"],
            "client_message_id": payload.client_message_id,
            "sender": "user",
        }
    )
    if existing:
        assistant = await database.copilot_messages.find_one(
            {
                "conversation_id": conversation["_id"],
                "metadata.reply_to_client_message_id": payload.client_message_id,
                "sender": "assistant",
            }
        )
        if assistant:
            return CopilotTurnResponse(
                user_message=message_response(existing),
                assistant_message=message_response(assistant),
                duplicated=True,
            )
        user_message = existing
    else:
        now = datetime.now(UTC)
        user_message = {
            "conversation_id": conversation["_id"],
            "sender": "user",
            "content": payload.content.strip(),
            "kind": "text",
            "metadata": {"safety_status": "ok"},
            "client_message_id": payload.client_message_id,
            "created_at": now,
        }
        try:
            result = await database.copilot_messages.insert_one(user_message)
            user_message["_id"] = result.inserted_id
            await database.copilot_conversations.update_one(
                {"_id": conversation["_id"]},
                {"$inc": {"message_count": 1}, "$set": {"last_message_at": now, "updated_at": now}},
            )
        except DuplicateKeyError:
            return await send_message(database, settings, conversation_id, user, payload, provider)

    previous = await database.copilot_messages.find(
        {"conversation_id": conversation["_id"], "_id": {"$lt": user_message["_id"]}},
        {"sender": 1, "content": 1},
    ).sort("_id", DESCENDING).limit(20).to_list(length=20)
    history = [
        {"role": "assistant" if item["sender"] == "assistant" else "user", "content": item["content"]}
        for item in reversed(previous)
        if item["sender"] in {"assistant", "user"}
    ]
    financial_context = await build_financial_context(database, user)
    try:
        answer = await provider(
            settings, str(user["_id"]), financial_context, history, user_message["content"]
        )
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Guardamos tu mensaje, pero el Copiloto no pudo responder. Podés reintentarlo.",
        ) from error

    now = datetime.now(UTC)
    assistant_message = {
        "conversation_id": conversation["_id"],
        "sender": "assistant",
        "content": answer,
        "kind": "recommendation",
        "metadata": {
            "model": settings.openai_model,
            "prompt_version": COPILOT_PROMPT_VERSION,
            "safety_status": "ok",
            "reply_to_client_message_id": payload.client_message_id,
        },
        "client_message_id": None,
        "created_at": now,
    }
    result = await database.copilot_messages.insert_one(assistant_message)
    assistant_message["_id"] = result.inserted_id
    await database.copilot_conversations.update_one(
        {"_id": conversation["_id"]},
        {"$inc": {"message_count": 1}, "$set": {"last_message_at": now, "updated_at": now}},
    )
    return CopilotTurnResponse(
        user_message=message_response(user_message),
        assistant_message=message_response(assistant_message),
    )


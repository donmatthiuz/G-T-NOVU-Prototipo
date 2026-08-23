from datetime import UTC, datetime
from typing import Any, Literal

from bson import Int64, ObjectId
from fastapi import HTTPException, status
from pymongo import DESCENDING
from pymongo.asynchronous.database import AsyncDatabase
from pymongo.errors import DuplicateKeyError

from app.schemas.api import (
    ContributionCreate,
    ContributionCreateResponse,
    ContributionPage,
    ContributionResponse,
)


DestinationType = Literal["goal", "shared_plan"]
MONTHS_ES = ("ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic")


def parse_object_id(value: str) -> ObjectId:
    if not ObjectId.is_valid(value):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El plan no existe.")
    return ObjectId(value)


def date_label(value: datetime) -> str:
    occurred_at = value if value.tzinfo else value.replace(tzinfo=UTC)
    delta = datetime.now(UTC).date() - occurred_at.date()
    if delta.days == 0:
        return "Hoy"
    if delta.days == 1:
        return "Ayer"
    return f"{occurred_at.day:02d} {MONTHS_ES[occurred_at.month - 1]}"


def contribution_response(
    contribution: dict[str, Any], current_user_id: ObjectId
) -> ContributionResponse:
    destination = contribution["destination"]
    occurred_at = contribution["occurred_at"]
    if occurred_at.tzinfo is None:
        occurred_at = occurred_at.replace(tzinfo=UTC)
    amount = round(int(contribution["amount_minor"]) / 100)
    return ContributionResponse(
        id=str(contribution["_id"]),
        destination_type=destination["type"],
        destination_id=str(destination["id"]),
        member_name=(
            "Vos"
            if contribution["user_id"] == current_user_id
            else contribution.get("member_name", "Integrante")
        ),
        description=contribution.get("description", "Aporte al plan"),
        amount=amount,
        amount_label=f"Q {amount:,.0f}",
        date_label=date_label(occurred_at),
        occurred_at=occurred_at,
        current_month=(
            occurred_at.year == datetime.now(UTC).year
            and occurred_at.month == datetime.now(UTC).month
        ),
        status=contribution.get("status", "posted"),
    )


async def authorized_destination(
    database: AsyncDatabase[dict[str, Any]],
    user_id: ObjectId,
    destination_type: DestinationType,
    destination_id: ObjectId,
) -> tuple[dict[str, Any], str, str, str]:
    if destination_type == "goal":
        goal = await database.goals.find_one(
            {
                "_id": destination_id,
                "owner_id": user_id,
                "deleted_at": None,
                "status": {"$in": ["active", "paused"]},
            }
        )
        if not goal:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="La meta no existe o no admite aportes.",
            )
        return goal, "goals", "saved_amount_minor", "target_amount_minor"

    membership = await database.memberships.find_one(
        {"shared_plan_id": destination_id, "user_id": user_id, "status": "active"}
    )
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tenés acceso para aportar a este plan.",
        )
    plan = await database.shared_plans.find_one(
        {
            "_id": destination_id,
            "deleted_at": None,
            "status": {"$in": ["active", "paused"]},
        }
    )
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El plan compartido no existe o no admite aportes.",
        )
    return plan, "shared_plans", "balance_minor", "target_amount_minor"


def balance_result(
    entity: dict[str, Any], balance_field: str, target_field: str
) -> tuple[int, int]:
    balance_minor = int(entity.get(balance_field, 0))
    target_minor = max(int(entity.get(target_field, 0)), 1)
    return round(balance_minor / 100), min(100, max(0, round(balance_minor * 100 / target_minor)))


def ensure_same_request(
    existing: dict[str, Any], payload: ContributionCreate, destination_id: ObjectId
) -> None:
    destination = existing.get("destination", {})
    same_request = (
        destination.get("type") == payload.destination_type
        and destination.get("id") == destination_id
        and int(existing.get("amount_minor", 0)) == payload.amount_minor
        and existing.get("description", "").strip() == payload.description.strip()
    )
    if not same_request:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El identificador del aporte ya fue utilizado con otros datos.",
        )


async def list_contributions(
    database: AsyncDatabase[dict[str, Any]],
    user: dict[str, Any],
    destination_type: DestinationType,
    destination_id_value: str,
) -> ContributionPage:
    destination_id = parse_object_id(destination_id_value)
    await authorized_destination(database, user["_id"], destination_type, destination_id)
    items = await database.contributions.find(
        {
            "destination.type": destination_type,
            "destination.id": destination_id,
            "status": "posted",
        }
    ).sort([("occurred_at", DESCENDING), ("_id", DESCENDING)]).limit(100).to_list(length=100)
    return ContributionPage(
        items=[contribution_response(item, user["_id"]) for item in items]
    )


async def create_contribution(
    database: AsyncDatabase[dict[str, Any]],
    user: dict[str, Any],
    payload: ContributionCreate,
) -> ContributionCreateResponse:
    user_id = user["_id"]
    destination_id = parse_object_id(payload.destination_id)
    entity, collection_name, balance_field, target_field = await authorized_destination(
        database, user_id, payload.destination_type, destination_id
    )
    existing = await database.contributions.find_one(
        {"user_id": user_id, "idempotency_key": payload.client_contribution_id}
    )
    if existing:
        ensure_same_request(existing, payload, destination_id)
        balance, progress = balance_result(entity, balance_field, target_field)
        return ContributionCreateResponse(
            contribution=contribution_response(existing, user_id),
            updated_balance_amount=balance,
            updated_progress=progress,
            duplicated=True,
        )

    now = datetime.now(UTC)
    contribution_id = ObjectId()
    amount_minor = Int64(payload.amount_minor)
    contribution = {
        "_id": contribution_id,
        "user_id": user_id,
        "destination": {"type": payload.destination_type, "id": destination_id},
        "amount_minor": amount_minor,
        "currency": "GTQ",
        "description": payload.description.strip(),
        "idempotency_key": payload.client_contribution_id,
        "status": "posted",
        "occurred_at": now,
        "created_at": now,
    }
    try:
        async with database.client.start_session() as session:
            async with await session.start_transaction():
                await database.contributions.insert_one(contribution, session=session)
                await database[collection_name].update_one(
                    {"_id": destination_id},
                    {"$inc": {balance_field: amount_minor}, "$set": {"updated_at": now}},
                    session=session,
                )
                await database.activities.insert_one(
                    {
                        "user_id": user_id,
                        "type": "contribution",
                        "title": payload.description.strip(),
                        "amount_minor": amount_minor,
                        "tone": "success",
                        "reference": {
                            "contribution_id": contribution_id,
                            "destination_type": payload.destination_type,
                            "destination_id": destination_id,
                        },
                        "occurred_at": now,
                    },
                    session=session,
                )
                await database.audit_events.insert_one(
                    {
                        "actor_id": user_id,
                        "action": "contribution.posted",
                        "entity_type": "contribution",
                        "entity_id": contribution_id,
                        "result": "success",
                        "metadata": {
                            "destination_type": payload.destination_type,
                            "destination_id": str(destination_id),
                            "amount_minor": payload.amount_minor,
                        },
                        "occurred_at": now,
                    },
                    session=session,
                )
    except DuplicateKeyError:
        existing = await database.contributions.find_one(
            {"user_id": user_id, "idempotency_key": payload.client_contribution_id}
        )
        if not existing:
            raise
        ensure_same_request(existing, payload, destination_id)
        refreshed = await database[collection_name].find_one({"_id": destination_id})
        balance, progress = balance_result(refreshed or entity, balance_field, target_field)
        return ContributionCreateResponse(
            contribution=contribution_response(existing, user_id),
            updated_balance_amount=balance,
            updated_progress=progress,
            duplicated=True,
        )

    refreshed = await database[collection_name].find_one({"_id": destination_id})
    balance, progress = balance_result(refreshed or entity, balance_field, target_field)
    return ContributionCreateResponse(
        contribution=contribution_response(contribution, user_id),
        updated_balance_amount=balance,
        updated_progress=progress,
    )

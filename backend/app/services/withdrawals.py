from collections import defaultdict
from datetime import UTC, datetime
from typing import Any, Literal

from bson import Int64, ObjectId
from fastapi import HTTPException, status
from pymongo import DESCENDING
from pymongo.asynchronous.database import AsyncDatabase
from pymongo.errors import DuplicateKeyError

from app.schemas.api import (
    WithdrawalCreate,
    WithdrawalExecutionResponse,
    WithdrawalPage,
    WithdrawalResponse,
    WithdrawalVoteCreate,
)

Decision = Literal["approve", "reject"]


def parse_object_id(value: str, detail: str) -> ObjectId:
    if not ObjectId.is_valid(value):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=detail)
    return ObjectId(value)


def resolved_status(
    required_votes: int, eligible_voters: int, approve_votes: int, reject_votes: int
) -> Literal["pending", "approved", "rejected"]:
    if approve_votes >= required_votes:
        return "approved"
    if reject_votes > max(eligible_voters - required_votes, 0):
        return "rejected"
    return "pending"


async def authorized_family_plan(
    database: AsyncDatabase[dict[str, Any]], user_id: ObjectId, plan_id: ObjectId
) -> tuple[dict[str, Any], dict[str, Any]]:
    membership = await database.memberships.find_one(
        {"shared_plan_id": plan_id, "user_id": user_id, "status": "active"}
    )
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tenés acceso a las solicitudes de este fondo.",
        )
    plan = await database.shared_plans.find_one(
        {
            "_id": plan_id,
            "type": "family_fund",
            "status": {"$in": ["active", "paused"]},
            "deleted_at": None,
        }
    )
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El fondo familiar no existe o ya no está disponible.",
        )
    return plan, membership


async def authorized_request(
    database: AsyncDatabase[dict[str, Any]], user_id: ObjectId, withdrawal_id: ObjectId
) -> tuple[dict[str, Any], dict[str, Any], dict[str, Any]]:
    request = await database.withdrawal_requests.find_one(
        {
            "_id": withdrawal_id,
            "source.type": "shared_plan",
        }
    )
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="La solicitud de retiro no existe.",
        )
    plan, membership = await authorized_family_plan(database, user_id, request["source"]["id"])
    return request, plan, membership


def _profile_name(user: dict[str, Any]) -> str:
    profile = user.get("profile", {})
    full_name = " ".join(
        part for part in [profile.get("first_name"), profile.get("last_name")] if part
    ).strip()
    return full_name or "Integrante"


def withdrawal_response(
    request: dict[str, Any],
    votes: list[dict[str, Any]],
    user_id: ObjectId,
    membership_role: str,
) -> WithdrawalResponse:
    snapshot = request.get("approval_snapshot", {})
    eligible_ids = snapshot.get("eligible_voter_ids", [])
    required_votes = max(int(snapshot.get("required_votes", snapshot.get("required", 1))), 1)
    approve_votes = sum(vote.get("decision") == "approve" for vote in votes)
    reject_votes = sum(vote.get("decision") == "reject" for vote in votes)
    current_vote = next(
        (vote.get("decision") for vote in votes if vote.get("voter_id") == user_id), None
    )
    amount = round(int(request["amount_minor"]) / 100)
    current_status = request.get("status", "pending")
    eligible = not eligible_ids or user_id in eligible_ids
    return WithdrawalResponse(
        id=str(request["_id"]),
        shared_plan_id=str(request["source"]["id"]),
        requester_id=str(request["requester_id"]),
        requester_name=snapshot.get("requester_name", "Integrante"),
        amount=amount,
        amount_label=f"Q {amount:,.0f}",
        reason=request.get("reason", "Solicitud de retiro"),
        required_votes=required_votes,
        approve_votes=approve_votes,
        reject_votes=reject_votes,
        remaining_approvals=max(required_votes - approve_votes, 0),
        current_user_vote=current_vote,
        status=current_status,
        created_at=request["created_at"],
        decided_at=request.get("decided_at"),
        executed_at=request.get("executed_at"),
        can_vote=current_status == "pending" and eligible and current_vote is None,
        can_execute=current_status == "approved" and membership_role in {"owner", "admin"},
    )


async def _votes_for_requests(
    database: AsyncDatabase[dict[str, Any]], request_ids: list[ObjectId]
) -> dict[ObjectId, list[dict[str, Any]]]:
    grouped: dict[ObjectId, list[dict[str, Any]]] = defaultdict(list)
    if not request_ids:
        return grouped
    votes = await database.votes.find({"withdrawal_request_id": {"$in": request_ids}}).to_list(
        length=500
    )
    for vote in votes:
        grouped[vote["withdrawal_request_id"]].append(vote)
    return grouped


async def list_withdrawals(
    database: AsyncDatabase[dict[str, Any]], user: dict[str, Any], plan_id_value: str
) -> WithdrawalPage:
    plan_id = parse_object_id(plan_id_value, "El fondo familiar no existe.")
    _, membership = await authorized_family_plan(database, user["_id"], plan_id)
    requests = (
        await database.withdrawal_requests.find(
            {"source.type": "shared_plan", "source.id": plan_id}
        )
        .sort([("created_at", DESCENDING), ("_id", DESCENDING)])
        .limit(100)
        .to_list(length=100)
    )
    grouped_votes = await _votes_for_requests(database, [request["_id"] for request in requests])
    return WithdrawalPage(
        items=[
            withdrawal_response(
                request,
                grouped_votes.get(request["_id"], []),
                user["_id"],
                membership["role"],
            )
            for request in requests
        ]
    )


async def get_withdrawal(
    database: AsyncDatabase[dict[str, Any]], user: dict[str, Any], withdrawal_id_value: str
) -> WithdrawalResponse:
    withdrawal_id = parse_object_id(withdrawal_id_value, "La solicitud de retiro no existe.")
    request, _, membership = await authorized_request(database, user["_id"], withdrawal_id)
    votes = await database.votes.find({"withdrawal_request_id": withdrawal_id}).to_list(length=100)
    return withdrawal_response(request, votes, user["_id"], membership["role"])


async def create_withdrawal(
    database: AsyncDatabase[dict[str, Any]],
    user: dict[str, Any],
    plan_id_value: str,
    payload: WithdrawalCreate,
) -> WithdrawalResponse:
    plan_id = parse_object_id(plan_id_value, "El fondo familiar no existe.")
    plan, membership = await authorized_family_plan(database, user["_id"], plan_id)
    if payload.amount_minor > int(plan.get("balance_minor", 0)):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El monto solicitado supera el saldo disponible del fondo.",
        )
    memberships = await database.memberships.find(
        {"shared_plan_id": plan_id, "status": "active"}
    ).to_list(length=100)
    eligible_ids = [item["user_id"] for item in memberships]
    configured_votes = int(plan.get("rules", {}).get("required_approvals", 1))
    required_votes = min(max(configured_votes, 1), max(len(eligible_ids), 1))
    now = datetime.now(UTC)
    request = {
        "_id": ObjectId(),
        "requester_id": user["_id"],
        "source": {"type": "shared_plan", "id": plan_id},
        "amount_minor": Int64(payload.amount_minor),
        "currency": "GTQ",
        "reason": payload.reason.strip(),
        "approval_snapshot": {
            "requester_name": _profile_name(user),
            "required_votes": required_votes,
            "eligible_voter_ids": eligible_ids,
        },
        "status": "pending",
        "created_at": now,
        "decided_at": None,
        "executed_at": None,
    }
    await database.withdrawal_requests.insert_one(request)
    await database.audit_events.insert_one(
        {
            "actor_id": user["_id"],
            "action": "withdrawal.requested",
            "entity_type": "withdrawal_request",
            "entity_id": request["_id"],
            "result": "success",
            "metadata": {"shared_plan_id": str(plan_id), "amount_minor": payload.amount_minor},
            "occurred_at": now,
        }
    )
    return withdrawal_response(request, [], user["_id"], membership["role"])


async def vote_withdrawal(
    database: AsyncDatabase[dict[str, Any]],
    user: dict[str, Any],
    withdrawal_id_value: str,
    payload: WithdrawalVoteCreate,
) -> WithdrawalResponse:
    withdrawal_id = parse_object_id(withdrawal_id_value, "La solicitud de retiro no existe.")
    request, _, membership = await authorized_request(database, user["_id"], withdrawal_id)
    if request.get("status") != "pending":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Esta solicitud ya no admite votos.",
        )
    eligible_ids = request.get("approval_snapshot", {}).get("eligible_voter_ids", [])
    if eligible_ids and user["_id"] not in eligible_ids:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No sos una de las personas habilitadas para votar.",
        )
    now = datetime.now(UTC)
    vote = {
        "withdrawal_request_id": withdrawal_id,
        "voter_id": user["_id"],
        "decision": payload.decision,
        "comment": payload.comment.strip() if payload.comment else None,
        "created_at": now,
    }
    try:
        await database.votes.insert_one(vote)
    except DuplicateKeyError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya registraste tu voto en esta solicitud.",
        ) from error

    votes = await database.votes.find({"withdrawal_request_id": withdrawal_id}).to_list(length=100)
    snapshot = request.get("approval_snapshot", {})
    required_votes = max(int(snapshot.get("required_votes", 1)), 1)
    eligible_count = max(len(snapshot.get("eligible_voter_ids", [])), required_votes)
    next_status = resolved_status(
        required_votes,
        eligible_count,
        sum(item.get("decision") == "approve" for item in votes),
        sum(item.get("decision") == "reject" for item in votes),
    )
    if next_status != "pending":
        await database.withdrawal_requests.update_one(
            {"_id": withdrawal_id, "status": "pending"},
            {"$set": {"status": next_status, "decided_at": now}},
        )
        request["status"] = next_status
        request["decided_at"] = now
    await database.audit_events.insert_one(
        {
            "actor_id": user["_id"],
            "action": f"withdrawal.vote.{payload.decision}",
            "entity_type": "withdrawal_request",
            "entity_id": withdrawal_id,
            "result": "success",
            "metadata": {},
            "occurred_at": now,
        }
    )
    return withdrawal_response(request, votes, user["_id"], membership["role"])


async def execute_withdrawal(
    database: AsyncDatabase[dict[str, Any]], user: dict[str, Any], withdrawal_id_value: str
) -> WithdrawalExecutionResponse:
    withdrawal_id = parse_object_id(withdrawal_id_value, "La solicitud de retiro no existe.")
    request, plan, membership = await authorized_request(database, user["_id"], withdrawal_id)
    if membership.get("role") not in {"owner", "admin"}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo una persona administradora puede liberar el dinero.",
        )
    if request.get("status") != "approved":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="La solicitud debe estar aprobada antes de liberar el dinero.",
        )
    amount_minor = Int64(request["amount_minor"])
    now = datetime.now(UTC)
    async with database.client.start_session() as session, await session.start_transaction():
        balance_result = await database.shared_plans.update_one(
            {
                "_id": plan["_id"],
                "balance_minor": {"$gte": amount_minor},
                "status": {"$in": ["active", "paused"]},
            },
            {
                "$inc": {"balance_minor": Int64(-int(amount_minor))},
                "$set": {"updated_at": now},
            },
            session=session,
        )
        if balance_result.modified_count != 1:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="El fondo ya no tiene saldo suficiente para este retiro.",
            )
        request_result = await database.withdrawal_requests.update_one(
            {"_id": withdrawal_id, "status": "approved"},
            {"$set": {"status": "executed", "executed_at": now}},
            session=session,
        )
        if request_result.modified_count != 1:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="La solicitud ya fue procesada.",
            )
        await database.activities.insert_one(
            {
                "user_id": user["_id"],
                "type": "withdrawal",
                "title": request.get("reason", "Retiro del fondo familiar"),
                "amount_minor": Int64(-int(amount_minor)),
                "tone": "expense",
                "reference": {
                    "withdrawal_request_id": withdrawal_id,
                    "shared_plan_id": plan["_id"],
                },
                "occurred_at": now,
            },
            session=session,
        )
        await database.audit_events.insert_one(
            {
                "actor_id": user["_id"],
                "action": "withdrawal.executed",
                "entity_type": "withdrawal_request",
                "entity_id": withdrawal_id,
                "result": "success",
                "metadata": {"amount_minor": int(amount_minor)},
                "occurred_at": now,
            },
            session=session,
        )
    request["status"] = "executed"
    request["executed_at"] = now
    votes = await database.votes.find({"withdrawal_request_id": withdrawal_id}).to_list(length=100)
    response = withdrawal_response(request, votes, user["_id"], membership["role"])
    return WithdrawalExecutionResponse(
        withdrawal=response,
        updated_balance_amount=round((int(plan["balance_minor"]) - int(amount_minor)) / 100),
    )

import asyncio
from datetime import UTC, datetime
from typing import Any

from bson import ObjectId
from pymongo import DESCENDING
from pymongo.asynchronous.database import AsyncDatabase

from app.schemas.api import (
    ActivityResponse,
    OverviewResponse,
    PersonalGoalResponse,
)
from app.services.auth import public_profile


def goal_response(goal: dict[str, Any]) -> PersonalGoalResponse:
    target_minor = max(int(goal["target_amount_minor"]), 1)
    saved_minor = int(goal.get("saved_amount_minor", 0))
    progress = min(100, max(0, round(saved_minor * 100 / target_minor)))
    recommendation = goal.get("recommendation", {})
    weekly_minor = int(recommendation.get("contribution_amount_minor", 0))
    if recommendation.get("contribution_frequency") == "monthly":
        weekly_minor = round(weekly_minor / 4.33)
    elif recommendation.get("contribution_frequency") == "biweekly":
        weekly_minor = round(weekly_minor / 2)
    return PersonalGoalResponse(
        id=str(goal["_id"]),
        name=goal["name"],
        saved_amount=round(saved_minor / 100),
        target_amount=round(target_minor / 100),
        weekly_contribution=round(weekly_minor / 100),
        progress=progress,
        currency=goal.get("currency", "GTQ"),
    )


def activity_response(activity: dict[str, Any]) -> ActivityResponse:
    occurred_at = activity["occurred_at"]
    if occurred_at.tzinfo is None:
        occurred_at = occurred_at.replace(tzinfo=UTC)
    delta = datetime.now(UTC).date() - occurred_at.date()
    date_label = "Hoy" if delta.days == 0 else "Ayer" if delta.days == 1 else occurred_at.strftime("%d %b")
    amount_minor = activity.get("amount_minor")
    sign = "+" if (amount_minor or 0) >= 0 else "−"
    amount_label = "" if amount_minor is None else f"{sign} Q {abs(amount_minor) / 100:,.0f}"
    return ActivityResponse(
        id=str(activity["_id"]),
        name=activity["title"],
        date_label=date_label,
        amount_label=amount_label,
        tone=activity.get("tone", "muted"),
    )


async def get_overview(
    database: AsyncDatabase[dict[str, Any]], user: dict[str, Any]
) -> OverviewResponse:
    user_id = user["_id"]
    goals_task = database.goals.find(
        {"owner_id": user_id, "deleted_at": None, "status": {"$in": ["active", "paused", "completed"]}}
    ).sort("updated_at", DESCENDING).limit(20).to_list(length=20)
    activities_task = database.activities.find({"user_id": user_id}).sort(
        [("occurred_at", DESCENDING), ("_id", DESCENDING)]
    ).limit(10).to_list(length=10)
    memberships_task = database.memberships.find(
        {"user_id": user_id, "status": "active"}, {"shared_plan_id": 1}
    ).limit(20).to_list(length=20)
    goals, activities, memberships = await asyncio.gather(
        goals_task, activities_task, memberships_task
    )
    if not goals:
        raise RuntimeError("El usuario no tiene una meta visible.")

    preferred = user.get("preferences", {}).get("primary_goal_id")
    primary = next((goal for goal in goals if goal["_id"] == preferred), goals[0])
    shared_ids = [item["shared_plan_id"] for item in memberships]
    shared_plans = (
        await database.shared_plans.find(
            {"_id": {"$in": shared_ids}, "deleted_at": None},
            {"name": 1, "type": 1, "balance_minor": 1, "target_amount_minor": 1, "currency": 1, "status": 1},
        ).to_list(length=20)
        if shared_ids
        else []
    )
    primary_response = goal_response(primary)
    return OverviewResponse(
        profile=public_profile(user),
        personal_goal=primary_response,
        personal_goals=[goal_response(goal) for goal in goals],
        primary_goal_id=primary_response.id,
        shared_plans=[
            {
                "id": str(plan["_id"]),
                "name": plan["name"],
                "type": plan["type"],
                "balanceAmount": round(plan.get("balance_minor", 0) / 100),
                "targetAmount": round(plan.get("target_amount_minor", 0) / 100),
                "currency": plan.get("currency", "GTQ"),
                "status": plan["status"],
            }
            for plan in shared_plans
        ],
        recent_activity=[activity_response(item) for item in activities],
    )


from datetime import UTC, datetime, timedelta
from typing import Any

from bson import Int64, ObjectId
from pymongo import ASCENDING, DESCENDING, IndexModel
from pymongo.asynchronous.database import AsyncDatabase

from app.core.security import hash_password


def object_schema(required: list[str], properties: dict[str, Any]) -> dict[str, Any]:
    return {
        "$jsonSchema": {
            "bsonType": "object",
            "required": required,
            "properties": properties,
        }
    }


OID = {"bsonType": "objectId"}
DATE = {"bsonType": "date"}
NULL_DATE = {"bsonType": ["date", "null"]}
MONEY = {"bsonType": "long"}
STRING = {"bsonType": "string"}


COLLECTIONS: dict[str, dict[str, Any]] = {
    "users": object_schema(
        ["email", "email_normalized", "phone", "phone_normalized", "password_hash", "profile", "status", "kyc_status", "created_at", "updated_at"],
        {
            "email": STRING,
            "email_normalized": STRING,
            "phone": STRING,
            "phone_normalized": STRING,
            "password_hash": STRING,
            "profile": {"bsonType": "object"},
            "preferences": {"bsonType": "object"},
            "status": {"enum": ["pending_kyc", "active", "suspended", "closed"]},
            "kyc_status": {"enum": ["draft", "submitted", "approved", "rejected", "needs_review"]},
            "created_at": DATE,
            "updated_at": DATE,
            "last_login_at": NULL_DATE,
        },
    ),
    "savings_profiles": object_schema(
        ["user_id", "income_pattern", "safe_monthly_savings_minor", "currency", "answers_version", "created_at", "updated_at"],
        {
            "user_id": OID,
            "income_pattern": {"enum": ["fixed", "variable", "mixed"]},
            "fixed_monthly_income_minor": {"bsonType": ["long", "null"]},
            "variable_income_frequency": {"enum": ["weekly", "biweekly", "irregular", None]},
            "safe_monthly_savings_minor": MONEY,
            "currency": {"enum": ["GTQ"]},
            "answers_version": {"bsonType": "int"},
            "created_at": DATE,
            "updated_at": DATE,
        },
    ),
    "auth_sessions": object_schema(
        ["user_id", "access_token_hash", "created_at", "expires_at"],
        {"user_id": OID, "access_token_hash": STRING, "device": {"bsonType": "object"}, "created_at": DATE, "expires_at": DATE, "revoked_at": NULL_DATE},
    ),
    "kyc_cases": object_schema(
        ["user_id", "status", "contact_snapshot", "document_ids", "created_at", "updated_at"],
        {"user_id": OID, "status": {"enum": ["draft", "submitted", "approved", "rejected", "needs_review"]}, "contact_snapshot": {"bsonType": "object"}, "document_ids": {"bsonType": "array", "items": OID, "maxItems": 4}, "provider": {"bsonType": "object"}, "submitted_at": NULL_DATE, "created_at": DATE, "updated_at": DATE},
    ),
    "media_assets": object_schema(
        ["owner_id", "kyc_case_id", "slot", "storage_key", "mime_type", "size_bytes", "sha256", "source", "scan_status", "created_at"],
        {"owner_id": OID, "kyc_case_id": OID, "slot": {"enum": ["dpi_front", "dpi_back", "selfie", "proof"]}, "storage_key": STRING, "mime_type": STRING, "size_bytes": {"bsonType": ["int", "long"]}, "sha256": STRING, "source": {"enum": ["camera", "upload"]}, "scan_status": {"enum": ["pending", "clean", "rejected"]}, "created_at": DATE, "purge_at": NULL_DATE},
    ),
    "goals": object_schema(
        ["owner_id", "client_creation_id", "name", "category", "currency", "target_amount_minor", "saved_amount_minor", "status", "created_at", "updated_at"],
        {"owner_id": OID, "client_creation_id": STRING, "name": {"bsonType": "string", "maxLength": 120}, "category": {"enum": ["travel", "motorcycle", "education", "business", "housing", "emergency", "other"]}, "currency": {"enum": ["GTQ"]}, "target_amount_minor": MONEY, "saved_amount_minor": MONEY, "planning_context": {"bsonType": "object"}, "recommendation": {"bsonType": "object"}, "target_date": NULL_DATE, "status": {"enum": ["draft", "active", "paused", "completed", "cancelled"]}, "created_at": DATE, "updated_at": DATE, "deleted_at": NULL_DATE},
    ),
    "shared_plans": object_schema(
        ["type", "name", "currency", "balance_minor", "created_by", "member_count", "status", "created_at", "updated_at"],
        {"type": {"enum": ["group_challenge", "family_fund"]}, "name": STRING, "currency": {"enum": ["GTQ"]}, "target_amount_minor": MONEY, "balance_minor": MONEY, "created_by": OID, "expected_participants": {"bsonType": "int"}, "rules": {"bsonType": "object"}, "member_count": {"bsonType": "int"}, "status": {"enum": ["draft", "inviting", "active", "paused", "completed", "cancelled"]}, "created_at": DATE, "updated_at": DATE, "deleted_at": NULL_DATE},
    ),
    "memberships": object_schema(
        ["shared_plan_id", "user_id", "role", "status", "created_at", "updated_at"],
        {"shared_plan_id": OID, "user_id": OID, "role": {"enum": ["owner", "admin", "member"]}, "status": {"enum": ["invited", "active", "declined", "removed"]}, "invitation_id": {"bsonType": ["objectId", "null"]}, "joined_at": NULL_DATE, "created_at": DATE, "updated_at": DATE},
    ),
    "plan_invitations": object_schema(
        ["shared_plan_id", "inviter_id", "invitee", "role", "token_hash", "status", "expires_at", "created_at", "updated_at"],
        {"shared_plan_id": OID, "inviter_id": OID, "invitee": {"bsonType": "object"}, "role": {"enum": ["admin", "member"]}, "token_hash": STRING, "status": {"enum": ["pending", "accepted", "declined", "expired", "revoked"]}, "expires_at": DATE, "accepted_at": NULL_DATE, "created_at": DATE, "updated_at": DATE, "purge_at": NULL_DATE},
    ),
    "contributions": object_schema(
        ["user_id", "destination", "amount_minor", "currency", "idempotency_key", "status", "occurred_at", "created_at"],
        {"user_id": OID, "destination": {"bsonType": "object"}, "amount_minor": MONEY, "currency": {"enum": ["GTQ"]}, "description": STRING, "idempotency_key": STRING, "status": {"enum": ["pending", "posted", "failed", "reversed"]}, "occurred_at": DATE, "created_at": DATE},
    ),
    "withdrawal_requests": object_schema(
        ["requester_id", "source", "amount_minor", "currency", "approval_snapshot", "status", "created_at"],
        {"requester_id": OID, "source": {"bsonType": "object"}, "amount_minor": MONEY, "currency": {"enum": ["GTQ"]}, "reason": STRING, "approval_snapshot": {"bsonType": "object"}, "status": {"enum": ["pending", "approved", "rejected", "executed", "cancelled"]}, "created_at": DATE, "decided_at": NULL_DATE, "executed_at": NULL_DATE},
    ),
    "votes": object_schema(
        ["withdrawal_request_id", "voter_id", "decision", "created_at"],
        {"withdrawal_request_id": OID, "voter_id": OID, "decision": {"enum": ["approve", "reject"]}, "comment": {"bsonType": ["string", "null"]}, "created_at": DATE},
    ),
    "copilot_conversations": object_schema(
        ["user_id", "title", "context", "status", "message_count", "last_message_at", "created_at", "updated_at"],
        {"user_id": OID, "title": STRING, "context": {"bsonType": "object"}, "status": {"enum": ["active", "archived"]}, "message_count": {"bsonType": "int"}, "last_message_at": DATE, "summary": {"bsonType": "object"}, "created_at": DATE, "updated_at": DATE},
    ),
    "copilot_messages": object_schema(
        ["conversation_id", "sender", "content", "kind", "metadata", "created_at"],
        {"conversation_id": OID, "sender": {"enum": ["user", "assistant", "system"]}, "content": {"bsonType": "string", "maxLength": 12000}, "kind": {"enum": ["text", "recommendation", "action"]}, "metadata": {"bsonType": "object"}, "client_message_id": {"bsonType": ["string", "null"]}, "created_at": DATE},
    ),
    "activities": object_schema(
        ["user_id", "type", "title", "tone", "occurred_at"],
        {"user_id": OID, "type": STRING, "title": STRING, "amount_minor": {"bsonType": ["long", "null"]}, "tone": {"enum": ["success", "muted"]}, "reference": {"bsonType": "object"}, "occurred_at": DATE},
    ),
    "audit_events": object_schema(
        ["actor_id", "action", "entity_type", "entity_id", "result", "occurred_at"],
        {"actor_id": OID, "action": STRING, "entity_type": STRING, "entity_id": OID, "result": STRING, "request_id": {"bsonType": ["string", "null"]}, "metadata": {"bsonType": "object"}, "occurred_at": DATE},
    ),
}


INDEXES: dict[str, list[IndexModel]] = {
    "users": [IndexModel("email_normalized", unique=True), IndexModel("phone_normalized", unique=True), IndexModel([("status", ASCENDING), ("created_at", DESCENDING)])],
    "savings_profiles": [IndexModel("user_id", unique=True)],
    "auth_sessions": [IndexModel([("user_id", ASCENDING), ("revoked_at", ASCENDING)]), IndexModel("access_token_hash", unique=True), IndexModel("expires_at", expireAfterSeconds=0)],
    "kyc_cases": [IndexModel([("user_id", ASCENDING), ("status", ASCENDING)]), IndexModel([("status", ASCENDING), ("submitted_at", ASCENDING)])],
    "media_assets": [IndexModel([("kyc_case_id", ASCENDING), ("slot", ASCENDING)], unique=True), IndexModel([("scan_status", ASCENDING), ("created_at", ASCENDING)]), IndexModel("purge_at", expireAfterSeconds=0)],
    "goals": [IndexModel([("owner_id", ASCENDING), ("status", ASCENDING), ("updated_at", DESCENDING)]), IndexModel([("owner_id", ASCENDING), ("client_creation_id", ASCENDING)], unique=True)],
    "shared_plans": [IndexModel([("created_by", ASCENDING), ("created_at", DESCENDING)]), IndexModel([("type", ASCENDING), ("status", ASCENDING)])],
    "memberships": [IndexModel([("shared_plan_id", ASCENDING), ("user_id", ASCENDING)], unique=True), IndexModel([("user_id", ASCENDING), ("status", ASCENDING), ("updated_at", DESCENDING)])],
    "plan_invitations": [IndexModel("token_hash", unique=True), IndexModel([("invitee.user_id", ASCENDING), ("status", ASCENDING), ("created_at", DESCENDING)]), IndexModel("purge_at", expireAfterSeconds=0)],
    "contributions": [IndexModel([("user_id", ASCENDING), ("idempotency_key", ASCENDING)], unique=True), IndexModel([("destination.id", ASCENDING), ("occurred_at", DESCENDING), ("_id", DESCENDING)]), IndexModel([("user_id", ASCENDING), ("occurred_at", DESCENDING)])],
    "withdrawal_requests": [IndexModel([("source.id", ASCENDING), ("status", ASCENDING), ("created_at", DESCENDING)]), IndexModel([("requester_id", ASCENDING), ("created_at", DESCENDING)])],
    "votes": [IndexModel([("withdrawal_request_id", ASCENDING), ("voter_id", ASCENDING)], unique=True)],
    "copilot_conversations": [IndexModel([("user_id", ASCENDING), ("status", ASCENDING), ("last_message_at", DESCENDING)]), IndexModel([("context.entity_id", ASCENDING), ("updated_at", DESCENDING)])],
    "copilot_messages": [IndexModel([("conversation_id", ASCENDING), ("created_at", DESCENDING), ("_id", DESCENDING)]), IndexModel([("conversation_id", ASCENDING), ("client_message_id", ASCENDING)], unique=True, partialFilterExpression={"client_message_id": {"$type": "string"}})],
    "activities": [IndexModel([("user_id", ASCENDING), ("occurred_at", DESCENDING), ("_id", DESCENDING)])],
    "audit_events": [IndexModel([("entity_type", ASCENDING), ("entity_id", ASCENDING), ("occurred_at", DESCENDING)]), IndexModel([("actor_id", ASCENDING), ("occurred_at", DESCENDING)])],
}


async def initialize_database(database: AsyncDatabase[dict[str, Any]], seed_demo: bool) -> None:
    existing = set(await database.list_collection_names())
    for name, validator in COLLECTIONS.items():
        if name not in existing:
            await database.create_collection(
                name, validator=validator, validationLevel="strict", validationAction="error"
            )
        else:
            await database.command(
                {"collMod": name, "validator": validator, "validationLevel": "strict", "validationAction": "error"}
            )
        if INDEXES.get(name):
            await database[name].create_indexes(INDEXES[name])
    if seed_demo:
        await seed_demo_data(database)


async def seed_demo_data(database: AsyncDatabase[dict[str, Any]]) -> None:
    user_id = ObjectId("66c000000000000000000001")
    goal_id = ObjectId("66c000000000000000000002")
    now = datetime.now(UTC)
    await database.users.update_one(
        {"_id": user_id},
        {"$setOnInsert": {"email": "diego@correo.com", "email_normalized": "diego@correo.com", "phone": "+50255123456", "phone_normalized": "+50255123456", "password_hash": hash_password("novu2026"), "profile": {"first_name": "Diego", "last_name": "López", "locale": "es-GT", "timezone": "America/Guatemala"}, "preferences": {"primary_goal_id": goal_id}, "status": "active", "kyc_status": "approved", "created_at": now, "updated_at": now, "last_login_at": None}},
        upsert=True,
    )
    await database.savings_profiles.update_one(
        {"user_id": user_id},
        {"$setOnInsert": {"income_pattern": "fixed", "fixed_monthly_income_minor": Int64(600000), "variable_income_frequency": None, "safe_monthly_savings_minor": Int64(72000), "currency": "GTQ", "answers_version": 1, "created_at": now, "updated_at": now}},
        upsert=True,
    )
    await database.goals.update_one(
        {"_id": goal_id},
        {"$setOnInsert": {"owner_id": user_id, "client_creation_id": "demo-goal-antigua", "name": "Viaje a Antigua", "category": "travel", "currency": "GTQ", "target_amount_minor": Int64(200000), "saved_amount_minor": Int64(125000), "planning_context": {"motivations": ["travel", "peace_of_mind"], "starting_point": "habitual_saver", "horizon": "flexible", "answers_version": 1}, "recommendation": {"contribution_amount_minor": Int64(18000), "contribution_frequency": "weekly", "estimated_months": 7, "generated_by": "rules_v1", "generated_at": now}, "target_date": None, "status": "active", "activated_at": now, "completed_at": None, "created_at": now, "updated_at": now, "deleted_at": None}},
        upsert=True,
    )
    demo_activities = [
        ("demo-activity-weekly", "contribution", "Aporte semanal", 18000, "success", 0),
        ("demo-activity-challenge", "contribution", "Reto de julio", 7500, "success", 1),
        ("demo-activity-coffee", "withdrawal", "Café con amigos", -4500, "muted", 6),
    ]
    for key, kind, title, amount, tone, days in demo_activities:
        await database.activities.update_one(
            {"reference.seed_key": key},
            {"$setOnInsert": {"user_id": user_id, "type": kind, "title": title, "amount_minor": Int64(amount), "tone": tone, "reference": {"seed_key": key}, "occurred_at": now - timedelta(days=days)}},
            upsert=True,
        )
    await database.contributions.update_one(
        {"user_id": user_id, "idempotency_key": "demo-weekly-contribution"},
        {"$setOnInsert": {"destination": {"type": "goal", "id": goal_id}, "amount_minor": Int64(18000), "currency": "GTQ", "description": "Aporte semanal", "status": "posted", "occurred_at": now, "created_at": now}},
        upsert=True,
    )


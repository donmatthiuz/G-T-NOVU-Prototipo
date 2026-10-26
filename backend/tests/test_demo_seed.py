from copy import deepcopy
from unittest.mock import AsyncMock, MagicMock

import pytest
from bson import ObjectId
from pymongo.errors import DuplicateKeyError

from app.core.security import verify_password
from app.db.initialize import seed_demo_data


@pytest.mark.asyncio
async def test_demo_can_be_seeded_repeatedly_beside_a_registered_example_phone():
    existing = {
        "_id": ObjectId(),
        "email_normalized": "vos@correo.com",
        "phone_normalized": "+50255123456",
        "password_hash": "existing-password-hash",
    }
    original = deepcopy(existing)
    users = {existing["_id"]: existing}

    async def upsert_user(query, update, *, upsert):
        if query["_id"] in users:
            return
        candidate = {"_id": query["_id"], **update["$setOnInsert"]}
        for field in ["phone_normalized", "email_normalized"]:
            if any(user[field] == candidate[field] for user in users.values()):
                raise DuplicateKeyError(f"duplicate {field}")
        users[candidate["_id"]] = candidate

    database = MagicMock()
    database.users.update_one = AsyncMock(side_effect=upsert_user)
    for name in [
        "savings_profiles", "goals", "shared_plans", "memberships",
        "activities", "contributions", "withdrawal_requests", "votes",
    ]:
        getattr(database, name).update_one = AsyncMock()

    await seed_demo_data(database)
    await seed_demo_data(database)

    assert len(users) == 2
    assert users[existing["_id"]] == original
    demo = users[ObjectId("66c000000000000000000001")]
    assert demo["email_normalized"] == "diego@correo.com"
    assert demo["status"] == "active"
    assert verify_password(demo["password_hash"], "novu2026")

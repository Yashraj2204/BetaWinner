"""Idempotent database seeding: admin account + demo user with sample data."""
import random
import uuid
from datetime import date as date_cls, datetime, timedelta, timezone

import config
from constants import FACTORS
from database import db
from security import hash_password, verify_password
from utils import co2_for

DEMO_EMAIL = "demo@ecotrace.app"
DEMO_PASSWORD = "demo1234"

# (category, type, value range) pool for realistic demo data.
_DEMO_POOL = [
    ("transport", "car_petrol", (5, 35)), ("transport", "bus", (3, 20)),
    ("transport", "train", (5, 30)), ("transport", "bicycle", (2, 10)),
    ("energy", "electricity", (3, 12)), ("energy", "natural_gas", (2, 8)),
    ("food", "chicken", (1, 2)), ("food", "beef", (1, 1)),
    ("food", "vegetarian", (1, 3)), ("food", "vegan", (1, 2)),
    ("shopping", "clothing", (1, 1)), ("shopping", "groceries", (1, 2)),
]


async def seed_admin() -> None:
    """Create the admin account, or resync its password with the env value."""
    existing = await db.users.find_one({"email": config.ADMIN_EMAIL})
    if existing is None:
        await db.users.insert_one({
            "_id": str(uuid.uuid4()), "email": config.ADMIN_EMAIL, "name": "Admin",
            "password_hash": hash_password(config.ADMIN_PASSWORD), "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
    elif not verify_password(config.ADMIN_PASSWORD, existing["password_hash"]):
        await db.users.update_one(
            {"email": config.ADMIN_EMAIL},
            {"$set": {"password_hash": hash_password(config.ADMIN_PASSWORD)}},
        )


async def seed_demo_user() -> None:
    """Create a demo user with 21 days of varied activity history (run once)."""
    if await db.users.find_one({"email": DEMO_EMAIL}):
        return
    user_id = str(uuid.uuid4())
    await db.users.insert_one({
        "_id": user_id, "email": DEMO_EMAIL, "name": "Demo User",
        "password_hash": hash_password(DEMO_PASSWORD), "role": "user",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    rng = random.Random(42)
    activities = []
    for i in range(21):
        day = (date_cls.today() - timedelta(days=i)).isoformat()
        for cat, typ, (lo, hi) in rng.sample(_DEMO_POOL, rng.randint(2, 4)):
            value = round(rng.uniform(lo, hi), 1) if cat in ("transport", "energy") else rng.randint(lo, hi)
            info = FACTORS[cat][typ]
            activities.append({
                "_id": str(uuid.uuid4()), "user_id": user_id, "category": cat,
                "activity_type": typ, "label": info["label"], "value": value,
                "unit": info["unit"], "co2_kg": co2_for(value, info["factor"]),
                "date": day, "created_at": datetime.now(timezone.utc).isoformat(),
            })
    if activities:
        await db.activities.insert_many(activities)

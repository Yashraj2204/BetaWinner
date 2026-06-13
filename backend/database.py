"""MongoDB connection (motor async driver) and index management."""
from motor.motor_asyncio import AsyncIOMotorClient

import config

client = AsyncIOMotorClient(config.MONGO_URL)
db = client[config.DB_NAME]


async def ensure_indexes() -> None:
    """Create the indexes every query path relies on (idempotent)."""
    await db.users.create_index("email", unique=True)
    await db.login_attempts.create_index("identifier")
    # Compound index serves activity listing, dashboard and achievements queries.
    await db.activities.create_index([("user_id", 1), ("date", -1)])
    await db.insights.create_index("user_id")

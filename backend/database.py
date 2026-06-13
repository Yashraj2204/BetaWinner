"""MongoDB connection — real Motor client locally, mongomock on Vercel/serverless.

Set USE_MOCK_DB=true to force in-memory mode (data resets on each cold start
but the full API surface works — ideal for demos/Vercel deployments without Atlas).
"""
import os
import config

_mongo_url = os.environ.get("MONGO_URL", "")
_is_vercel = "VERCEL" in os.environ
_has_local_mongo = not _mongo_url or "localhost" in _mongo_url or "127.0.0.1" in _mongo_url

if os.environ.get("USE_MOCK_DB", "").lower() == "true":
    USE_MOCK = True
elif _is_vercel and _has_local_mongo:
    USE_MOCK = True
else:
    USE_MOCK = os.environ.get("USE_MOCK_DB", "false").lower() == "true"

if USE_MOCK:
    # In-memory MongoDB — no external service needed (Vercel / CI / demo)
    import mongomock
    import motor.motor_asyncio

    _mock_client = mongomock.MongoClient()

    class _MockAsyncDB:
        """Thin async wrapper around the synchronous mongomock client."""

        def __init__(self, mock_db):
            self._db = mock_db

        def __getattr__(self, name):
            return _MockAsyncCollection(self._db[name])

        def __getitem__(self, name):
            return _MockAsyncCollection(self._db[name])

    class _MockAsyncCollection:
        def __init__(self, col):
            self._col = col

        async def find_one(self, *a, **kw):
            return self._col.find_one(*a, **kw)

        def find(self, *a, **kw):
            return _MockAsyncCursor(self._col.find(*a, **kw))

        async def insert_one(self, *a, **kw):
            return self._col.insert_one(*a, **kw)

        async def insert_many(self, *a, **kw):
            return self._col.insert_many(*a, **kw)

        async def update_one(self, *a, **kw):
            return self._col.update_one(*a, **kw)

        async def delete_one(self, *a, **kw):
            return self._col.delete_one(*a, **kw)

        async def create_index(self, *a, **kw):
            return self._col.create_index(*a, **kw)

        async def count_documents(self, *a, **kw):
            return self._col.count_documents(*a, **kw)

        def aggregate(self, pipeline, **kw):
            return _MockAsyncCursor(self._col.aggregate(pipeline))

    class _MockAsyncCursor:
        def __init__(self, cursor):
            self._cursor = cursor
            self._results = None

        def sort(self, *a, **kw):
            self._cursor = self._cursor.sort(*a, **kw)
            return self

        def limit(self, n):
            self._cursor = self._cursor.limit(n)
            return self

        def skip(self, n):
            self._cursor = self._cursor.skip(n)
            return self

        async def to_list(self, length=None):
            results = list(self._cursor)
            if length is not None:
                results = results[:length]
            return results

        def __aiter__(self):
            self._results = iter(list(self._cursor))
            return self

        async def __anext__(self):
            try:
                return next(self._results)
            except StopIteration:
                raise StopAsyncIteration

    _mock_db_instance = _MockAsyncDB(_mock_client["ecotrace_mock"])
    client = _mock_client
    db = _mock_db_instance

else:
    # Real Motor async client (local dev or MongoDB Atlas)
    from motor.motor_asyncio import AsyncIOMotorClient
    client = AsyncIOMotorClient(config.MONGO_URL)
    db = client[config.DB_NAME]


async def ensure_indexes() -> None:
    """Create the indexes every query path relies on (idempotent)."""
    try:
        await db.users.create_index("email", unique=True)
        await db.login_attempts.create_index("identifier")
        await db.activities.create_index([("user_id", 1), ("date", -1)])
        await db.insights.create_index("user_id")
    except Exception:
        pass  # mongomock may not support all index options

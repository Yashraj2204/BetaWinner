"""EcoTrace API entry point.

Assembles middleware (CORS + security headers), mounts the versioned `/api`
router and wires startup/shutdown lifecycle (indexes + idempotent seeding).
Run via supervisor: `uvicorn server:app --host 0.0.0.0 --port 8001`.
"""
import config  # noqa: F401  — must be first: loads .env before anything else

import logging

from fastapi import APIRouter, FastAPI
from starlette.middleware.cors import CORSMiddleware

import seed
from database import client, ensure_indexes
from routers import activities, auth, insights, stats

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("ecotrace")

app = FastAPI(
    title="EcoTrace API",
    description="Carbon Footprint Awareness Platform — track, understand and reduce your CO2 emissions.",
    version="1.0.0",
)

api_router = APIRouter(prefix="/api")


@api_router.get("/")
async def root():
    """Health check."""
    return {"message": "EcoTrace API running"}


api_router.include_router(auth.router)
api_router.include_router(activities.router)
api_router.include_router(stats.router)
api_router.include_router(insights.router)
app.include_router(api_router)


@app.middleware("http")
async def security_headers(request, call_next):
    """Attach standard security headers to every response."""
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    return response


app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=config.CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup() -> None:
    await ensure_indexes()
    await seed.seed_admin()
    await seed.seed_demo_user()
    logger.info("EcoTrace started: indexes ensured, admin & demo seeded")


@app.on_event("shutdown")
async def shutdown() -> None:
    client.close()

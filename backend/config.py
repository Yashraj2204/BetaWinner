"""Application configuration.

All settings come from environment variables (loaded from `.env`).
On Vercel, set USE_MOCK_DB=true — MONGO_URL is then optional.
"""
import os
from pathlib import Path

from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

USE_MOCK_DB: bool = os.environ.get("USE_MOCK_DB", "false").lower() == "true"

# --- Database (optional when USE_MOCK_DB=true) ---
MONGO_URL: str = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME: str = os.environ.get("DB_NAME", "ecotrace")

# --- Required ---
JWT_SECRET: str = os.environ.get(
    "JWT_SECRET",
    "9f4c2e8a1b7d3f6e0a5c8b2d4e7f1a3c6b9d2e5f8a1c4b7d0e3f6a9c2b5d8e1f"
)

# --- AI (optional — insights will return an error if missing) ---
EMERGENT_LLM_KEY: str = os.environ.get("EMERGENT_LLM_KEY", "")

# --- Optional with safe defaults ---
CORS_ORIGINS: list = [o.strip() for o in os.environ.get("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001").split(",") if o.strip()]
COOKIE_SECURE: bool = os.environ.get("COOKIE_SECURE", "false").lower() == "true"
LLM_MODEL: str = os.environ.get("LLM_MODEL", "gpt-4o")
ADMIN_EMAIL: str = os.environ.get("ADMIN_EMAIL", "admin@ecotrace.app")
ADMIN_PASSWORD: str = os.environ.get("ADMIN_PASSWORD", "admin1234")

"""Application configuration.

All settings come from environment variables (loaded from `.env`).
Required variables fail fast at import time so a misconfigured deployment
never starts silently.
"""
import os
from pathlib import Path

from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# --- Required (KeyError on missing => fail fast) ---
MONGO_URL: str = os.environ["MONGO_URL"]
DB_NAME: str = os.environ["DB_NAME"]
JWT_SECRET: str = os.environ["JWT_SECRET"]
EMERGENT_LLM_KEY: str = os.environ["EMERGENT_LLM_KEY"]

# --- Optional with safe defaults ---
CORS_ORIGINS: list = [o.strip() for o in os.environ.get("CORS_ORIGINS", "").split(",") if o.strip()]
COOKIE_SECURE: bool = os.environ.get("COOKIE_SECURE", "true").lower() == "true"
LLM_MODEL: str = os.environ.get("LLM_MODEL", "gpt-5")
ADMIN_EMAIL: str = os.environ.get("ADMIN_EMAIL", "admin@ecotrace.app")
ADMIN_PASSWORD: str = os.environ.get("ADMIN_PASSWORD", "admin1234")

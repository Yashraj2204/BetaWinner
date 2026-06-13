"""Vercel serverless entrypoint — imports the FastAPI app from the parent package."""
import sys
import os

# Make backend root importable
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from server import app  # noqa: F401  – Vercel picks up `app`



"""Vercel serverless entrypoint — imports the FastAPI app from the parent package."""
import sys
import os
import traceback

# Make backend root importable
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from server import app
except Exception as e:
    from fastapi import FastAPI
    app = FastAPI(title="EcoTrace Fallback")
    
    @app.api_route("/{path_name:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"])
    async def fallback_error_handler(path_name: str):
        tb = traceback.format_exc()
        return {
            "error": "Failed to initialize application",
            "exception": str(e),
            "traceback": tb
        }


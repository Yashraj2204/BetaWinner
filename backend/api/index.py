import sys
import os
import traceback
from fastapi import FastAPI

# Satisfy Vercel's AST analyzer with a top-level definition
app = FastAPI(title="EcoTrace Entry")

# Make backend root importable
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from server import app as real_app
    app = real_app
except Exception as err:
    # Safely capture error information so it is not cleaned up at the end of the except block
    error_message = str(err)
    error_traceback = traceback.format_exc()
    
    # Overwrite with fallback app if real app fails to load
    fallback_app = FastAPI(title="EcoTrace Fallback")
    
    @fallback_app.api_route("/{path_name:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"])
    async def fallback_error_handler(path_name: str):
        return {
            "error": "Failed to initialize application in index.py",
            "exception": error_message,
            "traceback": error_traceback,
            "sys_path": sys.path,
            "files": os.listdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))) if os.path.exists(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))) else []
        }
    app = fallback_app

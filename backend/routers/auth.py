"""Authentication routes: register, login, logout, session info, token refresh.

Brute-force protection: 5 failed logins per ip+email combination locks the
account out of login for 15 minutes (tracked in the `login_attempts` collection).

Tokens are returned BOTH as httpOnly cookies (for browser security) AND in the
response body (for clients that prefer Bearer token / localStorage storage).
"""
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException, Request, Response

from database import db
from schemas import LoginIn, RegisterIn, public_user
from security import (
    clear_auth_cookies, create_access_token, create_refresh_token,
    decode_token, get_current_user, hash_password, set_auth_cookies, verify_password,
)

router = APIRouter(prefix="/auth", tags=["auth"])

MAX_FAILED_ATTEMPTS = 5
LOCKOUT_MINUTES = 15


@router.post("/register")
async def register(body: RegisterIn, response: Response):
    email = body.email.strip().lower()
    if "@" not in email or "." not in email:
        raise HTTPException(status_code=400, detail="Invalid email address")
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="An account with this email already exists")
    user = {
        "_id": str(uuid.uuid4()),
        "name": body.name.strip(),
        "email": email,
        "password_hash": hash_password(body.password),
        "role": "user",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(user)
    access_token = create_access_token(user["_id"], email)
    refresh_token = create_refresh_token(user["_id"])
    set_auth_cookies(response, access_token, refresh_token)
    return {
        **public_user(user),
        "access_token": access_token,
        "refresh_token": refresh_token,
    }


@router.post("/login")
async def login(body: LoginIn, request: Request, response: Response):
    email = body.email.strip().lower()
    identifier = f"{request.client.host if request.client else 'unknown'}:{email}"
    now = datetime.now(timezone.utc)

    attempt = await db.login_attempts.find_one({"identifier": identifier})
    if attempt and attempt.get("locked_until") and datetime.fromisoformat(attempt["locked_until"]) > now:
        raise HTTPException(status_code=429, detail="Too many failed attempts. Try again in 15 minutes.")

    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user["password_hash"]):
        count = (attempt.get("count", 0) + 1) if attempt else 1
        update = {"identifier": identifier, "count": count}
        if count >= MAX_FAILED_ATTEMPTS:
            update["locked_until"] = (now + timedelta(minutes=LOCKOUT_MINUTES)).isoformat()
            update["count"] = 0
        await db.login_attempts.update_one({"identifier": identifier}, {"$set": update}, upsert=True)
        raise HTTPException(status_code=401, detail="Invalid email or password")

    await db.login_attempts.delete_one({"identifier": identifier})
    access_token = create_access_token(user["_id"], email)
    refresh_token = create_refresh_token(user["_id"])
    set_auth_cookies(response, access_token, refresh_token)
    return {
        **public_user(user),
        "access_token": access_token,
        "refresh_token": refresh_token,
    }


@router.post("/logout")
async def logout(response: Response):
    clear_auth_cookies(response)
    return {"message": "Logged out"}


@router.get("/me")
async def me(request: Request):
    user = await get_current_user(request)
    return {"id": user["id"], "name": user["name"], "email": user["email"]}


@router.post("/refresh")
async def refresh(request: Request, response: Response):
    # Accept refresh token from cookie OR request body
    token = request.cookies.get("refresh_token")
    if not token:
        try:
            body = await request.json()
            token = body.get("refresh_token")
        except Exception:
            pass
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")
    payload = decode_token(token, expected_type="refresh")
    user = await db.users.find_one({"_id": payload["sub"]})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    access_token = create_access_token(user["_id"], user["email"])
    response.set_cookie(
        "access_token", access_token,
        httponly=True, secure=__import__("config").COOKIE_SECURE, samesite="lax", max_age=3600, path="/",
    )
    return {"message": "refreshed", "access_token": access_token}

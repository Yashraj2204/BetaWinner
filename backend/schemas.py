"""Pydantic request schemas and response shaping helpers."""
from typing import Optional

from pydantic import BaseModel, Field


class RegisterIn(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    email: str = Field(max_length=254)
    password: str = Field(min_length=6, max_length=128)


class LoginIn(BaseModel):
    email: str = Field(max_length=254)
    password: str = Field(max_length=128)


class ActivityIn(BaseModel):
    category: str = Field(max_length=30)
    activity_type: str = Field(max_length=40)
    value: float = Field(gt=0, le=100_000)
    date: Optional[str] = None  # ISO YYYY-MM-DD; defaults to today server-side


def public_user(user_doc: dict) -> dict:
    """Strip credentials/internal fields before returning a user over the API."""
    return {"id": user_doc["_id"], "name": user_doc["name"], "email": user_doc["email"]}

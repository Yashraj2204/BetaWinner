"""Activity logging routes and the public emission-factor catalogue."""
import uuid
from datetime import date as date_cls, datetime, timezone

from fastapi import APIRouter, HTTPException, Query, Request

from constants import FACTORS
from database import db
from schemas import ActivityIn
from security import get_current_user
from utils import co2_for

router = APIRouter(tags=["activities"])


@router.get("/emission-factors")
async def emission_factors():
    """Public catalogue of supported activities and their kg CO2e factors."""
    return FACTORS


@router.post("/activities")
async def create_activity(body: ActivityIn, request: Request):
    user = await get_current_user(request)
    category = FACTORS.get(body.category)
    if not category or body.activity_type not in category:
        raise HTTPException(status_code=400, detail="Unknown category or activity type")
    info = category[body.activity_type]

    act_date = body.date or date_cls.today().isoformat()
    try:
        date_cls.fromisoformat(act_date)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format, use YYYY-MM-DD")

    activity = {
        "_id": str(uuid.uuid4()),
        "user_id": user["id"],
        "category": body.category,
        "activity_type": body.activity_type,
        "label": info["label"],
        "value": body.value,
        "unit": info["unit"],
        "co2_kg": co2_for(body.value, info["factor"]),
        "date": act_date,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.activities.insert_one(activity)
    activity["id"] = activity.pop("_id")
    return activity


@router.get("/activities")
async def list_activities(request: Request, limit: int = Query(20, ge=1, le=100)):
    user = await get_current_user(request)
    docs = (
        await db.activities.find({"user_id": user["id"]})
        .sort([("date", -1), ("created_at", -1)])
        .to_list(limit)
    )
    for d in docs:
        d["id"] = d.pop("_id")
    return docs


@router.delete("/activities/{activity_id}")
async def delete_activity(activity_id: str, request: Request):
    user = await get_current_user(request)
    # Scoping the filter by user_id makes cross-user deletion impossible (IDOR-safe).
    result = await db.activities.delete_one({"_id": activity_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Activity not found")
    return {"message": "deleted"}

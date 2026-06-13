"""Dashboard statistics and gamification (achievements, streaks).

Heavy lifting is pushed into MongoDB `$facet` aggregation pipelines so each
endpoint costs a constant number of round trips regardless of data volume.
"""
from datetime import date as date_cls, timedelta

from fastapi import APIRouter, Request

from constants import BADGES, GLOBAL_WEEKLY_AVG_KG, TREE_ABSORPTION_KG_PER_MONTH
from database import db
from security import get_current_user
from utils import compute_streak

router = APIRouter(tags=["stats"])


@router.get("/dashboard")
async def dashboard(request: Request):
    user = await get_current_user(request)
    today = date_cls.today()
    today_iso = today.isoformat()
    since = (today - timedelta(days=59)).isoformat()
    week_start = (today - timedelta(days=6)).isoformat()
    month_start = (today - timedelta(days=29)).isoformat()

    pipeline = [
        {"$match": {"user_id": user["id"], "date": {"$gte": since}}},
        {"$facet": {
            "daily": [{"$group": {"_id": "$date", "kg": {"$sum": "$co2_kg"}}}],
            "breakdown": [
                {"$match": {"date": {"$gte": month_start}}},
                {"$group": {"_id": "$category", "kg": {"$sum": "$co2_kg"}}},
                {"$sort": {"kg": -1}},
            ],
        }},
    ]
    facets = (await db.activities.aggregate(pipeline).to_list(1))[0]
    daily = {row["_id"]: row["kg"] for row in facets["daily"]}

    # Streak uses the full history (distinct is a single indexed command).
    all_dates = set(await db.activities.distinct("date", {"user_id": user["id"]}))
    total_count = await db.activities.count_documents({"user_id": user["id"]})

    today_kg = daily.get(today_iso, 0.0)
    week_kg = sum(kg for day, kg in daily.items() if day >= week_start)
    month_kg = sum(kg for day, kg in daily.items() if day >= month_start)

    trend = []
    for i in range(13, -1, -1):
        day = today - timedelta(days=i)
        trend.append({
            "date": day.isoformat(),
            "label": day.strftime("%b %d"),
            "kg": round(daily.get(day.isoformat(), 0.0), 2),
        })

    return {
        "today_kg": round(today_kg, 2),
        "week_kg": round(week_kg, 2),
        "month_kg": round(month_kg, 2),
        "streak": compute_streak(all_dates),
        "activity_count": total_count,
        "category_breakdown": [
            {"category": row["_id"], "kg": round(row["kg"], 2)} for row in facets["breakdown"]
        ],
        "daily_trend": trend,
        "vs_global_pct": round((week_kg / GLOBAL_WEEKLY_AVG_KG) * 100) if week_kg else 0,
        "trees_to_offset_month": round(month_kg / TREE_ABSORPTION_KG_PER_MONTH, 1),
    }


@router.get("/achievements")
async def achievements(request: Request):
    user = await get_current_user(request)
    pipeline = [
        {"$match": {"user_id": user["id"]}},
        {"$facet": {
            "count": [{"$count": "n"}],
            "categories": [{"$group": {"_id": "$category"}}],
            "daily": [{"$group": {"_id": "$date", "kg": {"$sum": "$co2_kg"}}}],
        }},
    ]
    facets = (await db.activities.aggregate(pipeline).to_list(1))[0]
    count = facets["count"][0]["n"] if facets["count"] else 0
    categories = {row["_id"] for row in facets["categories"]}
    daily = {row["_id"]: row["kg"] for row in facets["daily"]}
    streak = compute_streak(set(daily))
    has_insight = await db.insights.find_one({"user_id": user["id"]}) is not None

    earned_map = {
        "first_step": count >= 1,
        "eco_curious": count >= 10,
        "data_devotee": count >= 50,
        "streak_3": streak >= 3,
        "streak_7": streak >= 7,
        "streak_30": streak >= 30,
        "explorer": len(categories) >= 4,
        "light_day": any(0 < kg < 5 for kg in daily.values()),
        "insight_seeker": has_insight,
    }
    badges = [{**b, "earned": earned_map[b["id"]]} for b in BADGES]
    return {
        "streak": streak,
        "earned_count": sum(earned_map.values()),
        "total": len(BADGES),
        "badges": badges,
    }

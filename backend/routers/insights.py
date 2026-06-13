"""AI-powered personalized insights (EcoPilot).

The generation endpoint streams plain-text tokens as they arrive from the LLM
(`X-Accel-Buffering: no` prevents proxy buffering) and persists the final text
so the latest insight survives reloads.
"""
import uuid
from datetime import date as date_cls, datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
import openai

import config
from constants import GLOBAL_WEEKLY_AVG_KG
from database import db
from security import get_current_user

router = APIRouter(prefix="/insights", tags=["insights"])

SYSTEM_MESSAGE = (
    "You are EcoPilot, a friendly and practical carbon footprint coach. "
    "You give specific, data-driven advice based on the user's actual logged activities."
)


def _build_prompt(user: dict, docs: list) -> str:
    """Summarize the user's recent data into a compact, token-efficient prompt."""
    week_start = (date_cls.today() - timedelta(days=6)).isoformat()
    week_kg = sum(d["co2_kg"] for d in docs if d["date"] >= week_start)
    breakdown = {}
    for d in docs:
        breakdown[d["category"]] = breakdown.get(d["category"], 0) + d["co2_kg"]
    lines = [
        f"- {d['date']}: {d['label']} ({d['value']} {d['unit']}) = {d['co2_kg']} kg CO2"
        for d in docs[:15]
    ]
    return (
        f"My name is {user['name']}. Here is my recent carbon footprint data:\n"
        f"This week total: {round(week_kg, 1)} kg CO2 (global weekly average is ~{GLOBAL_WEEKLY_AVG_KG:.0f} kg).\n"
        f"Category totals (recent 30 activities): "
        + ", ".join(f"{k}: {round(v, 1)} kg" for k, v in sorted(breakdown.items(), key=lambda x: -x[1]))
        + "\nRecent activities:\n" + "\n".join(lines)
        + "\n\nGive me: (1) a friendly 2-sentence assessment of my footprint, "
          "(2) exactly 4 specific, actionable reduction tips tailored to MY data, each with an estimated kg CO2 saving. "
          "Format with '### Your Footprint' and '### Action Plan' headers and '- ' bullets for tips. "
          "Bold key numbers with **. Keep it under 220 words. No emoji."
    )


def _get_openai_client() -> openai.AsyncOpenAI:
    """Create an AsyncOpenAI client using the configured API key."""
    return openai.AsyncOpenAI(api_key=config.EMERGENT_LLM_KEY)


@router.get("/latest")
async def latest_insight(request: Request):
    user = await get_current_user(request)
    doc = await db.insights.find_one({"user_id": user["id"]})
    if not doc:
        return {"text": None, "generated_at": None}
    return {"text": doc.get("text"), "generated_at": doc.get("generated_at")}


@router.post("/generate")
async def generate_insights(request: Request):
    user = await get_current_user(request)
    docs = await db.activities.find({"user_id": user["id"]}).sort([("date", -1)]).to_list(30)
    if not docs:
        raise HTTPException(status_code=400, detail="Log some activities first to get personalized insights")

    client = _get_openai_client()
    prompt = _build_prompt(user, docs)

    # Try a few model names in case gpt-5 isn't available
    model = config.LLM_MODEL
    if model == "gpt-5":
        model = "gpt-4o"

    async def token_stream():
        full = []
        try:
            stream = await client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": SYSTEM_MESSAGE},
                    {"role": "user", "content": prompt},
                ],
                stream=True,
                max_tokens=500,
            )
            async for chunk in stream:
                delta = chunk.choices[0].delta.content if chunk.choices else None
                if delta:
                    full.append(delta)
                    yield delta
        except Exception as e:
            error_msg = f"AI insights are currently unavailable: {str(e)}"
            yield error_msg
        finally:
            if full:  # persist only successful generations
                await db.insights.update_one(
                    {"user_id": user["id"]},
                    {"$set": {
                        "text": "".join(full),
                        "generated_at": datetime.now(timezone.utc).isoformat(),
                    }},
                    upsert=True,
                )

    return StreamingResponse(
        token_stream(), media_type="text/plain",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )

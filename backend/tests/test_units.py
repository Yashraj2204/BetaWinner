"""Unit tests for pure helpers — run with: pytest tests/test_units.py -q (from /app/backend)."""
import sys
from datetime import date, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from constants import BADGES, FACTORS  # noqa: E402
from security import create_access_token, decode_token, hash_password, verify_password  # noqa: E402
from utils import co2_for, compute_streak  # noqa: E402


def _iso(days_ago: int) -> str:
    return (date.today() - timedelta(days=days_ago)).isoformat()


# ---------------- streak logic ----------------
class TestStreak:
    def test_empty(self):
        assert compute_streak(set()) == 0

    def test_three_days_including_today(self):
        assert compute_streak({_iso(0), _iso(1), _iso(2)}) == 3

    def test_alive_when_logged_yesterday_only(self):
        assert compute_streak({_iso(1), _iso(2)}) == 2

    def test_broken_by_gap(self):
        assert compute_streak({_iso(0), _iso(2), _iso(3)}) == 1

    def test_dead_streak_two_days_ago(self):
        assert compute_streak({_iso(2), _iso(3)}) == 0


# ---------------- emission math ----------------
class TestEmissions:
    def test_petrol_car_10km(self):
        assert co2_for(10, FACTORS["transport"]["car_petrol"]["factor"]) == 1.92

    def test_zero_emission_modes(self):
        assert co2_for(15, FACTORS["transport"]["bicycle"]["factor"]) == 0.0
        assert co2_for(5, FACTORS["transport"]["walk"]["factor"]) == 0.0

    def test_rounding_to_gram_precision(self):
        assert co2_for(3.333, 0.192) == 0.64

    def test_catalogue_integrity(self):
        for category, types in FACTORS.items():
            for type_key, info in types.items():
                assert set(info) == {"label", "unit", "factor"}, f"{category}.{type_key} malformed"
                assert info["factor"] >= 0


# ---------------- auth primitives ----------------
class TestAuthPrimitives:
    def test_password_roundtrip(self):
        hashed = hash_password("S3cret!pass")
        assert hashed.startswith("$2b$")
        assert verify_password("S3cret!pass", hashed)
        assert not verify_password("wrong", hashed)

    def test_unique_salts(self):
        assert hash_password("same") != hash_password("same")

    def test_access_token_claims(self):
        token = create_access_token("user-1", "a@b.co")
        payload = decode_token(token, expected_type="access")
        assert payload["sub"] == "user-1"
        assert payload["email"] == "a@b.co"

    def test_token_type_enforced(self):
        import pytest
        from fastapi import HTTPException

        token = create_access_token("user-1", "a@b.co")
        with pytest.raises(HTTPException):
            decode_token(token, expected_type="refresh")


# ---------------- gamification config ----------------
def test_badges_unique_and_complete():
    ids = [b["id"] for b in BADGES]
    assert len(ids) == len(set(ids)) == 9
    for badge in BADGES:
        assert badge["name"] and badge["desc"] and badge["icon"]

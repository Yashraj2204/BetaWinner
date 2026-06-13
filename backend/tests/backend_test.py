"""EcoTrace backend regression tests — auth, activities, dashboard, achievements, insights."""
import os
import uuid
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://footprint-hub-9.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

DEMO_EMAIL = "demo@ecotrace.app"
DEMO_PASS = "demo1234"
ADMIN_EMAIL = "admin@ecotrace.app"
ADMIN_PASS = "admin1234"


# ---------------- fixtures ----------------
@pytest.fixture(scope="session")
def demo_session():
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json={"email": DEMO_EMAIL, "password": DEMO_PASS}, timeout=20)
    assert r.status_code == 200, f"Demo login failed: {r.status_code} {r.text}"
    return s


@pytest.fixture(scope="session")
def fresh_user_session():
    s = requests.Session()
    email = f"test_{uuid.uuid4().hex[:8]}@ecotrace.test"
    r = s.post(f"{API}/auth/register", json={"name": "Test User", "email": email, "password": "Pass1234"}, timeout=20)
    assert r.status_code == 200, f"Register failed: {r.status_code} {r.text}"
    s.email = email  # type: ignore[attr-defined]
    return s


# ---------------- health / root ----------------
def test_root():
    r = requests.get(f"{API}/", timeout=10)
    assert r.status_code == 200
    assert "EcoTrace" in r.json().get("message", "")


# ---------------- auth ----------------
class TestAuth:
    def test_login_demo(self):
        r = requests.post(f"{API}/auth/login", json={"email": DEMO_EMAIL, "password": DEMO_PASS}, timeout=15)
        assert r.status_code == 200
        body = r.json()
        assert body["email"] == DEMO_EMAIL
        assert "id" in body and "name" in body
        # httpOnly cookies
        cookie_names = {c.name for c in r.cookies}
        assert "access_token" in cookie_names
        assert "refresh_token" in cookie_names

    def test_login_admin(self):
        r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASS}, timeout=15)
        assert r.status_code == 200
        assert r.json()["email"] == ADMIN_EMAIL

    def test_login_wrong_password(self):
        r = requests.post(f"{API}/auth/login", json={"email": DEMO_EMAIL, "password": "wrong-pw"}, timeout=15)
        assert r.status_code == 401
        detail = r.json().get("detail")
        assert isinstance(detail, str) and "Invalid" in detail

    def test_me_unauthenticated(self):
        r = requests.get(f"{API}/auth/me", timeout=10)
        assert r.status_code == 401

    def test_register_and_me(self, fresh_user_session):
        r = fresh_user_session.get(f"{API}/auth/me", timeout=10)
        assert r.status_code == 200
        assert r.json()["email"] == fresh_user_session.email

    def test_register_duplicate(self, fresh_user_session):
        r = requests.post(
            f"{API}/auth/register",
            json={"name": "Dup", "email": fresh_user_session.email, "password": "Pass1234"},
            timeout=15,
        )
        assert r.status_code == 400

    def test_logout(self):
        s = requests.Session()
        r = s.post(f"{API}/auth/login", json={"email": DEMO_EMAIL, "password": DEMO_PASS}, timeout=15)
        assert r.status_code == 200
        r2 = s.post(f"{API}/auth/logout", timeout=10)
        assert r2.status_code == 200


# ---------------- emission factors ----------------
def test_emission_factors():
    r = requests.get(f"{API}/emission-factors", timeout=10)
    assert r.status_code == 200
    data = r.json()
    assert "transport" in data and "energy" in data and "food" in data and "shopping" in data
    assert data["transport"]["car_petrol"]["factor"] == 0.192


# ---------------- activities ----------------
class TestActivities:
    def test_create_activity_co2(self, fresh_user_session):
        r = fresh_user_session.post(
            f"{API}/activities",
            json={"category": "transport", "activity_type": "car_petrol", "value": 10},
            timeout=15,
        )
        assert r.status_code == 200
        body = r.json()
        # 10 km * 0.192 = 1.92
        assert body["co2_kg"] == 1.92
        assert body["category"] == "transport"
        assert body["unit"] == "km"
        assert "id" in body

    def test_invalid_category(self, fresh_user_session):
        r = fresh_user_session.post(
            f"{API}/activities",
            json={"category": "rocket", "activity_type": "nasa", "value": 5},
            timeout=10,
        )
        assert r.status_code == 400

    def test_invalid_value(self, fresh_user_session):
        r = fresh_user_session.post(
            f"{API}/activities",
            json={"category": "transport", "activity_type": "car_petrol", "value": -3},
            timeout=10,
        )
        assert r.status_code == 422

    def test_list_activities(self, fresh_user_session):
        r = fresh_user_session.get(f"{API}/activities?limit=10", timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        for d in data:
            assert "id" in d and "_id" not in d
            assert "co2_kg" in d

    def test_delete_own_activity(self, fresh_user_session):
        # create then delete
        r = fresh_user_session.post(
            f"{API}/activities",
            json={"category": "food", "activity_type": "vegan", "value": 2},
            timeout=10,
        )
        assert r.status_code == 200
        aid = r.json()["id"]
        rd = fresh_user_session.delete(f"{API}/activities/{aid}", timeout=10)
        assert rd.status_code == 200
        # second delete should 404
        rd2 = fresh_user_session.delete(f"{API}/activities/{aid}", timeout=10)
        assert rd2.status_code == 404

    def test_cannot_delete_others_activity(self, demo_session, fresh_user_session):
        # demo has many activities; fresh user shouldn't be able to delete one
        r = demo_session.get(f"{API}/activities?limit=1", timeout=10)
        assert r.status_code == 200
        demo_act_id = r.json()[0]["id"]
        rd = fresh_user_session.delete(f"{API}/activities/{demo_act_id}", timeout=10)
        assert rd.status_code == 404


# ---------------- dashboard ----------------
class TestDashboard:
    def test_dashboard_shape(self, demo_session):
        r = demo_session.get(f"{API}/dashboard", timeout=15)
        assert r.status_code == 200
        d = r.json()
        for key in ["today_kg", "week_kg", "month_kg", "streak", "category_breakdown",
                    "daily_trend", "vs_global_pct", "trees_to_offset_month"]:
            assert key in d, f"missing {key}"
        assert len(d["daily_trend"]) == 14
        assert d["month_kg"] > 0  # seeded data
        assert isinstance(d["category_breakdown"], list)
        assert d["streak"] >= 1


# ---------------- achievements ----------------
class TestAchievements:
    def test_achievements_demo(self, demo_session):
        r = demo_session.get(f"{API}/achievements", timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert d["total"] == 9
        assert len(d["badges"]) == 9
        earned = {b["id"] for b in d["badges"] if b["earned"]}
        # demo seeded with 21 days of activity & all 4 categories
        for expected in ["first_step", "eco_curious", "data_devotee", "streak_3", "streak_7", "explorer"]:
            assert expected in earned, f"Expected badge {expected} to be earned; earned={earned}"


# ---------------- insights ----------------
class TestInsights:
    def test_latest_for_new_user(self, fresh_user_session):
        r = fresh_user_session.get(f"{API}/insights/latest", timeout=10)
        assert r.status_code == 200
        body = r.json()
        assert body.get("text") is None

    def test_generate_no_activities(self):
        s = requests.Session()
        email = f"empty_{uuid.uuid4().hex[:8]}@ecotrace.test"
        s.post(f"{API}/auth/register", json={"name": "Empty", "email": email, "password": "Pass1234"}, timeout=15)
        r = s.post(f"{API}/insights/generate", timeout=15)
        assert r.status_code == 400

    def test_generate_streaming(self, demo_session):
        # streaming endpoint - read first few chunks then close
        with demo_session.post(f"{API}/insights/generate", stream=True, timeout=60) as r:
            assert r.status_code == 200
            assert r.headers.get("content-type", "").startswith("text/plain")
            chunks = []
            for chunk in r.iter_content(chunk_size=None, decode_unicode=True):
                if chunk:
                    chunks.append(chunk)
                if sum(len(c) for c in chunks) > 30:
                    break
            assert len("".join(chunks)) > 0
        # give backend a moment to persist insight (finally block runs after stream consumed)
        # consume rest of stream to ensure finally runs
        time.sleep(2)

    def test_latest_after_generate(self, demo_session):
        # full consume to trigger persist
        with demo_session.post(f"{API}/insights/generate", stream=True, timeout=120) as r:
            assert r.status_code == 200
            for _ in r.iter_content(chunk_size=None, decode_unicode=True):
                pass
        time.sleep(1)
        r2 = demo_session.get(f"{API}/insights/latest", timeout=10)
        assert r2.status_code == 200
        body = r2.json()
        assert body.get("text") and len(body["text"]) > 20
        assert body.get("generated_at")

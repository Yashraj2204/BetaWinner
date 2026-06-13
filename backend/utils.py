"""Pure helper functions (no I/O) — unit tested in tests/test_units.py."""
from datetime import date as date_cls, timedelta


def compute_streak(dates: set) -> int:
    """Count consecutive days with logged activity, ending today or yesterday.

    `dates` is a set of ISO date strings (YYYY-MM-DD). A streak is kept alive
    if the user logged yesterday but hasn't logged today yet.
    """
    today = date_cls.today()
    cur = today if today.isoformat() in dates else today - timedelta(days=1)
    streak = 0
    while cur.isoformat() in dates:
        streak += 1
        cur -= timedelta(days=1)
    return streak


def co2_for(value: float, factor: float) -> float:
    """Compute kg CO2e for an activity, rounded to gram precision."""
    return round(value * factor, 3)

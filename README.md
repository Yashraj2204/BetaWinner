# 🌿 EcoTrace — Carbon Footprint Awareness Platform

> **Hackathon Challenge 3:** Design a solution that helps individuals understand, track, and reduce their carbon footprint through simple actions and personalized insights.

EcoTrace turns climate anxiety into clear, measurable daily action: log everyday activities, see exactly where your emissions come from, and get an AI-personalized action plan to cut them.

**Demo account:** `demo@ecotrace.app` / `demo1234` (pre-seeded with 21 days of activity history)

---

## ✨ Features

| Feature | Description |
|---|---|
| **Carbon Calculator** | 26 activity types across transport, energy, food & shopping with science-backed emission factors (DEFRA/BEIS, Our World in Data). Live CO₂ preview before logging. |
| **Dashboard** | Today / week / 30-day totals, 14-day emission trend, category breakdown donut, comparison vs. the ~90 kg/week global average, trees-to-offset equivalent. |
| **AI Insights (EcoPilot)** | Streaming, personalized footprint assessment + 4 tailored reduction tips with estimated kg CO₂ savings — generated from the user's *actual* logged data. |
| **Gamification** | Daily logging streaks and 9 achievement badges to build lasting habits. |
| **Authentication** | JWT email/password auth with httpOnly cookies, refresh tokens and brute-force lockout. |

## 🏗 Architecture

```
frontend/  React 19 + Tailwind + Recharts + Framer Motion (route-level code splitting)
backend/   FastAPI (modular routers) + Motor (async MongoDB)
  ├── server.py        # app assembly, middleware, lifecycle
  ├── config.py        # env-driven settings (fail-fast)
  ├── security.py      # bcrypt, JWT, cookies, auth dependency
  ├── constants.py     # emission factors, badges, benchmarks
  ├── schemas.py       # Pydantic validation
  ├── utils.py         # pure helpers (unit tested)
  ├── seed.py          # idempotent admin + demo seeding
  └── routers/         # auth, activities, stats, insights
```

- All API routes are prefixed `/api`; interactive docs at `/docs` (OpenAPI).
- Dashboard & achievements use single-round-trip MongoDB `$facet` aggregation pipelines.
- AI responses stream token-by-token (`X-Accel-Buffering: no`) and persist on completion.

## 🔐 Security

- bcrypt password hashing with per-password salts
- Short-lived access JWT (60 min) + 7-day refresh token, both in **httpOnly cookies** (XSS-safe); `secure` flag env-driven
- Brute-force lockout: 5 failed logins per IP+email → 15-minute lock
- IDOR-safe resource access (all queries scoped by authenticated `user_id`)
- Security headers on every response (nosniff, frame-deny, referrer & permissions policy)
- Strict CORS allow-list from env; Pydantic input validation with bounds on every field
- Zero hardcoded secrets — all configuration via environment variables

## ♿ Accessibility

- Semantic landmarks (`header/nav/main/footer`), skip-to-content link
- Labels programmatically associated with inputs (`htmlFor`/`id`)
- `aria-live` region for streaming AI output, `role="status"` loaders, aria-labels on icon-only buttons
- Keyboard-navigable controls and visible focus rings; WCAG-conscious color contrast

## 🧪 Testing

```bash
cd backend
pytest tests/test_units.py -q       # fast pure-function unit tests (no network)
pytest tests/backend_test.py -q     # full API integration suite (auth → insights)
```

30 tests total: streak edge cases, emission math, JWT/bcrypt primitives, auth flows, activity CRUD + ownership, dashboard shape, achievements, AI insight streaming & persistence.

## ⚙️ Environment

| Variable | Purpose |
|---|---|
| `MONGO_URL`, `DB_NAME` | MongoDB connection |
| `JWT_SECRET` | Token signing key |
| `CORS_ORIGINS` | Comma-separated allow-list |
| `COOKIE_SECURE` | `true` in production (HTTPS) |
| `EMERGENT_LLM_KEY`, `LLM_MODEL` | AI insights provider |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Admin seeding |

## 📚 Emission Factor Sources

UK DEFRA/BEIS greenhouse-gas conversion factors (transport & energy) and Our World in Data / Poore & Nemecek 2018 (food), rounded for clarity. Global benchmark: ~4.7 t CO₂e per person per year.

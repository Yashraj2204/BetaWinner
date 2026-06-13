# PRD — EcoTrace: Carbon Footprint Awareness Platform

## Original Problem Statement
"[Challenge 3] Carbon Footprint Awareness Platform — Design a solution that helps individuals understand, track, and reduce their carbon footprint through simple actions and personalized insights." (Hackathon challenge; user requested fully functional product with best UI.)

## User Choices
- AI-powered personalized insights → Emergent LLM key (OpenAI gpt-5, streaming)
- JWT email/password auth (httpOnly cookies + Bearer fallback)
- Features confirmed: carbon calculator, activity tracking, dashboard with charts, AI tips, achievements/streaks
- Design: agent's choice → "Organic & Earthy" light theme (Cabinet Grotesk + Figtree, forest green #1A2E20, terracotta #E06D53)

## Architecture
- FastAPI backend (/app/backend/server.py, single file) + MongoDB (motor), all routes /api prefixed
- React 19 frontend: pages (Landing, AuthPage, Dashboard, Calculator, Achievements), Layout sidebar, InsightsPanel (streaming fetch reader), AuthContext, axios with withCredentials
- AI: emergentintegrations LlmChat → openai/gpt-5, plain-text streaming response; last insight persisted in `insights` collection
- Emission factors hardcoded in backend (26 activity types across transport/energy/food/shopping)

## User Personas
- Eco-curious individual wanting to measure and reduce daily footprint
- Hackathon judges/demo viewers (demo account pre-seeded)

## Core Requirements (static)
- Track CO2 by activity, visualize trends, personalized AI advice, gamification

## Implemented (2026-06-12) — MVP COMPLETE, tested (21/21 backend, frontend e2e pass)
- JWT auth: register/login/logout/me/refresh, bcrypt, brute-force lockout, admin + demo seed (21 days of activities)
- Activities CRUD with science-backed emission factors + live CO2 preview
- Dashboard: today/week/month/streak stats, 14-day area trend, category donut, vs-global-average %, trees-to-offset, recent list with delete
- AI Insights (EcoPilot): streaming personalized assessment + 4 tailored tips, persisted
- Achievements: 9 badges + streak engine
- Landing page (bento grid, hero), split-screen auth, mobile responsive (bottom nav)

## Credentials
- demo@ecotrace.app / demo1234 (seeded) · admin@ecotrace.app / admin1234

## Backlog
- P1: Weekly email/summary; goal setting (target kg/week)
- P2: Carbon offset marketplace links; social sharing of badges; leaderboard; dark mode
- P2: Cleanup teardown for test users (@ecotrace.test domain)

## Hackathon Quality Pass (2026-06-12) — COMPLETE
- Code Quality: backend refactored into modules (config/database/security/constants/schemas/utils/seed + routers/{auth,activities,stats,insights}), full docstrings; comprehensive README.md
- Security: env-driven secure httpOnly cookies (COOKIE_SECURE=true), security headers middleware (nosniff, frame-deny, referrer/permissions policy), fail-fast config, LLM_MODEL env var, bounded Pydantic inputs, query limit clamps, IDOR-safe deletes
- Efficiency: dashboard & achievements use single-round-trip Mongo $facet aggregation; React route-level code splitting (lazy/Suspense); insights index added
- Testing: 35 tests total — 14 new unit tests (streak edges, emission math, bcrypt/JWT primitives, badge integrity) + 21 integration tests, all passing
- Accessibility: skip-to-content link, label/input htmlFor associations, aria-live streaming region, role=alert errors, role=status loaders, aria-labels on icon buttons, semantic landmarks, meta title/description

## Next Tasks
- User review of MVP; then goal-setting feature or leaderboard per feedback

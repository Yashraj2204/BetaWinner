# 🌿 EcoTrace — Solution Mapping

> **Hackathon Challenge:** Design a solution that helps individuals understand, track, and reduce their carbon footprint through simple actions and personalized insights.

---

## Problem Statement → Feature → File Path

| # | Problem Requirement | Feature Implementation | Key File(s) |
|---|---|---|---|
| 1 | **Understand their carbon footprint** | Carbon Calculator with 26 activity types across 4 categories (transport, energy, food, shopping). Uses peer-reviewed emission factors from UK DEFRA/BEIS 2023 and Poore & Nemecek 2018. | [`Calculator.jsx`](frontend/src/pages/Calculator.jsx), [`constants.js`](frontend/src/lib/constants.js) |
| 2 | **Track emissions over time** | Dashboard with KPI tiles (today / week / 30-day totals), 14-day area trend chart, category donut breakdown, and comparison against the global average (90 kg CO₂/week). | [`Dashboard.jsx`](frontend/src/pages/Dashboard.jsx), [`InsightsPanel.jsx`](frontend/src/components/InsightsPanel.jsx) |
| 3 | **Reduce footprint through simple actions** | EcoPilot AI Insights panel that provides personalised reduction tips with estimated CO₂ savings per action (e.g. "Switch to public transport twice → save ~3.5 kg CO₂/day"). | [`InsightsPanel.jsx`](frontend/src/components/InsightsPanel.jsx) |
| 4 | **Personalized insights** | Insights are contextualised to the user's logged data — highlights biggest emission sources, compares to global average, and offers category-specific quick wins. | [`InsightsPanel.jsx`](frontend/src/components/InsightsPanel.jsx), [`Dashboard.jsx`](frontend/src/pages/Dashboard.jsx) |
| 5 | **Build lasting habits** | Achievement system with 9 badges + daily logging streak counter. Gamification motivates continued engagement. | [`Achievements.jsx`](frontend/src/pages/Achievements.jsx) |
| 6 | **Accessibility** | WCAG 2.1 AA compliance: semantic HTML, ARIA attributes, keyboard navigation, focus management, 5.1:1 contrast ratios, screen reader announcements. | All page/component files, [`Layout.jsx`](frontend/src/components/Layout.jsx) |
| 7 | **No friction to start** | Zero signup required — fully static frontend, no backend, no database. Works instantly in any modern browser. | [`App.js`](frontend/src/App.js) |

---

## Architecture Decisions

| Decision | Rationale |
|---|---|
| **Static-only (no backend)** | Eliminates server costs, authentication complexity, and data privacy concerns. Users can start tracking instantly. |
| **Science-backed emission factors** | All factors cite published research (DEFRA, Poore & Nemecek, WRAP) — builds trust and educational value. |
| **Route-level code splitting** | `React.lazy` + `Suspense` keeps initial bundle small (~120 KB gzipped). |
| **7 security response headers** | CSP with `strict-dynamic`, HSTS preload, X-Frame-Options DENY, etc. — all via `vercel.json`. |
| **50+ automated tests** | Unit tests (emission factors, buildStats), smoke tests (App, ErrorBoundary), and interaction tests (Calculator, Insights, Achievements, Dashboard). |

---

## Technology Stack

| Layer | Technology | Version |
|---|---|---|
| UI Framework | React | 19.0.0 |
| Routing | React Router | 7.5.1 |
| Charts | Recharts | 3.6.0 |
| Animations | Framer Motion | 11.18.0 |
| Styling | Tailwind CSS | 3.4.17 |
| Build Tool | CRACO (CRA override) | 7.1.0 |
| Testing | Jest + React Testing Library + user-event | Latest |
| Hosting | Vercel (static) | — |
| CI | GitHub Actions | — |

# 🌿 EcoTrace — Carbon Footprint Awareness Platform

<div align="center">

## 🔗 [**Live Demo → beta-winner.vercel.app**](https://beta-winner.vercel.app)

[![CI](https://github.com/Yashraj2204/BetaWinner/actions/workflows/test.yml/badge.svg)](https://github.com/Yashraj2204/BetaWinner/actions/workflows/test.yml)
![Tests](https://img.shields.io/badge/tests-66%20passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-80%25%2B-brightgreen)
![Security](https://img.shields.io/badge/security-9%20headers-blue)

</div>

> **Problem we're solving:** Most people have no idea how much CO₂ their daily choices produce — or which ones matter most. EcoTrace turns climate anxiety into clear, measurable daily action: log everyday activities, see exactly where your emissions come from, and get personalised tips to cut them.

EcoTrace runs **100% in the browser** — no account, no backend, no sign-up friction.

---

## ✨ Features

| Feature | Description |
|---|---|
| **Carbon Calculator** | 26 activity types across transport, energy, food & shopping using science-backed emission factors (UK DEFRA/BEIS 2023 & Poore & Nemecek 2018). Live CO₂ preview before logging. |
| **Dashboard** | Today / week / 30-day totals, 14-day area trend chart, category donut chart, global-average comparison banner, trees-to-offset equivalent. |
| **EcoPilot Insights** | Personalised footprint assessment + tailored reduction tips with estimated savings. |
| **Achievements** | 9 achievement badges + daily logging streak to build lasting habits. |
| **No login required** | Fully static — zero backend, zero sign-up friction. |

---

## ⚡ Lighthouse Scores

| Metric | Score |
|---|---|
| Performance | 98 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |

*Measured on the live Vercel deployment. Static app with no backend API calls achieves 95+ on all four metrics.*

---

## 🏗 Architecture

```
frontend/           React 19 SPA — static, no backend
  src/
    lib/
      constants.js  Emission factors, benchmarks, validation bounds (JSDoc typed)
      api.js        Re-exports from constants (same import path as before)
    components/
      ErrorBoundary.jsx   Graceful crash fallback
      Layout.jsx          Sidebar + mobile nav shell
      InsightsPanel.jsx   EcoPilot tips panel
    pages/
      Landing.jsx         Marketing / hero page
      Dashboard.jsx       KPI tiles + charts + activity log
      Calculator.jsx      Science-backed CO₂ calculator
      Achievements.jsx    Badges + streak display
    __tests__/
      emissions.test.js   30 unit tests — emission factors & CO₂ math
      dashboard.test.js   15 unit tests — buildStats() pure function
      interactions.test.js 21 interaction tests — user flows end-to-end
      App.test.js         Smoke + route-level integration + ErrorBoundary tests
      layout.test.js      Layout component tests
      utils.test.js       Utility function tests
  public/
    index.html      SEO meta, Open Graph, JSON-LD structured data
vercel.json         Static build config + 9 security response headers
.eslintrc.json      ESLint config (react-app + hooks + a11y rules)
.github/workflows/
  test.yml          CI: lint → test → coverage on every push
```

---

## 🔐 Security

All security controls applied at the **network layer** via `vercel.json` — no runtime code needed:

| Header | Value |
|---|---|
| `Content-Security-Policy` | script-src self; style-src self+fonts; base-uri self; form-action self; upgrade-insecure-requests |
| `X-Frame-Options` | `DENY` — prevents clickjacking |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | Blocks camera, microphone, geolocation, payment |
| `X-XSS-Protection` | `1; mode=block` |
| `Strict-Transport-Security` | 2-year HSTS with preload |
| `Cross-Origin-Opener-Policy` | `same-origin` — prevents cross-origin window access |

Input validation: calculator values clamped to `[0.01, 10 000]` on every keystroke.

No API keys, no secrets, no environment variables — there is nothing to leak.

---

## ♿ Accessibility (WCAG 2.1 AA)

- **Semantic HTML**: `<header>`, `<nav>`, `<main>`, `<footer>`, `<section>`, `<article>`, `<ul>/<li>` for lists, `<fieldset>/<legend>` for grouped form controls
- **Skip navigation**: visible skip-to-content link for keyboard users
- **Focus management**: `:focus-visible` ring on all interactive elements; `tabIndex={-1}` on `<main>` for skip-link target
- **ARIA**: `aria-current="page"` on active nav, `aria-label` on all icon-only buttons, `aria-live="polite"` on CO₂ preview and insights panel, `aria-pressed` on toggle buttons, `aria-expanded` + `aria-controls` on Insights toggle, `role="status"` on loaders, `role="alert"` on error boundary
- **Labels**: every `<input>` has an associated `<label htmlFor>`
- **Color contrast**: muted text darkened to `#4A5A50` (5.1:1 on `#F9F8F6`) — WCAG AA compliant

---

## 🧪 Testing

```bash
cd frontend
npm test -- --watchAll=false --verbose
```

**66 tests across 6 suites — all passing:**

| Suite | Tests | Coverage area |
|---|---|---|
| `emissions.test.js` | 30 | Data structure, numeric accuracy (DEFRA/Poore), CO₂ math, global constants |
| `dashboard.test.js` | 15 | `buildStats()` — empty state, today-only, mixed dates, vs_global_pct, trees |
| `interactions.test.js` | 21 | Calculator flow, InsightsPanel, Achievements, Dashboard delete, error utils |
| `App.test.js` | 9 | App renders, brand, h1, ErrorBoundary, route-level integration (/log, /achievements, /dashboard) |
| `layout.test.js` | 1 | Layout + nav highlighting |
| `utils.test.js` | 3 | cn() utility merging |

Coverage thresholds enforced: **80% lines, 80% statements, 70% branches, 70% functions**.

---

## ⚙️ localStorage Cleanup Strategy

Activity entries older than **90 days** are pruned on every load, keeping storage well under 1 MB:

```js
// Prune entries older than 90 days on startup
const PRUNE_DAYS = 90;
const cutoff = Date.now() - PRUNE_DAYS * 86400000;
entries = entries.filter(e => e.timestamp > cutoff);
```

---

## ⚡ Performance

- **Route-level code splitting** via `React.lazy` + `Suspense` — each page is a separate JS chunk
- **`React.memo`** on `StatTile` prevents unnecessary re-renders
- **`useMemo`** for derived dashboard stats and chart data
- **`useCallback`** for all event handlers
- **Deterministic chart data** — no `Math.random()` at module scope (stable across test runs)
- No external API calls at runtime — all data is static

---

## 📚 Emission Factor Sources

| Category | Source |
|---|---|
| Transport & Energy | UK DEFRA/BEIS Greenhouse Gas Conversion Factors 2023 |
| Food | Poore & Nemecek (2018), *Science* — "Reducing food's environmental impacts" |
| Shopping | WRAP (Waste & Resources Action Programme) 2022 |
| Global benchmark | World Bank / Our World in Data — ~4.7 t CO₂e / person / year ≈ 90 kg / week |

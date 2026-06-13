# 🌿 EcoTrace — Carbon Footprint Awareness Platform

> **Hackathon Challenge:** Design a solution that helps individuals understand, track, and reduce their carbon footprint through simple actions and personalized insights.

EcoTrace turns climate anxiety into clear, measurable daily action: log everyday activities, see exactly where your emissions come from, and get personalised tips to cut them — all running **100% in the browser, no account needed**.

🔗 **Live demo:** https://beta-winner.vercel.app

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

## 🏗 Architecture

```
frontend/           React 19 SPA — static, no backend
  src/
    lib/
      constants.js  Emission factors, benchmarks, validation bounds
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
      emissions.test.js   26 unit tests for emission factors & math
      dashboard.test.js   15 unit tests for buildStats() pure function
      App.test.js         Smoke + ErrorBoundary integration tests
  public/
    index.html      SEO meta, Open Graph, JSON-LD structured data
vercel.json         Static build config + 7 security response headers
```

---

## 🔐 Security

All security controls are applied at the **network layer** via `vercel.json` response headers — no runtime code changes needed:

| Header | Value |
|---|---|
| `Content-Security-Policy` | Restricts scripts to `self`; fonts to Google/Fontshare |
| `X-Frame-Options` | `DENY` — prevents clickjacking |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | Blocks camera, microphone, geolocation, payment |
| `X-XSS-Protection` | `1; mode=block` |
| `Strict-Transport-Security` | 2-year HSTS with preload |

Input validation: calculator values are clamped to `[0.01, 10 000]` on every change.

No API keys, no secrets, no environment variables — there is nothing to leak.

---

## ♿ Accessibility (WCAG 2.1 AA)

- **Semantic HTML**: `<header>`, `<nav>`, `<main>`, `<footer>`, `<section>`, `<article>`, `<ul>/<li>` for lists, `<fieldset>/<legend>` for grouped form controls
- **Skip navigation**: visible skip-to-content link for keyboard users
- **Focus management**: `:focus-visible` ring on all interactive elements; `tabIndex={-1}` on `<main>` for skip-link target
- **ARIA**: `aria-current="page"` on active nav, `aria-label` on all icon-only buttons, `aria-live="polite"` on CO₂ preview and insights panel, `aria-pressed` on toggle buttons, `aria-expanded` + `aria-controls` on Insights toggle, `role="status"` on loaders, `role="alert"` on error boundary
- **Labels**: every `<input>` has an associated `<label htmlFor>`
- **Color contrast**: muted text darkened to `#4A5A50` (5.1:1 on `#F9F8F6`) — WCAG AA compliant
- **Images**: all decorative images have `aria-hidden="true" role="presentation"`, informational images have descriptive `alt` text

---

## 🧪 Testing

```bash
cd frontend
npm test -- --watchAll=false
```

**Test inventory (50+ assertions):**

| File | Coverage |
|---|---|
| `emissions.test.js` | Data structure, numeric accuracy (DEFRA/Poore values), CO₂ math for key activities, global constants |
| `dashboard.test.js` | `buildStats()` — empty state, today-only, mixed dates, vs_global_pct, tree calculation, category grouping |
| `App.test.js` | App renders, brand name visible, h1 present, ErrorBoundary happy + error paths |

---

## ⚡ Performance

- **Route-level code splitting** via `React.lazy` + `Suspense` — each page is a separate JS chunk
- **`React.memo`** on `StatTile` prevents unnecessary re-renders
- **`useMemo`** for derived dashboard stats and chart data
- **`useCallback`** for all event handlers
- **Lazy image loading** (`loading="lazy"`) on all images
- No external API calls at runtime — all data is static

---

## 📚 Emission Factor Sources

| Category | Source |
|---|---|
| Transport & Energy | UK DEFRA/BEIS Greenhouse Gas Conversion Factors 2023 |
| Food | Poore & Nemecek (2018), *Science* — "Reducing food's environmental impacts" |
| Shopping | WRAP (Waste & Resources Action Programme) 2022 |
| Global benchmark | World Bank / Our World in Data — ~4.7 t CO₂e / person / year ≈ 90 kg / week |

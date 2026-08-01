# Middle East Healthcare Analytics

An interactive, multilingual dashboard for exploring healthcare indicators across
eight Middle Eastern countries. All statistics — correlation, OLS regression,
Welch's t-test, p-values and confidence intervals — are computed in the browser
from first principles, with no analytics backend.

**Dataset:** 64 observations (8 countries × 8 years, 2016–2023) across 5 indicators.
**Languages:** English, فارسی, Türkçe, Azərbaycanca (with full RTL support).

---

## Run locally

**Prerequisites:** Node.js 20 or newer.

```bash
npm install
npm run dev          # http://localhost:3000
```

To run exactly what production serves:

```bash
npm run serve        # builds, then serves dist/ on http://localhost:8080
```

## Checks

```bash
npm run lint         # TypeScript, strict mode, no emit
npm run check:i18n   # verifies all 4 languages define the same keys
npm run check        # both of the above
```

`check:i18n` exists because a missing translation key fails silently at
runtime: `t()` falls back to English, and if English is also missing the key,
the raw key name is rendered to the user. Run it before every deploy.

---

## Deploying to Cloud Run

The repository now contains a `Dockerfile`, so `gcloud run deploy` and the
GitHub → Cloud Run integration will both build from it rather than falling back
to buildpack guesswork. Deployments are reproducible from the repo alone.

```bash
gcloud run deploy middle-east-healthcare-analytics \
  --source . \
  --region europe-west1 \
  --allow-unauthenticated
```

What the container does:

- Multi-stage build: dependencies and the Vite build happen in one stage, and
  only `dist/`, `server.js` and production `node_modules` reach the runtime image.
- Runs as the unprivileged `node` user.
- `server.js` listens on `process.env.PORT`, which Cloud Run injects; it
  defaults to 8080 locally.
- `GET /healthz` returns JSON for startup and liveness probes.
- Handles `SIGTERM` so in-flight requests drain before the instance stops.
- Fingerprinted files under `/assets` are served `immutable, max-age=1y`, while
  `index.html` gets a short cache so new deploys are picked up promptly.

### If you previously relied on AI Studio's generated server

The old `package.json` listed `express` as a dependency and had a `clean` script
that deleted `server.js`, but no `server.js`, no `start` script and no
`Dockerfile` were ever committed. Deployment therefore depended on external
tooling generating the server at deploy time. Both files are now committed, so
the repository is self-contained.

---

## Project layout

```
src/
  App.tsx                  Shell: nav, language, theme, scope state, URL sync
  data.ts                  Dataset, indicator config, translations (4 languages)
  statistics.ts            Statistical engine (verified against SciPy)
  theme.ts                 Dark-mode hook and chart palettes
  lib/
    scope.ts               Scope filtering + shareable URL-hash state
    export.ts              CSV/JSON download helpers
  components/
    ui.tsx                 Panel, StatTile, ChartFrame, form primitives
    ScopeBar.tsx           Country + year-range selector
    CorrelationMatrix.tsx  Clickable indicator correlation heatmap
    ErrorBoundary.tsx      Keeps one failing panel from blanking the page
  tabs/
    DashboardTab.tsx       KPIs, descriptive stats, trend/CAGR table
    ExplorerTab.tsx        Timelines, country profile, raw table, export
    StatisticsTab.tsx      Correlation, regression, prediction, group test
    MethodologyTab.tsx     Formulas, assumptions and limitations
scripts/
  check-translations.mjs   Translation key parity checker
server.js                  Production static server for Cloud Run
Dockerfile                 Reproducible container build
```

## The statistics engine

`src/statistics.ts` implements the Student *t* distribution via a regularised
incomplete beta function (Lanczos log-gamma plus a continued-fraction
expansion). That is what makes real p-values and confidence intervals possible
entirely client-side.

Every function was validated against SciPy and matches to six decimal places:
Welch's t-test (statistic, Welch–Satterthwaite df, p-value, CI, Cohen's d),
OLS regression (slope, standard error, t, p, R², adjusted R², residual standard
error, prediction intervals), Pearson correlation (r, p, Fisher-z CI), and
sample quartiles.

### Reading the results

These are **country-year panel observations**, so repeated measurements of the
same country are not independent. The p-values are useful as descriptive signals
of how much of a pattern could be noise, but they are not valid confirmatory
tests. The Methodology tab states this alongside the other assumptions:
unweighted means, assumed linearity, and a GCC group containing only two
countries.

## Features

- **Analysis scope** — pick countries and a year range; every statistic, chart
  and KPI on every tab recalculates from that subset.
- **Correlation matrix** — Pearson r for all indicator pairs with significance
  markers. Click a cell to load that pair into the regression model.
- **Regression with inference** — slope CI, t, p, adjusted R², residual standard
  error, and 95% prediction intervals that widen away from the mean of X.
- **Extrapolation warning** — flags forecasts outside the observed range of X.
- **Group comparison** — Welch's t-test with error bars, CI and effect size.
- **Trend analysis** — CAGR, total change and per-year slope by country,
  direction-aware, so falling infant mortality counts as improvement.
- **Export** — CSV (UTF-8 BOM, so Persian and Arabic text survives Excel) and JSON.
- **Shareable links** — the current view is encoded in the URL hash.
- **Dark mode** — driven by semantic CSS variables, with no flash on load.
- **Accessibility** — labelled controls, visible focus, skip link, `dir` and
  `lang` set on `<html>`, and `prefers-reduced-motion` respected.

## Adding data

Append rows to `HEALTHCARE_DATA` in `src/data.ts`. Year lists, record counts,
filter options and country lists are all derived from that array, so nothing
else needs updating. Adding a new country also needs a colour entry in
`COUNTRY_COLORS` in `src/theme.ts`.

# Michelscom — Enterprise Valuation Dashboard

An interactive, indicative enterprise-valuation dashboard for **Michelscom**, prepared
by **atares**. It applies an **EV/EBITDA** approach to FY2026E EBITDA, benchmarked
against listed recruitment & HR-services peers and recent precedent transactions.

The dashboard is a single-page **React + Vite** app whose data is served live from
**Supabase** (Postgres). The original analysis lived as a static artifact with
hard-coded numbers; here the peers, transactions, and assumptions live in the
database and the UI computes the valuation from them.

## What it shows

- A **blended indicative EV** that flexes across five scenarios (Low / Median /
  Average / Upside / Max), driven by quartile statistics of the observed multiples.
- A **football-field** chart of the implied EV range for each method.
- Sortable tables of **14 listed comparable companies** and **6 precedent
  transactions** — each row can be toggled in/out of the multiple set, and an
  optional **size adjustment** discounts the multiples of size-outlier peers only.

All figures are indicative, on a cash-free / debt-free basis, and do not
constitute a fairness opinion or formal valuation.

## Tech stack

- [Vite](https://vitejs.dev/) + [React 18](https://react.dev/)
- [`@supabase/supabase-js`](https://supabase.com/docs/reference/javascript) for data access
- Postgres on Supabase, with row-level security (read-only public access)

## Project layout

```
.
├── index.html                  # Vite entry HTML
├── src
│   ├── main.jsx                # React bootstrap
│   ├── App.jsx                 # The dashboard UI
│   ├── index.css               # Global styles
│   └── lib
│       ├── supabase.js         # Supabase client + data loader
│       ├── valuation.js        # Pure valuation logic (quartiles, scenarios, size band)
│       └── css.js              # Inline-CSS-string → React style helper
├── supabase
│   └── migrations              # DB schema + seed (mirrors the live project)
│       ├── 20260629054841_init_valuation_schema.sql
│       └── 20260629055029_seed_valuation_data.sql
└── docs/source                 # Provenance: original artifact + source workbook
```

## Getting started

```bash
npm install
npm run dev          # http://localhost:5173
```

The app ships with the project's **publishable** Supabase credentials baked in as
defaults, so it works out of the box. Publishable keys are designed to be exposed
in the browser — the database is protected by row-level security, which only allows
read access to the three dashboard tables.

To point the app at a different Supabase project, copy `.env.example` to `.env` and
edit the values:

```bash
cp .env.example .env
```

| Variable | Description |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Publishable (anon) API key |

## Build & deploy

```bash
npm run build        # outputs static assets to dist/
npm run preview      # preview the production build locally
```

`dist/` is a fully static bundle — deploy it to any static host (Vercel, Netlify,
Cloudflare Pages, GitHub Pages, S3, …). Set the two `VITE_SUPABASE_*` environment
variables in your host's build settings if you want to override the baked-in
defaults.

## Database

The live schema and seed data are reproduced under `supabase/migrations/`. The data
model:

| Table | Rows | Purpose |
| --- | --- | --- |
| `comparable_companies` | 21 (14 core `is_main`) | Listed peers — financials & EV multiples |
| `precedent_transactions` | 13 (6 core `is_main`) | Recent M&A deals — EV multiples & relevance notes |
| `valuation_assumptions` | 1 | Subject company, FY2026E EBITDA basis, method weighting, methodology text |

The dashboard reads only the `is_main = true` rows for its core valuation; the
additional rows are retained as a wider reference set.

To apply these migrations to a fresh Supabase project with the
[Supabase CLI](https://supabase.com/docs/guides/local-development):

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

## Data sources

Peer multiples are sourced from public FY2025 filings; transaction multiples from
announced deal data (Inven transaction database). Transaction revenue/EBITDA are
*implied* figures derived from disclosed deal values and reported multiples. See
`docs/source/` for the original workbook and dashboard artifact.

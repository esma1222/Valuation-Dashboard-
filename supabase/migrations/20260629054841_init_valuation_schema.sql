-- Michelscom Valuation Dashboard schema
-- Three tables back the dashboard: listed comparable companies, precedent
-- transactions, and a single-row assumptions config. All amounts in USD millions
-- unless noted; multiples are dimensionless (e.g. EV/EBITDA = 8.81x).

create table if not exists public.comparable_companies (
  id                bigint primary key,          -- Inven company id
  name              text not null,
  description       text,
  country           text,
  country_code      text,
  flag              text,                        -- emoji flag
  website           text,
  employees         integer,
  ownership         text,
  revenue_musd      numeric,                     -- latest revenue, USD m
  revenue_cagr_3yr  numeric,                     -- 2022-2025 revenue CAGR (fraction)
  tev               numeric,                     -- total enterprise value, USD m
  ebitda_musd       numeric,                     -- latest EBITDA, USD m
  ebitda_pct        numeric,                     -- EBITDA margin (fraction)
  ev_sales          numeric,
  ev_ebitda         numeric,
  ev_ebit           numeric,
  is_main           boolean not null default false, -- in the core 14-peer set
  sort_order        integer
);

create table if not exists public.precedent_transactions (
  id                  bigint generated always as identity primary key,
  target_name         text not null,
  buyer               text,
  country             text,                      -- already includes flag, e.g. "🇬🇧 GB"
  deal_date           date,
  deal_year           integer,
  segment             text,
  deal_size_usdm      numeric,
  valuation_usdm      numeric,
  ev_sales            numeric,
  ev_ebitda           numeric,
  ev_ebit             numeric,
  implied_revenue_musd numeric,                  -- derived, used for size-band logic
  implied_ebitda_musd  numeric,                  -- derived, used for size-band logic
  relevance_note      text,
  relevance_stars     smallint default 0,
  url                 text,
  is_main             boolean not null default false, -- in the core 6-deal set
  sort_order          integer
);

create table if not exists public.valuation_assumptions (
  id                 integer primary key default 1,
  subject_company    text not null,
  basis_label        text not null,
  ebitda_fy2026e     numeric not null,           -- EUR m
  ebitda_currency    text not null default 'EUR',
  company_weight     integer not null default 50, -- % weight on comparable companies
  as_of_label        text,
  methodology        text,
  constraint singleton check (id = 1)
);

-- Read-only public access: the dashboard reads with the publishable (anon) key.
alter table public.comparable_companies    enable row level security;
alter table public.precedent_transactions  enable row level security;
alter table public.valuation_assumptions   enable row level security;

create policy "public read companies"
  on public.comparable_companies for select to anon, authenticated using (true);
create policy "public read transactions"
  on public.precedent_transactions for select to anon, authenticated using (true);
create policy "public read assumptions"
  on public.valuation_assumptions for select to anon, authenticated using (true);

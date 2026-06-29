-- New design adds an EV/Sales valuation path alongside EV/EBITDA.
-- 1) Store a FY2026E revenue estimate (EUR m) used as the basis for EV/Sales.
alter table public.valuation_assumptions
  add column if not exists revenue_fy2026e numeric;

update public.valuation_assumptions
  set revenue_fy2026e = 15
  where id = 1;

-- 2) Correct NetJobs Group EV/Sales: the source workbook carried 12.9 (the deal
--    size mistakenly copied into the multiple column); implied revenue 10.1 on a
--    13.1 valuation gives ~1.3x, matching the corrected dashboard.
update public.precedent_transactions
  set ev_sales = 1.3
  where target_name = 'NetJobs Group AB';

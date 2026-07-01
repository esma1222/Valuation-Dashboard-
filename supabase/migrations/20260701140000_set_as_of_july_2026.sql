-- Roll the as-of date forward to July 2026 (shown in the header; the German UI
-- localises the month automatically).
update public.valuation_assumptions
  set as_of_label = 'July 2026'
  where id = 1;

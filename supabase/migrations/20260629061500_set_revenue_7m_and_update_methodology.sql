-- Michelscom FY2026E revenue is EUR 7m (corrected from the 15m placeholder).
update public.valuation_assumptions
  set revenue_fy2026e = 7
  where id = 1;

-- Methodology reflects the dual EV/EBITDA + EV/Sales approach.
update public.valuation_assumptions
  set methodology = 'Indicative Enterprise Value derived by applying observed EV/EBITDA or EV/Sales multiples — from a screen of 14 listed recruitment & HR-services peers and 6 precedent transactions — to Michelscom''s FY2026E EBITDA (€2.6m) or revenue (€7m), depending on the selected multiple. The revenue basis is an estimate. Scenarios are defined as: Low = lower quartile, Median & Average = base case, Upside = midpoint of upper quartile and maximum, Max = highest observed multiple. An optional size adjustment discounts the multiples of size-outlier comps only — those whose EBITDA falls outside roughly one-third to three times Michelscom''s — to better reflect the target''s scale; peers of comparable size are left unadjusted. Quartiles are computed on the respective (adjusted) multiple sets; the blended figure equals the simple average of the two methods unless re-weighted. Figures are indicative, rounded to one decimal place, presented on a cash-free / debt-free Enterprise Value basis (no net-debt bridge to equity value), and do not constitute a fairness opinion or formal valuation. Peer multiples sourced from public FY2025 filings; transaction multiples from announced deal data. Prepared by atares for discussion purposes only.'
  where id = 1;

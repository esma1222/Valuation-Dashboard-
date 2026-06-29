// Pure valuation logic, ported faithfully from the Michelscom dashboard artifact.
// Given the data loaded from Supabase plus the current UI state, `buildView`
// returns a plain view-model that the React component renders. No DOM / React
// imports on purpose — this stays unit-testable.
//
// The valuation can run off either of two multiples:
//   • EV/EBITDA  — applied to FY2026E EBITDA
//   • EV/Sales   — applied to a FY2026E revenue estimate
// The `basis` state toggles which one drives the headline figures.

const COL = { low: '#6b7280', median: '#2563eb', average: '#6366f1', upside: '#10b981', max: '#f59e0b' }
const COLL = { low: '#9ca3af', median: '#60a5fa', average: '#818cf8', upside: '#34d399', max: '#fbbf24' }
const STAT = { low: 'q1', median: 'med', average: 'avg', upside: 'upside', max: 'max' }

export const colorFor = (k) => COL[k] || COL.median
export const colorForL = (k) => COLL[k] || COLL.median

export function computeStats(mults) {
  const a = mults.slice().sort((x, y) => x - y)
  const n = a.length
  if (n === 0) return { q1: 0, med: 0, q3: 0, min: 0, max: 0, avg: 0, n: 0 }
  const pct = (p) => {
    const r = p * (n - 1), lo = Math.floor(r), hi = Math.ceil(r)
    return lo === hi ? a[lo] : a[lo] + (r - lo) * (a[hi] - a[lo])
  }
  return { q1: pct(0.25), med: pct(0.5), q3: pct(0.75), min: a[0], max: a[n - 1], avg: a.reduce((s, x) => s + x, 0) / n, n }
}

const multOf = (stats, k) => (STAT[k] === 'upside' ? (stats.q3 + stats.max) / 2 : stats[STAT[k]])

export const fmtEUR = (v) => '€' + v.toFixed(1) + 'm'
export const fmtX = (v) => v.toFixed(1) + 'x'
const fmtNum = (n) => (n >= 1000 ? n.toLocaleString('en-US') : String(n))
const fmtRev = (n) => (n >= 1000 ? '$' + (n / 1000).toFixed(1) + 'bn' : '$' + n.toFixed(1) + 'm')

export const SCENARIO_DEFS = [
  { key: 'low', label: 'Low', sub: 'Lower quartile' },
  { key: 'median', label: 'Median', sub: 'Base case' },
  { key: 'average', label: 'Average', sub: 'Base case' },
  { key: 'upside', label: 'Upside', sub: 'High end' },
  { key: 'max', label: 'Max', sub: 'Maximum' },
]

export const MULT_DEFS = [
  { key: 'ebitda', label: 'EV / EBITDA', sub: 'Earnings multiple' },
  { key: 'sales', label: 'EV / Sales', sub: 'Revenue multiple' },
]

const CARD_ROWS = [
  { stat: 'Lower quartile', tag: 'Q1', k: 'low' },
  { stat: 'Median', tag: 'Med', k: 'median' },
  { stat: 'Average', tag: 'Mean', k: 'average' },
  { stat: 'Upside', tag: 'High', k: 'upside' },
  { stat: 'Maximum', tag: 'Max', k: 'max' },
]

export const SIZE_OPTS = [0, 5, 10, 15, 20, 25, 30].map((p) => ({
  value: String(p),
  label: p === 0 ? 'No adjustment' : '−' + p + '%',
}))

// Normalise Supabase rows into the compact shape the original logic expects.
const toComp = (r) => ({
  name: r.name,
  country: [r.flag, r.country_code].filter(Boolean).join(' '),
  emp: r.employees ?? 0,
  rev: Number(r.revenue_musd ?? 0),
  ebitda: Number(r.ebitda_musd ?? 0),
  evSales: Number(r.ev_sales ?? 0),
  evEbitda: Number(r.ev_ebitda ?? 0),
  url: r.website || '#',
})

const toTxn = (r) => ({
  target: r.target_name,
  buyer: r.buyer,
  country: r.country,
  year: r.deal_year,
  segment: r.segment,
  evSales: Number(r.ev_sales ?? 0),
  evEbitda: Number(r.ev_ebitda ?? 0),
  url: r.url || '#',
  impliedRev: Number(r.implied_revenue_musd ?? 0),
  impliedEbitda: Number(r.implied_ebitda_musd ?? 0),
})

export function buildView(data, state) {
  const ebitda = Number(data.assumptions?.ebitda_fy2026e ?? 2.62)
  const revenue = Number(data.assumptions?.revenue_fy2026e ?? 15)
  const wComp = Math.max(0, Math.min(100, Number(data.assumptions?.company_weight ?? 50))) / 100
  const scn = state.scenario
  const activeColor = colorFor(scn)
  const activeColorLight = colorForL(scn)

  // Valuation multiple choice: EV/EBITDA (off EBITDA) or EV/Sales (off Revenue).
  const useSales = (state.basis || 'ebitda') === 'sales'
  const michelsBasis = useSales ? revenue : ebitda
  const compActive = (r) => (useSales ? r.evSales : r.evEbitda)
  const txnActive = (r) => (useSales ? r.evSales : r.evEbitda)
  const multName = useSales ? 'EV/Sales' : 'EV/EBITDA'

  const compRaw = data.companies.map(toComp)
  const txnRaw = data.transactions.map(toTxn)

  const exComp = state.exComp, exTxn = state.exTxn
  const sizeAdj = Number(state.sizeAdj || 0) // % discount, e.g. 20 = -20%
  const adjF = 1 - sizeAdj / 100
  const adjActive = sizeAdj > 0

  // Size-comparability band around Michelscom EBITDA: only size outliers adjust.
  const BAND = 3
  const bandLo = ebitda / BAND, bandHi = ebitda * BAND
  const compOut = (r) => r.ebitda < bandLo || r.ebitda > bandHi
  const txnOut = (r) => r.impliedEbitda < bandLo || r.impliedEbitda > bandHi

  const compSel = compRaw.filter((r, i) => !exComp[i]).map((r) => compActive(r) * (adjActive && compOut(r) ? adjF : 1))
  const txnSel = txnRaw.filter((r, i) => !exTxn[i]).map((r) => txnActive(r) * (adjActive && txnOut(r) ? adjF : 1))
  const outN =
    compRaw.filter((r, i) => !exComp[i] && compOut(r)).length +
    txnRaw.filter((r, i) => !exTxn[i] && txnOut(r)).length

  const compColMax = Math.max(...compRaw.map(compActive))
  const txnColMax = Math.max(...txnRaw.map(txnActive))

  const compStats = computeStats(compSel)
  const txnStats = computeStats(txnSel)
  const compCount = compSel.length, txnCount = txnSel.length

  const scenarios = SCENARIO_DEFS.map((d) => {
    const on = d.key === scn
    const col = colorFor(d.key)
    return {
      key: d.key, label: d.label, sub: d.sub,
      btnStyle:
        `cursor:pointer;border:none;border-radius:8px;padding:9px 13px;text-align:left;transition:all .2s;` +
        (on ? `background:${col};color:#fff;box-shadow:0 4px 12px -4px ${col};` : `background:transparent;color:#d1d5db;`),
    }
  })
  const active = SCENARIO_DEFS.find((d) => d.key === scn)

  const multToggle = MULT_DEFS.map((d) => {
    const on = (useSales ? 'sales' : 'ebitda') === d.key
    return {
      key: d.key, label: d.label, sub: d.sub,
      btnStyle:
        `cursor:pointer;border:none;border-radius:9px;padding:9px 18px;text-align:left;transition:all .2s;` +
        (on ? `background:#fff;color:#0b1a38;box-shadow:0 4px 12px -4px rgba(0,0,0,.4);` : `background:transparent;color:#cdd9ee;`),
    }
  })

  const compMult = multOf(compStats, scn), txnMult = multOf(txnStats, scn)
  const compEV = michelsBasis * compMult, txnEV = michelsBasis * txnMult
  const blendedEV = compEV * wComp + txnEV * (1 - wComp)

  const blendAt = (k) => multOf(compStats, k) * michelsBasis * wComp + multOf(txnStats, k) * michelsBasis * (1 - wComp)
  const rangeLabel = fmtEUR(blendAt('low')) + '–' + fmtEUR(blendAt('max'))
  const blendNote =
    wComp === 0.5 ? 'equal-weighted' : Math.round(wComp * 100) + '% companies / ' + Math.round((1 - wComp) * 100) + '% transactions'

  const minsX = [compStats, txnStats].filter((s) => s.n > 0).map((s) => s.min)
  const maxsX = [compStats, txnStats].filter((s) => s.n > 0).map((s) => s.max)
  const allMin = (minsX.length ? Math.min(...minsX) : 6) * michelsBasis
  const allMax = (maxsX.length ? Math.max(...maxsX) : 20) * michelsBasis
  const pad = (allMax - allMin) * 0.08 + 1
  const lo0 = Math.max(0, allMin - pad), hi0 = allMax + pad
  const niceSteps = [1, 2, 4, 5, 6, 10, 12, 20, 25, 50, 100]
  const step = niceSteps.find((s) => s >= (hi0 - lo0) / 8) || 100
  const axisMin = Math.max(0, Math.floor(lo0 / step) * step)
  const axisMax = Math.ceil(hi0 / step) * step
  const span = axisMax - axisMin
  const frac = (v) => (v - axisMin) / span
  const pctS = (v) => (frac(v) * 100).toFixed(2) + '%'

  const ticks = []
  for (let t = axisMin; t <= axisMax + 0.001; t += step) {
    ticks.push({ label: '€' + t + 'm', frac: frac(t).toFixed(4) })
  }

  const mkMethod = (name, stats, bandBg) => {
    const minEV = stats.min * michelsBasis, maxEV = stats.max * michelsBasis
    const q1EV = stats.q1 * michelsBasis, q3EV = stats.q3 * michelsBasis, medEV = stats.med * michelsBasis
    const activeEV = multOf(stats, scn) * michelsBasis
    return {
      name, bandBg,
      minLeft: pctS(minEV),
      maxLeft: pctS(maxEV),
      whiskerWidth: ((frac(maxEV) - frac(minEV)) * 100).toFixed(2) + '%',
      barLeft: pctS(q1EV),
      barWidth: ((frac(q3EV) - frac(q1EV)) * 100).toFixed(2) + '%',
      medLeft: pctS(medEV),
      activeLeft: pctS(activeEV),
      minLabel: fmtEUR(minEV),
      maxLabel: fmtEUR(maxEV),
    }
  }
  const methods = [
    mkMethod('Comparable Cos.', compStats, 'rgba(37,99,235,.16)'),
    mkMethod('Precedent Txns.', txnStats, 'rgba(16,185,129,.16)'),
  ]

  const mkCards = (stats) =>
    CARD_ROWS.map((r) => {
      const on = r.k === scn
      const col = colorFor(r.k)
      const mult = multOf(stats, r.k)
      return {
        stat: r.stat, tag: r.tag,
        x: fmtX(mult),
        ev: fmtEUR(mult * michelsBasis),
        labelColor: on ? col : '#9ca3af',
        cardStyle:
          `border-radius:10px;padding:16px 16px;transition:all .2s;` +
          (on ? `background:${col}14;border:1.5px solid ${col};box-shadow:0 8px 20px -14px ${col};` : `background:#f9fafb;border:1.5px solid #e5e7eb;`),
        tagStyle: on
          ? `font-size:10px;font-weight:800;letter-spacing:.05em;color:#fff;background:${col};padding:2px 9px;border-radius:20px;`
          : `font-size:10px;font-weight:800;letter-spacing:.05em;color:#6b7280;background:#e5e7eb;padding:2px 9px;border-radius:20px;`,
      }
    })

  const mkCheck = (on, col) =>
    on
      ? `width:18px;height:18px;border-radius:5px;background:${col};border:1.5px solid ${col};display:flex;align-items:center;justify-content:center;cursor:pointer;flex:none;transition:all .15s;`
      : `width:18px;height:18px;border-radius:5px;background:#fff;border:1.5px solid #cbd5e1;cursor:pointer;flex:none;transition:all .15s;`

  // One multiple cell (EV/Sales or EV/EBITDA) for a table row. The active multiple
  // (matching the selected basis) shows a bar and bold value; the other is dimmed.
  const mkMult = (rawMult, isActive, rowAdj, isInc, hl, colMax, accent) => {
    const adj = isActive && rowAdj
    const shown = adj ? rawMult * adjF : rawMult
    return {
      active: isActive, adj,
      num: fmtX(shown), raw: fmtX(rawMult),
      barW: (Math.min(1, shown / colMax) * 100).toFixed(1) + '%',
      barColor: !isInc ? '#e5e7eb' : hl ? activeColor : accent,
      color: !isInc ? '#c2c8d2' : isActive ? (hl ? activeColor : '#1f2937') : '#b6bdc9',
      weight: isActive ? '700' : '500',
    }
  }

  const companies = compRaw.map((r, i) => {
    const inc = !exComp[i]
    const isOut = compOut(r)
    const rowAdj = adjActive && isOut
    const activeShown = rowAdj ? compActive(r) * adjF : compActive(r)
    const inBand = inc && adjActive && !isOut
    const near = multOf(compStats, scn)
    const hl = inc && Math.abs(activeShown - near) < 0.06
    return {
      i,
      name: r.name, url: r.url, country: r.country, emp: fmtNum(r.emp), rev: fmtRev(r.rev),
      ebitda: '$' + r.ebitda.toFixed(1) + 'm',
      ebStyle: `padding:10px;text-align:right;` + (!inc ? 'color:#c2c8d2;' : inBand ? 'color:#059669;font-weight:700;' : 'color:#6b7280;'),
      sCell: mkMult(r.evSales, useSales, rowAdj, inc, useSales && hl, compColMax, 'rgba(37,99,235,.40)'),
      eCell: mkMult(r.evEbitda, !useSales, rowAdj, inc, !useSales && hl, compColMax, 'rgba(37,99,235,.40)'),
      included: inc,
      checkStyle: mkCheck(inc, '#2563eb'),
      checkMark: inc ? '✓' : '',
      nameColor: inc ? '#1f2937' : '#9ca3af',
      cellColor: inc ? '#6b7280' : '#c2c8d2',
      rowStyle: `border-bottom:1px solid #f3f4f6;transition:background .15s;` + (!inc ? `background:#fbfbfc;` : hl ? `background:${activeColor}0D;` : ''),
    }
  })

  const txns = txnRaw.map((r, i) => {
    const inc = !exTxn[i]
    const isOut = txnOut(r)
    const rowAdj = adjActive && isOut
    const activeShown = rowAdj ? txnActive(r) * adjF : txnActive(r)
    const inBand = inc && adjActive && !isOut
    const near = multOf(txnStats, scn)
    const hl = inc && Math.abs(activeShown - near) < 0.06
    return {
      i,
      target: r.target, url: r.url, buyer: r.buyer, country: r.country, year: String(r.year), segment: r.segment,
      rev: fmtRev(r.impliedRev), ebitda: '$' + r.impliedEbitda.toFixed(1) + 'm',
      ebStyle: `padding:10px;text-align:right;` + (!inc ? 'color:#c2c8d2;' : inBand ? 'color:#059669;font-weight:700;' : 'color:#6b7280;'),
      sCell: mkMult(r.evSales, useSales, rowAdj, inc, useSales && hl, txnColMax, 'rgba(16,185,129,.45)'),
      eCell: mkMult(r.evEbitda, !useSales, rowAdj, inc, !useSales && hl, txnColMax, 'rgba(16,185,129,.45)'),
      included: inc,
      checkStyle: mkCheck(inc, '#10b981'),
      checkMark: inc ? '✓' : '',
      nameColor: inc ? '#1f2937' : '#9ca3af',
      cellColor: inc ? '#6b7280' : '#c2c8d2',
      rowStyle: `border-bottom:1px solid #f3f4f6;transition:background .15s;` + (!inc ? `background:#fbfbfc;` : hl ? `background:${activeColor}0D;` : ''),
    }
  })

  const basisLabel = '€' + michelsBasis.toFixed(1) + 'm'

  return {
    scenarios, activeColor, activeColorLight,
    activeLabel: active.label,
    multToggle, multName,
    salesActive: useSales, ebitdaActive: !useSales,
    basisName: useSales ? 'Revenue' : 'EBITDA',
    basisRowName: useSales ? 'Basis · FY2026E Revenue' : 'Basis · FY2026E EBITDA',
    basisIsEstimate: useSales,
    basisEstimateLabel: 'est.',
    sizeAdjVal: String(sizeAdj),
    sizeOpts: SIZE_OPTS,
    adjActive,
    sizeAdjLabel: '−' + sizeAdj + '% on ' + outN + ' size outlier' + (outN === 1 ? '' : 's'),
    bandHint: 'Applies only to comps outside ≈' + bandLo.toFixed(1) + '–' + bandHi.toFixed(1) + 'm EBITDA',
    ebitdaLabel: basisLabel,
    ebitdaShort: basisLabel,
    blendedLabel: fmtEUR(blendedEV),
    blendedFrac: frac(blendedEV).toFixed(4),
    rangeLabel, blendNote,
    comp: {
      multLabel: fmtX(compMult), evLabel: fmtEUR(compEV),
      minLabel: fmtX(compStats.min), maxLabel: fmtX(compStats.max), avgLabel: fmtX(compStats.avg),
      cards: mkCards(compStats),
      count: compCount, total: compRaw.length,
      selLabel: compCount + ' of ' + compRaw.length + ' included',
      someExcluded: compCount !== compRaw.length,
    },
    txn: {
      multLabel: fmtX(txnMult), evLabel: fmtEUR(txnEV),
      minLabel: fmtX(txnStats.min), maxLabel: fmtX(txnStats.max), avgLabel: fmtX(txnStats.avg),
      cards: mkCards(txnStats),
      count: txnCount, total: txnRaw.length,
      selLabel: txnCount + ' of ' + txnRaw.length + ' included',
      someExcluded: txnCount !== txnRaw.length,
    },
    methods, ticks, companies, txns,
  }
}

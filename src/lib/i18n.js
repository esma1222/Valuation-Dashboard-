// Lightweight i18n for the dashboard. `makeT(lang)` returns a translator
// t(key, params) that interpolates {placeholders}. English is the fallback for
// any key missing from another language.

export const LANGS = [
  { code: 'en', label: 'EN' },
  { code: 'de', label: 'DE' },
]

const MONTHS = {
  January: 'Januar', February: 'Februar', March: 'März', April: 'April',
  May: 'Mai', June: 'Juni', July: 'Juli', August: 'August',
  September: 'September', October: 'Oktober', November: 'November', December: 'Dezember',
}

const dict = {
  en: {
    confidential: 'Strictly Confidential',
    tagline: 'merging visions',
    eyebrow: 'Indicative Enterprise Valuation',
    titleSuffix: '— Enterprise Value across scenarios',
    intro:
      'EV/EBITDA and EV/Sales approaches applied to FY2026E figures, benchmarked against listed recruitment & HR-services peers and recent precedent transactions. Choose a valuation multiple, then flex the scenario from the lower quartile, through the median and upper quartile, to the maximum observed multiple.',
    valuationMultiple: 'Valuation multiple',
    selectScenario: 'Select scenario',
    sizeAdjustment: 'Size adjustment',
    basisEbitda: 'Basis · FY2026E EBITDA',
    basisRevenue: 'Basis · FY2026E Revenue',
    bandHint: 'Applies only to comps outside ≈{lo}–{hi}m EBITDA',
    peersUnadjusted: "peers near {subject}'s size are kept unadjusted",
    blendedTitle: 'Blended indicative EV — {label} case',
    rangeLine: 'Indicative range {range} · {note}',
    blendEqual: 'equal-weighted',
    blendWeighted: '{c}% companies / {t2}% transactions',
    sizeAdj: '−{p}% on {n} size outliers',
    sizeAdj1: '−{p}% on 1 size outlier',
    compCompanies: 'Comparable Companies',
    precedentTransactions: 'Precedent Transactions',
    listedPeers: '{n} listed peers',
    deals: '{n} deals',
    enterpriseValue: 'Enterprise Value',
    basisNameEbitda: 'EBITDA',
    basisNameRevenue: 'Revenue',
    ffTitle: 'Valuation range — implied Enterprise Value',
    ffLegend: 'Box = Q1–Q3 · tick = median · whisker = min–max · dot = selected scenario',
    blended: 'Blended {v}',
    methodCompShort: 'Comparable Cos.',
    methodTxnShort: 'Precedent Txns.',
    method1: 'Method 1',
    method2: 'Method 2',
    compSectionTitle: 'Comparable companies — {n} listed peers',
    txnSectionTitle: 'Precedent transactions — {n} comparable deals',
    rangeAvg: '{mult} range {r} · avg {a}',
    included: '{c} of {t2} included',
    resetAll: 'Reset all',
    thCompany: 'Company', thCountry: 'Country', thEmployees: 'Employees',
    thRevenue: 'Revenue', thEbitda: 'EBITDA', thTarget: 'Target',
    thBuyer: 'Buyer', thYear: 'Year', thSegment: 'Segment',
    footnoteBold: '¹ Revenue and EBITDA are implied figures',
    footnoteRest:
      ", derived from the disclosed transaction value and the reported EV/Sales and EV/EBITDA multiples; targets' actual financials were not publicly disclosed. Closest strategic peers — HiOffice Group (DACH social recruiting), milch & zucker and QAPA/Adecco — were screened but excluded from the multiple set as transaction multiples were not disclosed.",
    methodologyHeading: 'Methodology & disclaimer.',
    loading: 'Loading valuation…',
    errorPrefix: 'Could not load valuation data:',
    'sc.low': 'Low', 'sc.median': 'Median', 'sc.average': 'Average', 'sc.upside': 'Upside', 'sc.max': 'Max',
    'scsub.low': 'Lower quartile', 'scsub.median': 'Base case', 'scsub.average': 'Base case', 'scsub.upside': 'High end', 'scsub.max': 'Maximum',
    'cardStat.low': 'Lower quartile', 'cardStat.median': 'Median', 'cardStat.average': 'Average', 'cardStat.upside': 'Upside', 'cardStat.max': 'Maximum',
    'cardTag.low': 'Q1', 'cardTag.median': 'Med', 'cardTag.average': 'Mean', 'cardTag.upside': 'High', 'cardTag.max': 'Max',
    'multsub.ebitda': 'Earnings multiple', 'multsub.sales': 'Revenue multiple',
    sizeNone: 'No adjustment',
  },
  de: {
    confidential: 'Streng vertraulich',
    tagline: 'merging visions',
    eyebrow: 'Indikative Unternehmensbewertung',
    titleSuffix: '— Unternehmenswert über Szenarien hinweg',
    intro:
      'EV/EBITDA- und EV/Umsatz-Ansätze angewendet auf GJ2026E-Kennzahlen, verglichen mit börsennotierten Personaldienstleistungs- und HR-Vergleichsunternehmen sowie aktuellen Präzedenztransaktionen. Wählen Sie einen Bewertungsmultiplikator und variieren Sie anschließend das Szenario vom unteren Quartil über den Median und das obere Quartil bis zum höchsten beobachteten Multiplikator.',
    valuationMultiple: 'Bewertungsmultiplikator',
    selectScenario: 'Szenario wählen',
    sizeAdjustment: 'Größenanpassung',
    basisEbitda: 'Basis · GJ2026E EBITDA',
    basisRevenue: 'Basis · GJ2026E Umsatz',
    bandHint: 'Gilt nur für Vergleichswerte außerhalb ≈{lo}–{hi} Mio. EBITDA',
    peersUnadjusted: 'Peers ähnlicher Größe wie {subject} bleiben unangepasst',
    blendedTitle: 'Gemischter indikativer EV — Szenario {label}',
    rangeLine: 'Indikative Spanne {range} · {note}',
    blendEqual: 'gleichgewichtet',
    blendWeighted: '{c}% Unternehmen / {t2}% Transaktionen',
    sizeAdj: '−{p}% auf {n} Größenausreißer',
    sizeAdj1: '−{p}% auf 1 Größenausreißer',
    compCompanies: 'Vergleichbare Unternehmen',
    precedentTransactions: 'Präzedenztransaktionen',
    listedPeers: '{n} börsennotierte Peers',
    deals: '{n} Transaktionen',
    enterpriseValue: 'Unternehmenswert',
    basisNameEbitda: 'EBITDA',
    basisNameRevenue: 'Umsatz',
    ffTitle: 'Bewertungsspanne — impliziter Unternehmenswert',
    ffLegend: 'Box = Q1–Q3 · Strich = Median · Antenne = Min–Max · Punkt = gewähltes Szenario',
    blended: 'Gemischt {v}',
    methodCompShort: 'Vergl. Unternehmen',
    methodTxnShort: 'Präz. Transaktionen',
    method1: 'Methode 1',
    method2: 'Methode 2',
    compSectionTitle: 'Vergleichbare Unternehmen — {n} börsennotierte Peers',
    txnSectionTitle: 'Präzedenztransaktionen — {n} vergleichbare Deals',
    rangeAvg: '{mult}-Spanne {r} · Ø {a}',
    included: '{c} von {t2} einbezogen',
    resetAll: 'Alle zurücksetzen',
    thCompany: 'Unternehmen', thCountry: 'Land', thEmployees: 'Mitarbeiter',
    thRevenue: 'Umsatz', thEbitda: 'EBITDA', thTarget: 'Zielunternehmen',
    thBuyer: 'Käufer', thYear: 'Jahr', thSegment: 'Segment',
    footnoteBold: '¹ Umsatz und EBITDA sind implizite Werte',
    footnoteRest:
      ', abgeleitet aus dem offengelegten Transaktionswert und den berichteten EV/Umsatz- und EV/EBITDA-Multiplikatoren; die tatsächlichen Finanzkennzahlen der Zielunternehmen wurden nicht öffentlich bekanntgegeben. Die nächstgelegenen strategischen Vergleichsunternehmen — HiOffice Group (DACH Social Recruiting), milch & zucker und QAPA/Adecco — wurden geprüft, aber aus dem Multiplikatorensatz ausgeschlossen, da keine Transaktionsmultiplikatoren offengelegt wurden.',
    methodologyHeading: 'Methodik & Haftungsausschluss.',
    loading: 'Bewertung wird geladen…',
    errorPrefix: 'Bewertungsdaten konnten nicht geladen werden:',
    'sc.low': 'Niedrig', 'sc.median': 'Median', 'sc.average': 'Durchschnitt', 'sc.upside': 'Aufwärts', 'sc.max': 'Max',
    'scsub.low': 'Unteres Quartil', 'scsub.median': 'Basisszenario', 'scsub.average': 'Basisszenario', 'scsub.upside': 'Oberes Ende', 'scsub.max': 'Maximum',
    'cardStat.low': 'Unteres Quartil', 'cardStat.median': 'Median', 'cardStat.average': 'Durchschnitt', 'cardStat.upside': 'Aufwärts', 'cardStat.max': 'Maximum',
    'cardTag.low': 'Q1', 'cardTag.median': 'Med', 'cardTag.average': 'Ø', 'cardTag.upside': 'Hoch', 'cardTag.max': 'Max',
    'multsub.ebitda': 'Ertragsmultiplikator', 'multsub.sales': 'Umsatzmultiplikator',
    sizeNone: 'Keine Anpassung',
  },
}

export function makeT(lang) {
  const table = dict[lang] || dict.en
  return function t(key, params) {
    let s = table[key] ?? dict.en[key] ?? key
    if (params) {
      for (const k of Object.keys(params)) s = s.split('{' + k + '}').join(String(params[k]))
    }
    return s
  }
}

// Localise an "<English Month> <Year>" label (e.g. the as-of date from the DB).
export function localizeAsOf(lang, s) {
  if (!s || lang !== 'de') return s
  return s.replace(
    /\b(January|February|March|April|May|June|July|August|September|October|November|December)\b/,
    (m) => MONTHS[m] || m,
  )
}

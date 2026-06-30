import { useEffect, useMemo, useState } from 'react'
import { loadValuationData } from './lib/supabase'
import { buildView } from './lib/valuation'
import { css } from './lib/css'

const PAGE_BG = '#003E5F'

export default function App() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  // Interactive state — mirrors the original artifact's on-screen controls.
  const [scenario, setScenario] = useState('median')
  const [basis, setBasis] = useState('ebitda') // 'ebitda' (EV/EBITDA) | 'sales' (EV/Sales)
  const [exComp, setExComp] = useState({})
  const [exTxn, setExTxn] = useState({})
  const [sizeAdj, setSizeAdj] = useState(0)

  useEffect(() => {
    let active = true
    loadValuationData()
      .then((d) => active && setData(d))
      .catch((e) => active && setError(e))
    return () => { active = false }
  }, [])

  const toggleComp = (i) =>
    setExComp((e) => { const n = { ...e }; n[i] ? delete n[i] : (n[i] = true); return n })
  const toggleTxn = (i) =>
    setExTxn((e) => { const n = { ...e }; n[i] ? delete n[i] : (n[i] = true); return n })

  const view = useMemo(
    () => (data ? buildView(data, { scenario, basis, exComp, exTxn, sizeAdj }) : null),
    [data, scenario, basis, exComp, exTxn, sizeAdj],
  )

  if (error) return <Centered>Could not load valuation data: {String(error.message || error)}</Centered>
  if (!view) return <Centered>Loading valuation…</Centered>

  const v = view
  const asOf = data.assumptions?.as_of_label || ''

  return (
    <div style={{ minHeight: '100vh', background: PAGE_BG, fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif", color: '#1f2937', padding: '0 0 64px' }}>
      {/* TOP BAR */}
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '26px 32px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
          <img src="/assets/atares-logo-white.png" alt="atares" style={{ height: 48, width: 'auto', display: 'block' }} />
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <span className="brand" style={{ fontWeight: 300, fontSize: 31, letterSpacing: '.05em', color: '#fff' }}>atares</span>
            <span style={{ fontSize: 9.5, fontWeight: 500, letterSpacing: '.36em', color: '#98A6AE', marginTop: 5, paddingLeft: 2 }}>merging visions</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,.62)' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#00C3BF', display: 'inline-block' }} />
          Strictly Confidential{asOf ? ` · ${asOf}` : ''}
        </div>
      </div>

      {/* TITLE */}
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '30px 32px 22px' }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: '#98A6AE', marginBottom: 12 }}>Indicative Enterprise Valuation</div>
        <h1 className="brand" style={{ fontWeight: 400, fontSize: 46, lineHeight: 1.08, letterSpacing: '-.3px', margin: '0 0 14px', color: '#fff', maxWidth: 880 }}>{data.assumptions?.subject_company || 'Michelscom'} — Enterprise Value across scenarios</h1>
        <p style={{ margin: 0, fontSize: 16, lineHeight: 1.55, color: 'rgba(255,255,255,.78)', maxWidth: 760 }}>EV/EBITDA and EV/Sales approaches applied to FY2026E figures, benchmarked against listed recruitment &amp; HR-services peers and recent precedent transactions. Choose a valuation multiple, then flex the scenario from the lower quartile, through the median and upper quartile, to the maximum observed multiple.</p>
      </div>

      {/* HERO PANEL */}
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 32px' }}>
        <div style={{ background: 'linear-gradient(135deg,#00567F 0%,#003E5F 55%,#00263B 100%)', border: '1px solid rgba(255,255,255,.13)', borderRadius: 14, padding: '34px 38px', boxShadow: '0 22px 50px -26px rgba(0,0,0,.55)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -70, right: -50, width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle,rgba(0,195,191,.22),transparent 68%)' }} />
          <img src="/assets/atares-logo-white.png" alt="" aria-hidden="true" style={{ position: 'absolute', bottom: -40, right: 18, width: 230, height: 'auto', opacity: 0.06, pointerEvents: 'none' }} />

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 28, flexWrap: 'wrap', position: 'relative' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,.55)', marginBottom: 12 }}>Valuation multiple</div>
              <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.14)', borderRadius: 11, padding: 5, gap: 4, marginBottom: 24 }}>
                {v.multToggle.map((m) => (
                  <button key={m.key} onClick={() => setBasis(m.key)} style={css(m.btnStyle)}>
                    <span style={{ fontWeight: 700, fontSize: 15, display: 'block' }}>{m.label}</span>
                    <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '.03em', opacity: 0.82 }}>{m.sub}</span>
                  </button>
                ))}
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,.55)', marginBottom: 12 }}>Select scenario</div>
              <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.14)', borderRadius: 11, padding: 5, gap: 4 }}>
                {v.scenarios.map((s) => (
                  <button key={s.key} onClick={() => setScenario(s.key)} style={css(s.btnStyle)}>
                    <span style={{ fontWeight: 700, fontSize: 15, display: 'block' }}>{s.label}</span>
                    <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '.03em', opacity: 0.82 }}>{s.sub}</span>
                  </button>
                ))}
              </div>
              <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 26, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,.55)' }}>{v.basisRowName}</span>
                  <span className="num" style={{ fontWeight: 700, fontSize: 15, color: '#fff', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.16)', borderRadius: 8, padding: '4px 11px' }}>{v.ebitdaLabel}</span>
                  {v.basisIsEstimate && (
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: '#fbbf24' }}>{v.basisEstimateLabel}</span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,.55)' }}>Size adjustment</span>
                  <select
                    value={v.sizeAdjVal}
                    onChange={(e) => setSizeAdj(Number(e.target.value))}
                    style={{ fontFamily: 'inherit', fontWeight: 700, fontSize: 14, color: '#fff', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.22)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer' }}
                  >
                    {v.sizeOpts.map((o) => (
                      <option key={o.value} value={o.value} style={{ color: '#0b1a38' }}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              {v.adjActive && (
                <div style={{ marginTop: 10, fontSize: 11.5, fontWeight: 600, color: 'rgba(255,255,255,.5)' }}>{v.bandHint} — peers near {data.assumptions?.subject_company || 'Michelscom'}'s size are kept unadjusted</div>
              )}
            </div>

            <div style={{ textAlign: 'right', minWidth: 280 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,.55)', marginBottom: 6 }}>Blended indicative EV — <span style={{ color: v.activeColorLight }}>{v.activeLabel} case</span></div>
              <div className="num" style={{ fontWeight: 800, fontSize: 74, lineHeight: 0.95, letterSpacing: '-2.5px', color: '#fff' }}>{v.blendedLabel}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,.7)', marginTop: 8 }}>Indicative range <span className="num" style={{ color: '#fff' }}>{v.rangeLabel}</span> · {v.blendNote}</div>
              {v.adjActive && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12, whiteSpace: 'nowrap', fontSize: 11, fontWeight: 800, letterSpacing: '.04em', color: '#FBC4BB', background: 'rgba(243,72,50,.15)', border: '1px solid rgba(243,72,50,.42)', borderRadius: 20, padding: '4px 12px' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F34832', flex: 'none' }} />{v.sizeAdjLabel}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 30, position: 'relative' }}>
            <HeroMethod title="Comparable Companies" countLabel={`${v.comp.total} listed peers`} multName={v.multName} basisName={v.basisName} mult={v.comp.multLabel} ebitda={v.ebitdaShort} ev={v.comp.evLabel} multColor={v.activeColorLight} />
            <HeroMethod title="Precedent Transactions" countLabel={`${v.txn.total} deals`} multName={v.multName} basisName={v.basisName} mult={v.txn.multLabel} ebitda={v.ebitdaShort} ev={v.txn.evLabel} multColor={v.activeColorLight} />
          </div>
        </div>
      </div>

      {/* FOOTBALL FIELD */}
      <Panel light>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6, flexWrap: 'wrap', gap: 8 }}>
          <h2 className="brand" style={{ fontWeight: 500, fontSize: 23, letterSpacing: '-.2px', margin: 0, color: '#003E5F' }}>Valuation range — implied Enterprise Value</h2>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#6b7280' }}>Box = Q1–Q3 · tick = median · whisker = min–max · dot = selected scenario</span>
        </div>

        <div style={{ position: 'relative', marginTop: 60, padding: '0 6px' }}>
          <div style={{ position: 'absolute', inset: 0 }}>
            {v.ticks.map((t, i) => (
              <div key={i} style={{ position: 'absolute', top: -8, bottom: 34, width: 1, background: '#e5e7eb', left: `calc(160px + (100% - 160px) * ${t.frac})` }} />
            ))}
          </div>

          <div style={{ position: 'absolute', top: -18, bottom: 34, width: 2, background: v.activeColor, left: `calc(160px + (100% - 160px) * ${v.blendedFrac})`, transition: 'left .4s cubic-bezier(.4,0,.2,1),background .3s', boxShadow: '0 0 0 4px rgba(0,195,191,.14)' }}>
            <div style={{ position: 'absolute', top: -26, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', background: v.activeColor, color: '#fff', fontWeight: 700, fontSize: 12, padding: '3px 9px', borderRadius: 7, transition: 'background .3s' }}>Blended {v.blendedLabel}</div>
          </div>

          {v.methods.map((m, i) => (
            <div key={i} style={{ position: 'relative', height: 54, marginBottom: 6 }}>
              <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', fontSize: 13, fontWeight: 700, color: '#1f2937', width: 150 }}>{m.name}</div>
              <div style={{ position: 'absolute', left: 160, right: 0, top: 0, bottom: 0 }}>
                <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 2, background: '#f3f4f6', transform: 'translateY(-50%)' }} />
                <div style={{ position: 'absolute', top: '50%', height: 2, background: '#d1d5db', transform: 'translateY(-50%)', left: m.minLeft, width: m.whiskerWidth, transition: 'left .4s,width .4s' }} />
                <div style={{ position: 'absolute', top: '50%', height: 12, width: 2, background: '#d1d5db', transform: 'translateY(-50%)', left: m.minLeft, transition: 'left .4s' }} />
                <div style={{ position: 'absolute', top: '50%', height: 12, width: 2, background: '#d1d5db', transform: 'translateY(-50%)', left: m.maxLeft, transition: 'left .4s' }} />
                <div style={{ position: 'absolute', top: '50%', height: 14, transform: 'translateY(-50%)', borderRadius: 8, background: m.bandBg, left: m.barLeft, width: m.barWidth, transition: 'left .4s,width .4s' }} />
                <div style={{ position: 'absolute', top: '50%', height: 26, width: 2, background: '#1f2937', transform: 'translateY(-50%)', left: m.medLeft, transition: 'left .4s' }} />
                <div style={{ position: 'absolute', top: '50%', width: 16, height: 16, borderRadius: '50%', background: v.activeColor, border: '3px solid #fff', transform: 'translate(-50%,-50%)', left: m.activeLeft, transition: 'left .4s cubic-bezier(.4,0,.2,1),background .3s', boxShadow: '0 2px 8px rgba(0,0,0,.22)', zIndex: 2 }} />
                <div className="num" style={{ position: 'absolute', bottom: -6, fontSize: 10.5, fontWeight: 700, color: '#9ca3af', left: m.minLeft, transform: 'translateX(-50%)' }}>{m.minLabel}</div>
                <div className="num" style={{ position: 'absolute', bottom: -6, fontSize: 10.5, fontWeight: 700, color: '#9ca3af', left: m.maxLeft, transform: 'translateX(-50%)' }}>{m.maxLabel}</div>
              </div>
            </div>
          ))}

          <div style={{ position: 'relative', height: 20, marginTop: 8, borderTop: '1px solid #e5e7eb', paddingLeft: 160 }}>
            {v.ticks.map((t, i) => (
              <div key={i} className="num" style={{ position: 'absolute', top: 6, fontSize: 11, fontWeight: 600, color: '#9ca3af', left: `calc(160px + (100% - 160px) * ${t.frac})`, transform: 'translateX(-50%)' }}>{t.label}</div>
            ))}
          </div>
        </div>
      </Panel>

      {/* COMPARABLE COMPANIES */}
      <Panel light>
        <SectionHead method="Method 1" title={`Comparable companies — ${v.comp.total} listed peers`} multName={v.multName} rangeLabel={`${v.comp.minLabel}–${v.comp.maxLabel}`} avgLabel={v.comp.avgLabel} selLabel={v.comp.selLabel} someExcluded={v.comp.someExcluded} onReset={() => setExComp({})} />
        <CardGrid cards={v.comp.cards} />
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: '#6b7280', fontSize: 10.5, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>
                <th style={th(34)} />
                <th style={th()}>Company</th>
                <th style={th()}>Country</th>
                <th style={th(null, 'right')}>Employees</th>
                <th style={th(null, 'right')}>Revenue</th>
                <th style={th(null, 'right')}>EBITDA</th>
                <th style={th(150, 'right')}>EV/Sales {v.salesActive && <span style={{ color: '#007775' }}>●</span>}</th>
                <th style={th(150, 'right')}>EV/EBITDA {v.ebitdaActive && <span style={{ color: '#007775' }}>●</span>}</th>
              </tr>
            </thead>
            <tbody>
              {v.companies.map((c) => (
                <tr key={c.i} style={css(c.rowStyle)}>
                  <td style={{ padding: 10 }} onClick={() => toggleComp(c.i)}>
                    <div style={css(c.checkStyle)}><span style={{ color: '#fff', fontSize: 12, fontWeight: 900, lineHeight: 1 }}>{c.checkMark}</span></div>
                  </td>
                  <td style={{ padding: 10, fontWeight: 700 }}><a className="dc-link" href={c.url} target="_blank" rel="noopener noreferrer" style={{ color: c.nameColor }}>{c.name}</a></td>
                  <td style={{ padding: 10, color: c.cellColor }}>{c.country}</td>
                  <td className="num" style={{ padding: 10, textAlign: 'right', color: c.cellColor }}>{c.emp}</td>
                  <td className="num" style={{ padding: 10, textAlign: 'right', color: c.cellColor }}>{c.rev}</td>
                  <td className="num" style={css(c.ebStyle)}>{c.ebitda}</td>
                  <td style={{ padding: 10 }}><MultCell cell={c.sCell} /></td>
                  <td style={{ padding: 10 }}><MultCell cell={c.eCell} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* PRECEDENT TRANSACTIONS */}
      <Panel light>
        <SectionHead method="Method 2" title={`Precedent transactions — ${v.txn.total} comparable deals`} multName={v.multName} rangeLabel={`${v.txn.minLabel}–${v.txn.maxLabel}`} avgLabel={v.txn.avgLabel} selLabel={v.txn.selLabel} someExcluded={v.txn.someExcluded} onReset={() => setExTxn({})} />
        <CardGrid cards={v.txn.cards} />
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: '#6b7280', fontSize: 10.5, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>
                <th style={th(34)} />
                <th style={th()}>Target</th>
                <th style={th()}>Buyer</th>
                <th style={th()}>Country</th>
                <th style={th()}>Year</th>
                <th style={th()}>Segment</th>
                <th style={th(null, 'right')}>Revenue<span style={{ color: '#cbd5e1' }}>¹</span></th>
                <th style={th(null, 'right')}>EBITDA<span style={{ color: '#cbd5e1' }}>¹</span></th>
                <th style={th(140, 'right')}>EV/Sales {v.salesActive && <span style={{ color: '#007775' }}>●</span>}</th>
                <th style={th(140, 'right')}>EV/EBITDA {v.ebitdaActive && <span style={{ color: '#007775' }}>●</span>}</th>
              </tr>
            </thead>
            <tbody>
              {v.txns.map((t) => (
                <tr key={t.i} style={css(t.rowStyle)}>
                  <td style={{ padding: 10 }} onClick={() => toggleTxn(t.i)}>
                    <div style={css(t.checkStyle)}><span style={{ color: '#fff', fontSize: 12, fontWeight: 900, lineHeight: 1 }}>{t.checkMark}</span></div>
                  </td>
                  <td style={{ padding: 10, fontWeight: 700 }}><a className="dc-link" href={t.url} target="_blank" rel="noopener noreferrer" style={{ color: t.nameColor }}>{t.target}</a></td>
                  <td style={{ padding: 10, color: t.cellColor }}>{t.buyer}</td>
                  <td style={{ padding: 10, color: t.cellColor }}>{t.country}</td>
                  <td className="num" style={{ padding: 10, color: t.cellColor }}>{t.year}</td>
                  <td style={{ padding: 10, color: t.cellColor }}>{t.segment}</td>
                  <td className="num" style={{ padding: 10, textAlign: 'right', color: t.cellColor }}>{t.rev}</td>
                  <td className="num" style={css(t.ebStyle)}>{t.ebitda}</td>
                  <td style={{ padding: 10 }}><MultCell cell={t.sCell} maxBar={84} /></td>
                  <td style={{ padding: 10 }}><MultCell cell={t.eCell} maxBar={84} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ margin: '18px 0 0', fontSize: 12, lineHeight: 1.6, color: '#9ca3af' }}>
          <span style={{ color: '#6b7280' }}>¹ Revenue and EBITDA are implied figures</span>, derived from the disclosed transaction value and the reported EV/Sales and EV/EBITDA multiples; targets' actual financials were not publicly disclosed. Closest strategic peers — HiOffice Group (DACH social recruiting), milch &amp; zucker and QAPA/Adecco — were screened but excluded from the multiple set as transaction multiples were not disclosed.
        </p>
      </Panel>

      {/* METHODOLOGY */}
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 32px' }}>
        <div style={{ marginTop: 22, padding: '20px 24px', border: '1px dashed rgba(255,255,255,.24)', borderRadius: 12, fontSize: 12, lineHeight: 1.65, color: 'rgba(255,255,255,.7)' }}>
          <strong style={{ color: '#fff' }}>Methodology &amp; disclaimer.</strong>{' '}
          {data.assumptions?.methodology ||
            'Indicative Enterprise Value derived from peer and transaction EV/EBITDA multiples. Figures are indicative and do not constitute a formal valuation.'}
        </div>
      </div>
    </div>
  )
}

/* ---------- small presentational helpers ---------- */

function Centered({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: PAGE_BG, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,.85)', fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif", fontSize: 15, padding: 24, textAlign: 'center' }}>
      {children}
    </div>
  )
}

function Panel({ children }) {
  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 32px' }}>
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '30px 36px', marginTop: 18, boxShadow: '0 12px 34px -20px rgba(0,0,0,.45)' }}>
        {children}
      </div>
    </div>
  )
}

function HeroMethod({ title, countLabel, multName, basisName, mult, ebitda, ev, multColor }) {
  return (
    <div style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 12, padding: '20px 22px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: '#fff' }}>{title}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.55)', letterSpacing: '.03em' }}>{countLabel}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.5)' }}>{multName}</div>
          <div className="num" style={{ fontWeight: 700, fontSize: 30, color: multColor }}>{mult}</div>
        </div>
        <div style={{ fontSize: 24, color: 'rgba(255,255,255,.35)', fontWeight: 300 }}>×</div>
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.5)' }}>{basisName}</div>
          <div className="num" style={{ fontWeight: 700, fontSize: 30, color: '#fff' }}>{ebitda}</div>
        </div>
        <div style={{ fontSize: 24, color: 'rgba(255,255,255,.35)', fontWeight: 300, marginLeft: 2 }}>=</div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.5)' }}>Enterprise Value</div>
          <div className="num" style={{ fontWeight: 800, fontSize: 30, color: '#fff' }}>{ev}</div>
        </div>
      </div>
    </div>
  )
}

function SectionHead({ method, methodColor = '#007775', title, multName, rangeLabel, avgLabel, selLabel, someExcluded, onReset }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: methodColor, marginBottom: 6 }}>{method}</div>
        <h2 className="brand" style={{ fontWeight: 500, fontSize: 23, letterSpacing: '-.2px', margin: 0, color: '#003E5F' }}>{title}</h2>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: '#6b7280' }}>{multName} range <span className="num" style={{ color: '#1f2937', fontWeight: 700 }}>{rangeLabel}</span> · avg <span className="num" style={{ color: '#1f2937', fontWeight: 700 }}>{avgLabel}</span></div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, marginTop: 7 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.04em', color: '#007775', background: '#e6f6f5', border: '1px solid #c9ebe9', borderRadius: 20, padding: '3px 11px' }}>{selLabel}</span>
          {someExcluded && (
            <button onClick={onReset} style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>Reset all</button>
          )}
        </div>
      </div>
    </div>
  )
}

function CardGrid({ cards }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10, marginBottom: 24 }}>
      {cards.map((c, i) => (
        <div key={i} style={css(c.cardStyle)}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: c.labelColor }}>{c.stat}</span>
            <span style={css(c.tagStyle)}>{c.tag}</span>
          </div>
          <div className="num" style={{ fontWeight: 800, fontSize: 27, letterSpacing: '-.6px', color: '#1f2937', lineHeight: 1 }}>{c.x}</div>
          <div className="num" style={{ fontSize: 13, fontWeight: 600, color: '#6b7280', marginTop: 6 }}>→ EV {c.ev}</div>
        </div>
      ))}
    </div>
  )
}

// One multiple cell (EV/Sales or EV/EBITDA). The active multiple (matching the
// selected basis) shows a scaled bar and bold value; the inactive one is dimmed.
function MultCell({ cell, maxBar = 88 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 9 }}>
      {cell.active && (
        <div style={{ flex: 1, height: 6, background: '#f3f4f6', borderRadius: 4, position: 'relative', maxWidth: maxBar }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 4, background: cell.barColor, width: cell.barW }} />
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: 44 }}>
        <span className="num" style={{ fontWeight: cell.weight, color: cell.color }}>{cell.num}</span>
        {cell.adj && <span className="num" style={{ fontSize: 10, fontWeight: 600, color: '#c2c8d2', textDecoration: 'line-through' }}>{cell.raw}</span>}
      </div>
    </div>
  )
}

const th = (width, align) => ({
  padding: '9px 10px',
  borderBottom: '1px solid #e5e7eb',
  ...(width ? { width } : {}),
  ...(align ? { textAlign: align } : {}),
})

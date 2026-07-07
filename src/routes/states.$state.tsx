import { createFileRoute, Link } from '@tanstack/react-router'
import { HomeNav } from '../components/HomeNav'
import { HomeFooter } from '../components/HomeFooter'
import { NIGERIA_STATES } from '../nigeriaStates'
import { STATE_BOUNDS } from '../stateBounds'
import { STATE_BY_SLUG } from '../stateSlug'
import { API_BASE } from '../config'

const COLORS: Record<string, string> = { APC: '#1f6fd6', PDP: '#c0392b', LP: '#e05a1f', NNPP: '#f0b429', APGA: '#7b3fb5', SDP: '#0f8a4a', NDC: '#0e7490', ADC: '#db2777' }
const colorOf = (p: string) => COLORS[p] ?? '#8aa093'
const TYPE_LABEL: Record<string, string> = { presidential: 'Presidential', governor: 'Governor', senate: 'Senate' }
const RACES = ['presidential', 'governor', 'senate'] as const

type PartyScore = { party: string; score: number }
type BoardPrediction = {
  id: number; source: string; label: string; author_name: string; election_type: string
  leading_party: string; scores: Record<string, number>; notes: string; year: string
}
type Heavyweight = { name: string; title: string; party: string; note: string }
type LgaShape = { lga: string; leader: string; pct: number; cx: number; cy: number; d: string }
type LgaGeo = { viewBox: string; lgas: LgaShape[] }
type Facts = {
  code: string; capital: string; area_sq_km: number | null; census_1991: number | null; census_2006: number | null; population_projection: number | null
  active_phone_2021: number | null; active_phone_2020: number | null; newly_registered_voters_2022: number | null
  voters_presidential_2019: number | null; buhari_votes_2019: number | null; atiku_votes_2019: number | null
  total_votes_2019: number | null; votes_2023: number | null; nin_total: number | null; nin_male: number | null; nin_female: number | null
}
type GovCand = { name: string; party: string; votes: number; position: number }
type LoaderData = {
  state: string; week: string; byRace: Record<string, PartyScore[]>
  predictions: BoardPrediction[]; politicians: Heavyweight[]; lga: LgaGeo | null
  facts: Facts | null; governor: GovCand[]
}

export const Route = createFileRoute('/states/$state')({
  loader: async ({ params }): Promise<LoaderData> => {
    const state = STATE_BY_SLUG[params.state] ?? decodeURIComponent(params.state)
    let week = ''
    let byRace: Record<string, PartyScore[]> = {}
    try {
      const meta = await fetch(`${API_BASE}/api/predictions/meta`).then((r) => r.json())
      week = meta.weeks?.[0] ?? ''
      const entries = await Promise.all(
        RACES.map(async (et) => {
          const rows: { state: string; party: string; score: number }[] = await fetch(
            `${API_BASE}/api/predictions?election_type=${et}&week=${encodeURIComponent(week)}`,
          ).then((r) => r.json())
          const forState = rows
            .filter((r) => r.state === state)
            .map((r) => ({ party: r.party, score: r.score }))
            .sort((a, b) => b.score - a.score)
          return [et, forState] as const
        }),
      )
      byRace = Object.fromEntries(entries)
    } catch {
      /* leave empty */
    }
    let predictions: BoardPrediction[] = []
    let politicians: Heavyweight[] = []
    let facts: Facts | null = null
    let governor: GovCand[] = []
    try {
      const detail = await fetch(`${API_BASE}/api/states/${encodeURIComponent(state)}`).then((r) => r.json())
      predictions = detail.predictions ?? []
      politicians = detail.politicians ?? []
      facts = detail.facts ?? null
      governor = detail.governor_2019 ?? []
    } catch {
      /* leave empty */
    }
    let lga: LgaGeo | null = null
    try {
      lga = (await import(`../data/lga/${params.state}.json`)).default as LgaGeo
    } catch {
      lga = null
    }
    return { state, week, byRace, predictions, politicians, lga, facts, governor }
  },
  head: ({ params }) => {
    const s = STATE_BY_SLUG[params.state] ?? decodeURIComponent(params.state)
    const title = `${s} — 2027 Election Prediction | Nigeria 2.0`
    const description = `Projected 2027 presidential, governorship and senate results for ${s} State, Nigeria — a party-by-party breakdown from Nigeria 2.0.`
    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
      ],
    }
  },
  component: StatePage,
})

function weekLabel(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  return isNaN(d.getTime()) ? iso : `Week of ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
}

function StatePage() {
  const { state, week, byRace, predictions, politicians, lga, facts, governor } = Route.useLoaderData()
  const fmt = (n: number | null | undefined) => (n == null ? '—' : n.toLocaleString())
  const shape = NIGERIA_STATES.find((s) => s.name === state)
  const bounds = STATE_BOUNDS[state]
  const pres = byRace.presidential ?? []
  const winner = pres[0]?.party
  const fill = winner ? colorOf(winner) : '#cdd8cf'

  let viewBox = '0 0 954 734'
  if (bounds) {
    const [x, y, w, h] = bounds
    const pad = Math.max(w, h) * 0.09
    viewBox = `${x - pad} ${y - pad} ${w + pad * 2} ${h + pad * 2}`
  }

  const govTotal = governor.reduce((sum, g) => sum + (g.votes || 0), 0)
  const panelStyle: React.CSSProperties = { background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', padding: '16px 18px' }
  const panelTitle: React.CSSProperties = { fontFamily: "'Archivo Black', sans-serif", fontSize: '12px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#8aa093', marginBottom: '4px' }
  const statRow = (label: string, value: string) => (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '10px', padding: '8px 0', borderTop: '1px solid #f2f5f1' }}>
      <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '13px', color: '#5c6b60' }}>{label}</span>
      <span style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '15px', color: '#0f2a1c' }}>{value}</span>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f4f7f2', fontFamily: "'Archivo', sans-serif" }}>
      <HomeNav />

      <div style={{ background: '#0d8244' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '30px 40px 26px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
          <div>
            <Link to="/2027/presidential" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '13px', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#9fd9b8', textDecoration: 'none', marginBottom: '12px' }}>
              ← Back to the map
            </Link>
            <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '40px', color: '#fff', margin: '0 0 6px', letterSpacing: '-0.01em' }}>{state} State</h1>
            <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '16px', color: '#c7e7d4', margin: 0 }}>
              Projected 2027 results for {state}{week ? ` · ${weekLabel(week)}` : ''}.
            </p>
          </div>
          <Link to="/predictions" style={{ flex: 'none', fontFamily: "'Archivo Black', sans-serif", fontSize: '15px', color: '#0f4a2c', background: '#ffe14d', textDecoration: 'none', padding: '13px 22px', borderRadius: '4px', marginTop: '4px' }}>
            + Add Your Prediction
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '30px 40px 72px' }}>
        <div className="two-col" style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: '28px', alignItems: 'start' }}>
          {/* state map — segmented by LGA, coloured by verified 2023 winner */}
          <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '12px', padding: '20px' }}>
            {lga && lga.lgas.length > 0 ? (
              <>
                <svg viewBox={lga.viewBox} width="100%" style={{ display: 'block', maxHeight: '620px' }} role="img" aria-label={`Local governments of ${state} State`}>
                  {lga.lgas.map((l) => (
                    <path key={l.lga} d={l.d} fill={l.leader ? colorOf(l.leader) : '#cdd8cf'} stroke="#111111" strokeWidth={0.7} strokeLinejoin="round">
                      <title>{l.lga}{l.leader ? ` — ${l.leader} led with ${l.pct}%` : ' — no verified data'}</title>
                    </path>
                  ))}
                  {lga.lgas.map((l) => {
                    const words = l.lga.split(/\s+/)
                    const lines = words.length <= 1 ? [l.lga] : [words[0], words.slice(1).join(' ')]
                    const FS = 19
                    return (
                      <text key={`t-${l.lga}`} textAnchor="middle" fontFamily="'Archivo', sans-serif" fontWeight={700} fontSize={FS} fill="#111111" style={{ paintOrder: 'stroke', stroke: '#ffffff', strokeWidth: 1.9, pointerEvents: 'none' }}>
                        {lines.length === 1 ? (
                          <tspan x={l.cx} y={l.cy + FS * 0.34}>{lines[0]}</tspan>
                        ) : (
                          <>
                            <tspan x={l.cx} y={l.cy - FS * 0.16}>{lines[0]}</tspan>
                            <tspan x={l.cx} y={l.cy + FS * 1.02}>{lines[1]}</tspan>
                          </>
                        )}
                      </text>
                    )
                  })}
                </svg>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 16px', justifyContent: 'center', marginTop: '12px' }}>
                  {[...new Set(lga.lgas.map((l) => l.leader).filter(Boolean))].map((p) => (
                    <div key={p} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: colorOf(p), display: 'inline-block' }} />
                      <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '13px', color: '#0f2a1c' }}>{p}</span>
                    </div>
                  ))}
                </div>
                <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '12px', color: '#8aa093', textAlign: 'center', margin: '8px 0 0' }}>
                  Each local government coloured by its verified 2023 presidential winner. Hover for details.
                </p>
              </>
            ) : shape ? (
              <svg viewBox={viewBox} width="100%" style={{ display: 'block', maxHeight: '460px' }} role="img" aria-label={`Map of ${state} State`}>
                <path d={shape.d} fill={fill} stroke="#ffffff" strokeWidth={1.2} strokeLinejoin="round" />
              </svg>
            ) : (
              <div style={{ padding: '60px', textAlign: 'center', fontFamily: "'Archivo', sans-serif", fontWeight: 700, color: '#8aa093' }}>Map unavailable for this state.</div>
            )}
          </div>

          {/* statistics panel */}
          {facts ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ ...panelStyle, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '20px', color: '#0f2a1c', lineHeight: 1.1 }}>{facts.capital || '—'}</div>
                  <div style={panelTitle}>Capital</div>
                </div>
                <div>
                  <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '20px', color: '#0f2a1c', lineHeight: 1.1 }}>{facts.code || '—'}</div>
                  <div style={panelTitle}>State code</div>
                </div>
              </div>

              <div style={panelStyle}>
                <div style={panelTitle}>Voters</div>
                {statRow('Presidential voters · 2019', fmt(facts.voters_presidential_2019))}
                {statRow('Newly registered · 2022', fmt(facts.newly_registered_voters_2022))}
              </div>

              <div style={panelStyle}>
                <div style={panelTitle}>Votes</div>
                {statRow('Presidential · 2019', fmt(facts.total_votes_2019 ?? (((facts.buhari_votes_2019 ?? 0) + (facts.atiku_votes_2019 ?? 0)) || null)))}
                {statRow('Presidential · 2023', fmt(facts.votes_2023))}
                {statRow('Governorship · 2019', govTotal ? govTotal.toLocaleString() : '—')}
              </div>

              <div style={panelStyle}>
                <div style={panelTitle}>Active phone lines</div>
                {statRow('2021', fmt(facts.active_phone_2021))}
                {statRow('2020', fmt(facts.active_phone_2020))}
              </div>

              <div style={panelStyle}>
                <div style={panelTitle}>NIN enrolment</div>
                {statRow('Total', fmt(facts.nin_total))}
                {statRow('Male', fmt(facts.nin_male))}
                {statRow('Female', fmt(facts.nin_female))}
              </div>
            </div>
          ) : (
            <div />
          )}
        </div>

        {/* all elections under one panel */}
        <div style={{ marginTop: '38px' }}>
          <h2 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '24px', color: '#0f2a1c', margin: '0 0 14px' }}>Elections</h2>
          <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* 2019 Presidential */}
            {facts && (facts.buhari_votes_2019 != null || facts.atiku_votes_2019 != null) && (() => {
              const b = facts.buhari_votes_2019 ?? 0
              const a = facts.atiku_votes_2019 ?? 0
              const m = Math.max(1, b, a)
              const row = (label: string, v: number, color: string) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                  <span style={{ width: '210px', flex: 'none', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '14px', color: '#0f2a1c' }}>{label}</span>
                  <div style={{ flex: 1, minWidth: '140px', height: '20px', borderRadius: '4px', background: '#eef2ee', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.round((v / m) * 100)}%`, background: color }} />
                  </div>
                  <span style={{ width: '100px', textAlign: 'right', flex: 'none', fontFamily: "'Archivo Black', sans-serif", fontSize: '14px', color: '#5c6b60' }}>{v.toLocaleString()}</span>
                </div>
              )
              return (
                <div>
                  <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '17px', color: '#0f2a1c', marginBottom: '6px' }}>2019 Presidential</div>
                  {row('Buhari / Osinbajo (APC)', b, colorOf('APC'))}
                  {row('Atiku / Obi (PDP)', a, colorOf('PDP'))}
                </div>
              )
            })()}

            {/* 2019 Governorship */}
            {governor.length > 0 && (() => {
              const gmax = Math.max(1, ...governor.map((g) => g.votes))
              return (
                <div style={{ borderTop: '1px solid #eef2ee', paddingTop: '22px' }}>
                  <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '17px', color: '#0f2a1c', marginBottom: '14px' }}>2019 Governorship</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {governor.map((g) => (
                      <div key={g.name + g.position} style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <span style={{ width: '22px', flex: 'none', fontFamily: "'Archivo Black', sans-serif", fontSize: '13px', color: g.position === 1 ? '#0f8a4a' : '#b3c2b8', textAlign: 'center' }}>{g.position}</span>
                        <span style={{ width: '180px', flex: 'none', fontFamily: "'Archivo Black', sans-serif", fontSize: '14px', color: '#0f2a1c' }}>{g.name}</span>
                        <span style={{ flex: 'none', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '11px', color: '#fff', background: colorOf(g.party), padding: '3px 10px', borderRadius: '20px', minWidth: '54px', textAlign: 'center' }}>{g.party}</span>
                        <div style={{ flex: 1, minWidth: '120px', height: '16px', borderRadius: '4px', background: '#eef2ee', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${Math.round((g.votes / gmax) * 100)}%`, background: colorOf(g.party) }} />
                        </div>
                        <span style={{ width: '92px', textAlign: 'right', flex: 'none', fontFamily: "'Archivo Black', sans-serif", fontSize: '13px', color: '#5c6b60' }}>{g.votes.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}

            {/* 2027 projection */}
            <div style={{ borderTop: '1px solid #eef2ee', paddingTop: '22px' }}>
              <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '17px', color: '#0f2a1c', marginBottom: '2px' }}>2027 projection</div>
              <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '13px', color: '#8aa093', margin: '0 0 14px' }}>Our crowd-sourced forecast{week ? ` · ${weekLabel(week)}` : ''}.</p>
              <div className="two-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {RACES.map((et) => {
                  const rows = byRace[et] ?? []
                  return (
                    <div key={et} style={{ background: '#f4f7f2', borderRadius: '10px', padding: '16px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '10px', marginBottom: '12px' }}>
                        <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '16px', color: '#0f2a1c' }}>{TYPE_LABEL[et]}</div>
                        {rows[0] && <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '12px', color: '#fff', background: colorOf(rows[0].party), padding: '3px 10px', borderRadius: '20px' }}>{rows[0].party}</div>}
                      </div>
                      {rows.length === 0 ? (
                        <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '13px', color: '#b3c2b8' }}>No data.</div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                          {rows.map((r) => (
                            <div key={r.party} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ width: '44px', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '10px', color: '#fff', background: colorOf(r.party), padding: '3px 0', borderRadius: '4px', textAlign: 'center', flex: 'none' }}>{r.party}</span>
                              <div style={{ flex: 1, height: '7px', borderRadius: '4px', background: '#e4ebe5', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${Math.min(100, Math.round(r.score))}%`, background: colorOf(r.party) }} />
                              </div>
                              <span style={{ width: '34px', textAlign: 'right', fontFamily: "'Archivo Black', sans-serif", fontSize: '11px', color: '#5c6b60', flex: 'none' }}>{Math.round(r.score)}%</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

          </div>
        </div>

        {/* Predictions on record for this state */}
        <div style={{ marginTop: '38px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '6px' }}>
            <h2 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '24px', color: '#0f2a1c', margin: 0 }}>Predictions</h2>
            <Link to="/predictions" style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '13px', color: '#0f8a4a', textDecoration: 'none' }}>+ Add your prediction</Link>
          </div>
          <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '15px', color: '#5c6b60', margin: '0 0 18px' }}>
            Every prediction on record for {state} — the verified past result and contributor calls.
          </p>
          {predictions.length === 0 ? (
            <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', padding: '36px', textAlign: 'center', fontFamily: "'Archivo', sans-serif", fontWeight: 700, color: '#8aa093' }}>No predictions yet for {state}.</div>
          ) : (
            <div className="two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {predictions.map((p) => {
                const pastPerf = p.source === 'past_performance'
                const entries = Object.entries(p.scores).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1])
                return (
                  <div key={p.id} style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', padding: '20px 22px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                      <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '11px', color: '#fff', background: pastPerf ? '#8a6d3b' : '#0f8a4a', padding: '3px 9px', borderRadius: '20px' }}>{pastPerf ? 'Past performance' : 'Expert'}</span>
                      <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '11px', color: '#5c6b60', background: '#f2f5f1', padding: '3px 9px', borderRadius: '20px' }}>{TYPE_LABEL[p.election_type] ?? p.election_type}</span>
                    </div>
                    <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '15px', color: '#0f2a1c', marginTop: '4px' }}>{p.label || p.author_name}</div>
                    <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '12px', color: '#8aa093' }}>{p.label ? p.author_name : (pastPerf ? p.year : `by ${p.author_name}`)} · leads {p.leading_party}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '10px' }}>
                      {entries.map(([party, v]) => (
                        <div key={party} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '46px', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '10px', color: '#fff', background: colorOf(party), padding: '2px 0', borderRadius: '4px', textAlign: 'center', flex: 'none' }}>{party}</span>
                          <div style={{ flex: 1, height: '6px', borderRadius: '4px', background: '#eef2ee', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${Math.min(100, Math.round(v))}%`, background: colorOf(party) }} />
                          </div>
                          <span style={{ width: '34px', textAlign: 'right', fontFamily: "'Archivo Black', sans-serif", fontSize: '11px', color: '#5c6b60', flex: 'none' }}>{Math.round(v)}%</span>
                        </div>
                      ))}
                    </div>
                    {p.notes && <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '13px', color: '#5c6b60', lineHeight: 1.5, margin: '12px 0 0' }}>{p.notes}</p>}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Political heavyweights (only shown when we have them) */}
        {politicians.length > 0 && (
          <div style={{ marginTop: '38px' }}>
            <h2 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '24px', color: '#0f2a1c', margin: '0 0 4px' }}>Politicians</h2>
            <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '15px', color: '#5c6b60', margin: '0 0 18px' }}>Political figures from {state}, including 2019 governorship candidates.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
              {politicians.map((pol) => (
                <div key={pol.name} style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '44px', height: '44px', flex: 'none', borderRadius: '50%', background: colorOf(pol.party), color: '#fff', fontFamily: "'Archivo Black', sans-serif", fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {pol.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '15px', color: '#0f2a1c', lineHeight: 1.15 }}>{pol.name}</div>
                    <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '12px', color: '#5c6b60' }}>{[pol.title, pol.party].filter(Boolean).join(' · ')}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '13px', color: '#8aa093', margin: '32px 0 0' }}>
          Illustrative projections aggregated from contributor traces. See our{' '}
          <Link to="/methodology" style={{ color: '#0f8a4a', fontWeight: 800 }}>methodology</Link>.
        </p>
      </div>

      <HomeFooter />
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { HomeNav } from './HomeNav'
import { HomeFooter } from './HomeFooter'
import { NigeriaMap } from './NigeriaMap'
import { NIGERIA_STATES } from '../nigeriaStates'
import { API_BASE } from '../config'

export const COLORS: Record<string, string> = { APC: '#1f6fd6', PDP: '#c0392b', LP: '#e05a1f', NNPP: '#f0b429', APGA: '#7b3fb5', SDP: '#0f8a4a', NDC: '#0e7490', ADC: '#db2777' }
export const colorOf = (party: string) => COLORS[party] ?? '#8aa093'
export const NO_DATA_FILL = '#9aa79f'
export const TYPE_LABEL: Record<string, string> = { presidential: 'Presidential', governor: 'Governor', senate: 'Senate' }
export const RACES = ['presidential', 'governor', 'senate'] as const
export const RACE_PATH = { presidential: '/2027/presidential', governor: '/2027/governor', senate: '/2027/senate' } as const

const ZONES: Record<string, string[]> = {
  'North-West': ['Sokoto', 'Zamfara', 'Kebbi', 'Katsina', 'Kano', 'Jigawa', 'Kaduna'],
  'North-East': ['Borno', 'Yobe', 'Bauchi', 'Gombe', 'Adamawa', 'Taraba'],
  'North-Central': ['Niger', 'Kwara', 'Kogi', 'Nasarawa', 'Plateau', 'Benue', 'FCT'],
  'South-West': ['Oyo', 'Osun', 'Ekiti', 'Ogun', 'Ondo', 'Lagos'],
  'South-East': ['Enugu', 'Anambra', 'Ebonyi', 'Imo', 'Abia'],
  'South-South': ['Edo', 'Delta', 'Bayelsa', 'Rivers', 'Akwa Ibom', 'Cross River'],
}

export type Row = { state: string; party: string; score: number }
export type Meta = { weeks: string[]; election_types: string[] }

export function weekLabel(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  return isNaN(d.getTime()) ? iso : `Week of ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
}

/** Detailed single-race view: map, scoreboard and per-state zone breakdown. */
export function Race2027({ race }: { race: string }) {
  const [meta, setMeta] = useState<Meta | null>(null)
  const [week, setWeek] = useState('')
  const [rows, setRows] = useState<Row[] | null>(null)

  useEffect(() => {
    fetch(`${API_BASE}/api/predictions/meta`)
      .then((r) => r.json())
      .then((m: Meta) => {
        setMeta(m)
        if (m.weeks?.length) setWeek(m.weeks[0])
      })
      .catch(() => setMeta({ weeks: [], election_types: [] }))
  }, [])

  useEffect(() => {
    if (!week) return
    setRows(null)
    fetch(`${API_BASE}/api/predictions?election_type=${encodeURIComponent(race)}&week=${encodeURIComponent(week)}`)
      .then((r) => r.json())
      .then((data: Row[]) => setRows(data))
      .catch(() => setRows([]))
  }, [race, week])

  const model = useMemo(() => {
    if (!rows) return null
    const byState: Record<string, Row[]> = {}
    rows.forEach((r) => (byState[r.state] ??= []).push(r))
    const leader: Record<string, { party: string; score: number }> = {}
    const stateFill: Record<string, string> = {}
    Object.entries(byState).forEach(([s, rs]) => {
      const top = rs.reduce((a, b) => (b.score > a.score ? b : a))
      leader[s] = { party: top.party, score: top.score }
      stateFill[s] = colorOf(top.party)
    })
    const counts: Record<string, number> = {}
    Object.values(leader).forEach((l) => (counts[l.party] = (counts[l.party] || 0) + 1))
    const total = Object.keys(leader).length
    const scoreboard = Object.keys(counts)
      .sort((a, b) => counts[b] - counts[a])
      .map((p) => ({ party: p, count: counts[p], color: colorOf(p), share: total ? Math.round((counts[p] / total) * 100) : 0 }))
    const noData = NIGERIA_STATES.filter((s) => !(s.name in leader)).map((s) => s.name)
    return { byState, leader, stateFill, scoreboard, total, noData }
  }, [rows])

  const raceWord = TYPE_LABEL[race]?.toLowerCase() ?? race

  return (
    <div style={{ minHeight: '100vh', background: '#0d8244', fontFamily: "'Archivo', sans-serif" }}>
      <HomeNav />

      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '34px 40px 0' }}>
        <Link to="/2027" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '13px', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#9fd9b8', textDecoration: 'none', marginBottom: '14px' }}>
          ← All races
        </Link>
        <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '40px', color: '#fff', margin: '0 0 8px', letterSpacing: '-0.01em' }}>
          {TYPE_LABEL[race] ?? race} · 2027 Prediction
        </h1>
        <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '16px', lineHeight: 1.5, color: '#c7e7d4', margin: '0 0 22px', maxWidth: '60ch' }}>
          Projected leading party in every state for the {raceWord} race. Step through measurement weeks to see how the
          picture is moving.
        </p>

        {/* controls */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {RACES.map((t) => (
              <Link
                key={t}
                to={RACE_PATH[t]}
                style={{
                  fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '13px', letterSpacing: '0.02em', padding: '9px 16px',
                  borderRadius: '30px', textDecoration: 'none',
                  border: t === race ? '2px solid #ffe14d' : '2px solid rgba(255,255,255,0.4)',
                  background: t === race ? '#ffe14d' : 'transparent', color: t === race ? '#0f4a2c' : '#eafaf0',
                }}
              >
                {TYPE_LABEL[t]}
              </Link>
            ))}
          </div>
          <select
            value={week}
            onChange={(e) => setWeek(e.target.value)}
            style={{ marginLeft: 'auto', fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '14px', color: '#0f2a1c', background: '#fff', border: '2px solid rgba(255,255,255,0.4)', borderRadius: '6px', padding: '10px 14px', cursor: 'pointer' }}
          >
            {(meta?.weeks ?? []).map((w) => (
              <option key={w} value={w}>{weekLabel(w)}</option>
            ))}
          </select>
        </div>

        {/* map */}
        <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '10px', padding: '14px' }}>
          {!model ? (
            <div style={{ padding: '80px', textAlign: 'center', fontFamily: "'Archivo Black', sans-serif", fontSize: '18px', color: '#eafaf0' }}>Loading projections…</div>
          ) : model.total === 0 ? (
            <div style={{ padding: '80px', textAlign: 'center', fontFamily: "'Archivo Black', sans-serif", fontSize: '18px', color: '#eafaf0' }}>No data for this selection.</div>
          ) : (
            <>
              <NigeriaMap values={model.stateFill} defaultFill={NO_DATA_FILL} stroke="rgba(255,255,255,0.55)" strokeWidth={0.8} style={{ maxWidth: '560px', margin: '0 auto' }} />
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '10px' }}>
                {model.scoreboard.map((s) => (
                  <div key={s.party} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <span style={{ width: '13px', height: '13px', borderRadius: '3px', background: s.color, display: 'inline-block' }} />
                    <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '13px', color: '#eafaf0' }}>{s.party} · {s.count}</span>
                  </div>
                ))}
                {model.noData.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <span style={{ width: '13px', height: '13px', borderRadius: '3px', background: NO_DATA_FILL, display: 'inline-block' }} />
                    <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '13px', color: '#eafaf0' }}>No data · {model.noData.length}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* scoreboard */}
      {model && model.total > 0 && (
        <div style={{ background: '#0f2a1c', marginTop: '30px' }}>
          <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '40px 40px 44px' }}>
            <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '12px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#ffe14d', marginBottom: '12px' }}>
              {TYPE_LABEL[race] ?? race} · projected states won · {weekLabel(week)}
            </div>
            <h2 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '30px', lineHeight: 1.08, color: '#fff', margin: '0 0 20px', letterSpacing: '-0.01em' }}>
              {model.scoreboard[0].party} projected to lead in {model.scoreboard[0].count} of {model.total} states
            </h2>
            <div style={{ display: 'flex', height: '22px', borderRadius: '6px', overflow: 'hidden', background: 'rgba(255,255,255,0.08)' }}>
              {model.scoreboard.map((s) => (
                <div key={s.party} style={{ width: `${s.share}%`, background: s.color }} title={`${s.party} ${s.count}`} />
              ))}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '22px', marginTop: '16px' }}>
              {model.scoreboard.map((s) => (
                <div key={s.party} style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: s.color, flex: 'none' }} />
                  <span style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '15px', color: '#fff' }}>{s.party}</span>
                  <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '13px', color: '#9fd9b8' }}>{s.count} {s.count === 1 ? 'state' : 'states'} · {s.share}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* zone breakdown */}
      <div style={{ background: '#f4f7f2' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '40px 40px 72px' }}>
          <h2 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '26px', color: '#0f2a1c', margin: '0 0 6px' }}>How each state goes</h2>
          <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '15px', color: '#5c6b60', margin: '0 0 26px' }}>
            Top three projected parties per state in the {raceWord} race, grouped by geopolitical zone.
          </p>

          {!model ? (
            <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, color: '#8aa093' }}>Loading…</div>
          ) : (
            <div className="two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {Object.entries(ZONES).map(([zone, states]) => (
                <div key={zone} style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '8px', padding: '22px 24px' }}>
                  <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '18px', color: '#0f2a1c', marginBottom: '14px' }}>{zone}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 22px' }}>
                    {states.map((st) => {
                      const rs = (model.byState[st] ?? []).slice().sort((a, b) => b.score - a.score).slice(0, 3)
                      return (
                        <div key={st}>
                          <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '13px', color: '#0f2a1c', marginBottom: '8px' }}>{st}</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {rs.length === 0 && (
                              <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '11px', color: '#b3c2b8' }}>No data</span>
                            )}
                            {rs.map((p) => (
                              <div key={p.party} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '10px', color: '#fff', background: colorOf(p.party), padding: '2px 0', borderRadius: '4px', width: '44px', textAlign: 'center', flex: 'none' }}>{p.party}</span>
                                <div style={{ flex: 1, height: '6px', borderRadius: '4px', background: '#eef2ee', overflow: 'hidden' }}>
                                  <div style={{ height: '100%', width: `${Math.round(p.score)}%`, background: colorOf(p.party) }} />
                                </div>
                                <span style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '11px', color: '#5c6b60', width: '32px', textAlign: 'right', flex: 'none' }}>{Math.round(p.score)}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '13px', color: '#8aa093', margin: '26px 0 34px' }}>
            Illustrative projections aggregated from contributor traces. See our{' '}
            <Link to="/methodology" style={{ color: '#0f8a4a', fontWeight: 800 }}>methodology</Link> for how these are produced.
          </p>

          <div style={{ textAlign: 'center' }}>
            <Link to="/contribute" style={{ display: 'inline-block', fontFamily: "'Archivo Black', sans-serif", fontSize: '18px', color: '#0f4a2c', background: '#ffe14d', textDecoration: 'none', padding: '16px 30px', borderRadius: '3px' }}>
              Contribute your knowledge →
            </Link>
          </div>
        </div>
      </div>

      <HomeFooter />
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { HomeNav } from '../components/HomeNav'
import { HomeFooter } from '../components/HomeFooter'
import { NIGERIA_STATES } from '../nigeriaStates'
import { stateSlug } from '../stateSlug'
import { API_BASE } from '../config'
import { colorOf, RACES, RACE_PATH, TYPE_LABEL, weekLabel, type Row } from '../components/Race2027'

export const Route = createFileRoute('/elections/2027/prediction/')({ component: Overview2027 })

type Summary = {
  topParty: string
  topCount: number
  total: number
  shares: { party: string; value: number }[]
}

function summarise(rows: Row[]): Summary {
  const byState: Record<string, Row[]> = {}
  rows.forEach((r) => (byState[r.state] ??= []).push(r))
  const counts: Record<string, number> = {}
  Object.values(byState).forEach((rs) => {
    const top = rs.reduce((a, b) => (b.score > a.score ? b : a))
    counts[top.party] = (counts[top.party] || 0) + 1
  })
  const total = Object.keys(byState).length
  const topParty = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0] ?? ''
  const sum: Record<string, number> = {}
  rows.forEach((r) => (sum[r.party] = (sum[r.party] || 0) + r.score))
  const n = total || 1
  const shares = Object.keys(sum)
    .map((p) => ({ party: p, value: Math.round(sum[p] / n) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)
  return { topParty, topCount: counts[topParty] || 0, total, shares }
}

function Overview2027() {
  const [weeks, setWeeks] = useState<string[]>([])
  const [week, setWeek] = useState('')
  const [metaLoaded, setMetaLoaded] = useState(false)
  const [data, setData] = useState<Record<string, Row[]> | null>(null)
  const noForecast = metaLoaded && weeks.length === 0

  useEffect(() => {
    fetch(`${API_BASE}/api/predictions/meta`)
      .then((r) => r.json())
      .then((m: { weeks: string[] }) => {
        setWeeks(m.weeks || [])
        if (m.weeks?.length) setWeek(m.weeks[0])
      })
      .catch(() => setWeeks([]))
      .finally(() => setMetaLoaded(true))
  }, [])

  useEffect(() => {
    if (!week) return
    setData(null)
    Promise.all(
      RACES.map((race) =>
        fetch(`${API_BASE}/api/predictions?election_type=${race}&week=${encodeURIComponent(week)}`)
          .then((r) => r.json())
          .then((d: Row[]) => [race, d] as const),
      ),
    )
      .then((entries) => setData(Object.fromEntries(entries)))
      .catch(() => setData({}))
  }, [week])

  const summaries = useMemo(() => {
    if (!data) return null
    return Object.fromEntries(RACES.map((r) => [r, summarise(data[r] ?? [])])) as Record<string, Summary>
  }, [data])

  return (
    <div style={{ minHeight: '100vh', background: '#0d8244', fontFamily: "'Archivo', sans-serif" }}>
      <HomeNav />

      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '34px 40px 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '24px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9fd9b8', marginBottom: '10px' }}>
              Aggregated from contributor traces · updated weekly
            </div>
            <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '40px', color: '#fff', margin: '0 0 8px', letterSpacing: '-0.01em' }}>2027 Election Prediction</h1>
            <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '16px', lineHeight: 1.5, color: '#c7e7d4', margin: 0, maxWidth: '62ch' }}>
              A national snapshot of the three races. Open a race to see the full state-by-state map and breakdown.
            </p>
          </div>

          <div style={{ flex: 'none', textAlign: 'right' }}>
            <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9fd9b8', marginBottom: '6px' }}>Measurement week</div>
            <select
              value={week}
              onChange={(e) => setWeek(e.target.value)}
              style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '14px', color: '#0f2a1c', background: '#fff', border: '2px solid rgba(255,255,255,0.4)', borderRadius: '6px', padding: '10px 14px', cursor: 'pointer' }}
            >
              {weeks.map((w) => (
                <option key={w} value={w}>{weekLabel(w)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '0 40px 8px' }}>
        <div className="two-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px' }}>
          {RACES.map((race) => {
            const s = summaries?.[race]
            return (
              <Link
                key={race}
                to={RACE_PATH[race]}
                className="race-card"
                style={{ display: 'block', textDecoration: 'none', background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 12px 30px rgba(0,0,0,0.14)' }}
              >
                <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '20px', color: '#0f2a1c', marginBottom: '4px' }}>{TYPE_LABEL[race]}</div>
                {noForecast ? (
                  <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '14px', color: '#8aa093', padding: '24px 0' }}>No forecast published yet.</div>
                ) : !s ? (
                  <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '14px', color: '#8aa093', padding: '24px 0' }}>Loading…</div>
                ) : s.total === 0 ? (
                  <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '14px', color: '#8aa093', padding: '24px 0' }}>No data yet.</div>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '14px 0 4px' }}>
                      <span style={{ minWidth: '54px', textAlign: 'center', fontFamily: "'Archivo Black', sans-serif", fontSize: '14px', color: '#fff', background: colorOf(s.topParty), padding: '6px 10px', borderRadius: '6px' }}>{s.topParty}</span>
                      <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '14px', color: '#33413a' }}>projected front-runner</span>
                    </div>
                    <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '13px', color: '#5c6b60', marginBottom: '16px' }}>
                      Leads in <strong style={{ color: '#0f2a1c' }}>{s.topCount}</strong> of {s.total} states
                    </div>
                    <div style={{ display: 'flex', height: '16px', borderRadius: '5px', overflow: 'hidden', background: '#eef2ee' }}>
                      {s.shares.map((b) => (
                        <div key={b.party} style={{ width: `${b.value}%`, background: colorOf(b.party) }} title={`${b.party} ${b.value}%`} />
                      ))}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '12px' }}>
                      {s.shares.map((b) => (
                        <div key={b.party} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: colorOf(b.party), flex: 'none' }} />
                          <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '12px', color: '#33413a' }}>{b.party} {b.value}%</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '13px', letterSpacing: '0.02em', color: '#0f8a4a', marginTop: '18px' }}>
                      View full map &amp; breakdown →
                    </div>
                  </>
                )}
              </Link>
            )
          })}
        </div>
      </div>

      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '20px 40px 40px' }}>
        <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '13px', color: '#9fd9b8', margin: 0 }}>
          Figures are national roll-ups. Open a race for the full state-by-state map, or jump to a state below.
        </p>
      </div>

      <div style={{ background: '#f4f7f2' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '34px 40px 56px' }}>
          <h2 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '22px', color: '#0f2a1c', margin: '0 0 16px' }}>Browse by state</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '8px' }}>
            {[...NIGERIA_STATES]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((s) => (
                <Link
                  key={s.name}
                  to="/states/$state"
                  params={{ state: stateSlug(s.name) }}
                  className="nav-underline"
                  style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '14px', color: '#0f2a1c', textDecoration: 'none', background: '#fff', border: '1px solid #dbe4dc', borderRadius: '8px', padding: '11px 14px' }}
                >
                  {s.name} →
                </Link>
              ))}
          </div>
        </div>
      </div>

      <HomeFooter />
    </div>
  )
}

import { useEffect, useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { HomeNav } from '../components/HomeNav'
import { HomeFooter } from '../components/HomeFooter'
import { API_BASE } from '../config'
import { stateSlug } from '../stateSlug'
import { lgaSlug, lgaIdFromSlug } from '../lgaSlug'
import { politicianSlug } from '../politicianSlug'

export const Route = createFileRoute('/lga/$id')({ component: LgaPage })

const COLORS: Record<string, string> = { APC: '#1f6fd6', PDP: '#c0392b', LP: '#e05a1f', NNPP: '#f0b429', APGA: '#7b3fb5', SDP: '#0f8a4a', NDC: '#0e7490', ADC: '#db2777' }
const colorOf = (p: string) => COLORS[p] ?? '#8aa093'
const PARTIES = ['APC', 'LP', 'PDP', 'NNPP']

type Ward = { ward: string; ward_code: string; pu_count: number; registered_voters: number | null; winner: string; runner_up: string }
type Stronghold = { id: number; name: string; party: string; photo: string; title: string; mentions: number; avg_electoral_value: number }
type Problem = { id: number; ward: string; polling_unit: string; anomaly_type: string; severity: string; description: string }
type Result = { leading_party: string; total_votes: number; scores: Record<string, number>; year: string }
type Detail = {
  id: number; name: string; state: string; geo_id: string
  result: Result | null; wards: Ward[]; ward_count: number; pu_count: number; registered_voters: number
  strongholds: Stronghold[]; problem_units: Problem[]
}

const th: React.CSSProperties = { textAlign: 'left', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '11px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#5c6b60', padding: '11px 14px', whiteSpace: 'nowrap' }
const td: React.CSSProperties = { fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '13px', color: '#0f2a1c', padding: '11px 14px' }

function PartyPill({ party }: { party: string }) {
  if (!party) return <span style={{ color: '#c3ccc6' }}>—</span>
  return <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '10px', color: '#fff', background: colorOf(party), padding: '2px 9px', borderRadius: '20px' }}>{party}</span>
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', padding: '16px 18px' }}>
      <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '22px', color: '#0f2a1c', lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '11px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#8aa093', marginTop: '3px' }}>{label}</div>
    </div>
  )
}

function LgaPage() {
  const { id: slug } = Route.useParams()
  const id = lgaIdFromSlug(slug)
  const navigate = useNavigate()
  const [d, setD] = useState<Detail | null | 'error'>(null)

  useEffect(() => {
    if (!id) return
    setD(null)
    fetch(`${API_BASE}/api/lga/${encodeURIComponent(id)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: Detail) => setD(data))
      .catch(() => setD('error'))
  }, [id])

  useEffect(() => {
    if (!d || d === 'error') return
    const canonical = lgaSlug(d.id, d.name)
    if (canonical !== slug) navigate({ to: '/lga/$id', params: { id: canonical }, replace: true })
  }, [d, slug, navigate])

  const fmt = (n: number | null | undefined) => (n == null ? '—' : n.toLocaleString())

  return (
    <div style={{ minHeight: '100vh', background: '#f4f7f2', fontFamily: "'Archivo', sans-serif" }}>
      <HomeNav />

      <div style={{ background: '#0d8244' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '30px 40px 26px' }}>
          {d && d !== 'error' && (
            <Link to="/states/$state/lgas" params={{ state: stateSlug(d.state) }} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '13px', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#9fd9b8', textDecoration: 'none', marginBottom: '12px' }}>
              ← Local governments of {d.state}
            </Link>
          )}
          <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '34px', color: '#fff', margin: '0 0 6px' }}>
            {d && d !== 'error' ? d.name : d === 'error' ? 'Local government not found' : 'Loading…'}
          </h1>
          {d && d !== 'error' && (
            <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '15px', color: '#c7e7d4', margin: 0 }}>
              {d.name} Local Government Area · <Link to="/states/$state" params={{ state: stateSlug(d.state) }} style={{ color: '#fff', fontWeight: 800 }}>{d.state} State</Link>
            </p>
          )}
        </div>
      </div>

      {d && d !== 'error' && (
        <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '26px 40px 72px', display: 'flex', flexDirection: 'column', gap: '26px' }}>
          {/* key numbers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
            <Stat value={fmt(d.ward_count)} label="Wards" />
            <Stat value={fmt(d.pu_count)} label="Polling units" />
            <Stat value={fmt(d.registered_voters)} label="Registered voters" />
            <Stat value={d.result ? fmt(d.result.total_votes) : '—'} label="Votes cast · 2023" />
          </div>

          {/* 2023 presidential result */}
          {d.result && (() => {
            const r = d.result
            const ranked = [...PARTIES].sort((a, b) => (r.scores[b] ?? 0) - (r.scores[a] ?? 0))
            const max = Math.max(1, ...PARTIES.map((p) => r.scores[p] ?? 0))
            return (
              <div>
                <h2 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '20px', color: '#0f2a1c', margin: '0 0 12px' }}>2023 Presidential result</h2>
                <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', padding: '20px 22px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '14px' }}>
                    <span style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '16px', color: '#fff', background: colorOf(r.leading_party), padding: '8px 16px', borderRadius: '8px' }}>{r.leading_party}</span>
                    <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '16px', color: '#0f2a1c' }}>won {d.name} in 2023
                      <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '13px', color: '#8aa093', display: 'block' }}>{r.total_votes.toLocaleString()} votes counted</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {ranked.map((p) => (
                      <div key={p} style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                        <span style={{ width: '52px', flex: 'none', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '11px', color: '#fff', background: colorOf(p), padding: '3px 0', borderRadius: '4px', textAlign: 'center' }}>{p}</span>
                        <div style={{ flex: 1, height: '12px', borderRadius: '4px', background: '#eef2ee', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${Math.round(((r.scores[p] ?? 0) / max) * 100)}%`, background: colorOf(p) }} />
                        </div>
                        <span style={{ width: '52px', textAlign: 'right', flex: 'none', fontFamily: "'Archivo Black', sans-serif", fontSize: '12px', color: '#5c6b60' }}>{(r.scores[p] ?? 0).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })()}

          {/* strongholds — politicians who count this LGA among their strengths */}
          {d.strongholds.length > 0 && (
            <div>
              <h2 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '20px', color: '#0f2a1c', margin: '0 0 4px' }}>Politicians strong here</h2>
              <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '13px', color: '#5c6b60', margin: '0 0 12px' }}>Politicians our contributors cite as influential in {d.name}.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
                {d.strongholds.map((s) => (
                  <Link key={s.id} to="/politician/$id" params={{ id: politicianSlug(s.id, s.name) }} style={{ display: 'flex', alignItems: 'center', gap: '11px', background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', padding: '12px 14px', textDecoration: 'none' }}>
                    {s.photo
                      ? <img src={s.photo} alt={s.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flex: 'none' }} />
                      : <div style={{ width: 40, height: 40, borderRadius: '50%', flex: 'none', background: colorOf(s.party), color: '#fff', fontFamily: "'Archivo Black', sans-serif", fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.name.split(/\s+/).map((w) => w[0]).slice(0, 2).join('')}</div>}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '13px', color: '#0f2a1c', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
                      <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '11px', color: '#8aa093' }}><PartyPill party={s.party} /> · rated {s.avg_electoral_value}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* wards */}
          {d.wards.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
                <h2 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '20px', color: '#0f2a1c', margin: 0 }}>Wards ({d.wards.length})</h2>
                <Link to="/wards/$state" params={{ state: stateSlug(d.state) }} style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '13px', color: '#0f8a4a', textDecoration: 'none' }}>All wards in {d.state} →</Link>
              </div>
              <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '520px' }}>
                  <thead>
                    <tr style={{ background: '#f4f7f2' }}>
                      <th style={th}>Ward</th>
                      <th style={{ ...th, textAlign: 'center' }}>2023 winner</th>
                      <th style={{ ...th, textAlign: 'right' }}>Polling units</th>
                      <th style={{ ...th, textAlign: 'right' }}>Registered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.wards.map((w) => (
                      <tr key={w.ward_code} style={{ borderTop: '1px solid #eef2ee' }}>
                        <td style={td}>
                          <Link to="/ward/$ward" params={{ ward: w.ward_code.replace(/\//g, '-') }} style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '13px', color: '#0f2a1c', textDecoration: 'none' }}>{w.ward}</Link>
                        </td>
                        <td style={{ ...td, textAlign: 'center' }}><PartyPill party={w.winner} /></td>
                        <td style={{ ...td, textAlign: 'right', fontFamily: "'Archivo Black', sans-serif" }}>{w.pu_count}</td>
                        <td style={{ ...td, textAlign: 'right', fontFamily: "'Archivo Black', sans-serif" }}>{fmt(w.registered_voters)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* problem units */}
          {d.problem_units.length > 0 && (
            <div>
              <h2 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '20px', color: '#0f2a1c', margin: '0 0 12px' }}>Flagged polling units ({d.problem_units.length})</h2>
              <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', display: 'flex', flexDirection: 'column' }}>
                {d.problem_units.map((p, i) => (
                  <div key={p.id} style={{ padding: '13px 16px', borderTop: i ? '1px solid #eef2ee' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '10px', color: '#fff', background: p.severity === 'High' ? '#c0392b' : '#b8860b', padding: '2px 8px', borderRadius: '20px' }}>{p.severity}</span>
                      <span style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '13px', color: '#0f2a1c' }}>{p.polling_unit || p.ward}</span>
                      <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '12px', color: '#8aa093' }}>{p.anomaly_type}</span>
                    </div>
                    {p.description && <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '12px', color: '#5c6b60', margin: '5px 0 0' }}>{p.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <HomeFooter />
    </div>
  )
}

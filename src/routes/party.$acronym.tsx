import { useEffect, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { HomeNav } from '../components/HomeNav'
import { HomeFooter } from '../components/HomeFooter'
import { API_BASE } from '../config'
import { stateSlug } from '../stateSlug'

export const Route = createFileRoute('/party/$acronym')({ component: PartyPage })

const COLORS: Record<string, string> = {
  APC: '#1f6fd6', PDP: '#c0392b', LP: '#e05a1f', NNPP: '#f0b429', APGA: '#7b3fb5',
  SDP: '#0f8a4a', NDC: '#0e7490', ADC: '#db2777', ANPP: '#0b8457', AD: '#8e44ad',
  ACN: '#16a085', CPC: '#2c3e50', AC: '#27ae60', APP: '#d35400', PPA: '#c0392b',
}
const colorOf = (acr: string) => COLORS[acr] ?? '#5c6b60'
const nf = (n: number) => n.toLocaleString()

type Summary = {
  acronym: string; name: string
  gov_wins: { year: number; state: string; name: string }[]
  gov_win_count: number; gov_states: string[]
  pres_state_wins: { year: number; states: string[] }[]
  pres_state_win_count: number
  pres_national_wins: { year: number; name: string }[]
  total_gov_votes: number; total_pres_votes: number
  years_active: number[]; first_year: number | null; last_year: number | null
}

const th: React.CSSProperties = { textAlign: 'left', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '11px', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#7a8a99', padding: '9px 14px', whiteSpace: 'nowrap' }
const td: React.CSSProperties = { fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '13px', color: '#33413a', padding: '10px 14px' }

function PartyPage() {
  const { acronym } = Route.useParams()
  const [s, setS] = useState<Summary | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    setS(null); setNotFound(false)
    fetch(`${API_BASE}/api/parties/${encodeURIComponent(acronym)}/summary`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setS)
      .catch(() => setNotFound(true))
  }, [acronym])

  const c = colorOf(acronym.toUpperCase())
  const years = s?.first_year ? (s.first_year === s.last_year ? `${s.first_year}` : `${s.first_year}–${s.last_year}`) : ''
  const hasNothing = s && s.gov_win_count === 0 && s.pres_national_wins.length === 0 && s.pres_state_win_count === 0

  return (
    <div style={{ minHeight: '100vh', background: '#f4f7f2', fontFamily: "'Archivo', sans-serif" }}>
      <HomeNav />

      <div style={{ background: c }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 40px 30px' }}>
          <Link to="/parties" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '13px', letterSpacing: '0.04em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)', textDecoration: 'none', marginBottom: '14px' }}>← All parties</Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <span style={{ flex: 'none', minWidth: '64px', height: '64px', padding: '0 12px', borderRadius: '12px', background: 'rgba(255,255,255,0.18)', border: '2px solid rgba(255,255,255,0.5)', color: '#fff', fontFamily: "'Archivo Black', sans-serif", fontSize: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{acronym.toUpperCase()}</span>
            <div>
              <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '30px', color: '#fff', margin: 0, lineHeight: 1.1 }}>{s ? s.name : notFound ? 'Party not found' : 'Loading…'}</h1>
              {years && <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '14px', color: 'rgba(255,255,255,0.85)', marginTop: '4px' }}>Active {years}</div>}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '26px 40px 72px' }}>
        {notFound ? (
          <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', padding: '44px', textAlign: 'center', fontFamily: "'Archivo', sans-serif", fontWeight: 700, color: '#8aa093' }}>No record for this party.</div>
        ) : !s ? (
          <div style={{ padding: '60px', textAlign: 'center', fontFamily: "'Archivo Black', sans-serif", color: '#8aa093' }}>Loading…</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* headline tiles */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
              <Tile n={s.pres_national_wins.length} label="Presidencies won" big />
              <Tile n={s.gov_win_count} label="Governorships won" big />
              <Tile n={s.pres_state_win_count} label="States carried (pres.)" />
              <Tile n={s.gov_states.length} label="States governed" />
            </div>

            {hasNothing && (
              <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', padding: '20px', fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '14px', color: '#5c6b60' }}>
                No governorship or presidential state-wins on record — this party has contested but not carried a state in the elections we hold.
              </div>
            )}

            {/* presidencies */}
            {s.pres_national_wins.length > 0 && (
              <Panel title="Presidential elections won">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {s.pres_national_wins.map((w) => (
                    <div key={w.year} style={{ border: `1px solid ${c}33`, background: `${c}0f`, borderRadius: '10px', padding: '12px 16px' }}>
                      <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '20px', color: c }}>{w.year}</div>
                      {w.name && <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '12px', color: '#5c6b60' }}>{w.name}</div>}
                    </div>
                  ))}
                </div>
              </Panel>
            )}

            {/* presidential states by year */}
            {s.pres_state_wins.length > 0 && (
              <Panel title="States carried in presidential elections">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {s.pres_state_wins.map((row) => (
                    <div key={row.year} style={{ display: 'flex', gap: '12px', alignItems: 'baseline', flexWrap: 'wrap' }}>
                      <span style={{ flex: 'none', width: '52px', fontFamily: "'Archivo Black', sans-serif", fontSize: '15px', color: '#0f2a1c' }}>{row.year}</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {row.states.map((st) => (
                          <Link key={st} to="/states/$state" params={{ state: stateSlug(st) }} style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '12px', color: '#0f4a2c', background: '#e7f3ec', padding: '3px 10px', borderRadius: '20px', textDecoration: 'none' }}>{st}</Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            )}

            {/* governorships */}
            {s.gov_wins.length > 0 && (
              <Panel title={`Governorships won (${s.gov_win_count})`}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '420px' }}>
                    <thead><tr style={{ background: '#f4f7f2' }}><th style={th}>Year</th><th style={th}>State</th><th style={th}>Governor elected</th></tr></thead>
                    <tbody>
                      {s.gov_wins.map((g, i) => (
                        <tr key={g.year + g.state + i} style={{ borderTop: '1px solid #eef2ee' }}>
                          <td style={{ ...td, fontFamily: "'Archivo Black', sans-serif", whiteSpace: 'nowrap' }}>{g.year}</td>
                          <td style={td}><Link to="/states/$state" params={{ state: stateSlug(g.state) }} style={{ color: '#0f8a4a', fontWeight: 800, textDecoration: 'none' }}>{g.state}</Link></td>
                          <td style={{ ...td, color: '#0f2a1c', fontWeight: 800 }}>{g.name || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
            )}

            <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '12px', color: '#8aa093' }}>
              Aggregated from official governorship and presidential results, 1999–2022. Vote totals across all recorded elections: {nf(s.total_gov_votes)} (governorship) · {nf(s.total_pres_votes)} (presidential).
            </div>
          </div>
        )}
      </div>

      <HomeFooter />
    </div>
  )
}

function Tile({ n, label, big }: { n: number; label: string; big?: boolean }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', padding: '16px 18px' }}>
      <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: big ? '30px' : '24px', color: n > 0 ? '#0f8a4a' : '#c3ccc6', lineHeight: 1 }}>{n}</div>
      <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '10px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#8aa093', marginTop: '6px' }}>{label}</div>
    </div>
  )
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', padding: '20px 22px' }}>
      <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '16px', color: '#0f2a1c', marginBottom: '14px' }}>{title}</div>
      {children}
    </div>
  )
}

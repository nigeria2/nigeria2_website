import { useEffect, useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { HomeNav } from '../components/HomeNav'
import { HomeFooter } from '../components/HomeFooter'
import { API_BASE } from '../config'
import { stateSlug } from '../stateSlug'
import { politicianSlug, politicianIdFromSlug } from '../politicianSlug'

export const Route = createFileRoute('/politician/$id')({
  component: PoliticianPage,
})

const COLORS: Record<string, string> = { APC: '#1f6fd6', PDP: '#c0392b', LP: '#e05a1f', NNPP: '#f0b429', APGA: '#7b3fb5', SDP: '#0f8a4a', NDC: '#0e7490', ADC: '#db2777' }
const colorOf = (p: string) => COLORS[p] ?? '#5c6b60'
const TYPE_LABEL: Record<string, string> = { presidential: 'Presidential', governor: 'Governorship', senate: 'Senate', reps: 'House of Reps', primary: 'Primary' }

type Assessment = { author_name: string; electoral_value: number; influential_lgas: string[]; reason: string; created_at: string | null }
type PH = { party: string; state: string; year: string; election_type: string; votes: number; percent: number | null; position: number; running_mate: string | null; constituency: string | null }
type TopLga = { lga: string; count: number }
type BestRun = { year: string; election_type: string; votes: number; percent: number | null; party: string }
type StateVote = { state: string; votes: number; total: number; won: boolean }
type PresStateVotes = { year: string; party: string; states: StateVote[] }
type Detail = {
  id: number; name: string; state: string; title: string; party: string; note: string; photo: string
  avg_electoral_value: number | null; assessments: number; top_lgas: TopLga[]; assessment_list: Assessment[]; party_history: PH[]
  max_votes: number | null; best_run: BestRun | null; runs_count: number; aka: string[]
  presidential_state_votes: PresStateVotes[]
}

const th: React.CSSProperties = { textAlign: 'left', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '11px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#5c6b60', padding: '11px 14px', whiteSpace: 'nowrap' }
const td: React.CSSProperties = { fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '13px', color: '#0f2a1c', padding: '11px 14px' }
const ord = (n: number) => (n === 1 ? '1st' : n === 2 ? '2nd' : n === 3 ? '3rd' : `${n}th`)

function PoliticianPage() {
  const { id: slug } = Route.useParams()
  const id = politicianIdFromSlug(slug)
  const navigate = useNavigate()
  const [d, setD] = useState<Detail | null | 'error'>(null)

  useEffect(() => {
    if (!id) return
    setD(null)
    fetch(`${API_BASE}/api/politicians/${encodeURIComponent(id)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: Detail) => setD(data))
      .catch(() => setD('error'))
  }, [id])

  // Canonicalise the URL to `<id>-<name-slug>` once we know the name (e.g. when
  // arriving at a bare /politician/302). Keeps shared links pretty and unique.
  useEffect(() => {
    if (!d || d === 'error') return
    const canonical = politicianSlug(d.id, d.name)
    if (canonical !== slug) {
      navigate({ to: '/politician/$id', params: { id: canonical }, replace: true })
    }
  }, [d, slug, navigate])

  return (
    <div style={{ minHeight: '100vh', background: '#f4f7f2', fontFamily: "'Archivo', sans-serif" }}>
      <HomeNav />

      <div style={{ background: '#0d8244' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '30px 40px 26px' }}>
          {d && d !== 'error' && (
            <Link to="/states/$state" params={{ state: stateSlug(d.state) }} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '13px', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#9fd9b8', textDecoration: 'none', marginBottom: '14px' }}>
              ← {d.state} State
            </Link>
          )}
          {d && d !== 'error' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
              {d.photo ? (
                <img src={d.photo} alt={d.name} style={{ width: 84, height: 84, borderRadius: '50%', objectFit: 'cover', flex: 'none', border: '3px solid rgba(255,255,255,0.4)' }} />
              ) : (
                <div style={{ width: 84, height: 84, borderRadius: '50%', flex: 'none', background: colorOf(d.party), color: '#fff', fontFamily: "'Archivo Black', sans-serif", fontSize: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{d.name.split(/\s+/).map((w) => w[0]).slice(0, 2).join('')}</div>
              )}
              <div>
                <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '34px', color: '#fff', margin: '0 0 4px' }}>{d.name}</h1>
                <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '15px', color: '#c7e7d4' }}>{[d.title, d.party, `${d.state} State`].filter(Boolean).join(' · ')}</div>
                {d.aka.length > 0 && (
                  <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '12px', color: '#9fd9b8', marginTop: '4px' }}>
                    Also known as: {d.aka.join(' · ')}
                  </div>
                )}
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '26px', flex: 'none' }}>
                {d.max_votes != null && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '30px', color: '#ffe14d' }}>{d.max_votes.toLocaleString()}</div>
                    <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '10px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#9fd9b8' }}>Votes can pull{d.best_run ? ` · ${d.best_run.year}` : ''}</div>
                  </div>
                )}
                {d.avg_electoral_value != null && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '30px', color: '#ffe14d' }}>{d.avg_electoral_value}</div>
                    <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '10px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#9fd9b8' }}>Electoral value{d.assessments ? ` · ${d.assessments}` : ''}</div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '30px', color: '#fff', margin: 0 }}>{d === 'error' ? 'Politician not found' : 'Loading…'}</h1>
          )}
        </div>
      </div>

      {d && d !== 'error' && (
        <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '26px 40px 72px', display: 'flex', flexDirection: 'column', gap: '26px' }}>
          {/* vote-pulling history — how many votes they could pull over time */}
          {(() => {
            const runs = d.party_history.filter((h) => h.votes && h.election_type !== 'primary')
            if (runs.length === 0) return null
            const chron = [...runs].sort((a, b) => Number(a.year) - Number(b.year))
            const peak = Math.max(...runs.map((h) => h.votes))
            return (
              <div>
                <h2 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '20px', color: '#0f2a1c', margin: '0 0 4px' }}>Votes pulled over time</h2>
                <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '13px', color: '#5c6b60', margin: '0 0 14px' }}>Each bar is one election — how many votes {d.name.split(/\s+/)[0]} drew.</p>
                <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {chron.map((h, i) => (
                    <div key={i}>
                      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '10px', marginBottom: '4px' }}>
                        <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '12px', color: '#0f2a1c' }}>{h.year} · {TYPE_LABEL[h.election_type] ?? h.election_type}{h.constituency ? ` · ${h.constituency}` : ''}<span style={{ color: '#8aa093', fontWeight: 700 }}> · {h.party}</span></span>
                        <span style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '13px', color: '#0f2a1c' }}>{h.votes.toLocaleString()}{h.percent != null ? <span style={{ color: '#8aa093', fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '11px' }}> · {h.percent}%</span> : null}{h.position === 1 ? <span style={{ color: '#0f8a4a', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '11px' }}> · Won</span> : null}</span>
                      </div>
                      <div style={{ height: '12px', borderRadius: '6px', background: '#eef2ee', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.max(3, Math.round((h.votes / peak) * 100))}%`, background: colorOf(h.party), borderRadius: '6px' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}

          {/* by-state vote breakdown — where this presidential candidate polled,
              strongest state first */}
          {(d.presidential_state_votes ?? []).map((psv) => {
            const peak = Math.max(1, ...psv.states.map((s) => s.votes))
            const first = d.name.split(/\s+/)[0]
            return (
              <div key={psv.year}>
                <h2 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '20px', color: '#0f2a1c', margin: '0 0 4px' }}>Where {first} polled votes · {psv.year}</h2>
                <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '13px', color: '#5c6b60', margin: '0 0 14px' }}>{first}'s {psv.party} presidential vote in every state, strongest first — tap a state for its full breakdown.</p>
                <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '520px' }}>
                    <thead>
                      <tr style={{ background: '#f4f7f2' }}>
                        <th style={{ ...th, width: '34px' }}>#</th>
                        <th style={th}>State</th>
                        <th style={{ ...th, textAlign: 'right' }}>Votes</th>
                        <th style={{ ...th, textAlign: 'right' }}>% of state</th>
                        <th style={th}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {psv.states.map((s, i) => (
                        <tr key={s.state} style={{ borderTop: '1px solid #eef2ee' }}>
                          <td style={{ ...td, fontFamily: "'Archivo Black', sans-serif", color: i === 0 ? '#0f8a4a' : '#b3c2b8' }}>{i + 1}</td>
                          <td style={td}>
                            <Link to="/states/$state" params={{ state: stateSlug(s.state) }} style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '13px', color: '#0f2a1c', textDecoration: 'none' }}>{s.state}</Link>
                          </td>
                          <td style={{ ...td, textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                              <div style={{ flex: '0 1 120px', height: '8px', borderRadius: '5px', background: '#eef2ee', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${Math.max(3, Math.round((s.votes / peak) * 100))}%`, background: colorOf(psv.party), borderRadius: '5px' }} />
                              </div>
                              <span style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '13px', color: '#0f2a1c', minWidth: '68px', textAlign: 'right' }}>{s.votes.toLocaleString()}</span>
                            </div>
                          </td>
                          <td style={{ ...td, textAlign: 'right', color: '#5c6b60' }}>{s.total ? `${((s.votes / s.total) * 100).toFixed(1)}%` : '—'}</td>
                          <td style={td}>{s.won && <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '10px', color: '#0f8a4a', background: '#e7f3ec', padding: '2px 8px', borderRadius: '20px' }}>Won state</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          })}

          {/* party history */}
          {d.party_history.length > 0 && (
            <div>
              <h2 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '20px', color: '#0f2a1c', margin: '0 0 12px' }}>Party history</h2>
              <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '480px' }}>
                  <thead>
                    <tr style={{ background: '#f4f7f2' }}>
                      <th style={th}>Year</th>
                      <th style={th}>Election</th>
                      <th style={th}>Party</th>
                      <th style={{ ...th, textAlign: 'right' }}>Votes</th>
                      <th style={{ ...th, textAlign: 'right' }}>Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.party_history.map((h, i) => (
                      <tr key={i} style={{ borderTop: '1px solid #eef2ee' }}>
                        <td style={{ ...td, fontWeight: 800 }}>{h.year}</td>
                        <td style={td}>{TYPE_LABEL[h.election_type] ?? h.election_type}{h.constituency ? <span style={{ color: '#8aa093' }}> · {h.constituency}</span> : null}</td>
                        <td style={td}><span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '11px', color: '#fff', background: colorOf(h.party), padding: '2px 10px', borderRadius: '20px' }}>{h.party}</span></td>
                        <td style={{ ...td, textAlign: 'right', fontFamily: "'Archivo Black', sans-serif" }}>{h.votes ? h.votes.toLocaleString() : '—'}</td>
                        <td style={{ ...td, textAlign: 'right', fontWeight: 800, color: h.position === 1 ? '#0f8a4a' : '#5c6b60' }}>{h.position ? (h.position === 1 ? 'Won' : ord(h.position)) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* strongholds */}
          {d.top_lgas.length > 0 && (
            <div>
              <h2 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '20px', color: '#0f2a1c', margin: '0 0 12px' }}>Most-cited strongholds</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {d.top_lgas.map((t) => (
                  <span key={t.lga} style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '12px', color: '#0f2a1c', background: '#fff', border: '1px solid #dbe4dc', padding: '6px 12px', borderRadius: '20px' }}>{t.lga} · {t.count}</span>
                ))}
              </div>
            </div>
          )}

          {/* assessments */}
          {d.assessment_list.length > 0 && (
            <div>
              <h2 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '20px', color: '#0f2a1c', margin: '0 0 12px' }}>Contributor assessments</h2>
              <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {d.assessment_list.map((a, i) => (
                  <div key={i} style={{ borderTop: i ? '1px solid #eef2ee' : 'none', paddingTop: i ? '12px' : 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '13px', color: '#0f8a4a' }}>{a.electoral_value}</span>
                      <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '13px', color: '#0f2a1c' }}>{a.author_name}</span>
                      {a.influential_lgas.map((l) => <span key={l} style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '11px', color: '#5c6b60', background: '#f2f5f1', padding: '2px 8px', borderRadius: '20px' }}>{l}</span>)}
                    </div>
                    {a.reason && <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '13px', color: '#5c6b60', margin: '5px 0 0', lineHeight: 1.5 }}>{a.reason}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <Link to="/politicians" style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '13px', color: '#0f8a4a', textDecoration: 'none' }}>Submit a photo or an assessment on the Politicians board →</Link>
        </div>
      )}

      <HomeFooter />
    </div>
  )
}

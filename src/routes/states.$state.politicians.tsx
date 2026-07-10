import { useMemo, useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { HomeNav } from '../components/HomeNav'
import { HomeFooter } from '../components/HomeFooter'
import { STATE_BY_SLUG, stateSlug, geoIdFromSlug, stateGeoId } from '../stateSlug'
import { API_BASE } from '../config'

const COLORS: Record<string, string> = { APC: '#1f6fd6', PDP: '#c0392b', LP: '#e05a1f', NNPP: '#f0b429', APGA: '#7b3fb5', SDP: '#0f8a4a', NDC: '#0e7490', ADC: '#db2777' }
const colorOf = (p: string) => COLORS[p] ?? '#8aa093'
const TYPE_LABEL: Record<string, string> = { presidential: 'Presidential', governor: 'Governor', senate: 'Senate', house: 'House of Reps' }

const rth: React.CSSProperties = { textAlign: 'left', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '10px', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#7a8a99', padding: '8px 12px', whiteSpace: 'nowrap' }
const rtd: React.CSSProperties = { fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '12px', color: '#33414f', padding: '9px 12px', verticalAlign: 'middle' }

function PartyPill({ party }: { party: string }) {
  if (!party) return <span style={{ color: '#c3ccc6' }}>—</span>
  return <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '10px', color: '#fff', background: colorOf(party), padding: '2px 9px', borderRadius: '20px' }}>{party}</span>
}

type BestRun = { year: string; election_type: string; votes: number; percent: number | null; party: string }
type Pol = { id: number; name: string; title: string; party: string; photo: string; max_votes: number | null; best_run: BestRun | null; runs_count: number; top_lgas: { lga: string; count: number }[] }
type LoaderData = { state: string; politicians: Pol[] }

export const Route = createFileRoute('/states/$state/politicians')({
  loader: async ({ params }): Promise<LoaderData> => {
    const state = STATE_BY_SLUG[params.state] ?? decodeURIComponent(params.state)
    const geoId = geoIdFromSlug(params.state) ?? stateGeoId(state) ?? ''
    let politicians: Pol[] = []
    try {
      const detail = await fetch(`${API_BASE}/api/states/${encodeURIComponent(geoId)}/politicians`).then((r) => r.json())
      politicians = detail.politicians ?? []
    } catch {
      /* leave empty */
    }
    return { state, politicians }
  },
  head: ({ params }) => {
    const s = STATE_BY_SLUG[params.state] ?? decodeURIComponent(params.state)
    return { meta: [{ title: `Every politician in ${s} | Nigeria 2.0` }] }
  },
  component: AllPoliticiansPage,
})

function AllPoliticiansPage() {
  const { state, politicians } = Route.useLoaderData()
  const navigate = useNavigate()
  const [q, setQ] = useState('')

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase()
    const rows = term ? politicians.filter((p) => p.name.toLowerCase().includes(term) || p.party.toLowerCase().includes(term)) : politicians
    return [...rows].sort((a, b) => (b.max_votes || 0) - (a.max_votes || 0))
  }, [politicians, q])

  return (
    <div style={{ minHeight: '100vh', background: '#f4f7f2', fontFamily: "'Archivo', sans-serif" }}>
      <HomeNav />

      <div style={{ background: '#0d8244' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '38px 40px 34px' }}>
          <Link to="/states/$state" params={{ state: stateSlug(state) }} style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '12px', color: '#c7e7d4', textDecoration: 'none' }}>
            ← Back to {state}
          </Link>
          <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '36px', color: '#fff', margin: '10px 0 8px', letterSpacing: '-0.01em' }}>Every Politician in {state}</h1>
          <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '15px', lineHeight: 1.5, color: '#c7e7d4', margin: '0 0 20px', maxWidth: '62ch' }}>
            The complete list, including minor candidates left off the state's headline heavyweight board.
          </p>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or party…"
            style={{ width: '100%', maxWidth: '420px', border: 'none', borderRadius: '6px', background: '#fff', padding: '13px 16px', fontFamily: "'Archivo', sans-serif", fontSize: '15px', color: '#0f2a1c' }}
          />
        </div>
      </div>

      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '34px 40px 72px' }}>
        <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '13px', color: '#8aa093', marginBottom: '18px' }}>
          {shown.length} {shown.length === 1 ? 'politician' : 'politicians'}
        </div>
        {shown.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', fontFamily: "'Archivo', sans-serif", fontWeight: 700, color: '#8aa093' }}>No politicians match “{q}”.</div>
        ) : (
          <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '620px' }}>
              <thead>
                <tr style={{ background: '#f4f7f2' }}>
                  <th style={{ ...rth, width: '28px' }}>#</th>
                  <th style={rth}>Politician</th>
                  <th style={{ ...rth, textAlign: 'center' }}>Party</th>
                  <th style={{ ...rth, textAlign: 'right' }}>Votes can pull</th>
                  <th style={rth}>Peak run</th>
                  <th style={rth}>Strongest LGAs</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((pol, i) => (
                  <tr key={pol.id} onClick={() => navigate({ to: '/politician/$id', params: { id: String(pol.id) } })} className="n2row" style={{ borderTop: '1px solid #eef2ee', cursor: 'pointer' }}>
                    <td style={{ ...rtd, fontFamily: "'Archivo Black', sans-serif", color: '#b3c2b8' }}>{i + 1}</td>
                    <td style={rtd}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {pol.photo ? (
                          <img src={pol.photo} alt={pol.name} style={{ width: '34px', height: '34px', flex: 'none', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '34px', height: '34px', flex: 'none', borderRadius: '50%', background: colorOf(pol.party), color: '#fff', fontFamily: "'Archivo Black', sans-serif", fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{pol.name.split(/\s+/).map((w) => w[0]).slice(0, 2).join('')}</div>
                        )}
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '13px', color: '#0f2a1c' }}>{pol.name}</div>
                          {pol.title && <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '11px', color: '#8aa093' }}>{pol.title}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ ...rtd, textAlign: 'center' }}><PartyPill party={pol.party} /></td>
                    <td style={{ ...rtd, textAlign: 'right' }}>
                      {pol.max_votes != null
                        ? <span style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '14px', color: '#0f8a4a' }}>{pol.max_votes.toLocaleString()}</span>
                        : <span style={{ color: '#b3c2b8' }}>—</span>}
                    </td>
                    <td style={{ ...rtd, color: '#8aa093', fontWeight: 700 }}>
                      {pol.best_run
                        ? <>{pol.best_run.year} {TYPE_LABEL[pol.best_run.election_type] ?? pol.best_run.election_type}{pol.best_run.percent != null ? ` · ${pol.best_run.percent}%` : ''}{pol.runs_count > 1 ? ` · ${pol.runs_count} runs` : ''}</>
                        : '—'}
                    </td>
                    <td style={rtd}>
                      {pol.top_lgas.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {pol.top_lgas.slice(0, 3).map((l) => (
                            <span key={l.lga} style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '10px', color: '#0f4a2c', background: '#e7f3ec', padding: '2px 8px', borderRadius: '20px' }}>{l.lga}</span>
                          ))}
                        </div>
                      ) : <span style={{ color: '#b3c2b8' }}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <HomeFooter />
    </div>
  )
}

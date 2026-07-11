import { createFileRoute, Link } from '@tanstack/react-router'
import { HomeNav } from '../components/HomeNav'
import { HomeFooter } from '../components/HomeFooter'
import { API_BASE } from '../config'
import { stateSlug } from '../stateSlug'

const COLORS: Record<string, string> = { APC: '#1f6fd6', PDP: '#c0392b', LP: '#e05a1f', NNPP: '#f0b429', APGA: '#7b3fb5', SDP: '#0f8a4a', NDC: '#0e7490', ADC: '#db2777' }
const colorOf = (p: string) => COLORS[p] ?? '#8aa093'

type Cand = { politician_id: number | null; politician_name: string | null; photo: string; party: string; votes: number }
type StateRow = { geo_id: string; state: string; candidates: Cand[]; leading_party: string; total_votes: number; baseline_votes: number; unknown_votes: number; lga_count: number }
type LoaderData = { states: StateRow[] }

export const Route = createFileRoute('/2027/presidential/states/')({
  loader: async (): Promise<LoaderData> => {
    try {
      const d = await fetch(`${API_BASE}/api/lga-predictions/states?election_type=presidential&year=2027`).then((r) => r.json())
      return { states: d.states ?? [] }
    } catch {
      return { states: [] }
    }
  },
  head: () => ({ meta: [{ title: '2027 Presidential prediction by state | Nigeria 2.0' }] }),
  component: StatesList,
})

function StatesList() {
  const { states } = Route.useLoaderData()

  return (
    <div style={{ minHeight: '100vh', background: '#0d8244', fontFamily: "'Archivo', sans-serif" }}>
      <HomeNav />

      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '26px 40px 0' }}>
        <Link to="/2027/presidential" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '13px', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#9fd9b8', textDecoration: 'none' }}>
          ← Presidential map
        </Link>
        <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '38px', color: '#fff', margin: '12px 0 8px', letterSpacing: '-0.01em' }}>2027 Presidential · Prediction by state</h1>
        <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '16px', lineHeight: 1.5, color: '#c7e7d4', margin: '0 0 24px', maxWidth: '60ch' }}>
          States with a projected presidential vote so far. Open a state to see the local-government breakdown.
        </p>
      </div>

      <div style={{ background: '#f4f7f2' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '30px 40px 64px' }}>
          {states.length === 0 ? (
            <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
              <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '17px', color: '#0f2a1c', marginBottom: '4px' }}>No predictions yet</div>
              <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '14px', color: '#8aa093' }}>Projected votes will appear here as they are added.</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
              {states.map((s) => (
                <Link key={s.geo_id} to="/2027/presidential/states/$state" params={{ state: stateSlug(s.state) }} style={{ background: '#fff', border: '1px solid #dbe4dc', borderLeft: `5px solid ${colorOf(s.leading_party)}`, borderRadius: '12px', padding: '18px 20px', textDecoration: 'none', display: 'block' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '10px' }}>
                    <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '20px', color: '#0f2a1c' }}>{s.state}</div>
                    <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '11px', color: '#fff', background: colorOf(s.leading_party), padding: '3px 10px', borderRadius: '20px' }}>{s.leading_party}</span>
                  </div>

                  {/* stacked bar: each candidate's predicted share + unknown remainder */}
                  {s.baseline_votes > 0 && (
                    <div style={{ display: 'flex', height: '8px', borderRadius: '5px', overflow: 'hidden', background: '#eef2ee', marginTop: '12px' }}>
                      {s.candidates.map((c) => (
                        <div key={c.politician_id ?? c.party} style={{ width: `${(c.votes / s.baseline_votes) * 100}%`, background: colorOf(c.party) }} title={`${c.politician_name ?? c.party}: ${c.votes.toLocaleString()}`} />
                      ))}
                    </div>
                  )}

                  {/* per-candidate predicted votes, then the unknown remainder */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginTop: '12px' }}>
                    {s.candidates.map((c) => (
                      <div key={c.politician_id ?? c.party} style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                        <span style={{ width: '46px', flex: 'none', textAlign: 'center', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '10px', color: '#fff', background: colorOf(c.party), padding: '3px 0', borderRadius: '4px' }}>{c.party}</span>
                        <span style={{ flex: 1, minWidth: 0, fontFamily: "'Archivo Black', sans-serif", fontSize: '13px', color: '#0f2a1c', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.politician_name ?? c.party}</span>
                        <span style={{ flex: 'none', fontFamily: "'Archivo Black', sans-serif", fontSize: '14px', color: '#0f2a1c' }}>{c.votes.toLocaleString()}</span>
                      </div>
                    ))}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '9px', borderTop: '1px solid #eef2ee', paddingTop: '7px' }}>
                      <span style={{ width: '46px', flex: 'none', textAlign: 'center', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '10px', color: '#5c6b60', background: '#eef2ee', padding: '3px 0', borderRadius: '4px' }}>?</span>
                      <span style={{ flex: 1, fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '13px', color: '#8aa093' }}>Unknown</span>
                      <span style={{ flex: 'none', fontFamily: "'Archivo Black', sans-serif", fontSize: '14px', color: '#8aa093' }}>{s.unknown_votes.toLocaleString()}</span>
                    </div>
                  </div>

                  <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '12px', color: '#0f8a4a', marginTop: '12px' }}>
                    {s.lga_count} local government{s.lga_count === 1 ? '' : 's'} predicted · view breakdown →
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <HomeFooter />
    </div>
  )
}

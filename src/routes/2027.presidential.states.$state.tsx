import { createFileRoute, Link } from '@tanstack/react-router'
import { HomeNav } from '../components/HomeNav'
import { HomeFooter } from '../components/HomeFooter'
import { API_BASE } from '../config'
import { STATE_BY_SLUG, geoIdFromSlug, stateGeoId } from '../stateSlug'
import { lgaSlug } from '../lgaSlug'
import { politicianSlug } from '../politicianSlug'

const COLORS: Record<string, string> = { APC: '#1f6fd6', PDP: '#c0392b', LP: '#e05a1f', NNPP: '#f0b429', APGA: '#7b3fb5', SDP: '#0f8a4a', NDC: '#0e7490', ADC: '#db2777' }
const colorOf = (p: string) => COLORS[p] ?? '#8aa093'

type Pred = { politician_id: number | null; politician_name: string | null; party: string; label: string; votes: number }
type Row = { lga_id: number; lga_name: string; total_votes: number; predictions: Pred[] }
type LoaderData = { state: string; lgas: Row[] }

export const Route = createFileRoute('/2027/presidential/states/$state')({
  loader: async ({ params }): Promise<LoaderData> => {
    const state = STATE_BY_SLUG[params.state] ?? decodeURIComponent(params.state)
    const geoId = geoIdFromSlug(params.state) ?? stateGeoId(state) ?? ''
    try {
      const d = await fetch(`${API_BASE}/api/lga-predictions/states/${encodeURIComponent(geoId)}?election_type=presidential&year=2027`).then((r) => r.json())
      return { state: d.state ?? state, lgas: d.lgas ?? [] }
    } catch {
      return { state, lgas: [] }
    }
  },
  head: ({ params }) => {
    const s = STATE_BY_SLUG[params.state] ?? decodeURIComponent(params.state)
    return { meta: [{ title: `2027 Presidential prediction · ${s} | Nigeria 2.0` }] }
  },
  component: StatePredictionPage,
})

function StatePredictionPage() {
  const { state, lgas } = Route.useLoaderData()
  const total = lgas.reduce((s, l) => s + l.total_votes, 0)

  return (
    <div style={{ minHeight: '100vh', background: '#0d8244', fontFamily: "'Archivo', sans-serif" }}>
      <HomeNav />

      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '26px 40px 0' }}>
        <Link to="/2027/presidential/states" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '13px', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#9fd9b8', textDecoration: 'none' }}>
          ← All states
        </Link>
        <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '38px', color: '#fff', margin: '12px 0 8px', letterSpacing: '-0.01em' }}>{state} · 2027 Presidential prediction</h1>
        <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '16px', color: '#c7e7d4', margin: '0 0 24px' }}>
          Projected votes by local government{total ? ` · ${total.toLocaleString()} total` : ''}.
        </p>
      </div>

      <div style={{ background: '#f4f7f2' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '30px 40px 64px' }}>
          {lgas.length === 0 ? (
            <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '12px', padding: '40px', textAlign: 'center', fontFamily: "'Archivo', sans-serif", fontWeight: 700, color: '#8aa093' }}>No predictions for this state yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {lgas.map((l) => (
                <div key={l.lga_id} style={{ background: '#fff', border: '1px solid #dbe4dc', borderLeft: `5px solid ${colorOf(l.predictions[0]?.party ?? '')}`, borderRadius: '12px', padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                    <Link to="/2027/presidential/lga/$lga" params={{ lga: lgaSlug(l.lga_id, l.lga_name) }} style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '18px', color: '#0f2a1c', textDecoration: 'none' }}>{l.lga_name} →</Link>
                    <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '12px', color: '#8aa093' }}>{l.predictions.length} prediction{l.predictions.length === 1 ? '' : 's'}</span>
                  </div>
                  <div style={{ marginTop: '8px', borderTop: '1px solid #eef2ee' }}>
                    {l.predictions.map((p, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '7px 0' }}>
                        <span style={{ width: '46px', flex: 'none', textAlign: 'center', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '10px', color: '#fff', background: colorOf(p.party), padding: '3px 0', borderRadius: '4px' }}>{p.party}</span>
                        <span style={{ flex: 1, minWidth: 0 }}>
                          {p.politician_id && p.politician_name
                            ? <Link to="/politician/$id" params={{ id: politicianSlug(p.politician_id, p.politician_name) }} style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '13px', color: '#0f2a1c', textDecoration: 'none' }}>{p.politician_name}</Link>
                            : <span style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '13px', color: '#0f2a1c' }}>{p.politician_name ?? p.party}</span>}
                          {p.label && <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '11px', color: '#8aa093' }}> · {p.label}</span>}
                        </span>
                        <span style={{ flex: 'none', fontFamily: "'Archivo Black', sans-serif", fontSize: '15px', color: '#0f2a1c' }}>{p.votes.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <HomeFooter />
    </div>
  )
}

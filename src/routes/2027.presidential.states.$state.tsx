import { createFileRoute, Link } from '@tanstack/react-router'
import { HomeNav } from '../components/HomeNav'
import { HomeFooter } from '../components/HomeFooter'
import { API_BASE } from '../config'
import { STATE_BY_SLUG, geoIdFromSlug, stateGeoId } from '../stateSlug'
import { lgaSlug } from '../lgaSlug'
import { politicianSlug } from '../politicianSlug'

const COLORS: Record<string, string> = { APC: '#1f6fd6', PDP: '#c0392b', LP: '#e05a1f', NNPP: '#f0b429', APGA: '#7b3fb5', SDP: '#0f8a4a', NDC: '#0e7490', ADC: '#db2777' }
const colorOf = (p: string) => COLORS[p] ?? '#8aa093'

type Row = { lga_id: number; lga_name: string; party: string; votes: number; politician_id: number | null; politician_name: string | null; politician_photo: string }
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
  const total = lgas.reduce((s, l) => s + l.votes, 0)

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
                <div key={l.lga_id} style={{ background: '#fff', border: '1px solid #dbe4dc', borderLeft: `5px solid ${colorOf(l.party)}`, borderRadius: '12px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  {l.politician_photo
                    ? <img src={l.politician_photo} alt={l.politician_name ?? ''} style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', flex: 'none' }} />
                    : <div style={{ width: 52, height: 52, borderRadius: '50%', flex: 'none', background: colorOf(l.party), color: '#fff', fontFamily: "'Archivo Black', sans-serif", fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{(l.politician_name ?? l.party).split(/\s+/).map((w) => w[0]).slice(0, 2).join('')}</div>}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <Link to="/2027/presidential/lga/$lga" params={{ lga: lgaSlug(l.lga_id, l.lga_name) }} style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '18px', color: '#0f2a1c', textDecoration: 'none' }}>{l.lga_name}</Link>
                    <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '13px', color: '#5c6b60', marginTop: '2px' }}>
                      {l.politician_id && l.politician_name
                        ? <Link to="/politician/$id" params={{ id: politicianSlug(l.politician_id, l.politician_name) }} style={{ color: '#0f2a1c', textDecoration: 'none' }}>{l.politician_name}</Link>
                        : l.politician_name}
                      <span style={{ fontWeight: 800, fontSize: '10px', color: '#fff', background: colorOf(l.party), padding: '2px 8px', borderRadius: '20px', marginLeft: '8px' }}>{l.party}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flex: 'none' }}>
                    <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '26px', color: '#0f2a1c' }}>{l.votes.toLocaleString()}</div>
                    <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '10px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#8aa093' }}>projected votes</div>
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

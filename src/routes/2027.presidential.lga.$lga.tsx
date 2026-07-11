import { createFileRoute, Link } from '@tanstack/react-router'
import { HomeNav } from '../components/HomeNav'
import { HomeFooter } from '../components/HomeFooter'
import { API_BASE } from '../config'
import { stateSlug } from '../stateSlug'
import { lgaSlug, lgaIdFromSlug } from '../lgaSlug'
import { politicianSlug } from '../politicianSlug'

const COLORS: Record<string, string> = { APC: '#1f6fd6', PDP: '#c0392b', LP: '#e05a1f', NNPP: '#f0b429', APGA: '#7b3fb5', SDP: '#0f8a4a', NDC: '#0e7490', ADC: '#db2777' }
const colorOf = (p: string) => COLORS[p] ?? '#8aa093'

type Cand = { politician_id: number | null; politician_name: string | null; photo: string; party: string; votes: number }
type Detail = { lga_id: number; lga_name: string; state: string; state_geo: string; candidates: Cand[]; total_votes: number; baseline_votes: number; unknown_votes: number }

export const Route = createFileRoute('/2027/presidential/lga/$lga')({
  loader: async ({ params }): Promise<Detail | null> => {
    const id = lgaIdFromSlug(params.lga)
    try {
      return await fetch(`${API_BASE}/api/lga-predictions/lga/${encodeURIComponent(id)}?election_type=presidential&year=2027`).then((r) => (r.ok ? r.json() : null))
    } catch {
      return null
    }
  },
  head: ({ loaderData }) => ({ meta: [{ title: `${loaderData?.lga_name ?? 'LGA'} — 2027 Presidential prediction | Nigeria 2.0` }] }),
  component: LgaPredictionPage,
})

function Row({ label, party, votes, pct, photo, to }: { label: string; party: string; votes: number; pct: number; photo?: string; to?: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderLeft: `5px solid ${party ? colorOf(party) : '#cdd8cf'}`, borderRadius: '12px', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '15px' }}>
      {photo !== undefined && (
        photo
          ? <img src={photo} alt={label} style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', flex: 'none' }} />
          : <div style={{ width: 52, height: 52, borderRadius: '50%', flex: 'none', background: party ? colorOf(party) : '#cdd8cf', color: '#fff', fontFamily: "'Archivo Black', sans-serif", fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{label.split(/\s+/).map((w) => w[0]).slice(0, 2).join('')}</div>
      )}
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '17px', color: '#0f2a1c' }}>{to ?? label}</div>
        {party && <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '10px', color: '#fff', background: colorOf(party), padding: '2px 9px', borderRadius: '20px', display: 'inline-block', marginTop: '4px' }}>{party}</span>}
      </div>
      <div style={{ textAlign: 'right', flex: 'none' }}>
        <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '26px', color: '#0f2a1c' }}>{votes.toLocaleString()}</div>
        <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '10px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#8aa093' }}>projected votes{pct ? ` · ${pct.toFixed(0)}%` : ''}</div>
      </div>
    </div>
  )
}

function LgaPredictionPage() {
  const d = Route.useLoaderData()

  return (
    <div style={{ minHeight: '100vh', background: '#0d8244', fontFamily: "'Archivo', sans-serif" }}>
      <HomeNav />

      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '26px 40px 0' }}>
        {d && (
          <Link to="/2027/presidential/states/$state" params={{ state: stateSlug(d.state) }} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '13px', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#9fd9b8', textDecoration: 'none' }}>
            ← {d.state} prediction
          </Link>
        )}
        <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '38px', color: '#fff', margin: '12px 0 8px', letterSpacing: '-0.01em' }}>
          {d ? `${d.lga_name} · 2027 Presidential prediction` : 'Prediction not found'}
        </h1>
        {d && (
          <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '16px', color: '#c7e7d4', margin: '0 0 24px' }}>
            Projected votes in {d.lga_name}, {d.state}{d.baseline_votes ? ` · measured against ${d.baseline_votes.toLocaleString()} cast here in 2023` : ''}.
          </p>
        )}
      </div>

      <div style={{ background: '#f4f7f2' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '30px 40px 64px' }}>
          {!d ? (
            <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '12px', padding: '40px', textAlign: 'center', fontFamily: "'Archivo', sans-serif", fontWeight: 700, color: '#8aa093' }}>No prediction for this local government yet.</div>
          ) : (
            <>
              {/* stacked bar: predicted candidates + unknown */}
              {d.baseline_votes > 0 && (
                <div style={{ display: 'flex', height: '12px', borderRadius: '6px', overflow: 'hidden', background: '#e4e9e4', marginBottom: '18px' }}>
                  {d.candidates.map((c) => (
                    <div key={c.politician_id ?? c.party} style={{ width: `${(c.votes / d.baseline_votes) * 100}%`, background: colorOf(c.party) }} />
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {d.candidates.length === 0 && (
                  <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '12px', padding: '30px', textAlign: 'center', fontFamily: "'Archivo', sans-serif", fontWeight: 700, color: '#8aa093' }}>No candidate prediction yet for this LGA.</div>
                )}
                {d.candidates.map((c) => (
                  <Row
                    key={c.politician_id ?? c.party}
                    label={c.politician_name ?? c.party}
                    party={c.party}
                    votes={c.votes}
                    pct={d.baseline_votes ? (c.votes / d.baseline_votes) * 100 : 0}
                    photo={c.photo}
                    to={c.politician_id && c.politician_name
                      ? <Link to="/politician/$id" params={{ id: politicianSlug(c.politician_id, c.politician_name) }} style={{ color: 'inherit', textDecoration: 'none' }}>{c.politician_name}</Link>
                      : undefined}
                  />
                ))}
                {/* unknown remainder */}
                <div style={{ background: '#fff', border: '1px dashed #cdd8cf', borderRadius: '12px', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', flex: 'none', background: '#eef2ee', color: '#8aa093', fontFamily: "'Archivo Black', sans-serif", fontSize: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>?</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '17px', color: '#5c6b60' }}>Unknown</div>
                    <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '12px', color: '#8aa093' }}>Votes here not yet predicted</div>
                  </div>
                  <div style={{ textAlign: 'right', flex: 'none' }}>
                    <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '26px', color: '#8aa093' }}>{d.unknown_votes.toLocaleString()}</div>
                    <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '10px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#b3c2b8' }}>unknown votes</div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '22px' }}>
                <Link to="/lga/$id" params={{ id: lgaSlug(d.lga_id, d.lga_name) }} style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '14px', color: '#0f8a4a', textDecoration: 'none' }}>
                  See the full {d.lga_name} profile (history, wards, polling units) →
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      <HomeFooter />
    </div>
  )
}

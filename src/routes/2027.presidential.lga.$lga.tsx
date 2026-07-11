import { createFileRoute, Link } from '@tanstack/react-router'
import { HomeNav } from '../components/HomeNav'
import { HomeFooter } from '../components/HomeFooter'
import { API_BASE } from '../config'
import { stateSlug } from '../stateSlug'
import { lgaSlug, lgaIdFromSlug } from '../lgaSlug'
import { politicianSlug } from '../politicianSlug'

const COLORS: Record<string, string> = { APC: '#1f6fd6', PDP: '#c0392b', LP: '#e05a1f', NNPP: '#f0b429', APGA: '#7b3fb5', SDP: '#0f8a4a', NDC: '#0e7490', ADC: '#db2777' }
const colorOf = (p: string) => COLORS[p] ?? '#8aa093'

type Pred = { politician_id: number | null; politician_name: string | null; party: string; label: string; votes: number }
type Ward = { ward: string; ward_code: string; registered_voters: number | null; total_votes: number; winner: string; winner_votes: number; predictions: Pred[] }
type Detail = { lga_id: number; lga_name: string; state: string; state_geo: string; predictions: Pred[]; total_votes: number; baseline_votes: number; unknown_votes: number; wards: Ward[] }

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

/** One prediction line: candidate (party) · label · votes. */
function PredLine({ p }: { p: Pred }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '7px 0' }}>
      <span style={{ width: '46px', flex: 'none', textAlign: 'center', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '10px', color: '#fff', background: colorOf(p.party), padding: '3px 0', borderRadius: '4px' }}>{p.party}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '13px', color: '#0f2a1c', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {p.politician_id && p.politician_name
            ? <Link to="/politician/$id" params={{ id: politicianSlug(p.politician_id, p.politician_name) }} style={{ color: 'inherit', textDecoration: 'none' }}>{p.politician_name}</Link>
            : (p.politician_name ?? p.party)}
        </div>
        {p.label && <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '11px', color: '#8aa093' }}>{p.label}</div>}
      </div>
      <span style={{ flex: 'none', fontFamily: "'Archivo Black', sans-serif", fontSize: '15px', color: '#0f2a1c' }}>{p.votes.toLocaleString()}</span>
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
            We project each ward, then add them up. A candidate can have several predictions — each scenario is listed{d.baseline_votes ? ` · ${d.baseline_votes.toLocaleString()} votes were cast here in 2023` : ''}.
          </p>
        )}
      </div>

      <div style={{ background: '#f4f7f2' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '30px 40px 64px' }}>
          {!d ? (
            <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '12px', padding: '40px', textAlign: 'center', fontFamily: "'Archivo', sans-serif", fontWeight: 700, color: '#8aa093' }}>No prediction for this local government yet.</div>
          ) : (
            <>
              {/* LGA-level aggregate: each prediction summed across wards, then unknown */}
              <h2 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '20px', color: '#0f2a1c', margin: '0 0 4px' }}>{d.lga_name} total</h2>
              <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '13px', color: '#5c6b60', margin: '0 0 12px' }}>Every ward’s prediction added up.</p>
              <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '12px', padding: '10px 18px', marginBottom: '30px' }}>
                {d.predictions.map((p, i) => <div key={i} style={{ borderTop: i ? '1px solid #eef2ee' : 'none' }}><PredLine p={p} /></div>)}
                <div style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '7px 0', borderTop: '1px dashed #cdd8cf' }}>
                  <span style={{ width: '46px', flex: 'none', textAlign: 'center', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '12px', color: '#8aa093', background: '#eef2ee', padding: '3px 0', borderRadius: '4px' }}>?</span>
                  <span style={{ flex: 1, fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '13px', color: '#8aa093' }}>Unknown (not yet predicted)</span>
                  <span style={{ flex: 'none', fontFamily: "'Archivo Black', sans-serif", fontSize: '15px', color: '#8aa093' }}>{d.unknown_votes.toLocaleString()}</span>
                </div>
              </div>

              {/* ward by ward: each ward's 2023 result, then its predictions below */}
              <h2 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '20px', color: '#0f2a1c', margin: '0 0 4px' }}>Ward by ward</h2>
              <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '13px', color: '#5c6b60', margin: '0 0 14px' }}>Each ward in {d.lga_name}, its 2023 turnout and result, then every prediction added for that ward.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {d.wards.map((w) => (
                  <div key={w.ward_code} style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '12px', padding: '15px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                      <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '17px', color: '#0f2a1c' }}>{w.ward}</div>
                      <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '12px', color: '#8aa093', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        {w.registered_voters != null && <span>{w.registered_voters.toLocaleString()} registered</span>}
                        <span>{w.total_votes.toLocaleString()} cast ’23</span>
                        {w.winner && <span>Won: <span style={{ color: colorOf(w.winner), fontWeight: 800 }}>{w.winner}</span>{w.winner_votes ? ` ${w.winner_votes.toLocaleString()}` : ''}</span>}
                      </div>
                    </div>
                    {w.predictions.length > 0 ? (
                      <div style={{ marginTop: '8px', borderTop: '1px solid #eef2ee' }}>
                        {w.predictions.map((p, i) => <PredLine key={i} p={p} />)}
                      </div>
                    ) : (
                      <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #eef2ee', fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '12px', color: '#b3c2b8' }}>No prediction for this ward yet.</div>
                    )}
                  </div>
                ))}
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

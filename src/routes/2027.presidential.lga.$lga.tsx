import { createFileRoute, Link } from '@tanstack/react-router'
import { HomeNav } from '../components/HomeNav'
import { HomeFooter } from '../components/HomeFooter'
import { API_BASE } from '../config'
import { stateSlug } from '../stateSlug'
import { lgaSlug, lgaIdFromSlug } from '../lgaSlug'
import { politicianSlug } from '../politicianSlug'

const COLORS: Record<string, string> = { APC: '#1f6fd6', PDP: '#c0392b', LP: '#e05a1f', NNPP: '#f0b429', APGA: '#7b3fb5', SDP: '#0f8a4a', NDC: '#0e7490', ADC: '#db2777' }
const colorOf = (p: string) => COLORS[p] ?? '#8aa093'

type Pred = { label: string; votes: number; importance: number; pct: number | null }
type Cand = { politician_id: number | null; politician_name: string | null; photo: string; party: string; votes: number; pct: number | null; predictions: Pred[] }
type Hist = { year: number; office: string; total_votes: number; winner: string; parties: Record<string, number> }
type Ward = { ward: string; ward_code: string; registered_voters: number | null; total_votes: number; candidates: Cand[]; swing_votes: number; historical: Hist[] }
type Detail = { lga_id: number; lga_name: string; state: string; state_geo: string; candidates: Cand[]; total_votes: number; baseline_votes: number; swing_votes: number; wards: Ward[] }

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

/** One candidate: name + importance-weighted votes, with each prediction shown small. */
function CandidateRow({ c }: { c: Cand }) {
  const n = c.predictions.length
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 0' }}>
      <span style={{ width: '46px', flex: 'none', textAlign: 'center', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '10px', color: '#fff', background: colorOf(c.party), padding: '4px 0', borderRadius: '4px' }}>{c.party}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '14px', color: '#0f2a1c', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {c.politician_id && c.politician_name
            ? <Link to="/politician/$id" params={{ id: politicianSlug(c.politician_id, c.politician_name) }} style={{ color: 'inherit', textDecoration: 'none' }}>{c.politician_name}</Link>
            : (c.politician_name ?? c.party)}
        </div>
        {n > 0 && (
          <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '10.5px', color: '#8aa093' }}>
            {n} prediction{n === 1 ? '' : 's'}: {c.predictions.map((p) => `${p.pct ?? '—'}%`).join(', ')}
          </div>
        )}
      </div>
      <div style={{ textAlign: 'right', flex: 'none' }}>
        <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '16px', color: '#0f2a1c' }}>{c.votes.toLocaleString()}</div>
        {c.pct != null && <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '10px', color: '#8aa093' }}>{c.pct}%</div>}
      </div>
    </div>
  )
}

function SwingRow({ votes }: { votes: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 0', borderTop: '1px dashed #cdd8cf' }}>
      <span style={{ width: '46px', flex: 'none', textAlign: 'center', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '13px', color: '#8aa093', background: '#eef2ee', padding: '4px 0', borderRadius: '4px' }}>≈</span>
      <span style={{ flex: 1, fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '13px', color: '#8aa093' }}>Swing Votes (Unknown)</span>
      <span style={{ flex: 'none', fontFamily: "'Archivo Black', sans-serif", fontSize: '16px', color: '#8aa093' }}>{votes.toLocaleString()}</span>
    </div>
  )
}

function Historical({ items }: { items: Hist[] }) {
  if (items.length === 0) return null
  return (
    <div style={{ marginTop: '10px', paddingTop: '9px', borderTop: '1px solid #eef2ee' }}>
      <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '9px', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#b3c2b8', marginBottom: '4px' }}>Historical results</div>
      {items.map((h, i) => (
        <div key={i} style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '10.5px', color: '#8aa093', lineHeight: 1.5 }}>
          <span style={{ fontWeight: 800, color: '#5c6b60' }}>{h.year} {h.office}:</span>{' '}
          {Object.entries(h.parties).sort((a, b) => b[1] - a[1]).map(([p, v]) => `${p} ${v.toLocaleString()}`).join(' · ')}
          {h.total_votes ? ` · ${h.total_votes.toLocaleString()} total` : ''}{h.winner ? ` · won ${h.winner}` : ''}
        </div>
      ))}
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
            We project each ward, then add them up. A candidate can have several predictions — their votes are the importance-weighted average, and swing votes close the gap.
          </p>
        )}
      </div>

      <div style={{ background: '#f4f7f2' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '30px 40px 64px' }}>
          {!d ? (
            <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '12px', padding: '40px', textAlign: 'center', fontFamily: "'Archivo', sans-serif", fontWeight: 700, color: '#8aa093' }}>No prediction for this local government yet.</div>
          ) : (
            <>
              {/* LGA total: each candidate (weighted average of their predictions) + swing */}
              <h2 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '20px', color: '#0f2a1c', margin: '0 0 4px' }}>{d.lga_name} total</h2>
              <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '13px', color: '#5c6b60', margin: '0 0 12px' }}>Every ward’s projection added up.</p>
              <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '12px', padding: '10px 18px', marginBottom: '30px' }}>
                {d.candidates.map((c, i) => <div key={i} style={{ borderTop: i ? '1px solid #eef2ee' : 'none' }}><CandidateRow c={c} /></div>)}
                <SwingRow votes={d.swing_votes} />
              </div>

              {/* ward by ward: plain header, candidate projections, swing, then history */}
              <h2 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '20px', color: '#0f2a1c', margin: '0 0 4px' }}>Ward by ward</h2>
              <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '13px', color: '#5c6b60', margin: '0 0 14px' }}>Each ward in {d.lga_name}: the projected votes per candidate, swing votes, and past results.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {d.wards.map((w) => (
                  <div key={w.ward_code} style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '12px', padding: '15px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                      <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '17px', color: '#0f2a1c' }}>{w.ward}</div>
                      {w.registered_voters != null && <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '12px', color: '#8aa093' }}>{w.registered_voters.toLocaleString()} registered</div>}
                    </div>
                    <div style={{ marginTop: '6px', borderTop: '1px solid #eef2ee' }}>
                      {w.candidates.length > 0
                        ? <>{w.candidates.map((c, i) => <CandidateRow key={i} c={c} />)}<SwingRow votes={w.swing_votes} /></>
                        : <div style={{ padding: '9px 0', fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '12px', color: '#b3c2b8' }}>No prediction for this ward yet.</div>}
                    </div>
                    <Historical items={w.historical} />
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

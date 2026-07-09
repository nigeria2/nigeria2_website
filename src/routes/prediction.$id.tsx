import { useEffect, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { HomeNav } from '../components/HomeNav'
import { HomeFooter } from '../components/HomeFooter'
import { API_BASE } from '../config'
import { stateSlug } from '../stateSlug'

export const Route = createFileRoute('/prediction/$id')({
  component: PredictionDetailPage,
})

const COLORS: Record<string, string> = { APC: '#1f6fd6', PDP: '#c0392b', LP: '#e05a1f', NNPP: '#f0b429', APGA: '#7b3fb5', SDP: '#0f8a4a', NDC: '#0e7490', ADC: '#db2777', others: '#8aa093' }
const colorOf = (p: string) => COLORS[p] ?? '#8aa093'
const PARTIES = ['APC', 'PDP', 'LP', 'NNPP', 'others']
const TYPE_LABEL: Record<string, string> = { presidential: 'Presidential', governor: 'Governor', senate: 'Senate' }
const nf = (n: number) => Math.round(n).toLocaleString()

type Step = {
  kind: 'politician' | 'trend'
  name: string
  from_party?: string
  to_party?: string
  to_party_label?: string
  votes: number
  delta_popularity?: number
  influence_pct?: number
  scope?: string
  shift_pct?: number
}
type Detail = {
  state: string
  baseline_votes: Record<string, number>
  baseline_total: number
  steps: Step[]
  result_votes: Record<string, number>
  result_pct: Record<string, number>
  total_votes: number
  leader: string
}
type Pred = {
  id: number; state: string; election_type: string; source: string; label: string; author_name: string
  leading_party: string; scores: Record<string, number>; notes: string; year: string
  detail: Detail | null
  scenario: { id: number; name: string; description: string; target_year: string; election_type: string } | null
}

function Bars({ votes, pct }: { votes: Record<string, number>; pct?: Record<string, number> }) {
  const total = Object.values(votes).reduce((s, v) => s + (v || 0), 0) || 1
  const ranked = [...PARTIES].filter((p) => (votes[p] ?? 0) > 0).sort((a, b) => (votes[b] ?? 0) - (votes[a] ?? 0))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
      {ranked.map((p) => {
        const share = pct ? (pct[p] ?? 0) : Math.round((100 * (votes[p] ?? 0)) / total)
        return (
          <div key={p} style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <span style={{ width: '58px', flex: 'none', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '11px', color: '#fff', background: colorOf(p), padding: '3px 0', borderRadius: '4px', textAlign: 'center', textTransform: 'uppercase' }}>{p}</span>
            <div style={{ flex: 1, height: '12px', borderRadius: '4px', background: '#eef2ee', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(100, share)}%`, background: colorOf(p) }} />
            </div>
            <span style={{ width: '52px', textAlign: 'right', flex: 'none', fontFamily: "'Archivo Black', sans-serif", fontSize: '12px', color: '#5c6b60' }}>{share}%</span>
            <span style={{ width: '78px', textAlign: 'right', flex: 'none', fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '11px', color: '#8aa093' }}>{nf(votes[p] ?? 0)}</span>
          </div>
        )
      })}
    </div>
  )
}

function PredictionDetailPage() {
  const { id } = Route.useParams()
  const [p, setP] = useState<Pred | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    setP(null)
    setNotFound(false)
    fetch(`${API_BASE}/api/predictions/${encodeURIComponent(id)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setP)
      .catch(() => setNotFound(true))
  }, [id])

  const d = p?.detail && p.detail.steps ? p.detail : null

  return (
    <div style={{ minHeight: '100vh', background: '#f4f7f2', fontFamily: "'Archivo', sans-serif" }}>
      <HomeNav />

      <div style={{ background: '#0d8244' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '30px 40px 26px' }}>
          {p && (
            <Link to="/states/$state" params={{ state: stateSlug(p.state) }} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '13px', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#9fd9b8', textDecoration: 'none', marginBottom: '12px' }}>
              ← {p.state}
            </Link>
          )}
          <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9fd9b8', marginBottom: '8px' }}>
            {p ? `${TYPE_LABEL[p.election_type] ?? p.election_type} · ${p.year}` : 'Prediction'}
          </div>
          <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '32px', color: '#fff', margin: '0 0 6px' }}>{p ? p.label || p.author_name : notFound ? 'Not found' : 'Loading…'}</h1>
          {p && (
            <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '15px', color: '#c7e7d4', margin: 0 }}>
              {p.leading_party ? <>Projected leader: <strong style={{ color: '#fff' }}>{p.leading_party}</strong></> : 'No clear leader'}
            </p>
          )}
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '26px 40px 72px' }}>
        {notFound ? (
          <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', padding: '44px', textAlign: 'center', fontFamily: "'Archivo', sans-serif", fontWeight: 700, color: '#8aa093' }}>This prediction could not be found.</div>
        ) : !p ? (
          <div style={{ padding: '60px', textAlign: 'center', fontFamily: "'Archivo Black', sans-serif", color: '#8aa093' }}>Loading…</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {p.notes && (
              <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', padding: '18px 22px', fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '14px', color: '#33413a', lineHeight: 1.6 }}>{p.notes}</div>
            )}

            {d ? (
              <>
                {/* Final projection */}
                <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', padding: '20px 22px' }}>
                  <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '16px', color: '#0f2a1c', marginBottom: '4px' }}>Projected result</div>
                  <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '12px', color: '#8aa093', marginBottom: '14px' }}>{nf(d.total_votes)} projected votes</div>
                  <Bars votes={d.result_votes} pct={d.result_pct} />
                </div>

                {/* How we got there */}
                <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', padding: '20px 22px' }}>
                  <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '16px', color: '#0f2a1c', marginBottom: '12px' }}>How this projection was built</div>

                  <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '11px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#8aa093', marginBottom: '10px' }}>1 · Baseline — 2023 result</div>
                  <div style={{ marginBottom: '18px' }}><Bars votes={d.baseline_votes} /></div>

                  {d.steps.length === 0 ? (
                    <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '13px', color: '#8aa093' }}>No adjustments applied in this state — projection equals the baseline.</div>
                  ) : (
                    <>
                      <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '11px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#8aa093', marginBottom: '10px' }}>2 · Adjustments</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {d.steps.map((s, i) => (
                          <div key={i} style={{ border: '1px solid #eef2ee', borderRadius: '8px', padding: '12px 14px', background: '#f9fbf8' }}>
                            {s.kind === 'politician' ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '10px', color: '#0f4a2c', background: '#d7f0e0', padding: '3px 8px', borderRadius: '20px' }}>POLITICIAN</span>
                                <span style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '14px', color: '#0f2a1c' }}>{s.name}</span>
                                <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '13px', color: '#5c6b60' }}>
                                  moved <strong>{nf(s.votes)}</strong> votes
                                </span>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                  <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '10px', color: '#fff', background: colorOf(s.from_party || 'others'), padding: '2px 8px', borderRadius: '20px', textTransform: 'uppercase' }}>{s.from_party}</span>
                                  <span style={{ color: '#8aa093' }}>→</span>
                                  <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '10px', color: '#fff', background: colorOf(s.to_party || 'others'), padding: '2px 8px', borderRadius: '20px', textTransform: 'uppercase' }}>{s.to_party_label || s.to_party}</span>
                                </span>
                                <span style={{ marginLeft: 'auto', fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '11px', color: '#8aa093' }}>
                                  {s.influence_pct}% influence · {(s.delta_popularity ?? 0) >= 0 ? '+' : ''}{s.delta_popularity}% popularity · {s.scope}
                                </span>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '10px', color: '#5a3a00', background: '#ffe6b0', padding: '3px 8px', borderRadius: '20px' }}>TREND</span>
                                <span style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '14px', color: '#0f2a1c' }}>{s.name}</span>
                                <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '13px', color: '#5c6b60' }}>
                                  shifted <strong>{nf(s.votes)}</strong> votes ({s.shift_pct}%) toward
                                </span>
                                <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '10px', color: '#fff', background: colorOf(s.to_party || 'others'), padding: '2px 8px', borderRadius: '20px', textTransform: 'uppercase' }}>{s.to_party}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              // Non-model (expert) prediction — just show the projected shares.
              <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', padding: '20px 22px' }}>
                <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '16px', color: '#0f2a1c', marginBottom: '14px' }}>Projected shares</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                  {Object.entries(p.scores).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).map(([party, v]) => (
                    <div key={party} style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                      <span style={{ width: '58px', flex: 'none', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '11px', color: '#fff', background: colorOf(party), padding: '3px 0', borderRadius: '4px', textAlign: 'center' }}>{party}</span>
                      <div style={{ flex: 1, height: '12px', borderRadius: '4px', background: '#eef2ee', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.min(100, Math.round(v))}%`, background: colorOf(party) }} />
                      </div>
                      <span style={{ width: '44px', textAlign: 'right', flex: 'none', fontFamily: "'Archivo Black', sans-serif", fontSize: '12px', color: '#5c6b60' }}>{Math.round(v)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '12px', color: '#8aa093', margin: '4px 0 0' }}>
              {p.scenario ? `Generated by the “${p.scenario.name}” model scenario.` : 'Expert prediction.'} Baseline is the verified 2023 result; adjustments are modelled assumptions, not forecasts of certainty.
            </p>
          </div>
        )}
      </div>

      <HomeFooter />
    </div>
  )
}

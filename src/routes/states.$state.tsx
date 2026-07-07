import { createFileRoute, Link } from '@tanstack/react-router'
import { HomeNav } from '../components/HomeNav'
import { HomeFooter } from '../components/HomeFooter'
import { NIGERIA_STATES } from '../nigeriaStates'
import { STATE_BOUNDS } from '../stateBounds'
import { API_BASE } from '../config'

const COLORS: Record<string, string> = { APC: '#1f6fd6', PDP: '#c0392b', LP: '#e05a1f', NNPP: '#f0b429', APGA: '#7b3fb5', SDP: '#0f8a4a', NDC: '#0e7490', ADC: '#db2777' }
const colorOf = (p: string) => COLORS[p] ?? '#8aa093'
const TYPE_LABEL: Record<string, string> = { presidential: 'Presidential', governor: 'Governor', senate: 'Senate' }
const RACES = ['presidential', 'governor', 'senate'] as const

type PartyScore = { party: string; score: number }
type LoaderData = { state: string; week: string; byRace: Record<string, PartyScore[]> }

export const Route = createFileRoute('/states/$state')({
  loader: async ({ params }): Promise<LoaderData> => {
    const state = decodeURIComponent(params.state)
    try {
      const meta = await fetch(`${API_BASE}/api/predictions/meta`).then((r) => r.json())
      const week: string = meta.weeks?.[0] ?? ''
      const entries = await Promise.all(
        RACES.map(async (et) => {
          const rows: { state: string; party: string; score: number }[] = await fetch(
            `${API_BASE}/api/predictions?election_type=${et}&week=${encodeURIComponent(week)}`,
          ).then((r) => r.json())
          const forState = rows
            .filter((r) => r.state === state)
            .map((r) => ({ party: r.party, score: r.score }))
            .sort((a, b) => b.score - a.score)
          return [et, forState] as const
        }),
      )
      return { state, week, byRace: Object.fromEntries(entries) }
    } catch {
      return { state, week: '', byRace: {} }
    }
  },
  head: ({ params }) => {
    const s = decodeURIComponent(params.state)
    const title = `${s} — 2027 Election Prediction | Nigeria 2.0`
    const description = `Projected 2027 presidential, governorship and senate results for ${s} State, Nigeria — a party-by-party breakdown from Nigeria 2.0.`
    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
      ],
    }
  },
  component: StatePage,
})

function weekLabel(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  return isNaN(d.getTime()) ? iso : `Week of ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
}

function StatePage() {
  const { state, week, byRace } = Route.useLoaderData()
  const shape = NIGERIA_STATES.find((s) => s.name === state)
  const bounds = STATE_BOUNDS[state]
  const pres = byRace.presidential ?? []
  const winner = pres[0]?.party
  const fill = winner ? colorOf(winner) : '#cdd8cf'

  let viewBox = '0 0 954 734'
  if (bounds) {
    const [x, y, w, h] = bounds
    const pad = Math.max(w, h) * 0.09
    viewBox = `${x - pad} ${y - pad} ${w + pad * 2} ${h + pad * 2}`
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f4f7f2', fontFamily: "'Archivo', sans-serif" }}>
      <HomeNav />

      <div style={{ background: '#0d8244' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '30px 40px 26px' }}>
          <Link to="/2027/presidential" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '13px', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#9fd9b8', textDecoration: 'none', marginBottom: '12px' }}>
            ← Back to the map
          </Link>
          <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '40px', color: '#fff', margin: '0 0 6px', letterSpacing: '-0.01em' }}>{state} State</h1>
          <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '16px', color: '#c7e7d4', margin: 0 }}>
            Projected 2027 results for {state}{week ? ` · ${weekLabel(week)}` : ''}.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '30px 40px 72px' }}>
        <div className="two-col" style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: '28px', alignItems: 'start' }}>
          {/* state map */}
          <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '12px', padding: '20px' }}>
            {shape ? (
              <svg viewBox={viewBox} width="100%" style={{ display: 'block', maxHeight: '460px' }} role="img" aria-label={`Map of ${state} State`}>
                <path d={shape.d} fill={fill} stroke="#ffffff" strokeWidth={1.2} strokeLinejoin="round" />
              </svg>
            ) : (
              <div style={{ padding: '60px', textAlign: 'center', fontFamily: "'Archivo', sans-serif", fontWeight: 700, color: '#8aa093' }}>Map unavailable for this state.</div>
            )}
            {winner && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', marginTop: '10px' }}>
                <span style={{ width: '14px', height: '14px', borderRadius: '3px', background: fill, display: 'inline-block' }} />
                <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '14px', color: '#0f2a1c' }}>
                  {winner} projected to lead the presidential vote
                </span>
              </div>
            )}
          </div>

          {/* per-race breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {RACES.map((et) => {
              const rows = byRace[et] ?? []
              return (
                <div key={et} style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', padding: '20px 22px' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '10px', marginBottom: '12px' }}>
                    <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '17px', color: '#0f2a1c' }}>{TYPE_LABEL[et]}</div>
                    {rows[0] && <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '12px', color: '#fff', background: colorOf(rows[0].party), padding: '3px 10px', borderRadius: '20px' }}>{rows[0].party} leads</div>}
                  </div>
                  {rows.length === 0 ? (
                    <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '13px', color: '#b3c2b8' }}>No data for this race.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                      {rows.map((r) => (
                        <div key={r.party} style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                          <span style={{ width: '48px', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '11px', color: '#fff', background: colorOf(r.party), padding: '3px 0', borderRadius: '4px', textAlign: 'center', flex: 'none' }}>{r.party}</span>
                          <div style={{ flex: 1, height: '8px', borderRadius: '4px', background: '#eef2ee', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${Math.min(100, Math.round(r.score))}%`, background: colorOf(r.party) }} />
                          </div>
                          <span style={{ width: '38px', textAlign: 'right', fontFamily: "'Archivo Black', sans-serif", fontSize: '12px', color: '#5c6b60', flex: 'none' }}>{Math.round(r.score)}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '13px', color: '#8aa093', margin: '24px 0 0' }}>
          Illustrative projections aggregated from contributor traces. See our{' '}
          <Link to="/methodology" style={{ color: '#0f8a4a', fontWeight: 800 }}>methodology</Link>.
        </p>
      </div>

      <HomeFooter />
    </div>
  )
}

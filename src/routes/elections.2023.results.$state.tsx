import { createFileRoute, Link } from '@tanstack/react-router'
import { HomeNav } from '../components/HomeNav'
import { HomeFooter } from '../components/HomeFooter'
import { API_BASE } from '../config'
import { stateSlug, geoIdFromSlug, STATE_BY_SLUG } from '../stateSlug'
import { lgaSlug } from '../lgaSlug'

const COLORS: Record<string, string> = {
  APC: '#1f6fd6', PDP: '#c0392b', LP: '#e05a1f', NNPP: '#f0b429', APGA: '#7b3fb5', SDP: '#0f8a4a',
  NDC: '#0e7490', ADC: '#db2777', YPP: '#0aa2c0', PRP: '#6d28d9', NRM: '#b45309', APP: '#475569',
  ADP: '#0891b2', A: '#64748b', AA: '#94a3b8', AAC: '#334155', APM: '#7c3aed', BP: '#059669', ZLP: '#be123c',
}
const colorOf = (p: string) => COLORS[p] ?? '#8aa093'
const MAX_COLS = 6 // party columns shown; the rest fold into "Others"

type Lga = { lga_id: number | null; lga: string; total: number; parties: Record<string, number> }
type Table = { parties: string[]; party_totals: Record<string, number>; winner: string; total_votes: number; lga_count: number; lgas: Lga[] }
type Detail = { year: string; geo_id: string; state: string; presidential: Table | null; governor: Table | null }

export const Route = createFileRoute('/elections/2023/results/$state')({
  loader: async ({ params }): Promise<Detail | null> => {
    const geo = geoIdFromSlug(params.state)
    if (!geo) return null
    try {
      return await fetch(`${API_BASE}/api/results/2023/${geo}`).then((r) => (r.ok ? r.json() : null))
    } catch {
      return null
    }
  },
  head: ({ params }) => ({ meta: [{ title: `${STATE_BY_SLUG[params.state] ?? 'State'} — 2023 results | Nigeria 2.0` }] }),
  component: ResultsState,
})

function ResultsTable({ title, subtitle, geo_id, t }: { title: string; subtitle: string; geo_id: string; t: Table }) {
  const cols = t.parties.slice(0, MAX_COLS)
  const hasOthers = t.parties.length > cols.length
  const th: React.CSSProperties = { padding: '10px 12px', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.03em', textAlign: 'right', whiteSpace: 'nowrap' }
  const td: React.CSSProperties = { padding: '9px 12px', fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '13px', textAlign: 'right', whiteSpace: 'nowrap', color: '#33414f' }
  const othersOf = (l: Lga) => l.total - cols.reduce((s, p) => s + (l.parties[p] ?? 0), 0)
  return (
    <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '12px', overflow: 'hidden', marginBottom: '26px' }}>
      <div style={{ padding: '16px 18px', borderBottom: '1px solid #eef2ee' }}>
        <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '17px', color: '#0f2a1c' }}>{title}</div>
        <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '13px', color: '#8aa093', marginTop: '2px' }}>{subtitle}</div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: `${240 + (cols.length + (hasOthers ? 1 : 0)) * 92}px` }}>
          <thead>
            <tr style={{ background: '#f7faf7' }}>
              <th style={{ ...th, textAlign: 'left' }}>LGA</th>
              {cols.map((p) => (
                <th key={p} style={{ ...th, color: colorOf(p) }}>{p}</th>
              ))}
              {hasOthers && <th style={{ ...th, color: '#8aa093' }}>Others</th>}
            </tr>
          </thead>
          <tbody>
            {t.lgas.map((l, i) => {
              const winParty = cols.reduce((best, p) => ((l.parties[p] ?? 0) > (l.parties[best] ?? 0) ? p : best), cols[0])
              return (
                <tr key={i} style={{ borderTop: '1px solid #eef2ee' }}>
                  <td style={{ padding: '9px 12px', fontFamily: "'Archivo Black', sans-serif", fontSize: '13px', color: '#0f2a1c', whiteSpace: 'nowrap' }}>
                    {l.lga_id ? (
                      <Link to="/elections/2027/prediction/presidential/lga/$lga" params={{ lga: lgaSlug(l.lga_id, l.lga) }} style={{ color: 'inherit', textDecoration: 'none' }}>{l.lga}</Link>
                    ) : l.lga}
                  </td>
                  {cols.map((p) => (
                    <td key={p} style={{ ...td, color: p === winParty ? colorOf(p) : '#33414f', fontWeight: p === winParty ? 800 : 700 }}>{(l.parties[p] ?? 0).toLocaleString()}</td>
                  ))}
                  {hasOthers && <td style={{ ...td, color: '#8aa093' }}>{Math.max(0, othersOf(l)).toLocaleString()}</td>}
                </tr>
              )
            })}
            <tr style={{ borderTop: '2px solid #cdd8cf', background: '#f7faf7' }}>
              <td style={{ padding: '10px 12px', fontFamily: "'Archivo Black', sans-serif", fontSize: '12px', color: '#0f2a1c', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Total</td>
              {cols.map((p) => (
                <td key={p} style={{ ...td, fontFamily: "'Archivo Black', sans-serif", color: colorOf(p) }}>{(t.party_totals[p] ?? 0).toLocaleString()}</td>
              ))}
              {hasOthers && <td style={{ ...td, fontFamily: "'Archivo Black', sans-serif", color: '#8aa093' }}>{Math.max(0, t.total_votes - cols.reduce((s, p) => s + (t.party_totals[p] ?? 0), 0)).toLocaleString()}</td>}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ResultsState() {
  const d = Route.useLoaderData()
  if (!d) {
    return (
      <div style={{ minHeight: '100vh', background: '#0d8244', fontFamily: "'Archivo', sans-serif" }}>
        <HomeNav />
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 40px', color: '#fff' }}>No results for this state yet.</div>
        <HomeFooter />
      </div>
    )
  }
  const winLabel = (t: Table | null) => (t ? `${t.winner} led · ${t.total_votes.toLocaleString()} votes across ${t.lga_count} LGA${t.lga_count === 1 ? '' : 's'}` : '')
  return (
    <div style={{ minHeight: '100vh', background: '#0d8244', fontFamily: "'Archivo', sans-serif" }}>
      <HomeNav />
      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '26px 40px 0' }}>
        <Link to="/elections/2023/results" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '13px', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#9fd9b8', textDecoration: 'none' }}>← All 2023 results</Link>
        <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '38px', color: '#fff', margin: '12px 0 8px', letterSpacing: '-0.01em' }}>{d.state} · 2023 results</h1>
        <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '15px', color: '#c7e7d4', margin: '0 0 24px' }}>Verified results by local government area.</p>
      </div>
      <div style={{ background: '#f4f7f2' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '30px 40px 64px' }}>
          {d.governor && <ResultsTable title="Governorship" subtitle={winLabel(d.governor)} geo_id={d.geo_id} t={d.governor} />}
          {d.presidential && <ResultsTable title="Presidential" subtitle={winLabel(d.presidential)} geo_id={d.geo_id} t={d.presidential} />}
          {!d.governor && !d.presidential && (
            <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '12px', padding: '40px', textAlign: 'center', fontFamily: "'Archivo', sans-serif", color: '#8aa093' }}>No results captured for {d.state} yet.</div>
          )}
        </div>
      </div>
      <HomeFooter />
    </div>
  )
}

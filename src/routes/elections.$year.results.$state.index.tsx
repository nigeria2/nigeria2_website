import { createFileRoute, Link } from '@tanstack/react-router'
import { HomeNav } from '../components/HomeNav'
import { HomeFooter } from '../components/HomeFooter'
import { ApiLink } from '../components/ApiLink'
import { LevelEvidence, type LevelEvidenceItem } from '../components/LevelEvidence'
import { API_BASE } from '../config'
import { geoIdFromSlug, STATE_BY_SLUG } from '../stateSlug'
import { lgaSlug } from '../lgaSlug'
import { politicianSlug } from '../politicianSlug'

const COLORS: Record<string, string> = {
  APC: '#1f6fd6', PDP: '#c0392b', LP: '#e05a1f', NNPP: '#f0b429', APGA: '#7b3fb5', SDP: '#0f8a4a',
  NDC: '#0e7490', ADC: '#db2777', YPP: '#0aa2c0', PRP: '#6d28d9', NRM: '#b45309', APP: '#475569',
  ADP: '#0891b2', A: '#64748b', AA: '#94a3b8', AAC: '#334155', APM: '#7c3aed', BP: '#059669', ZLP: '#be123c',
}
const colorOf = (p: string) => COLORS[p] ?? '#8aa093'
const MAX_COLS = 6 // party columns shown; the rest fold into "Others"

type Lga = { lga_id: number | null; lga: string; total: number; parties: Record<string, number> }
type Table = { parties: string[]; party_totals: Record<string, number>; winner: string; total_votes: number; lga_count: number; lgas: Lga[] }
type Cand = { candidate: string; party: string; votes: number; position: number; elected: boolean; gender: string; politician_id: number | null }
type LegBlock = { constituency: string; code: string; candidates: Cand[]; total_votes: number; candidate_count: number; winner: Cand | null }
type PresState = { parties: Record<string, number>; winner: string; total_votes: number }
type Detail = {
  year: string; geo_id: string; state: string
  presidential: Table | null; presidential_state: PresState | null; governor: Table | null
  senate: LegBlock[] | null; house: LegBlock[] | null
  evidence?: LevelEvidenceItem[]
}

export const Route = createFileRoute('/elections/$year/results/$state/')({
  loader: async ({ params }): Promise<Detail | null> => {
    const geo = geoIdFromSlug(params.state)
    if (!geo) return null
    try {
      return await fetch(`${API_BASE}/api/results/${params.year}/${geo}`).then((r) => (r.ok ? r.json() : null))
    } catch {
      return null
    }
  },
  head: ({ params }) => ({ meta: [{ title: `${STATE_BY_SLUG[params.state] ?? 'State'} — ${params.year} results | Nigeria 2.0` }] }),
  component: ResultsState,
})

function ResultsTable({ title, subtitle, year, state, t }: { title: string; subtitle: string; year: string; state: string; t: Table }) {
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
                    {l.lga_id && year === '2023' ? (
                      <Link to="/elections/$year/results/$state/$lga" params={{ year, state, lga: lgaSlug(l.lga_id, l.lga) }} style={{ color: 'inherit', textDecoration: 'none' }}>{l.lga}</Link>
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
      {year === '2023' && <div style={{ padding: '10px 18px', fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '12px', color: '#8aa093', borderTop: '1px solid #eef2ee' }}>Click an LGA to drill into its wards and polling-unit result sheets.</div>}
    </div>
  )
}

function CandName({ c }: { c: Cand }) {
  if (c.politician_id)
    return (
      <Link to="/politician/$id" params={{ id: politicianSlug(c.politician_id, c.candidate) }} style={{ color: 'inherit', textDecoration: 'none', borderBottom: '1px dotted #9db3a3' }}>
        {c.candidate}
      </Link>
    )
  return <>{c.candidate}</>
}

function PresStateCard({ t }: { t: PresState }) {
  const entries = Object.entries(t.parties).sort((a, b) => b[1] - a[1])
  return (
    <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '12px', overflow: 'hidden', marginBottom: '26px' }}>
      <div style={{ padding: '16px 18px', borderBottom: '1px solid #eef2ee' }}>
        <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '17px', color: '#0f2a1c' }}>Presidential</div>
        <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '13px', color: '#8aa093', marginTop: '2px' }}>
          {t.winner} led · {t.total_votes.toLocaleString()} votes · state total (no LGA breakdown held for this year)
        </div>
      </div>
      <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {entries.map(([p, v]) => {
          const pct = t.total_votes ? Math.round((v / t.total_votes) * 100) : 0
          return (
            <div key={p}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '13px', color: '#33414f', marginBottom: '3px' }}>
                <span style={{ color: colorOf(p) }}>{p}{p === t.winner ? ' ✓' : ''}</span>
                <span>{v.toLocaleString()} · {pct}%</span>
              </div>
              <div style={{ height: '8px', background: '#eef2ee', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: colorOf(p) }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function LegSection({ title, subtitle, blocks }: { title: string; subtitle: string; blocks: LegBlock[] }) {
  const td: React.CSSProperties = { padding: '7px 12px', fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '13px', color: '#33414f', whiteSpace: 'nowrap' }
  return (
    <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '12px', overflow: 'hidden', marginBottom: '26px' }}>
      <div style={{ padding: '16px 18px', borderBottom: '1px solid #eef2ee' }}>
        <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '17px', color: '#0f2a1c' }}>{title}</div>
        <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '13px', color: '#8aa093', marginTop: '2px' }}>{subtitle}</div>
      </div>
      {blocks.map((b) => (
        <details key={b.constituency} style={{ borderTop: '1px solid #eef2ee' }}>
          <summary style={{ padding: '12px 18px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '14px', color: '#0f2a1c' }}>{b.constituency}</span>
            {b.winner && (
              <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '13px', color: '#33414f' }}>
                <span style={{ color: colorOf(b.winner.party), fontWeight: 800 }}>{b.winner.party}</span> · <CandName c={b.winner} /> · {b.winner.votes.toLocaleString()} ✓
              </span>
            )}
          </summary>
          <div style={{ overflowX: 'auto', padding: '0 6px 8px' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
              <tbody>
                {b.candidates.map((c, i) => (
                  <tr key={i} style={{ background: c.elected ? '#f2fbf5' : 'transparent' }}>
                    <td style={{ ...td, color: '#8aa093', width: '28px', textAlign: 'right' }}>{c.position}</td>
                    <td style={{ ...td, fontFamily: "'Archivo Black', sans-serif", color: c.elected ? '#0f6a38' : '#0f2a1c', whiteSpace: 'normal' }}><CandName c={c} />{c.elected ? ' ✓' : ''}</td>
                    <td style={{ ...td, color: colorOf(c.party), fontWeight: 800 }}>{c.party}</td>
                    <td style={{ ...td, textAlign: 'right' }}>{c.votes.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      ))}
    </div>
  )
}

function ResultsState() {
  const { year, state } = Route.useParams()
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
  const jumps: { id: string; label: string }[] = [
    ...(d.governor ? [{ id: 'governorship', label: 'Governorship' }] : []),
    ...(d.presidential || d.presidential_state ? [{ id: 'presidential', label: 'Presidential' }] : []),
    ...(d.senate && d.senate.length > 0 ? [{ id: 'senate', label: 'Senate' }] : []),
    ...(d.house && d.house.length > 0 ? [{ id: 'house', label: 'House of Reps' }] : []),
  ]
  return (
    <div style={{ minHeight: '100vh', background: '#0d8244', fontFamily: "'Archivo', sans-serif" }}>
      <HomeNav />
      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '26px 40px 0', position: 'relative' }}>
        <ApiLink href={`${API_BASE}/elections/${year}/${state}`} />
        <Link to="/elections/$year/results" params={{ year }} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '13px', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#9fd9b8', textDecoration: 'none' }}>← All {year} results</Link>
        <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '38px', color: '#fff', margin: '12px 0 8px', letterSpacing: '-0.01em' }}>{d.state} · {year} results</h1>
        <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '15px', color: '#c7e7d4', margin: '0 0 18px' }}>Verified results by local government area.</p>
        {jumps.length > 1 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', paddingBottom: '4px' }}>
            <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '12px', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#9fd9b8', alignSelf: 'center' }}>Jump to:</span>
            {jumps.map((j) => (
              <a key={j.id} href={`#${j.id}`} style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '12px', letterSpacing: '0.03em', textTransform: 'uppercase', color: '#0f2a1c', background: '#ffe14d', textDecoration: 'none', padding: '6px 14px', borderRadius: '20px' }}>{j.label}</a>
            ))}
          </div>
        )}
      </div>
      <div style={{ background: '#f4f7f2' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '30px 40px 64px' }}>
          {d.governor && <div id="governorship" style={{ scrollMarginTop: '20px' }}><ResultsTable title="Governorship" subtitle={winLabel(d.governor)} year={year} state={state} t={d.governor} /></div>}
          {(d.presidential || d.presidential_state) && (
            <div id="presidential" style={{ scrollMarginTop: '20px' }}>
              {d.presidential && <ResultsTable title="Presidential" subtitle={winLabel(d.presidential)} year={year} state={state} t={d.presidential} />}
              {d.presidential_state && <PresStateCard t={d.presidential_state} />}
            </div>
          )}
          {d.senate && d.senate.length > 0 && (
            <div id="senate" style={{ scrollMarginTop: '20px' }}><LegSection title="Senate" subtitle={`${d.senate.length} senatorial district${d.senate.length === 1 ? '' : 's'} · open a district for the full candidate list`} blocks={d.senate} /></div>
          )}
          {d.house && d.house.length > 0 && (
            <div id="house" style={{ scrollMarginTop: '20px' }}><LegSection title="House of Representatives" subtitle={`${d.house.length} federal constituenc${d.house.length === 1 ? 'y' : 'ies'} · open one for the full candidate list`} blocks={d.house} /></div>
          )}
          {!d.governor && !d.presidential && !d.presidential_state && !d.senate && !d.house && (
            <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '12px', padding: '40px', textAlign: 'center', fontFamily: "'Archivo', sans-serif", color: '#8aa093' }}>No results captured for {d.state} in {year} yet.</div>
          )}
          <LevelEvidence
            items={d.evidence ?? []}
            blurb="The evidence behind this state's score — its roll-up from the LGAs, plus any figures recorded independently at state level from another source. Each is a guess; the state score is a merge of them."
          />
        </div>
      </div>
      <HomeFooter />
    </div>
  )
}

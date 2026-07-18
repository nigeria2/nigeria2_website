import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { HomeNav } from '../components/HomeNav'
import { HomeFooter } from '../components/HomeFooter'
import { API_BASE } from '../config'
import { stateSlug } from '../stateSlug'
import { RESULT_YEARS, isFutureElection } from '../electionYears'

type OfficeTotals = { parties: Record<string, number>; total: number; winner: string; level: string }
type StateRow = {
  geo_id: string; state: string
  has_presidential: boolean; has_governor: boolean; has_senate: boolean; has_house: boolean
  presidential_lga_count: number; governor_lga_count: number; senate_count: number; house_count: number
  party_totals?: Record<string, OfficeTotals>
}
type Summary = Record<string, { parties: Record<string, number>; total: number; winner: string; states: number }>
type LoaderData = { year: string; states: StateRow[]; summary: Summary }

export const Route = createFileRoute('/elections/$year/results/')({
  loader: async ({ params }): Promise<LoaderData> => {
    try {
      const d = await fetch(`${API_BASE}/api/results/${params.year}`).then((r) => r.json())
      return { year: params.year, states: d.states ?? [], summary: d.summary ?? {} }
    } catch {
      return { year: params.year, states: [], summary: {} }
    }
  },
  head: ({ params }) => ({ meta: [{ title: `${params.year} Election results by state | Nigeria 2.0` }] }),
  component: ResultsIndex,
})

const COLORS: Record<string, string> = {
  APC: '#1f6fd6', PDP: '#c0392b', LP: '#e05a1f', NNPP: '#f0b429', APGA: '#7b3fb5', SDP: '#0f8a4a',
  NDC: '#0e7490', ADC: '#db2777', YPP: '#0aa2c0', PRP: '#6d28d9', Others: '#8aa093',
}
const colorOf = (p: string) => COLORS[p] ?? '#8aa093'
const OFFICES = [
  { key: 'presidential', label: 'Presidential' },
  { key: 'governor', label: 'Governorship' },
] as const
type OfficeKey = (typeof OFFICES)[number]['key']

/** Fold a party->votes map into the top N parties + an "Others" bucket. */
function topParties(parties: Record<string, number>, n = 4): [string, number][] {
  const sorted = Object.entries(parties).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1])
  if (sorted.length <= n) return sorted
  const top = sorted.slice(0, n)
  const others = sorted.slice(n).reduce((s, [, v]) => s + v, 0)
  if (others > 0) top.push(['Others', others])
  return top
}

/** Small horizontal bar chart of party vote totals. */
function PartyBars({ totals }: { totals: OfficeTotals }) {
  const rows = topParties(totals.parties)
  const max = Math.max(1, ...rows.map(([, v]) => v))
  if (rows.length === 0) return <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '12px', color: '#b3c2b8', padding: '6px 0' }}>No vote totals captured.</div>
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px' }}>
      {rows.map(([p, v]) => (
        <div key={p} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '48px', flex: 'none', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '10px', color: '#fff', background: colorOf(p), padding: '2px 0', borderRadius: '3px', textAlign: 'center' }}>{p}</span>
          <div style={{ flex: 1, height: '10px', borderRadius: '3px', background: '#eef2ee', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.round((v / max) * 100)}%`, background: colorOf(p) }} />
          </div>
          <span style={{ width: '64px', textAlign: 'right', flex: 'none', fontFamily: "'Archivo Black', sans-serif", fontSize: '11px', color: '#5c6b60' }}>{v.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

function YearTabs({ year }: { year: string }) {
  return (
    <div style={{ display: 'flex', gap: '8px', margin: '0 0 4px' }}>
      {RESULT_YEARS.map((y) => (
        <Link key={y} to="/elections/$year/results" params={{ year: y }}
          style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '14px', textDecoration: 'none', padding: '7px 16px', borderRadius: '20px', background: y === year ? '#ffe14d' : 'rgba(255,255,255,0.14)', color: y === year ? '#0f2a1c' : '#eafaf0' }}>
          {y}
        </Link>
      ))}
    </div>
  )
}

function Badge({ label, on }: { label: string; on: boolean }) {
  return (
    <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '11px', color: on ? '#0f4a2c' : '#b6c3b8', background: on ? '#d8f0df' : '#f0f3ef', padding: '3px 10px', borderRadius: '20px' }}>{label}</span>
  )
}

/** Office toggle used both globally (top) and per-card. */
function OfficeSwitch({ value, onChange, available, size = 'md' }: { value: OfficeKey; onChange: (o: OfficeKey) => void; available: OfficeKey[]; size?: 'sm' | 'md' }) {
  const pad = size === 'sm' ? '3px 10px' : '6px 14px'
  const fs = size === 'sm' ? '11px' : '13px'
  return (
    <div style={{ display: 'inline-flex', gap: '4px', background: '#eef2ee', borderRadius: '20px', padding: '3px' }}>
      {OFFICES.filter((o) => available.includes(o.key)).map((o) => (
        <button key={o.key} onClick={() => onChange(o.key)}
          style={{ cursor: 'pointer', border: 'none', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: fs, padding: pad, borderRadius: '20px', background: value === o.key ? '#0f8a4a' : 'transparent', color: value === o.key ? '#fff' : '#5c6b60' }}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

function SummaryPanel({ summary, office }: { summary: Summary; office: OfficeKey }) {
  const s = summary[office]
  if (!s || Object.keys(s.parties).length === 0) return null
  const rows = topParties(s.parties, 5)
  const max = Math.max(1, ...rows.map(([, v]) => v))
  const label = OFFICES.find((o) => o.key === office)?.label ?? office
  return (
    <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '14px', padding: '22px 24px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '6px' }}>
        <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '18px', color: '#0f2a1c' }}>{label} — national summary</div>
        <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '13px', color: '#8aa093' }}>{s.states} states · {s.total.toLocaleString()} votes</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <span style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '15px', color: '#fff', background: colorOf(s.winner), padding: '5px 14px', borderRadius: '8px' }}>{s.winner}</span>
        <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '14px', color: '#33414f' }}>leads across captured states</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px 24px' }}>
        {rows.map(([p, v]) => {
          const pct = s.total ? Math.round((v / s.total) * 100) : 0
          return (
            <div key={p}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '12px', color: '#33414f', marginBottom: '3px' }}>
                <span style={{ color: colorOf(p) }}>{p}</span><span>{v.toLocaleString()} · {pct}%</span>
              </div>
              <div style={{ height: '8px', background: '#eef2ee', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.round((v / max) * 100)}%`, height: '100%', background: colorOf(p) }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StateCard({ s, year, globalOffice }: { s: StateRow; year: string; globalOffice: OfficeKey }) {
  const available: OfficeKey[] = [
    ...(s.has_presidential ? (['presidential'] as const) : []),
    ...(s.has_governor ? (['governor'] as const) : []),
  ]
  // per-card override starts null → follows the global switch; a click pins it
  const [override, setOverride] = useState<OfficeKey | null>(null)
  const office: OfficeKey = override ?? (available.includes(globalOffice) ? globalOffice : available[0] ?? 'presidential')
  const totals = s.party_totals?.[office]
  return (
    <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '12px', padding: '18px 20px', display: 'flex', flexDirection: 'column' }}>
      <Link to="/elections/$year/results/$state" params={{ year, state: stateSlug(s.state) }} style={{ textDecoration: 'none' }}>
        <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '20px', color: '#0f2a1c', marginBottom: '8px' }}>{s.state}</div>
      </Link>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
        <Badge label={s.has_presidential ? (s.presidential_lga_count ? `Pres · ${s.presidential_lga_count} LGAs` : 'Presidential') : 'Pres —'} on={s.has_presidential} />
        <Badge label={s.has_governor ? `Gov · ${s.governor_lga_count} LGAs` : 'Gov —'} on={s.has_governor} />
        {(s.has_senate || s.has_house) && <Badge label={s.has_senate ? `Senate · ${s.senate_count}` : 'Senate —'} on={s.has_senate} />}
        {(s.has_senate || s.has_house) && <Badge label={s.has_house ? `House · ${s.house_count}` : 'House —'} on={s.has_house} />}
      </div>
      {available.length > 0 && (
        <>
          {available.length > 1 && (
            <div style={{ marginBottom: '2px' }}>
              <OfficeSwitch value={office} onChange={setOverride} available={available} size="sm" />
            </div>
          )}
          {totals ? <PartyBars totals={totals} /> : (
            <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '12px', color: '#b3c2b8', padding: '8px 0' }}>No {OFFICES.find((o) => o.key === office)?.label.toLowerCase()} totals captured.</div>
          )}
        </>
      )}
      <Link to="/elections/$year/results/$state" params={{ year, state: stateSlug(s.state) }} style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '12px', color: '#0f8a4a', marginTop: '12px', textDecoration: 'none' }}>View full results →</Link>
    </div>
  )
}

function ResultsIndex() {
  const { year, states, summary } = Route.useLoaderData()
  const future = isFutureElection(year)
  const [globalOffice, setGlobalOffice] = useState<OfficeKey>('presidential')
  const anyGov = states.some((s) => s.has_governor)
  const globalAvail: OfficeKey[] = ['presidential', ...(anyGov ? (['governor'] as const) : [])]

  return (
    <div style={{ minHeight: '100vh', background: '#0d8244', fontFamily: "'Archivo', sans-serif" }}>
      <HomeNav />
      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '26px 40px 0' }}>
        <YearTabs year={year} />
        <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '38px', color: '#fff', margin: '12px 0 8px', letterSpacing: '-0.01em' }}>{year} Election results</h1>
        <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '16px', lineHeight: 1.5, color: '#c7e7d4', margin: '0 0 18px', maxWidth: '62ch' }}>
          {future
            ? `The ${year} general election has not been held yet. Results will appear here local government by local government once votes are declared.`
            : 'The verified results, local government by local government. Open a state to see the presidential and governorship breakdowns.'}
        </p>
        {!future && states.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', paddingBottom: '4px' }}>
            <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '12px', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#9fd9b8' }}>Show all as:</span>
            <OfficeSwitch value={globalOffice} onChange={setGlobalOffice} available={globalAvail} />
          </div>
        )}
      </div>
      <div style={{ background: '#f4f7f2' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '30px 40px 64px' }}>
          {states.length === 0 ? (
            <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
              <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '17px', color: '#0f2a1c', marginBottom: '4px' }}>{future ? `${year} election not held yet` : 'No results yet'}</div>
              <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '14px', color: '#8aa093' }}>{future ? 'Check back after the election.' : 'Results have not been captured for this year.'}</div>
            </div>
          ) : (
            <>
              <SummaryPanel summary={summary} office={globalOffice} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
                {states.map((s) => (
                  <StateCard key={s.geo_id} s={s} year={year} globalOffice={globalOffice} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <HomeFooter />
    </div>
  )
}

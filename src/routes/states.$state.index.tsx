import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { HomeNav } from '../components/HomeNav'
import { HomeFooter } from '../components/HomeFooter'
import { NIGERIA_STATES } from '../nigeriaStates'
import { STATE_BOUNDS } from '../stateBounds'
import { STATE_BY_SLUG, stateSlug, stateGeoId, geoIdFromSlug } from '../stateSlug'
import { politicianSlug } from '../politicianSlug'
import { lgaSlug } from '../lgaSlug'
import { API_BASE } from '../config'

const COLORS: Record<string, string> = { APC: '#1f6fd6', PDP: '#c0392b', LP: '#e05a1f', NNPP: '#f0b429', APGA: '#7b3fb5', SDP: '#0f8a4a', NDC: '#0e7490', ADC: '#db2777' }
const colorOf = (p: string) => COLORS[p] ?? '#8aa093'
const TYPE_LABEL: Record<string, string> = { presidential: 'Presidential', governor: 'Governor', senate: 'Senate' }
const RACES = ['presidential', 'governor', 'senate'] as const

// shared table styles (used across every data table so columns stay uniform)
const rth: React.CSSProperties = { textAlign: 'left', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '10px', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#7a8a99', padding: '8px 12px', whiteSpace: 'nowrap' }
const rtd: React.CSSProperties = { fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '12px', color: '#33414f', padding: '9px 12px', verticalAlign: 'middle' }

function PartyPill({ party }: { party: string }) {
  if (!party) return <span style={{ color: '#c3ccc6' }}>—</span>
  return <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '10px', color: '#fff', background: colorOf(party), padding: '2px 9px', borderRadius: '20px' }}>{party}</span>
}

// The names on each party's 2023 presidential ticket (for the Candidates section).
const PRES_2023: { party: string; name: string }[] = [
  { party: 'APC', name: 'Bola Tinubu' },
  { party: 'PDP', name: 'Atiku Abubakar' },
  { party: 'LP', name: 'Peter Obi' },
  { party: 'NNPP', name: 'Rabiu Kwankwaso' },
]

type Cand = { name: string; party: string; votes?: number | null; sub?: string; politician_id?: number | null }
function CandidateGroup({ title, cands }: { title: string; cands: Cand[] }) {
  if (cands.length === 0) return null
  return (
    <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', padding: '16px 18px' }}>
      <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '11px', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#0f8a4a', marginBottom: '12px' }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {cands.map((c, i) => (
          <div key={c.name + i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '18px', flex: 'none', fontFamily: "'Archivo Black', sans-serif", fontSize: '13px', color: i === 0 ? '#0f8a4a' : '#c3ccc6', textAlign: 'center' }}>{i + 1}</div>
            <div style={{ minWidth: 0, flex: 1 }}>
              {c.politician_id
                ? <Link to="/politician/$id" params={{ id: politicianSlug(c.politician_id, c.name) }} style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '14px', color: i === 0 ? '#0f8a4a' : '#0f2a1c', textDecoration: 'none' }}>{c.name}</Link>
                : <span style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '14px', color: i === 0 ? '#0f8a4a' : '#0f2a1c' }}>{c.name}</span>}
              {c.sub && <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '11px', color: '#8aa093' }}>{c.sub}</div>}
            </div>
            <PartyPill party={c.party} />
            {c.votes != null && <span style={{ width: '76px', textAlign: 'right', flex: 'none', fontFamily: "'Archivo Black', sans-serif", fontSize: '12px', color: i === 0 ? '#0f8a4a' : '#5c6b60' }}>{c.votes.toLocaleString()}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

// One uniform results table: # · Candidate · Party · Votes · %. Percent is taken
// from the row when present, otherwise derived from `total`.
type ResultRow = { name: string; party: string; votes: number; percent?: number | null; politician_id?: number | null }
function ResultTable({ title, note, rows, total }: { title: string; note?: React.ReactNode; rows: ResultRow[]; total?: number }) {
  const sorted = [...rows].sort((a, b) => (b.votes || 0) - (a.votes || 0))
  const denom = total ?? sorted.reduce((s, r) => s + (r.votes || 0), 0)
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '10px', marginBottom: '8px' }}>
        <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '14px', color: '#33414f' }}>{title}</div>
        {note && <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '11px', color: '#7a8a99' }}>{note}</div>}
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '420px' }}>
          <thead>
            <tr style={{ background: '#f4f7fa' }}>
              <th style={{ ...rth, width: '28px' }}>#</th>
              <th style={rth}>Candidate</th>
              <th style={{ ...rth, textAlign: 'center' }}>Party</th>
              <th style={{ ...rth, textAlign: 'right' }}>Votes</th>
              <th style={{ ...rth, textAlign: 'right' }}>%</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r, i) => {
              const pct = r.percent != null ? r.percent : denom ? (r.votes / denom) * 100 : null
              return (
                <tr key={r.name + i} style={{ borderTop: '1px solid #eef2f5', background: i === 0 ? '#f2fbf5' : 'transparent' }}>
                  <td style={{ ...rtd, fontFamily: "'Archivo Black', sans-serif", color: i === 0 ? '#0f8a4a' : '#b3c2b8' }}>{i + 1}</td>
                  <td style={{ ...rtd, fontFamily: "'Archivo Black', sans-serif", color: i === 0 ? '#0f8a4a' : '#33414f' }}>
                    {r.politician_id ? <Link to="/politician/$id" params={{ id: politicianSlug(r.politician_id, r.name) }} style={{ color: 'inherit', textDecoration: 'none' }}>{r.name}</Link> : r.name}
                  </td>
                  <td style={{ ...rtd, textAlign: 'center' }}><PartyPill party={r.party} /></td>
                  <td style={{ ...rtd, textAlign: 'right', fontFamily: "'Archivo Black', sans-serif" }}>{r.votes ? r.votes.toLocaleString() : '—'}</td>
                  <td style={{ ...rtd, textAlign: 'right', color: '#7a8a99' }}>{pct != null ? `${pct.toFixed(1)}%` : '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

type PartyScore = { party: string; score: number }
type BoardPrediction = {
  id: number; source: string; label: string; author_name: string; election_type: string
  leading_party: string; scores: Record<string, number>; notes: string; year: string
}
type BestRun = { year: string; election_type: string; votes: number; percent: number | null; party: string }
type Heavyweight = { id: number; name: string; title: string; party: string; note: string; photo: string; avg_electoral_value: number | null; max_votes: number | null; best_run: BestRun | null; runs_count: number; top_lgas: { lga: string; count: number }[] }
type LgaShape = { lga: string; leader: string; pct: number; cx: number; cy: number; d: string }
type WardPoint = { n: string; l: string; x: number; y: number }
type LgaGeo = { viewBox: string; lgas: LgaShape[]; wards?: WardPoint[] }
type Facts = {
  code: string; capital: string; area_sq_km: number | null; census_1991: number | null; census_2006: number | null; population_projection: number | null
  active_phone_2021: number | null; active_phone_2020: number | null; newly_registered_voters_2022: number | null
  voters_presidential_2019: number | null; buhari_votes_2019: number | null; atiku_votes_2019: number | null
  total_votes_2019: number | null; votes_2023: number | null; nin_total: number | null; nin_male: number | null; nin_female: number | null
}
type GovCand = { name: string; party: string; votes: number; percent?: number | null; running_mate?: string | null; position: number; politician_id?: number | null }
type SenatorRow = { id: number; name: string; state: string; district: string; party: string; gender: string | null; age: number | null; terms: number | null; leadership: string | null; politician_id: number | null; votes_2023: number | null }
type Incumbent = { name: string; state: string; party: string; party_elected: string | null; term_start: string | null; term_end: string | null; politician_id: number | null }
type GovHistItem = { name: string; party: string; term_start: string | null; term_end: string | null; acting: boolean; incumbent: boolean; politician_id: number | null }
type RepRow = { id: number; state: string; constituency: string; name: string; party: string; politician_id: number | null }
type SenateCand = { name: string; party: string; votes: number | null; position: number; politician_id: number | null }
type SenateRace = { district: string; district_short: string; candidates: SenateCand[] }
type Pres23 = { APC: number; PDP: number; LP: number; NNPP: number; others: number; total: number; turnout: number | null; winner: string; politician_ids?: Record<string, number> }
type ModelPred = { id: number; party: string; scores: Record<string, number> }
type DeclaredCand = { id: number; state: string; election_type: string; year: string; party: string; politician_name: string; politician_id: number | null; running_mate: string | null }
type LgaVotes = { lga: string; lga_id: number | null; leading_party: string; scores: Record<string, number>; total_votes: number; year: string }
type LoaderData = {
  state: string; week: string; byRace: Record<string, PartyScore[]>
  predictions: BoardPrediction[]; politicians: Heavyweight[]; lga: LgaGeo | null
  facts: Facts | null; governor: GovCand[]; governor2023: GovCand[]; senators: SenatorRow[]; incumbentGov: Incumbent | null; governorHistory: GovHistItem[]; reps: RepRow[]; pres2023: Pres23 | null
  senate2023: SenateRace[]; modelPred: Record<string, ModelPred>; declaredCandidates2027: DeclaredCand[]; lgaVotes: LgaVotes[]
}

export const Route = createFileRoute('/states/$state/')({
  loader: async ({ params }): Promise<LoaderData> => {
    const state = STATE_BY_SLUG[params.state] ?? decodeURIComponent(params.state)
    const geoId = geoIdFromSlug(params.state) ?? stateGeoId(state) ?? ''
    let week = ''
    let byRace: Record<string, PartyScore[]> = {}
    try {
      const meta = await fetch(`${API_BASE}/api/predictions/meta`).then((r) => r.json())
      week = meta.weeks?.[0] ?? ''
      const entries = await Promise.all(
        RACES.map(async (et) => {
          const rows: { geo_id: string; party: string; score: number }[] = await fetch(
            `${API_BASE}/api/predictions?election_type=${et}&week=${encodeURIComponent(week)}`,
          ).then((r) => r.json())
          const forState = rows
            .filter((r) => r.geo_id === geoId)
            .map((r) => ({ party: r.party, score: r.score }))
            .sort((a, b) => b.score - a.score)
          return [et, forState] as const
        }),
      )
      byRace = Object.fromEntries(entries)
    } catch {
      /* leave empty */
    }
    let predictions: BoardPrediction[] = []
    let politicians: Heavyweight[] = []
    let facts: Facts | null = null
    let governor: GovCand[] = []
    let governor2023: GovCand[] = []
    let senators: SenatorRow[] = []
    let incumbentGov: Incumbent | null = null
    let governorHistory: GovHistItem[] = []
    let reps: RepRow[] = []
    let pres2023: Pres23 | null = null
    let senate2023: SenateRace[] = []
    let modelPred: Record<string, ModelPred> = {}
    let declaredCandidates2027: DeclaredCand[] = []
    let lgaVotes: LgaVotes[] = []
    try {
      const detail = await fetch(`${API_BASE}/api/states/${encodeURIComponent(geoId)}`).then((r) => r.json())
      predictions = detail.predictions ?? []
      politicians = detail.politicians ?? []
      facts = detail.facts ?? null
      governor = detail.governor_2019 ?? []
      governor2023 = detail.governor_2023 ?? []
      senators = detail.senators ?? []
      incumbentGov = detail.governor ?? null
      governorHistory = detail.governor_history ?? []
      reps = detail.reps ?? []
      pres2023 = detail.presidential_2023 ?? null
      senate2023 = detail.senate_2023 ?? []
      modelPred = detail.model_prediction ?? {}
      declaredCandidates2027 = detail.declared_candidates_2027 ?? []
      lgaVotes = detail.lgas ?? []
    } catch {
      /* leave empty */
    }
    let lga: LgaGeo | null = null
    try {
      lga = (await import(`../data/lga/${params.state}.json`)).default as LgaGeo
    } catch {
      lga = null
    }
    return { state, week, byRace, predictions, politicians, lga, facts, governor, governor2023, senators, incumbentGov, governorHistory, reps, pres2023, senate2023, modelPred, declaredCandidates2027, lgaVotes }
  },
  head: ({ params }) => {
    const s = STATE_BY_SLUG[params.state] ?? decodeURIComponent(params.state)
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
  const { state, week, byRace, predictions, politicians, lga, facts, governor, governor2023, senators, incumbentGov, governorHistory, reps, pres2023, senate2023, modelPred, declaredCandidates2027, lgaVotes } = Route.useLoaderData()
  const navigate = useNavigate()
  const [race, setRace] = useState<'presidential' | 'governor'>('presidential')
  const [openRole, setOpenRole] = useState<string | null>(null)
  const toggleRole = (k: string) => setOpenRole((cur) => (cur === k ? null : k))
  const normDistrict = (s: string) => s.toLowerCase().replace(state.toLowerCase(), '').replace(/[^a-z]/g, '')
  const senateRaceFor = (district: string) => senate2023.find((r) => normDistrict(r.district) === normDistrict(district))
  const fmt = (n: number | null | undefined) => (n == null ? '—' : n.toLocaleString())
  const shape = NIGERIA_STATES.find((s) => s.name === state)
  const bounds = STATE_BOUNDS[state]
  // The map is coloured by OUR model's projected winner for the selected race.
  // With no prediction yet the LGAs stay blank.
  const predicted = modelPred[race] ?? null
  const predWinner = predicted?.party || ''
  const fill = predWinner ? colorOf(predWinner) : '#e4ebe5'
  const predId = predicted?.id ?? null

  let viewBox = '0 0 954 734'
  if (bounds) {
    const [x, y, w, h] = bounds
    const pad = Math.max(w, h) * 0.09
    viewBox = `${x - pad} ${y - pad} ${w + pad * 2} ${h + pad * 2}`
  }

  const govTotal = governor.reduce((sum, g) => sum + (g.votes || 0), 0)

  // Biggest LGAs by vote count (2023 presidential, our only LGA-level vote
  // data). LgaResult names are sometimes truncated (e.g. "Essien-U" for
  // "Essien Udim") relative to the map's GeoJSON names, so match by whichever
  // normalized name is a prefix of the other rather than requiring equality.
  const normLga = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')
  const shapeForLga = (name: string): LgaShape | undefined => {
    const n = normLga(name)
    return lga?.lgas.find((l) => { const ln = normLga(l.lga); return ln.startsWith(n) || n.startsWith(ln) })
  }
  const lgaTotalVotes = lgaVotes.reduce((sum, l) => sum + (l.total_votes || 0), 0)
  const top5Lgas = [...lgaVotes].sort((a, b) => b.total_votes - a.total_votes).slice(0, 5)
  const biggestLga = top5Lgas[0]
  const biggestLgaShape = biggestLga ? shapeForLga(biggestLga.lga) : undefined
  const panelStyle: React.CSSProperties = { background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', padding: '16px 18px' }
  const panelTitle: React.CSSProperties = { fontFamily: "'Archivo Black', sans-serif", fontSize: '12px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#8aa093', marginBottom: '4px' }
  const statRow = (label: string, value: string) => (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '10px', padding: '8px 0', borderTop: '1px solid #f2f5f1' }}>
      <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '13px', color: '#5c6b60' }}>{label}</span>
      <span style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '15px', color: '#0f2a1c' }}>{value}</span>
    </div>
  )
  const ptTh: React.CSSProperties = { textAlign: 'left', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '10px', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#7a8a99', padding: '8px 12px', whiteSpace: 'nowrap' }
  const ptTd: React.CSSProperties = { fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '12px', color: '#33414f', padding: '9px 12px', verticalAlign: 'top' }

  return (
    <div style={{ minHeight: '100vh', background: '#f4f7f2', fontFamily: "'Archivo', sans-serif" }}>
      <HomeNav />

      <div style={{ background: '#0d8244' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '30px 40px 26px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
          <div>
            <Link to="/elections/2027/prediction/presidential" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '13px', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#9fd9b8', textDecoration: 'none', marginBottom: '12px' }}>
              ← Back to the map
            </Link>
            <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '38px', color: '#fff', margin: '0 0 6px', letterSpacing: '-0.01em' }}>{state} State 2027 Election Analysis</h1>
            <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '16px', color: '#c7e7d4', margin: 0 }}>
              Projected 2027 results for {state}{week ? ` · ${weekLabel(week)}` : ''}.
            </p>
          </div>
          <Link to="/predictions" style={{ flex: 'none', fontFamily: "'Archivo Black', sans-serif", fontSize: '15px', color: '#0f4a2c', background: '#ffe14d', textDecoration: 'none', padding: '13px 22px', borderRadius: '4px', marginTop: '4px' }}>
            + Add Your Prediction
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '30px 40px 72px' }}>
        <div className="two-col" style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: '28px', alignItems: 'start' }}>
          {/* state map — coloured by OUR model's projected winner for the selected race */}
          <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '12px', padding: '20px' }}>
            {/* Biggest LGAs by vote (2023 presidential) — the only LGA-level vote data we have */}
            {top5Lgas.length > 0 && (
              <div style={{ marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '10px', marginBottom: '8px' }}>
                  <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '12px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#8aa093' }}>
                    Top 5 LGAs by Vote — 2023 Presidential
                  </div>
                  <Link to="/states/$state/lgas" params={{ state: stateSlug(state) }} style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '11px', color: '#0f8a4a', textDecoration: 'none', whiteSpace: 'nowrap' }}>All LGAs →</Link>
                </div>
                <div style={{ border: '1px solid #eef2ee', borderRadius: '8px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f4f7f2' }}>
                        <th style={{ ...ptTh, width: '24px' }}>#</th>
                        <th style={ptTh}>LGA</th>
                        <th style={{ ...ptTh, textAlign: 'center' }}>Leader</th>
                        <th style={{ ...ptTh, textAlign: 'right' }}>Votes</th>
                        <th style={{ ...ptTh, textAlign: 'right' }}>% of state</th>
                      </tr>
                    </thead>
                    <tbody>
                      {top5Lgas.map((l, i) => (
                        <tr key={l.lga} style={{ borderTop: '1px solid #eef2ee' }}>
                          <td style={{ ...ptTd, fontFamily: "'Archivo Black', sans-serif", color: '#b3c2b8' }}>{i + 1}</td>
                          <td style={{ ...ptTd, fontFamily: "'Archivo Black', sans-serif", fontSize: '13px', color: '#0f2a1c' }}>
                            {l.lga_id ? <Link to="/lga/$id" params={{ id: lgaSlug(l.lga_id, l.lga) }} style={{ color: '#0f2a1c', textDecoration: 'none' }}>{l.lga}</Link> : l.lga}
                          </td>
                          <td style={{ ...ptTd, textAlign: 'center' }}><PartyPill party={l.leading_party} /></td>
                          <td style={{ ...ptTd, textAlign: 'right', fontFamily: "'Archivo Black', sans-serif", color: '#0f2a1c' }}>{l.total_votes.toLocaleString()}</td>
                          <td style={{ ...ptTd, textAlign: 'right', fontFamily: "'Archivo Black', sans-serif", color: '#0f8a4a' }}>
                            {lgaTotalVotes > 0 ? `${((l.total_votes / lgaTotalVotes) * 100).toFixed(1)}%` : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* race switcher */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
              {(['presidential', 'governor'] as const).map((r) => {
                const active = race === r
                return (
                  <button key={r} onClick={() => setRace(r)} style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '13px', padding: '8px 16px', borderRadius: '30px', cursor: 'pointer', border: `2px solid ${active ? '#0f8a4a' : '#d7e0d9'}`, background: active ? '#0f8a4a' : '#fff', color: active ? '#fff' : '#5c6b60' }}>{TYPE_LABEL[r]}</button>
                )
              })}
            </div>
            {lga && lga.lgas.length > 0 ? (
              <>
                <svg viewBox={lga.viewBox} width="100%" style={{ display: 'block', maxHeight: '620px' }} role="img" aria-label={`Local governments of ${state} State`}>
                  {lga.lgas.map((l) => (
                    <path key={l.lga} d={l.d} fill={fill} stroke="#111111" strokeWidth={0.7} strokeLinejoin="round">
                      <title>{l.lga}{predWinner ? ` — projected ${predWinner}` : ' — no prediction yet'}</title>
                    </path>
                  ))}
                  {lga.lgas.map((l) => {
                    const words = l.lga.split(/\s+/)
                    const lines = words.length <= 1 ? [l.lga] : [words[0], words.slice(1).join(' ')]
                    const FS = 19
                    return (
                      <text key={`t-${l.lga}`} textAnchor="middle" fontFamily="'Archivo', sans-serif" fontWeight={700} fontSize={FS} fill="#111111" style={{ paintOrder: 'stroke', stroke: '#ffffff', strokeWidth: 1.9, pointerEvents: 'none' }}>
                        {lines.length === 1 ? (
                          <tspan x={l.cx} y={l.cy + FS * 0.34}>{lines[0]}</tspan>
                        ) : (
                          <>
                            <tspan x={l.cx} y={l.cy - FS * 0.16}>{lines[0]}</tspan>
                            <tspan x={l.cx} y={l.cy + FS * 1.02}>{lines[1]}</tspan>
                          </>
                        )}
                      </text>
                    )
                  })}
                  {(lga.wards ?? []).map((w, i) => (
                    <circle key={`w-${i}`} cx={w.x} cy={w.y} r={2.8} fill="#0f2a1c" fillOpacity={0.5} stroke="#ffffff" strokeWidth={0.6}>
                      <title>{w.n} · {w.l}</title>
                    </circle>
                  ))}
                  {/* Biggest LGA by vote (2023 presidential) — blue ring + vote count */}
                  {biggestLgaShape && biggestLga && (
                    <g style={{ pointerEvents: 'none' }}>
                      <circle cx={biggestLgaShape.cx} cy={biggestLgaShape.cy} r={26} fill="none" stroke="#1f6fd6" strokeWidth={3.5}>
                        <title>{biggestLga.lga} — {biggestLga.total_votes.toLocaleString()} votes (biggest LGA)</title>
                      </circle>
                      <text textAnchor="middle" x={biggestLgaShape.cx} y={biggestLgaShape.cy - 34} fontFamily="'Archivo Black', sans-serif" fontWeight={800} fontSize={17} fill="#1f6fd6" style={{ paintOrder: 'stroke', stroke: '#ffffff', strokeWidth: 2.4 }}>
                        {biggestLga.total_votes.toLocaleString()}
                      </text>
                    </g>
                  )}
                </svg>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 16px', justifyContent: 'center', marginTop: '12px' }}>
                  {predWinner ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: colorOf(predWinner), display: 'inline-block' }} />
                      <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '13px', color: '#0f2a1c' }}>Projected: {predWinner}</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#e4ebe5', border: '1px solid #cdd8cf', display: 'inline-block' }} />
                      <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '13px', color: '#8aa093' }}>No prediction yet</span>
                    </div>
                  )}
                  {(lga.wards?.length ?? 0) > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#0f2a1c', opacity: 0.5, border: '1px solid #fff', display: 'inline-block' }} />
                      <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '13px', color: '#0f2a1c' }}>Wards</span>
                    </div>
                  )}
                </div>
                <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '12px', color: '#8aa093', textAlign: 'center', margin: '8px 0 10px' }}>
                  {lga.lgas.length} local governments{(lga.wards?.length ?? 0) > 0 ? ` · ${lga.wards!.length} wards` : ''} — {predWinner ? (
                    <>coloured by our projected {TYPE_LABEL[race].toLowerCase()} winner{predId ? <> · <Link to="/prediction/$id" params={{ id: String(predId) }} style={{ color: '#0f8a4a', fontWeight: 800 }}>see prediction</Link></> : null}.</>
                  ) : (
                    <>no {TYPE_LABEL[race].toLowerCase()} prediction yet — run a model scenario to project this state.</>
                  )}
                </p>
                <div style={{ textAlign: 'center' }}>
                  <Link to="/wards/$state" params={{ state: stateSlug(state) }} style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '14px', color: '#fff', background: '#0f8a4a', textDecoration: 'none', padding: '10px 18px', borderRadius: '6px', display: 'inline-block' }}>
                    View all wards &amp; polling units →
                  </Link>
                </div>
              </>
            ) : shape ? (
              <svg viewBox={viewBox} width="100%" style={{ display: 'block', maxHeight: '460px' }} role="img" aria-label={`Map of ${state} State`}>
                <path d={shape.d} fill={fill} stroke="#ffffff" strokeWidth={1.2} strokeLinejoin="round" />
              </svg>
            ) : (
              <div style={{ padding: '60px', textAlign: 'center', fontFamily: "'Archivo', sans-serif", fontWeight: 700, color: '#8aa093' }}>Map unavailable for this state.</div>
            )}
          </div>

          {/* statistics panel */}
          {facts ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ ...panelStyle, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '20px', color: '#0f2a1c', lineHeight: 1.1 }}>{facts.capital || '—'}</div>
                  <div style={panelTitle}>Capital</div>
                </div>
                <div>
                  <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '20px', color: '#0f2a1c', lineHeight: 1.1 }}>{facts.code || '—'}</div>
                  <div style={panelTitle}>State code</div>
                </div>
              </div>

              <div style={panelStyle}>
                <div style={panelTitle}>Voters &amp; votes</div>
                {statRow('Presidential votes · 2023', fmt(facts.votes_2023))}
                {statRow('Registered voters · 2019', fmt(facts.voters_presidential_2019))}
                {statRow('Presidential votes · 2019', fmt(facts.total_votes_2019 ?? (((facts.buhari_votes_2019 ?? 0) + (facts.atiku_votes_2019 ?? 0)) || null)))}
                {statRow('Governorship votes · 2019', govTotal ? govTotal.toLocaleString() : '—')}
              </div>

              <div style={panelStyle}>
                <div style={panelTitle}>Population statistics</div>
                {statRow('Active phone lines · 2021', fmt(facts.active_phone_2021))}
                {statRow('Active phone lines · 2020', fmt(facts.active_phone_2020))}
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '10px', padding: '8px 0', borderTop: '1px solid #f2f5f1' }}>
                  <div>
                    <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '13px', color: '#5c6b60' }}>NIN enrolment</div>
                    <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '10px', color: '#b3c2b8' }}>Male {fmt(facts.nin_male)} · Female {fmt(facts.nin_female)}</div>
                  </div>
                  <span style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '15px', color: '#0f2a1c' }}>{fmt(facts.nin_total)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div />
          )}
        </div>

        {/* 2027 Election Trend — our prediction */}
        <div style={{ marginTop: '38px' }}>
          <h2 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '24px', color: '#0f2a1c', margin: '0 0 4px' }}>2027 Election Trend</h2>
          <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '15px', color: '#5c6b60', margin: '0 0 18px' }}>Our crowd-sourced prediction for {state}{week ? ` · ${weekLabel(week)}` : ''}.</p>
          {!RACES.some((et) => (byRace[et] ?? []).length > 0) ? (
            <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', padding: '28px 22px', textAlign: 'center' }}>
              <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '15px', color: '#0f2a1c', marginBottom: '4px' }}>No forecast published yet</div>
              <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '13px', color: '#8aa093' }}>A {state} projection will show here once contributor analyses are aggregated.</div>
            </div>
          ) : (
          <div className="two-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {RACES.map((et) => {
              const rows = byRace[et] ?? []
              return (
                <div key={et} style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', padding: '18px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '10px', marginBottom: '12px' }}>
                    <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '16px', color: '#0f2a1c' }}>{TYPE_LABEL[et]}</div>
                    {rows[0] && <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '12px', color: '#fff', background: colorOf(rows[0].party), padding: '3px 10px', borderRadius: '20px' }}>{rows[0].party}</div>}
                  </div>
                  {rows.length === 0 ? (
                    <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '13px', color: '#b3c2b8' }}>No data.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                      {rows.map((r) => (
                        <div key={r.party} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '44px', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '10px', color: '#fff', background: colorOf(r.party), padding: '3px 0', borderRadius: '4px', textAlign: 'center', flex: 'none' }}>{r.party}</span>
                          <div style={{ flex: 1, height: '7px', borderRadius: '4px', background: '#eef2ee', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${Math.min(100, Math.round(r.score))}%`, background: colorOf(r.party) }} />
                          </div>
                          <span style={{ width: '34px', textAlign: 'right', fontFamily: "'Archivo Black', sans-serif", fontSize: '11px', color: '#5c6b60', flex: 'none' }}>{Math.round(r.score)}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          )}
        </div>

        {/* 2027 — declared candidates (not results; nothing has happened yet). Shown
            first: these are the candidates people expect to see, not history. */}
        {declaredCandidates2027.length > 0 && (() => {
          const pres2027: Cand[] = declaredCandidates2027
            .filter((c) => c.election_type === 'presidential')
            .map((c) => ({ name: c.politician_name, party: c.party, politician_id: c.politician_id ?? undefined }))
          const gov2027: Cand[] = declaredCandidates2027
            .filter((c) => c.election_type === 'governor')
            .map((c) => ({ name: c.politician_name, party: c.party, politician_id: c.politician_id ?? undefined }))
          return (
            <div style={{ marginTop: '38px' }}>
              <h2 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '24px', color: '#0f2a1c', margin: '0 0 4px' }}>2027 Declared Candidates</h2>
              <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '15px', color: '#5c6b60', margin: '0 0 18px' }}>Who's running so far — not a result, the election hasn't happened yet.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', alignItems: 'start' }}>
                <CandidateGroup title="Presidential · 2027" cands={pres2027} />
                <CandidateGroup title="Governor · 2027" cands={gov2027} />
              </div>
            </div>
          )
        })()}

        {/* Candidates — the leading contenders for each office, from the last election */}
        {(pres2023 || governor2023.length > 0 || senate2023.length > 0) && (() => {
          const presCands: Cand[] = pres2023
            ? PRES_2023.map((p) => ({ name: p.name, party: p.party, votes: (pres2023 as Pres23)[p.party as 'APC' | 'PDP' | 'LP' | 'NNPP'], politician_id: pres2023.politician_ids?.[p.party] }))
                .sort((a, b) => (b.votes || 0) - (a.votes || 0))
            : []
          const govCands: Cand[] = [...governor2023]
            .sort((a, b) => (b.votes || 0) - (a.votes || 0))
            .slice(0, 4)
            .map((g) => ({ name: g.name, party: g.party, votes: g.votes, politician_id: g.politician_id }))
          const senCands: Cand[] = senate2023.flatMap((r) => {
            const win = [...r.candidates].sort((a, b) => a.position - b.position)[0]
            return win ? [{ name: win.name, party: win.party, votes: win.votes, sub: r.district_short, politician_id: win.politician_id }] : []
          })
          return (
            <div style={{ marginTop: '38px' }}>
              <h2 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '24px', color: '#0f2a1c', margin: '0 0 4px' }}>Historical Candidates · 2023</h2>
              <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '15px', color: '#5c6b60', margin: '0 0 18px' }}>The leading candidates for each office in {state}, from the most recent election.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', alignItems: 'start' }}>
                <CandidateGroup title="Presidential · 2023" cands={presCands} />
                <CandidateGroup title="Governor · 2023" cands={govCands} />
                <CandidateGroup title="Senatorial · 2023" cands={senCands} />
              </div>
            </div>
          )
        })()}

        {/* Incumbents — current office-holders, each expandable to that role's history */}
        {(incumbentGov || senators.length > 0) && (() => {
          const NameCell = ({ name, pid }: { name: string; pid: number | null }) =>
            pid ? <Link to="/politician/$id" params={{ id: politicianSlug(pid, name) }} style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '13px', color: '#0f2a1c', textDecoration: 'none' }}>{name}</Link>
                : <span style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '13px', color: '#0f2a1c' }}>{name}</span>
          const officeCell = (office: string, term: string) => (
            <td style={{ ...rtd, minWidth: '130px' }}>
              <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '13px', color: '#0f2a1c' }}>{office}</div>
              <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '11px', color: '#8aa093' }}>{term}</div>
            </td>
          )
          const chevron = (open: boolean, hasDetail: boolean) => (
            <td style={{ ...rtd, textAlign: 'right', color: hasDetail ? '#5c6b60' : '#d3dce5', width: '30px' }}>{hasDetail ? (open ? '▾' : '▸') : ''}</td>
          )
          return (
            <div style={{ marginTop: '38px' }}>
              <h2 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '24px', color: '#0f2a1c', margin: '0 0 4px' }}>Incumbents</h2>
              <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '15px', color: '#5c6b60', margin: '0 0 18px' }}>The people currently holding {state} State's top elective offices — tap a row for the history of that seat.</p>
              <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '460px' }}>
                  <thead><tr style={{ background: '#f4f7f2' }}><th style={rth}>Office</th><th style={rth}>Name</th><th style={{ ...rth, textAlign: 'center' }}>Party</th><th style={rth}></th></tr></thead>
                  {incumbentGov && (() => {
                    const g = incumbentGov
                    const key = 'gov'
                    const open = openRole === key
                    const hasHist = governorHistory.length > 0
                    return (
                      <tbody>
                        <tr onClick={() => hasHist && toggleRole(key)} className="n2row" style={{ borderTop: '1px solid #eef2ee', cursor: hasHist ? 'pointer' : 'default' }}>
                          {officeCell('Governor', `${g.term_start}–${g.term_end}`)}
                          <td style={rtd}><NameCell name={g.name} pid={g.politician_id} /></td>
                          <td style={{ ...rtd, textAlign: 'center' }}><PartyPill party={g.party} />{g.party_elected && <span style={{ marginLeft: '6px', fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '10px', color: '#8aa093' }}>elected {g.party_elected}</span>}</td>
                          {chevron(open, hasHist)}
                        </tr>
                        {open && hasHist && (
                          <tr style={{ background: '#f9fbf8' }}>
                            <td colSpan={4} style={{ padding: '4px 12px 14px' }}>
                              <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '10px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#8aa093', margin: '8px 0 6px' }}>Governors since 2007</div>
                              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead><tr><th style={rth}>Term</th><th style={rth}>Name</th><th style={{ ...rth, textAlign: 'center' }}>Party</th></tr></thead>
                                <tbody>
                                  {governorHistory.map((h, i) => (
                                    <tr key={h.name + h.term_start + i} style={{ borderTop: '1px solid #eef2ee' }}>
                                      <td style={{ ...rtd, fontFamily: "'Archivo Black', sans-serif", color: h.incumbent ? '#0f8a4a' : '#5c6b60', whiteSpace: 'nowrap' }}>{h.term_start}–{h.term_end === 'present' ? 'now' : h.term_end}{h.acting && <span style={{ marginLeft: '6px', fontWeight: 700, fontSize: '9px', textTransform: 'uppercase', color: '#8aa093' }}>acting</span>}</td>
                                      <td style={rtd}><NameCell name={h.name} pid={h.politician_id} /></td>
                                      <td style={{ ...rtd, textAlign: 'center' }}><PartyPill party={h.party} /></td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    )
                  })()}
                  {senators.map((s) => {
                    const key = `sen-${s.id}`
                    const open = openRole === key
                    const race = senateRaceFor(s.district)
                    const hasHist = !!race && race.candidates.length > 0
                    return (
                      <tbody key={s.id}>
                        <tr onClick={() => hasHist && toggleRole(key)} className="n2row" style={{ borderTop: '1px solid #eef2ee', cursor: hasHist ? 'pointer' : 'default' }}>
                          {officeCell(`Senator · ${s.district}`, '2023–2027')}
                          <td style={rtd}>
                            <NameCell name={s.name} pid={s.politician_id} />
                            {s.leadership && <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '10px', color: '#c0392b' }}>{s.leadership}</div>}
                          </td>
                          <td style={{ ...rtd, textAlign: 'center' }}><PartyPill party={s.party} /></td>
                          {chevron(open, hasHist)}
                        </tr>
                        {open && race && (
                          <tr style={{ background: '#f9fbf8' }}>
                            <td colSpan={4} style={{ padding: '4px 12px 14px' }}>
                              <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '10px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#8aa093', margin: '8px 0 6px' }}>2023 senatorial election · {race.district_short || s.district}</div>
                              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead><tr><th style={{ ...rth, width: '28px' }}>#</th><th style={rth}>Candidate</th><th style={{ ...rth, textAlign: 'center' }}>Party</th><th style={{ ...rth, textAlign: 'right' }}>Votes</th></tr></thead>
                                <tbody>
                                  {[...race.candidates].sort((a, b) => a.position - b.position).map((c, i) => (
                                    <tr key={c.name + i} style={{ borderTop: '1px solid #eef2ee', background: c.position === 1 ? '#f2fbf5' : 'transparent' }}>
                                      <td style={{ ...rtd, fontFamily: "'Archivo Black', sans-serif", color: c.position === 1 ? '#0f8a4a' : '#b3c2b8' }}>{c.position || i + 1}</td>
                                      <td style={rtd}><NameCell name={c.name} pid={c.politician_id} /></td>
                                      <td style={{ ...rtd, textAlign: 'center' }}><PartyPill party={c.party} /></td>
                                      <td style={{ ...rtd, textAlign: 'right', fontFamily: "'Archivo Black', sans-serif" }}>{c.votes ? c.votes.toLocaleString() : '—'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    )
                  })}
                </table>
              </div>
            </div>
          )
        })()}

        {/* House of Representatives */}
        {reps.length > 0 && (
          <div style={{ marginTop: '38px' }}>
            <h2 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '24px', color: '#0f2a1c', margin: '0 0 4px' }}>House of Representatives</h2>
            <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '15px', color: '#5c6b60', margin: '0 0 18px' }}>{state}'s members in the 10th National Assembly (2023–2027), by federal constituency.</p>
            <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '440px' }}>
                <thead><tr style={{ background: '#f4f7f2' }}><th style={ptTh}>Constituency</th><th style={ptTh}>Member</th><th style={{ ...ptTh, textAlign: 'center' }}>Party</th></tr></thead>
                <tbody>
                  {reps.map((r) => (
                    <tr key={r.id} style={{ borderTop: '1px solid #eef2ee' }}>
                      <td style={ptTd}>{r.constituency}</td>
                      <td style={{ ...ptTd, fontFamily: "'Archivo Black', sans-serif" }}>
                        {r.politician_id
                          ? <Link to="/politician/$id" params={{ id: politicianSlug(r.politician_id, r.name) }} style={{ color: '#0f2a1c', textDecoration: 'none' }}>{r.name}</Link>
                          : r.name}
                      </td>
                      <td style={{ ...ptTd, textAlign: 'center' }}>{r.party ? <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '10px', color: '#fff', background: colorOf(r.party), padding: '2px 9px', borderRadius: '20px' }}>{r.party}</span> : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2027 Heavyweight Politicians — table, ranked by votes they can pull */}
        <div style={{ marginTop: '38px' }}>
          <h2 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '24px', color: '#0f2a1c', margin: '0 0 4px' }}>2027 Heavyweight Politicians</h2>
          <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '15px', color: '#5c6b60', margin: '0 0 4px' }}>Ranked by the most votes we know they can pull — tap a row for their full vote history.</p>
          <div style={{ marginBottom: '18px' }}>
            <Link to="/states/$state/politicians" params={{ state: stateSlug(state) }} style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '13px', color: '#0f8a4a', textDecoration: 'none' }}>
              View every politician in {state} (including minor candidates) →
            </Link>
          </div>
          {politicians.length > 0 && (
            <>
            <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '620px' }}>
                <thead>
                  <tr style={{ background: '#f4f7f2' }}>
                    <th style={{ ...rth, width: '28px' }}>#</th>
                    <th style={rth}>Politician</th>
                    <th style={{ ...rth, textAlign: 'center' }}>Party</th>
                    <th style={{ ...rth, textAlign: 'right' }}>Votes can pull</th>
                    <th style={rth}>Peak run</th>
                    <th style={rth}>Strongest LGAs</th>
                  </tr>
                </thead>
                <tbody>
                  {[...politicians].sort((a, b) => (b.max_votes || 0) - (a.max_votes || 0)).map((pol, i) => (
                    <tr key={pol.id} onClick={() => navigate({ to: '/politician/$id', params: { id: politicianSlug(pol.id, pol.name) } })} className="n2row" style={{ borderTop: '1px solid #eef2ee', cursor: 'pointer' }}>
                      <td style={{ ...rtd, fontFamily: "'Archivo Black', sans-serif", color: '#b3c2b8' }}>{i + 1}</td>
                      <td style={rtd}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {pol.photo ? (
                            <img src={pol.photo} alt={pol.name} style={{ width: '34px', height: '34px', flex: 'none', borderRadius: '50%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '34px', height: '34px', flex: 'none', borderRadius: '50%', background: colorOf(pol.party), color: '#fff', fontFamily: "'Archivo Black', sans-serif", fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{pol.name.split(/\s+/).map((w) => w[0]).slice(0, 2).join('')}</div>
                          )}
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '13px', color: '#0f2a1c' }}>{pol.name}</div>
                            {pol.title && <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '11px', color: '#8aa093' }}>{pol.title}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ ...rtd, textAlign: 'center' }}><PartyPill party={pol.party} /></td>
                      <td style={{ ...rtd, textAlign: 'right' }}>
                        {pol.max_votes != null
                          ? <span style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '14px', color: '#0f8a4a' }}>{pol.max_votes.toLocaleString()}</span>
                          : <span style={{ color: '#b3c2b8' }}>—</span>}
                      </td>
                      <td style={{ ...rtd, color: '#8aa093', fontWeight: 700 }}>
                        {pol.best_run
                          ? <>{pol.best_run.year} {TYPE_LABEL[pol.best_run.election_type] ?? pol.best_run.election_type}{pol.best_run.percent != null ? ` · ${pol.best_run.percent}%` : ''}{pol.runs_count > 1 ? ` · ${pol.runs_count} runs` : ''}</>
                          : '—'}
                      </td>
                      <td style={rtd}>
                        {pol.top_lgas.length > 0 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {pol.top_lgas.slice(0, 3).map((l) => (
                              <span key={l.lga} style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '10px', color: '#0f4a2c', background: '#e7f3ec', padding: '2px 8px', borderRadius: '20px' }}>{l.lga}</span>
                            ))}
                          </div>
                        ) : <span style={{ color: '#b3c2b8' }}>—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </>
          )}
        </div>

        {/* Political data — the source data our prediction is built from */}
        <div style={{ marginTop: '44px', background: '#e9eef3', border: '1px solid #d3dce5', borderRadius: '14px', padding: '20px 22px' }}>
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7a8a99' }}>Underlying source data</div>
            <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '17px', color: '#33414f', margin: '2px 0 2px' }}>Political Data for {state} State</div>
            <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '12px', color: '#7a8a99', margin: 0 }}>The past results and contributor inputs the 2027 prediction above is built from.</p>
          </div>
          <div style={{ background: '#fff', border: '1px solid #d3dce5', borderRadius: '10px', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {(() => {
              const tables: React.ReactNode[] = []
              if (pres2023) tables.push(
                <ResultTable key="p23" title="2023 Presidential"
                  note={pres2023.turnout != null ? `${pres2023.total.toLocaleString()} votes · ${pres2023.turnout}% turnout` : undefined}
                  total={pres2023.total}
                  rows={[
                    { name: 'Tinubu / Shettima', party: 'APC', votes: pres2023.APC },
                    { name: 'Atiku / Okowa', party: 'PDP', votes: pres2023.PDP },
                    { name: 'Obi / Baba-Ahmed', party: 'LP', votes: pres2023.LP },
                    { name: 'Kwankwaso / Idahosa', party: 'NNPP', votes: pres2023.NNPP },
                  ]} />,
              )
              if (facts && (facts.buhari_votes_2019 != null || facts.atiku_votes_2019 != null)) tables.push(
                <ResultTable key="p19" title="2019 Presidential"
                  total={facts.total_votes_2019 ?? undefined}
                  rows={[
                    { name: 'Buhari / Osinbajo', party: 'APC', votes: facts.buhari_votes_2019 ?? 0 },
                    { name: 'Atiku / Obi', party: 'PDP', votes: facts.atiku_votes_2019 ?? 0 },
                  ]} />,
              )
              if (governor2023.length > 0) tables.push(
                <ResultTable key="g23" title="2023 Governorship"
                  rows={governor2023.map((g) => ({ name: g.name, party: g.party, votes: g.votes, percent: g.percent, politician_id: g.politician_id }))} />,
              )
              if (governor.length > 0) tables.push(
                <ResultTable key="g19" title="2019 Governorship"
                  rows={governor.map((g) => ({ name: g.name, party: g.party, votes: g.votes, percent: g.percent, politician_id: g.politician_id }))} />,
              )
              if (tables.length === 0) return <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '13px', color: '#8aa093' }}>No source data on record yet.</div>
              return tables.map((t, i) => (
                <div key={i} style={i > 0 ? { borderTop: '1px solid #eef2ee', paddingTop: '16px' } : undefined}>{t}</div>
              ))
            })()}

          </div>

        {/* Predictions on record — compact table */}
        <div style={{ marginTop: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '10px' }}>
            <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '15px', color: '#33414f' }}>Predictions on record</div>
            <Link to="/predictions" style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '12px', color: '#0f8a4a', textDecoration: 'none' }}>+ Add your prediction</Link>
          </div>
          {predictions.length === 0 ? (
            <div style={{ background: '#fff', border: '1px solid #d3dce5', borderRadius: '8px', padding: '20px', textAlign: 'center', fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '13px', color: '#8aa093' }}>No predictions yet for {state}.</div>
          ) : (
            <div style={{ background: '#fff', border: '1px solid #d3dce5', borderRadius: '8px', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '580px' }}>
                <thead>
                  <tr style={{ background: '#f4f7fa' }}>
                    <th style={ptTh}>Source</th>
                    <th style={ptTh}>Race</th>
                    <th style={ptTh}>By</th>
                    <th style={{ ...ptTh, textAlign: 'center' }}>Leads</th>
                    <th style={ptTh}></th>
                  </tr>
                </thead>
                <tbody>
                  {predictions.map((p) => {
                    const isModel = p.source === 'model'
                    return (
                      <tr key={p.id} onClick={() => navigate({ to: '/prediction/$id', params: { id: String(p.id) } })} className="n2row" style={{ borderTop: '1px solid #eef2f5', cursor: 'pointer' }}>
                        <td style={ptTd}><span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '10px', color: '#fff', background: isModel ? '#1f6fd6' : '#0f8a4a', padding: '2px 8px', borderRadius: '20px', whiteSpace: 'nowrap' }}>{isModel ? 'Model' : 'Expert'}</span></td>
                        <td style={ptTd}>{TYPE_LABEL[p.election_type] ?? p.election_type}</td>
                        <td style={ptTd}>{p.label || p.author_name}</td>
                        <td style={{ ...ptTd, textAlign: 'center' }}>{p.leading_party ? <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '10px', color: '#fff', background: colorOf(p.leading_party), padding: '2px 8px', borderRadius: '20px' }}>{p.leading_party}</span> : '—'}</td>
                        <td style={{ ...ptTd, color: '#0f8a4a', fontWeight: 800, whiteSpace: 'nowrap' }}>View →</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        </div>

        <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '13px', color: '#8aa093', margin: '32px 0 0' }}>
          Illustrative projections aggregated from contributor traces. See our{' '}
          <Link to="/methodology" style={{ color: '#0f8a4a', fontWeight: 800 }}>methodology</Link>.
        </p>
      </div>

      <HomeFooter />
    </div>
  )
}

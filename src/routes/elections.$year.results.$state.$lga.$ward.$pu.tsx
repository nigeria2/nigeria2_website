import { useEffect, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { HomeNav } from '../components/HomeNav'
import { HomeFooter } from '../components/HomeFooter'
import { API_BASE } from '../config'
import { STATE_BY_SLUG } from '../stateSlug'

const COLORS: Record<string, string> = {
  APC: '#1f6fd6', PDP: '#c0392b', LP: '#e05a1f', NNPP: '#f0b429', APGA: '#7b3fb5', SDP: '#0f8a4a',
  NDC: '#0e7490', ADC: '#db2777', YPP: '#0aa2c0', PRP: '#6d28d9',
}
const colorOf = (p: string) => COLORS[p] ?? '#8aa093'
const RACE_LABEL: Record<string, string> = { presidential: 'Presidential', governor: 'Governorship', governorship: 'Governorship', senate: 'Senate', senatorial: 'Senate', house: 'House of Reps' }

type ResultItem = {
  election_type: string; year: string; winner: string; runner_up: string
  total_votes: number; valid_votes: number | null; registered_voters: number | null
  source: string; method: string; parties: Record<string, number>
}
type PartyRow = { party?: string; votes?: number | null; votes_words?: string; votes_figures?: string; votes_in_words?: string }
type EvidenceItem = {
  id: number | null; election_type: string; year: string; kind: string; source: string; method: string
  created_at?: string | null; poll_summary?: Record<string, unknown>; party_results?: PartyRow[]; source_image?: string
}
type Sheet = { election_type: string; year: string; sheet_url: string; status: string }
type Detail = {
  pu_code: string; pu_name: string; ward: string; ward_code: string; lga: string; lga_id: number | null
  state: string; state_geo: string | null; registered_voters: number | null
  result: ResultItem[]; sheets: Sheet[]; evidence: EvidenceItem[]
}

const KIND_LABEL: Record<string, string> = { '2023_transcription': '2023 transcription', inec: 'INEC reported', llm: 'LLM transcription', human: 'Human transcription', crowd: 'Crowd submission' }
const KIND_COLOR: Record<string, string> = { '2023_transcription': '#1f6fd6', inec: '#0f8a4a', llm: '#7a4bd0', human: '#0e7490', crowd: '#e05a1f' }

export const Route = createFileRoute('/elections/$year/results/$state/$lga/$ward/$pu')({
  head: ({ params }) => ({ meta: [{ title: `${STATE_BY_SLUG[params.state] ?? 'State'} — polling unit ${params.pu}, ${params.year} | Nigeria 2.0` }] }),
  component: PollingUnitPage,
})

const card: React.CSSProperties = { background: '#fff', border: '1px solid #dbe4dc', borderRadius: '12px', padding: '20px 22px', marginBottom: '18px' }
const sheetTh: React.CSSProperties = { textAlign: 'left', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '11px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#5c6b60', padding: '10px 14px', whiteSpace: 'nowrap' }
const sheetTd: React.CSSProperties = { fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '13px', color: '#0f2a1c', padding: '10px 14px', whiteSpace: 'nowrap' }
const evTh: React.CSSProperties = { textAlign: 'left', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '11px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#5c6b60', padding: '10px 12px', whiteSpace: 'nowrap' }
const evTd: React.CSSProperties = { fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '13px', color: '#0f2a1c', padding: '9px 12px', whiteSpace: 'nowrap' }

/** Read a poll-summary figure regardless of whether it came from the unified schema
 *  (registered_voters, accredited_voters, valid_votes, …) or the legacy EC8A JSON
 *  (1_registered_voters, 2_accredited_voters, 7_total_valid_votes, …). */
function summaryVal(s: Record<string, unknown> | undefined, ...keys: string[]): string {
  if (!s) return ''
  for (const k of keys) {
    const v = s[k]
    if (v != null && v !== '') return String(v)
  }
  return ''
}

function partyVotes(row: PartyRow): { figure: string; words: string } {
  const fig = row.votes != null ? String(row.votes) : (row.votes_figures ?? '')
  const words = row.votes_words ?? row.votes_in_words ?? ''
  return { figure: (fig ?? '').trim(), words: (words ?? '').trim() }
}

/** Humanise the raw sheet download-outcome status into a user-facing label + colour.
 *  saved/have = we successfully have the scan; no_sheet = INEC had none; dead = broken URL;
 *  jpeg_fail/deferred = we haven't managed to fetch it yet. */
function sheetStatus(status: string, url: string): { label: string; fg: string; bg: string; bd: string } {
  const ok = { fg: '#0f6a38', bg: '#e3f5ea', bd: '#bfe6cd' }
  const warn = { fg: '#b45309', bg: '#fdf0dc', bd: '#f0d9ac' }
  const grey = { fg: '#5c6b60', bg: '#eef2ee', bd: '#dbe4dc' }
  switch ((status || '').toLowerCase()) {
    case 'saved':
    case 'have':
    case 'ok':
      return { label: 'Available', ...ok }
    case 'dead':
      return { label: 'Broken link', ...warn }
    case 'no_sheet':
      return { label: 'No sheet', ...grey }
    case 'jpeg_fail':
    case 'deferred':
      return { label: 'Not fetched', ...warn }
    default:
      return url ? { label: 'Available', ...ok } : { label: 'No sheet', ...grey }
  }
}

function ResultCard({ d }: { d: ResultItem }) {
  const ranked = Object.entries(d.parties).filter(([, v]) => v != null).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
  const max = Math.max(1, ...ranked.map(([, v]) => v ?? 0))
  return (
    <div style={card}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
        <span style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '13px', color: '#0f2a1c', background: '#ffe14d', padding: '4px 12px', borderRadius: '20px' }}>{RACE_LABEL[d.election_type] ?? d.election_type} · {d.year}</span>
        {d.winner && <span style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '15px', color: '#fff', background: colorOf(d.winner), padding: '5px 14px', borderRadius: '8px' }}>{d.winner}</span>}
      </div>
      <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', marginBottom: '12px' }}>
        {d.registered_voters != null && <Stat label="Registered" value={d.registered_voters} />}
        {d.valid_votes != null && <Stat label="Valid votes" value={d.valid_votes} />}
        <Stat label="Total" value={d.total_votes} />
      </div>
      {ranked.length === 0 ? (
        <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '13px', color: '#8aa093' }}>Summary only — no party-by-party breakdown recorded.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
          {ranked.map(([p, v]) => (
            <div key={p} style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
              <span style={{ width: '56px', flex: 'none', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '11px', color: '#fff', background: colorOf(p), padding: '3px 0', borderRadius: '4px', textAlign: 'center' }}>{p}</span>
              <div style={{ flex: 1, height: '12px', borderRadius: '4px', background: '#eef2ee', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.round(((v ?? 0) / max) * 100)}%`, background: colorOf(p) }} />
              </div>
              <span style={{ width: '84px', textAlign: 'right', flex: 'none', fontFamily: "'Archivo Black', sans-serif", fontSize: '12px', color: '#5c6b60' }}>{(v ?? 0).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '10px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#8aa093' }}>{label}</div>
      <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '18px', color: '#0f2a1c' }}>{value.toLocaleString()}</div>
    </div>
  )
}

const EVIDENCE_PARTIES = ['APC', 'LP', 'PDP', 'NNPP'] as const

/** All evidence for a unit in one table — one row per entry. */
function EvidenceTable({ items }: { items: EvidenceItem[] }) {
  const partyMap = (t: EvidenceItem): Record<string, string> => {
    const m: Record<string, string> = {}
    for (const p of t.party_results ?? []) {
      const key = (p.party ?? '').trim()
      if (key) m[key] = partyVotes(p).figure
    }
    return m
  }
  return (
    <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '760px' }}>
        <thead>
          <tr style={{ background: '#f4f7f2' }}>
            <th style={evTh}>Kind</th>
            <th style={evTh}>Election</th>
            {EVIDENCE_PARTIES.map((p) => (
              <th key={p} style={{ ...evTh, textAlign: 'right', color: colorOf(p) }}>{p}</th>
            ))}
            <th style={{ ...evTh, textAlign: 'right' }}>Registered</th>
            <th style={{ ...evTh, textAlign: 'right' }}>Accredited</th>
            <th style={evTh}>Source</th>
          </tr>
        </thead>
        <tbody>
          {items.map((t, i) => {
            const m = partyMap(t)
            const reg = summaryVal(t.poll_summary, 'registered_voters', '1_registered_voters')
            const acc = summaryVal(t.poll_summary, 'accredited_voters', '2_accredited_voters')
            const kindColor = KIND_COLOR[t.kind] ?? '#7a4bd0'
            return (
              <tr key={t.id ?? i} style={{ borderTop: '1px solid #eef2ee' }}>
                <td style={evTd}>
                  <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '11px', color: '#fff', background: kindColor, padding: '3px 9px', borderRadius: '20px' }}>{KIND_LABEL[t.kind] ?? t.kind}</span>
                </td>
                <td style={evTd}>{RACE_LABEL[t.election_type] ?? t.election_type}</td>
                {EVIDENCE_PARTIES.map((p) => (
                  <td key={p} style={{ ...evTd, textAlign: 'right', fontFamily: "'Archivo Black', sans-serif", color: m[p] != null && m[p] !== '' ? '#0f2a1c' : '#c3ccc6' }}>{m[p] != null && m[p] !== '' ? Number(m[p]).toLocaleString() : '—'}</td>
                ))}
                <td style={{ ...evTd, textAlign: 'right', fontFamily: "'Archivo Black', sans-serif" }}>{reg ? Number(reg).toLocaleString() : '—'}</td>
                <td style={{ ...evTd, textAlign: 'right', fontFamily: "'Archivo Black', sans-serif", color: acc ? '#0f2a1c' : '#c3ccc6' }}>{acc ? Number(acc).toLocaleString() : '—'}</td>
                <td style={{ ...evTd, color: '#8aa093' }}>{t.source || '—'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}


function PollingUnitPage() {
  const { year, state, lga, ward, pu } = Route.useParams()
  const [d, setD] = useState<Detail | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setD(null); setFailed(false)
    // The URL carries the ward code (03-01-01) and the PU's own number (005); the full
    // pu_code is ward + "/" + pu. (Older links passed the whole code, e.g. 03-01-01-005 —
    // still handled by stripping the ward prefix.)
    const wardCode = ward.replace(/-/g, '/')
    const puNum = pu.replace(/-/g, '/').replace(new RegExp('^' + wardCode + '/?'), '')
    const puCode = `${wardCode}/${puNum}`
    fetch(`${API_BASE}/api/polling-units/${puCode}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: Detail) => setD(data))
      .catch(() => setFailed(true))
  }, [pu, ward])

  return (
    <div style={{ minHeight: '100vh', background: '#f4f7f2', fontFamily: "'Archivo', sans-serif" }}>
      <HomeNav />
      <div style={{ background: '#0d8244' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '30px 40px 26px' }}>
          <Link to="/elections/$year/results/$state/$lga/$ward" params={{ year, state, lga, ward }} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '13px', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#9fd9b8', textDecoration: 'none', marginBottom: '12px' }}>
            ← {d?.ward || 'Ward'} · polling units
          </Link>
          <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '30px', color: '#fff', margin: '0 0 6px', textTransform: 'capitalize' }}>{d ? (d.pu_name || d.pu_code) : 'Loading…'}</h1>
          <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '14px', color: '#c7e7d4', margin: 0 }}>
            {d ? `${d.lga} · ${d.ward}` : ''}{d ? <span style={{ fontFamily: 'monospace', marginLeft: '8px', color: '#9fd9b8' }}>{d.pu_code}</span> : ''}
            {d?.registered_voters != null ? ` · ${d.registered_voters.toLocaleString()} registered` : ''}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '26px 40px 72px' }}>
        {failed ? (
          <div style={{ ...card, textAlign: 'center', color: '#8aa093', fontWeight: 700 }}>No data captured for this polling unit yet.</div>
        ) : !d ? (
          <div style={{ padding: '60px', textAlign: 'center', fontFamily: "'Archivo Black', sans-serif", color: '#8aa093' }}>Loading…</div>
        ) : (
          <>
            {/* the unit's result per election — a merge of the evidence, not a "definitive" */}
            <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '15px', color: '#0f2a1c', margin: '4px 0 12px' }}>Result</div>
            {d.result.length === 0 ? (
              <div style={{ ...card, color: '#8aa093', fontWeight: 700 }}>No result recorded for this polling unit yet.</div>
            ) : (
              d.result.map((x) => <ResultCard key={`${x.election_type}-${x.year}`} d={x} />)
            )}

            {/* every piece of evidence — each a guess */}
            <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '15px', color: '#0f2a1c', margin: '22px 0 6px' }}>
              Evidence {d.evidence.length > 0 ? `(${d.evidence.length})` : ''}
            </div>
            <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '13px', color: '#8aa093', margin: '0 0 12px' }}>
              Every recorded figure for this unit is a piece of evidence — a reading of a result sheet. None is treated as certain; the result above is a merge of them.
            </p>
            {d.evidence.length === 0 ? (
              <div style={{ ...card, color: '#8aa093', fontWeight: 600 }}>No evidence recorded for this polling unit yet.</div>
            ) : (
              <EvidenceTable items={d.evidence} />
            )}

            {/* all result sheets for this unit, including broken URLs */}
            <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '15px', color: '#0f2a1c', margin: '22px 0 6px' }}>
              Result sheets {d.sheets.length > 0 ? `(${d.sheets.length})` : ''}
            </div>
            <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '13px', color: '#8aa093', margin: '0 0 12px' }}>
              Every INEC result sheet we hold for this unit, including ones whose link is broken or missing.
            </p>
            {d.sheets.length === 0 ? (
              <div style={{ ...card, color: '#8aa093', fontWeight: 600 }}>No result sheets recorded for this polling unit.</div>
            ) : (
              <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '520px' }}>
                  <thead>
                    <tr style={{ background: '#f4f7f2' }}>
                      <th style={sheetTh}>Election</th>
                      <th style={sheetTh}>Year</th>
                      <th style={sheetTh}>Status</th>
                      <th style={sheetTh}>Sheet</th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.sheets.map((s, i) => {
                      const st = sheetStatus(s.status, s.sheet_url)
                      return (
                        <tr key={`${s.election_type}-${s.year}-${i}`} style={{ borderTop: '1px solid #eef2ee' }}>
                          <td style={sheetTd}>{RACE_LABEL[s.election_type] ?? s.election_type}</td>
                          <td style={sheetTd}>{s.year}</td>
                          <td style={{ ...sheetTd }}>
                            <span title={s.status || undefined} style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '11px', color: st.fg, background: st.bg, border: `1px solid ${st.bd}`, padding: '2px 9px', borderRadius: '20px' }}>{st.label}</span>
                          </td>
                          <td style={sheetTd}>
                            {s.sheet_url ? (
                              <a href={s.sheet_url} target="_blank" rel="noreferrer" style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '12px', color: '#0f6a38', textDecoration: 'none', borderBottom: '1px dotted #9db3a3' }}>Open sheet ↗</a>
                            ) : (
                              <span style={{ color: '#b3c2b8' }}>—</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
      <HomeFooter />
    </div>
  )
}

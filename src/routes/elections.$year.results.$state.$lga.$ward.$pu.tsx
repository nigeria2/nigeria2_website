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

function ResultCard({ d }: { d: ResultItem }) {
  const ranked = Object.entries(d.parties).filter(([, v]) => v != null).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
  const max = Math.max(1, ...ranked.map(([, v]) => v ?? 0))
  const mergeNote = d.method === 'single-source' ? 'from a single entry' : (d.method || '')
  return (
    <div style={card}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
        <span style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '13px', color: '#0f2a1c', background: '#ffe14d', padding: '4px 12px', borderRadius: '20px' }}>{RACE_LABEL[d.election_type] ?? d.election_type} · {d.year}</span>
        {d.winner && <span style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '15px', color: '#fff', background: colorOf(d.winner), padding: '5px 14px', borderRadius: '8px' }}>{d.winner}</span>}
        {mergeNote && <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '12px', color: '#8aa093' }}>merged {mergeNote}</span>}
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

function EvidenceCard({ t }: { t: EvidenceItem }) {
  const parties = (t.party_results ?? []).filter((p) => (p.party ?? '').trim())
  const kindColor = KIND_COLOR[t.kind] ?? '#7a4bd0'
  return (
    <div style={{ background: '#fff', border: '1px solid #e4dcf5', borderRadius: '10px', padding: '14px 16px', marginBottom: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
        <span style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '12px', color: '#fff', background: kindColor, padding: '3px 10px', borderRadius: '20px' }}>
          {KIND_LABEL[t.kind] ?? t.kind}
        </span>
        <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '11px', color: '#8aa093' }}>{RACE_LABEL[t.election_type] ?? t.election_type}</span>
        {t.source && <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '11px', color: kindColor }}>source: {t.source}</span>}
        {t.source_image && <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#b3c2b8' }}>{t.source_image}</span>}
      </div>
      {(() => {
        const reg = summaryVal(t.poll_summary, 'registered_voters', '1_registered_voters')
        const acc = summaryVal(t.poll_summary, 'accredited_voters', '2_accredited_voters')
        const valid = summaryVal(t.poll_summary, 'valid_votes', '7_total_valid_votes')
        if (!reg && !acc && !valid) return null
        return (
          <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #f0ecfa' }}>
            {reg && <SummaryPill label="Registered" value={reg} />}
            {acc && <SummaryPill label="Accredited" value={acc} />}
            {valid && <SummaryPill label="Valid votes" value={valid} />}
          </div>
        )
      })()}
      {parties.length === 0 ? (
        <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '13px', color: '#8aa093' }}>No party figures in this entry.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: '340px' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '10px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#8aa093', padding: '6px 10px' }}>Party</th>
                <th style={{ textAlign: 'right', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '10px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#8aa093', padding: '6px 10px' }}>Votes</th>
                <th style={{ textAlign: 'left', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '10px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#8aa093', padding: '6px 10px' }}>In words</th>
              </tr>
            </thead>
            <tbody>
              {parties.map((p, i) => {
                const { figure, words } = partyVotes(p)
                const has = figure !== ''
                return (
                  <tr key={`${p.party}-${i}`} style={{ borderTop: '1px solid #f0ecfa', background: has ? 'transparent' : '#faf9fe' }}>
                    <td style={{ padding: '6px 10px', fontFamily: "'Archivo Black', sans-serif", fontSize: '12px', color: colorOf(p.party ?? '') !== '#8aa093' ? colorOf(p.party ?? '') : '#0f2a1c' }}>{p.party}</td>
                    <td style={{ padding: '6px 10px', textAlign: 'right', fontFamily: "'Archivo Black', sans-serif", fontSize: '13px', color: has ? '#0f2a1c' : '#c3ccc6' }}>{has ? figure : '0'}</td>
                    <td style={{ padding: '6px 10px', fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '12px', color: '#8aa093', textTransform: 'capitalize' }}>{words || '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function SummaryPill({ label, value }: { label: string; value: string }) {
  return <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '12px', color: '#5c6b60' }}>{label}: <strong style={{ color: '#0f2a1c' }}>{value}</strong></span>
}

function PollingUnitPage() {
  const { year, state, lga, ward, pu } = Route.useParams()
  const [d, setD] = useState<Detail | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setD(null); setFailed(false)
    // pu param carries the code with dashes (03-03-05-001); the API takes raw slashes.
    const puCode = pu.replace(/-/g, '/')
    fetch(`${API_BASE}/api/polling-units/${puCode}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: Detail) => setD(data))
      .catch(() => setFailed(true))
  }, [pu])

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
              d.evidence.map((t, i) => <EvidenceCard key={t.id ?? i} t={t} />)
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
                      const ok = /^saved|have|ok$/i.test(s.status || '') || (!s.status && s.sheet_url)
                      return (
                        <tr key={`${s.election_type}-${s.year}-${i}`} style={{ borderTop: '1px solid #eef2ee' }}>
                          <td style={sheetTd}>{RACE_LABEL[s.election_type] ?? s.election_type}</td>
                          <td style={sheetTd}>{s.year}</td>
                          <td style={{ ...sheetTd }}>
                            <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '11px', color: ok ? '#0f6a38' : '#b45309', background: ok ? '#e3f5ea' : '#fdf0dc', border: `1px solid ${ok ? '#bfe6cd' : '#f0d9ac'}`, padding: '2px 9px', borderRadius: '20px' }}>{s.status || (s.sheet_url ? 'available' : 'no sheet')}</span>
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

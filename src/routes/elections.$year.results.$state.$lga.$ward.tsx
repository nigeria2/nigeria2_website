import { Fragment, useEffect, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { HomeNav } from '../components/HomeNav'
import { HomeFooter } from '../components/HomeFooter'
import { API_BASE } from '../config'
import { STATE_BY_SLUG } from '../stateSlug'

type PartyResult = { sn?: string; party?: string; votes_figures?: string; votes_in_words?: string; polling_agent?: string }
type Recording = {
  source_image?: string
  method?: string
  form?: Record<string, string>
  poll_summary?: Record<string, string>
  party_results?: PartyResult[]
  [k: string]: unknown
}
type Sheet = { election_type: string; year: string; sheet_url: string; status: string; has_json?: boolean; recordings?: Recording[] }
type PU = { pu_name: string; pu_code: string; registered_voters: number | null; known_votes: number | null; winner: string; runner_up: string; scores: Record<string, number | null>; sheets?: Sheet[] }
type Result = { winner: string; runner_up: string; total_votes: number; scores: Record<string, number> }
type Detail = { state: string; lga: string; ward: string; ward_code: string; result: Result | null; polling_units: PU[] }

const COLORS: Record<string, string> = { APC: '#1f6fd6', LP: '#e05a1f', PDP: '#c0392b', NNPP: '#f0b429' }
const colorOf = (p: string) => COLORS[p] ?? '#cdd8cf'
const PARTIES = ['APC', 'LP', 'PDP', 'NNPP']
const RACE_ABBR: Record<string, string> = { presidential: 'Pres', governorship: 'Gov', senatorial: 'Sen', house: 'Reps' }

const th: React.CSSProperties = { textAlign: 'left', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '11px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#5c6b60', padding: '12px 14px', whiteSpace: 'nowrap' }
const td: React.CSSProperties = { fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '13px', color: '#0f2a1c', padding: '11px 14px' }

export const Route = createFileRoute('/elections/$year/results/$state/$lga/$ward')({
  head: ({ params }) => ({ meta: [{ title: `${STATE_BY_SLUG[params.state] ?? 'State'} — ward polling units, ${params.year} | Nigeria 2.0` }] }),
  component: WardResultsPage,
})

/** One transcription of an EC8A sheet: every party's recorded votes (figures + words),
 *  plus the poll summary. "One entry per recording" — a sheet may be transcribed by more
 *  than one method, and each is shown separately. */
function RecordingCard({ r, index, total, raceLabel }: { r: Recording; index: number; total: number; raceLabel: string }) {
  const parties = (r.party_results ?? []).filter((p) => (p.party ?? '').trim())
  const rowsWithVotes = parties.filter((p) => (p.votes_figures ?? '').trim() !== '')
  const summary = r.poll_summary ?? {}
  const sumRow = (key: string, label: string) =>
    summary[key] != null && summary[key] !== '' ? (
      <span key={key} style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '12px', color: '#5c6b60' }}>
        {label}: <strong style={{ color: '#0f2a1c' }}>{summary[key]}</strong>
      </span>
    ) : null
  return (
    <div style={{ background: '#fff', border: '1px solid #e4dcf5', borderRadius: '8px', padding: '14px 16px', marginBottom: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
        <span style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '12px', color: '#fff', background: '#7a4bd0', padding: '3px 10px', borderRadius: '20px' }}>
          {raceLabel} · recording {index + 1}{total > 1 ? ` of ${total}` : ''}
        </span>
        {r.method && <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '11px', color: '#7a4bd0' }}>method: {r.method}</span>}
        {r.source_image && <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#8aa093' }}>{r.source_image}</span>}
      </div>
      {(sumRow('1_registered_voters', 'Registered') || sumRow('2_accredited_voters', 'Accredited') || sumRow('7_total_valid_votes', 'Valid votes')) && (
        <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #f0ecfa' }}>
          {sumRow('1_registered_voters', 'Registered')}
          {sumRow('2_accredited_voters', 'Accredited')}
          {sumRow('7_total_valid_votes', 'Valid votes')}
          {sumRow('6_rejected_ballots', 'Rejected')}
        </div>
      )}
      {parties.length === 0 ? (
        <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '13px', color: '#8aa093' }}>No party figures in this recording.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: '360px' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '10px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#8aa093', padding: '6px 10px' }}>Party</th>
                <th style={{ textAlign: 'right', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '10px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#8aa093', padding: '6px 10px' }}>Votes</th>
                <th style={{ textAlign: 'left', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '10px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#8aa093', padding: '6px 10px' }}>In words</th>
              </tr>
            </thead>
            <tbody>
              {parties.map((p, i) => {
                const fig = (p.votes_figures ?? '').trim()
                const has = fig !== ''
                return (
                  <tr key={`${p.party}-${i}`} style={{ borderTop: '1px solid #f0ecfa', background: has ? 'transparent' : '#faf9fe' }}>
                    <td style={{ padding: '6px 10px', fontFamily: "'Archivo Black', sans-serif", fontSize: '12px', color: colorOf(p.party ?? '') !== '#cdd8cf' ? colorOf(p.party ?? '') : '#0f2a1c' }}>{p.party}</td>
                    <td style={{ padding: '6px 10px', textAlign: 'right', fontFamily: "'Archivo Black', sans-serif", fontSize: '13px', color: has ? '#0f2a1c' : '#c3ccc6' }}>{has ? fig : '0'}</td>
                    <td style={{ padding: '6px 10px', fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '12px', color: '#8aa093', textTransform: 'capitalize' }}>{(p.votes_in_words ?? '').trim() || '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '11px', color: '#b0a8c8', marginTop: '8px' }}>
        {rowsWithVotes.length} of {parties.length} parties recorded a figure · verbatim transcription
      </div>
    </div>
  )
}

function WardResultsPage() {
  const { year, state, lga, ward } = Route.useParams()
  // Ward codes use slashes (03/01/01); the URL segment carries them as dashes (03-01-01).
  // The API accepts the dash form and converts it back — do NOT URL-encode the slashes,
  // as encoded slashes (%2F) in a path segment are rejected by the API gateway.
  const [d, setD] = useState<Detail | null>(null)
  const [openPu, setOpenPu] = useState<string | null>(null)
  const [tx, setTx] = useState<Record<string, Sheet[] | null>>({})

  useEffect(() => {
    setD(null)
    fetch(`${API_BASE}/api/wards/${ward}/polling-units`)
      .then((r) => r.json())
      .then((data: Detail) => setD(data))
      .catch(() => setD({ state: '', lga: '', ward: '', ward_code: ward, result: null, polling_units: [] }))
  }, [ward])

  const toggleTranscript = (pu_code: string) => {
    if (openPu === pu_code) { setOpenPu(null); return }
    setOpenPu(pu_code)
    if (!(pu_code in tx)) {
      fetch(`${API_BASE}/api/polling-units/${pu_code}/sheets`)
        .then((r) => r.json())
        .then((data) => setTx((prev) => ({ ...prev, [pu_code]: data.sheets })))
        .catch(() => setTx((prev) => ({ ...prev, [pu_code]: null })))
    }
  }

  const totalReg = d?.polling_units.reduce((s, p) => s + (p.registered_voters ?? 0), 0) ?? 0
  const totalVotes = d?.polling_units.reduce((s, p) => s + (p.known_votes ?? 0), 0) ?? 0

  return (
    <div style={{ minHeight: '100vh', background: '#f4f7f2', fontFamily: "'Archivo', sans-serif" }}>
      <HomeNav />
      <div style={{ background: '#0d8244' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '30px 40px 26px' }}>
          <Link to="/elections/$year/results/$state/$lga" params={{ year, state, lga }} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '13px', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#9fd9b8', textDecoration: 'none', marginBottom: '12px' }}>
            ← {d?.lga || 'LGA'} · wards
          </Link>
          <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '32px', color: '#fff', margin: '0 0 6px' }}>{d ? d.ward || 'Ward' : 'Loading…'}</h1>
          <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '15px', color: '#c7e7d4', margin: 0 }}>
            {d && d.polling_units.length > 0
              ? `${d.lga} · ${d.polling_units.length} polling units · ${totalReg.toLocaleString()} registered${totalVotes ? ` · ${totalVotes.toLocaleString()} votes cast (2023)` : ''}`
              : d ? 'No polling units found.' : ''}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '26px 40px 72px' }}>
        {d?.result && (() => {
          const r = d.result
          const ranked = [...PARTIES].sort((a, b) => (r.scores[b] ?? 0) - (r.scores[a] ?? 0))
          const max = Math.max(1, ...PARTIES.map((p) => r.scores[p] ?? 0))
          return (
            <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', padding: '20px 22px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '14px' }}>
                <span style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '16px', color: '#fff', background: colorOf(r.winner), padding: '8px 16px', borderRadius: '8px' }}>{r.winner}</span>
                <div>
                  <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '16px', color: '#0f2a1c' }}>won this ward in 2023 (presidential)</div>
                  <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '13px', color: '#8aa093' }}>Runner-up: {r.runner_up} · {r.total_votes.toLocaleString()} votes counted</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                {ranked.map((p) => (
                  <div key={p} style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                    <span style={{ width: '52px', flex: 'none', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '11px', color: '#fff', background: colorOf(p), padding: '3px 0', borderRadius: '4px', textAlign: 'center' }}>{p}</span>
                    <div style={{ flex: 1, height: '12px', borderRadius: '4px', background: '#eef2ee', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.round(((r.scores[p] ?? 0) / max) * 100)}%`, background: colorOf(p) }} />
                    </div>
                    <span style={{ width: '80px', textAlign: 'right', flex: 'none', fontFamily: "'Archivo Black', sans-serif", fontSize: '12px', color: '#5c6b60' }}>{(r.scores[p] ?? 0).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })()}
        {!d ? (
          <div style={{ padding: '60px', textAlign: 'center', fontFamily: "'Archivo Black', sans-serif", color: '#8aa093' }}>Loading…</div>
        ) : d.polling_units.length === 0 ? (
          <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', padding: '44px', textAlign: 'center', fontFamily: "'Archivo', sans-serif", fontWeight: 700, color: '#8aa093' }}>No polling units for this ward.</div>
        ) : (
          <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '760px' }}>
              <thead>
                <tr style={{ background: '#f4f7f2' }}>
                  <th style={th}>Polling unit</th>
                  <th style={th}>Code</th>
                  <th style={{ ...th, textAlign: 'center' }}>Winner (2023)</th>
                  <th style={{ ...th, textAlign: 'right' }}>Registered</th>
                  <th style={{ ...th, textAlign: 'right' }}>Known votes</th>
                  <th style={{ ...th, textAlign: 'left' }}>Result sheets (INEC)</th>
                </tr>
              </thead>
              <tbody>
                {d.polling_units.map((p) => {
                  const sheets = p.sheets ?? []
                  const hasTx = sheets.some((s) => s.has_json)
                  const open = openPu === p.pu_code
                  const loaded = tx[p.pu_code]
                  const openSheets = Array.isArray(loaded) ? loaded : []
                  const recordings = openSheets.flatMap((s) =>
                    (s.recordings ?? []).map((r) => ({ r, race: RACE_ABBR[s.election_type] ?? s.election_type })),
                  )
                  return (
                    <Fragment key={p.pu_code}>
                      <tr style={{ borderTop: '1px solid #eef2ee' }}>
                        <td style={{ ...td, fontWeight: 800, textTransform: 'capitalize' }}>{p.pu_name || '—'}</td>
                        <td style={{ ...td, fontFamily: 'monospace', color: '#8aa093' }}>{p.pu_code}</td>
                        <td style={{ ...td, textAlign: 'center' }}>{p.winner ? <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '11px', color: '#fff', background: colorOf(p.winner), padding: '3px 10px', borderRadius: '20px' }}>{p.winner}</span> : <span style={{ color: '#b3c2b8' }}>—</span>}</td>
                        <td style={{ ...td, textAlign: 'right', fontFamily: "'Archivo Black', sans-serif" }}>{p.registered_voters != null ? p.registered_voters.toLocaleString() : '—'}</td>
                        <td style={{ ...td, textAlign: 'right', fontFamily: "'Archivo Black', sans-serif", color: p.known_votes != null ? '#0f2a1c' : '#b3c2b8' }}>{p.known_votes != null ? p.known_votes.toLocaleString() : '—'}</td>
                        <td style={{ ...td }}>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                            {sheets.length === 0 && <span style={{ color: '#b3c2b8' }}>—</span>}
                            {sheets.map((s) => (
                              s.sheet_url ? (
                                <a key={s.election_type} href={s.sheet_url} target="_blank" rel="noreferrer" title={`${s.election_type} result sheet on INEC IReV`}
                                   style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '11px', color: '#0f6a38', background: '#e3f5ea', border: '1px solid #bfe6cd', padding: '3px 9px', borderRadius: '20px', textDecoration: 'none' }}>
                                  {RACE_ABBR[s.election_type] ?? s.election_type} ↗
                                </a>
                              ) : (
                                <span key={s.election_type} title={`${s.election_type}: ${s.status}`} style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '11px', color: '#b3c2b8', border: '1px solid #e4ebe5', padding: '3px 9px', borderRadius: '20px' }}>
                                  {RACE_ABBR[s.election_type] ?? s.election_type} —
                                </span>
                              )
                            ))}
                            {hasTx && (
                              <button onClick={() => toggleTranscript(p.pu_code)} style={{ cursor: 'pointer', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '11px', color: open ? '#fff' : '#7a4bd0', background: open ? '#7a4bd0' : '#f0e9fb', border: '1px solid #d9c8f5', padding: '3px 9px', borderRadius: '20px' }}>
                                {open ? 'Hide recorded votes' : 'Recorded votes'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                      {open && (
                        <tr>
                          <td colSpan={6} style={{ padding: '4px 14px 16px', background: '#faf7fe' }}>
                            {tx[p.pu_code] === undefined ? (
                              <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '13px', color: '#7a4bd0', padding: '10px 2px' }}>Loading recorded votes…</div>
                            ) : recordings.length === 0 ? (
                              <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '13px', color: '#8aa093', padding: '10px 2px' }}>No transcribed recordings for this polling unit yet.</div>
                            ) : (
                              <div style={{ paddingTop: '6px' }}>
                                {recordings.map(({ r, race }, i) => (
                                  <RecordingCard key={i} r={r} index={i} total={recordings.length} raceLabel={race} />
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '13px', color: '#8aa093', margin: '18px 0 0' }}>
          The Pres/Gov/Sen links open each polling unit's scanned result sheet on INEC's IReV server. "Recorded votes" shows every party's votes from our verbatim transcription of that sheet — one entry per recording (a sheet may be transcribed by more than one method).
        </p>
      </div>
      <HomeFooter />
    </div>
  )
}

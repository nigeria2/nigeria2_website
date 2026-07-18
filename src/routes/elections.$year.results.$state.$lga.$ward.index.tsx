import { useEffect, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { HomeNav } from '../components/HomeNav'
import { HomeFooter } from '../components/HomeFooter'
import { LevelEvidence, type LevelEvidenceItem } from '../components/LevelEvidence'
import { API_BASE } from '../config'
import { STATE_BY_SLUG } from '../stateSlug'

type PU = { pu_name: string; pu_code: string; registered_voters: number | null; accredited_voters: number | null; known_votes: number | null; winner: string; runner_up: string; scores: Record<string, number | null> }
type Result = { winner: string; runner_up: string; total_votes: number; scores: Record<string, number> }
type Detail = { state: string; lga: string; ward: string; ward_code: string; result: Result | null; polling_units: PU[]; evidence?: LevelEvidenceItem[] }

const COLORS: Record<string, string> = { APC: '#1f6fd6', LP: '#e05a1f', PDP: '#c0392b', NNPP: '#f0b429' }
const colorOf = (p: string) => COLORS[p] ?? '#cdd8cf'
const PARTIES = ['APC', 'LP', 'PDP', 'NNPP'] as const

const th: React.CSSProperties = { textAlign: 'left', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '11px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#5c6b60', padding: '12px 14px', whiteSpace: 'nowrap' }
const td: React.CSSProperties = { fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '13px', color: '#0f2a1c', padding: '11px 14px' }

export const Route = createFileRoute('/elections/$year/results/$state/$lga/$ward/')({
  head: ({ params }) => ({ meta: [{ title: `${STATE_BY_SLUG[params.state] ?? 'State'} — ward polling units, ${params.year} | Nigeria 2.0` }] }),
  component: WardResultsPage,
})

// The ward code carries slashes as dashes in the URL (03/03/05 -> 03-03-05); the API
// accepts the dash form directly. The polling-unit URL segment is just the PU's own
// number — its last code segment (03/01/01/005 -> 005) — since the ward is already in the
// path; the PU page reconstructs the full code from ward + this segment.
const puSlug = (pu_code: string) => pu_code.split('/').pop() ?? pu_code

function WardResultsPage() {
  const { year, state, lga, ward } = Route.useParams()
  const [d, setD] = useState<Detail | null>(null)

  useEffect(() => {
    setD(null)
    fetch(`${API_BASE}/api/wards/${ward}/polling-units`)
      .then((r) => r.json())
      .then((data: Detail) => setD(data))
      .catch(() => setD({ state: '', lga: '', ward: '', ward_code: ward, result: null, polling_units: [] }))
  }, [ward])

  const totalReg = d?.polling_units.reduce((s, p) => s + (p.registered_voters ?? 0), 0) ?? 0
  const totalVotes = d?.polling_units.reduce((s, p) => s + (p.known_votes ?? 0), 0) ?? 0
  const partyTotals = (d?.polling_units ?? []).reduce<Record<string, number>>((acc, p) => {
    for (const party of PARTIES) acc[party] = (acc[party] ?? 0) + (p.scores?.[party] ?? 0)
    return acc
  }, {})
  const anyPuScores = (d?.polling_units ?? []).some((p) => PARTIES.some((party) => p.scores?.[party] != null))

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
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '820px' }}>
              <thead>
                <tr style={{ background: '#f4f7f2' }}>
                  <th style={th}>Polling unit</th>
                  {PARTIES.map((p) => (
                    <th key={p} style={{ ...th, textAlign: 'right', color: colorOf(p) }}>{p}</th>
                  ))}
                  <th style={{ ...th, textAlign: 'center' }}>Winner</th>
                  <th style={{ ...th, textAlign: 'right' }}>Registered</th>
                  <th style={{ ...th, textAlign: 'right' }}>Accredited</th>
                </tr>
              </thead>
              <tbody>
                {d.polling_units.map((p) => (
                  <tr key={p.pu_code} style={{ borderTop: '1px solid #eef2ee' }}>
                    <td style={{ ...td, fontWeight: 800 }}>
                      <Link to="/elections/$year/results/$state/$lga/$ward/$pu" params={{ year, state, lga, ward, pu: puSlug(p.pu_code) }} style={{ color: '#0f2a1c', textDecoration: 'none', borderBottom: '1px dotted #9db3a3' }}>
                        <span style={{ textTransform: 'capitalize' }}>{p.pu_name || p.pu_code}</span>
                      </Link>
                      <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#b3c2b8' }}>{p.pu_code}</div>
                    </td>
                    {PARTIES.map((party) => {
                      const v = p.scores?.[party]
                      const isWin = party === p.winner
                      return (
                        <td key={party} style={{ ...td, textAlign: 'right', fontFamily: "'Archivo Black', sans-serif", color: v == null ? '#c3ccc6' : isWin ? colorOf(party) : '#33414f' }}>
                          {v != null ? v.toLocaleString() : '—'}
                        </td>
                      )
                    })}
                    <td style={{ ...td, textAlign: 'center' }}>{p.winner ? <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '11px', color: '#fff', background: colorOf(p.winner), padding: '3px 10px', borderRadius: '20px' }}>{p.winner}</span> : <span style={{ color: '#b3c2b8' }}>—</span>}</td>
                    <td style={{ ...td, textAlign: 'right', fontFamily: "'Archivo Black', sans-serif" }}>{p.registered_voters != null ? p.registered_voters.toLocaleString() : '—'}</td>
                    <td style={{ ...td, textAlign: 'right', fontFamily: "'Archivo Black', sans-serif", color: p.accredited_voters != null ? '#0f2a1c' : '#c3ccc6' }}>{p.accredited_voters != null ? p.accredited_voters.toLocaleString() : '—'}</td>
                  </tr>
                ))}
                {anyPuScores && (
                  <tr style={{ borderTop: '2px solid #cdd8cf', background: '#f7faf7' }}>
                    <td style={{ ...td, fontFamily: "'Archivo Black', sans-serif", textTransform: 'uppercase', letterSpacing: '0.03em', fontSize: '12px' }}>Ward total</td>
                    {PARTIES.map((p) => (
                      <td key={p} style={{ ...td, textAlign: 'right', fontFamily: "'Archivo Black', sans-serif", color: colorOf(p) }}>{(partyTotals[p] ?? 0).toLocaleString()}</td>
                    ))}
                    <td style={{ ...td, textAlign: 'center' }} />
                    <td style={{ ...td, textAlign: 'right', fontFamily: "'Archivo Black', sans-serif" }}>{totalReg.toLocaleString()}</td>
                    <td style={{ ...td }} />
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '13px', color: '#8aa093', margin: '18px 0 0' }}>
          Party columns show verified 2023 presidential votes per polling unit. Open a polling unit to see its full result, the INEC result sheets and every recorded transcription of the votes. Accredited-voter figures are shown only for polling units we have flagged data for.
        </p>
        {d && (
          <LevelEvidence
            items={d.evidence ?? []}
            blurb="The evidence behind this ward's score — its roll-up from the polling units, plus any figures recorded independently at ward level. Each is a guess; the ward score is a merge of them."
          />
        )}
      </div>
      <HomeFooter />
    </div>
  )
}

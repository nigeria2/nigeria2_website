import { useEffect, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { HomeNav } from '../components/HomeNav'
import { HomeFooter } from '../components/HomeFooter'
import { LevelEvidence, type LevelEvidenceItem } from '../components/LevelEvidence'
import { API_BASE } from '../config'
import { STATE_BY_SLUG } from '../stateSlug'

const COLORS: Record<string, string> = { APC: '#1f6fd6', LP: '#e05a1f', PDP: '#c0392b', NNPP: '#f0b429' }
const colorOf = (p: string) => COLORS[p] ?? '#cdd8cf'
const PARTIES = ['APC', 'LP', 'PDP', 'NNPP'] as const

type Ward = { ward: string; ward_code: string; pu_count: number; registered_voters: number | null; winner: string; runner_up: string; scores: Record<string, number | null>; total_votes: number | null }
type Detail = { id: number; name: string; state: string; geo_id: string; wards: Ward[]; evidence?: LevelEvidenceItem[] }

export const Route = createFileRoute('/elections/$year/results/$state/$lga/')({
  head: ({ params }) => ({ meta: [{ title: `${STATE_BY_SLUG[params.state] ?? 'State'} — LGA wards, ${params.year} results | Nigeria 2.0` }] }),
  component: LgaResults,
})

const th: React.CSSProperties = { textAlign: 'left', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '11px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#5c6b60', padding: '12px 14px', whiteSpace: 'nowrap' }
const td: React.CSSProperties = { fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '13px', color: '#0f2a1c', padding: '11px 14px' }

function LgaResults() {
  const { year, state, lga } = Route.useParams()
  const lgaId = parseInt(lga.split('-')[0], 10)
  const [d, setD] = useState<Detail | null>(null)

  useEffect(() => {
    setD(null)
    fetch(`${API_BASE}/api/lga/${lgaId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setD(data))
      .catch(() => setD(null))
  }, [lgaId])

  const totalReg = d?.wards.reduce((s, w) => s + (w.registered_voters ?? 0), 0) ?? 0
  const totalPu = d?.wards.reduce((s, w) => s + (w.pu_count ?? 0), 0) ?? 0
  const partyTotals = (d?.wards ?? []).reduce<Record<string, number>>((acc, w) => {
    for (const p of PARTIES) acc[p] = (acc[p] ?? 0) + (w.scores?.[p] ?? 0)
    return acc
  }, {})
  const anyScores = (d?.wards ?? []).some((w) => PARTIES.some((p) => w.scores?.[p] != null))

  return (
    <div style={{ minHeight: '100vh', background: '#f4f7f2', fontFamily: "'Archivo', sans-serif" }}>
      <HomeNav />
      <div style={{ background: '#0d8244' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '30px 40px 26px' }}>
          <Link to="/elections/$year/results/$state" params={{ year, state }} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '13px', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#9fd9b8', textDecoration: 'none', marginBottom: '12px' }}>
            ← {d?.state ?? STATE_BY_SLUG[state] ?? 'State'} · {year} results
          </Link>
          <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '32px', color: '#fff', margin: '0 0 6px' }}>{d ? d.name : 'Loading…'}</h1>
          <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '15px', color: '#c7e7d4', margin: 0 }}>
            {d ? `${d.wards.length} wards · ${totalPu.toLocaleString()} polling units · ${totalReg.toLocaleString()} registered · 2023` : ''}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '26px 40px 72px' }}>
        {!d ? (
          <div style={{ padding: '60px', textAlign: 'center', fontFamily: "'Archivo Black', sans-serif", color: '#8aa093' }}>Loading…</div>
        ) : d.wards.length === 0 ? (
          <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', padding: '44px', textAlign: 'center', fontFamily: "'Archivo', sans-serif", fontWeight: 700, color: '#8aa093' }}>No ward data for this LGA.</div>
        ) : (
          <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '760px' }}>
              <thead>
                <tr style={{ background: '#f4f7f2' }}>
                  <th style={th}>Ward</th>
                  {PARTIES.map((p) => (
                    <th key={p} style={{ ...th, textAlign: 'right', color: colorOf(p) }}>{p}</th>
                  ))}
                  <th style={{ ...th, textAlign: 'center' }}>Winner</th>
                  <th style={{ ...th, textAlign: 'right' }}>Polling units</th>
                  <th style={{ ...th, textAlign: 'right' }}>Registered</th>
                </tr>
              </thead>
              <tbody>
                {d.wards.map((w) => (
                  <tr key={w.ward_code} style={{ borderTop: '1px solid #eef2ee' }}>
                    <td style={{ ...td, fontWeight: 800 }}>
                      <Link to="/elections/$year/results/$state/$lga/$ward" params={{ year, state, lga, ward: w.ward_code.replace(/\//g, '-') }} style={{ color: '#0f2a1c', textDecoration: 'none', borderBottom: '1px dotted #9db3a3' }}>{w.ward}</Link>
                    </td>
                    {PARTIES.map((p) => {
                      const v = w.scores?.[p]
                      const isWin = p === w.winner
                      return (
                        <td key={p} style={{ ...td, textAlign: 'right', fontFamily: "'Archivo Black', sans-serif", color: v == null ? '#b3c2b8' : isWin ? colorOf(p) : '#33414f' }}>
                          {v != null ? v.toLocaleString() : '—'}
                        </td>
                      )
                    })}
                    <td style={{ ...td, textAlign: 'center' }}>{w.winner ? <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '11px', color: '#fff', background: colorOf(w.winner), padding: '3px 10px', borderRadius: '20px' }}>{w.winner}</span> : <span style={{ color: '#b3c2b8' }}>—</span>}</td>
                    <td style={{ ...td, textAlign: 'right', fontFamily: "'Archivo Black', sans-serif" }}>{w.pu_count.toLocaleString()}</td>
                    <td style={{ ...td, textAlign: 'right', fontFamily: "'Archivo Black', sans-serif" }}>{w.registered_voters != null ? w.registered_voters.toLocaleString() : '—'}</td>
                  </tr>
                ))}
                {anyScores && (
                  <tr style={{ borderTop: '2px solid #cdd8cf', background: '#f7faf7' }}>
                    <td style={{ ...td, fontFamily: "'Archivo Black', sans-serif", textTransform: 'uppercase', letterSpacing: '0.03em', fontSize: '12px' }}>LGA total</td>
                    {PARTIES.map((p) => (
                      <td key={p} style={{ ...td, textAlign: 'right', fontFamily: "'Archivo Black', sans-serif", color: colorOf(p) }}>{(partyTotals[p] ?? 0).toLocaleString()}</td>
                    ))}
                    <td style={{ ...td, textAlign: 'center' }} />
                    <td style={{ ...td, textAlign: 'right', fontFamily: "'Archivo Black', sans-serif" }}>{totalPu.toLocaleString()}</td>
                    <td style={{ ...td, textAlign: 'right', fontFamily: "'Archivo Black', sans-serif" }}>{totalReg.toLocaleString()}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '13px', color: '#8aa093', margin: '18px 0 0' }}>
          Party columns show verified 2023 presidential votes for the four major parties per ward. Open a ward to see its polling units and the INEC result sheets.
        </p>
        {d && (
          <LevelEvidence
            items={d.evidence ?? []}
            blurb="The evidence behind this LGA's score — its roll-up from the wards, plus any figures recorded independently at LGA level from another source. Each is a guess; the LGA score is a merge of them."
          />
        )}
      </div>
      <HomeFooter />
    </div>
  )
}

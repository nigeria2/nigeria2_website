import { useEffect, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { HomeNav } from '../components/HomeNav'
import { HomeFooter } from '../components/HomeFooter'
import { API_BASE } from '../config'
import { stateSlug } from '../stateSlug'

export const Route = createFileRoute('/ward')({
  component: WardPage,
  validateSearch: (s: Record<string, unknown>): { ward: string } => ({ ward: String(s.ward ?? '') }),
})

type PU = { pu_name: string; pu_code: string; registered_voters: number | null; known_votes: number | null; winner: string; runner_up: string; scores: Record<string, number | null> }
type Result = { winner: string; runner_up: string; total_votes: number; scores: Record<string, number> }
type Detail = { state: string; lga: string; ward: string; ward_code: string; result: Result | null; polling_units: PU[] }

const COLORS: Record<string, string> = { APC: '#1f6fd6', LP: '#e05a1f', PDP: '#c0392b', NNPP: '#f0b429' }
const colorOf = (p: string) => COLORS[p] ?? '#cdd8cf'
const PARTIES = ['APC', 'LP', 'PDP', 'NNPP']

const th: React.CSSProperties = { textAlign: 'left', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '11px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#5c6b60', padding: '12px 14px', whiteSpace: 'nowrap' }
const td: React.CSSProperties = { fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '13px', color: '#0f2a1c', padding: '11px 14px' }

function WardPage() {
  const { ward: code } = Route.useSearch()
  const [d, setD] = useState<Detail | null>(null)

  useEffect(() => {
    if (!code) {
      setD({ state: '', lga: '', ward: '', ward_code: '', result: null, polling_units: [] })
      return
    }
    setD(null)
    fetch(`${API_BASE}/api/wards/${encodeURIComponent(code)}/polling-units`)
      .then((r) => r.json())
      .then((data: Detail) => setD(data))
      .catch(() => setD({ state: '', lga: '', ward: '', ward_code: '', result: null, polling_units: [] }))
  }, [code])

  const totalReg = d?.polling_units.reduce((s, p) => s + (p.registered_voters ?? 0), 0) ?? 0
  const totalVotes = d?.polling_units.reduce((s, p) => s + (p.known_votes ?? 0), 0) ?? 0

  return (
    <div style={{ minHeight: '100vh', background: '#f4f7f2', fontFamily: "'Archivo', sans-serif" }}>
      <HomeNav />

      <div style={{ background: '#0d8244' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '30px 40px 26px' }}>
          {d && d.state && (
            <Link to="/wards/$state" params={{ state: stateSlug(d.state) }} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '13px', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#9fd9b8', textDecoration: 'none', marginBottom: '12px' }}>
              ← Wards of {d.state}
            </Link>
          )}
          <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '32px', color: '#fff', margin: '0 0 6px' }}>{d ? d.ward || 'Ward' : 'Loading…'}</h1>
          <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '15px', color: '#c7e7d4', margin: 0 }}>
            {d && d.polling_units.length > 0
              ? `${d.lga} · ${d.polling_units.length} polling units · ${totalReg.toLocaleString()} registered${totalVotes ? ` · ${totalVotes.toLocaleString()} votes cast (2023)` : ''}`
              : d
                ? 'No polling units found.'
                : ''}
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
                  <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '16px', color: '#0f2a1c' }}>won this ward in 2023</div>
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
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '640px' }}>
              <thead>
                <tr style={{ background: '#f4f7f2' }}>
                  <th style={th}>Polling unit</th>
                  <th style={th}>Code</th>
                  <th style={{ ...th, textAlign: 'center' }}>Winner (2023)</th>
                  <th style={{ ...th, textAlign: 'center' }}>Runner-up</th>
                  <th style={{ ...th, textAlign: 'right' }}>Registered</th>
                  <th style={{ ...th, textAlign: 'right' }}>Known votes</th>
                </tr>
              </thead>
              <tbody>
                {d.polling_units.map((p) => (
                  <tr key={p.pu_code} style={{ borderTop: '1px solid #eef2ee' }}>
                    <td style={{ ...td, fontWeight: 800, textTransform: 'capitalize' }}>{p.pu_name || '—'}</td>
                    <td style={{ ...td, fontFamily: 'monospace', color: '#8aa093' }}>{p.pu_code}</td>
                    <td style={{ ...td, textAlign: 'center' }}>{p.winner ? <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '11px', color: '#fff', background: colorOf(p.winner), padding: '3px 10px', borderRadius: '20px' }}>{p.winner}</span> : <span style={{ color: '#b3c2b8' }}>—</span>}</td>
                    <td style={{ ...td, textAlign: 'center', color: p.runner_up ? '#5c6b60' : '#b3c2b8', fontWeight: 800, fontSize: '12px' }}>{p.runner_up || '—'}</td>
                    <td style={{ ...td, textAlign: 'right', fontFamily: "'Archivo Black', sans-serif" }}>{p.registered_voters != null ? p.registered_voters.toLocaleString() : '—'}</td>
                    <td style={{ ...td, textAlign: 'right', fontFamily: "'Archivo Black', sans-serif", color: p.known_votes != null ? '#0f2a1c' : '#b3c2b8' }}>{p.known_votes != null ? p.known_votes.toLocaleString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '13px', color: '#8aa093', margin: '18px 0 0' }}>
          Registered voters and known (cast) votes are from the verified 2023 election data, where available.
        </p>
      </div>

      <HomeFooter />
    </div>
  )
}

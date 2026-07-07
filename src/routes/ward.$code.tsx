import { useEffect, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { HomeNav } from '../components/HomeNav'
import { HomeFooter } from '../components/HomeFooter'
import { API_BASE } from '../config'
import { stateSlug } from '../stateSlug'

export const Route = createFileRoute('/ward/$code')({ component: WardPage })

type PU = { pu_name: string; pu_code: string; registered_voters: number | null; known_votes: number | null }
type Detail = { state: string; lga: string; ward: string; ward_code: string; polling_units: PU[] }

const th: React.CSSProperties = { textAlign: 'left', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '11px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#5c6b60', padding: '12px 14px', whiteSpace: 'nowrap' }
const td: React.CSSProperties = { fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '13px', color: '#0f2a1c', padding: '11px 14px' }

function WardPage() {
  const { code } = Route.useParams()
  const [d, setD] = useState<Detail | null>(null)

  useEffect(() => {
    setD(null)
    fetch(`${API_BASE}/api/wards/${encodeURIComponent(code)}/polling-units`)
      .then((r) => r.json())
      .then((data: Detail) => setD(data))
      .catch(() => setD({ state: '', lga: '', ward: '', ward_code: '', polling_units: [] }))
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
                  <th style={{ ...th, textAlign: 'right' }}>Registered</th>
                  <th style={{ ...th, textAlign: 'right' }}>Known votes (2023)</th>
                </tr>
              </thead>
              <tbody>
                {d.polling_units.map((p) => (
                  <tr key={p.pu_code} style={{ borderTop: '1px solid #eef2ee' }}>
                    <td style={{ ...td, fontWeight: 800, textTransform: 'capitalize' }}>{p.pu_name || '—'}</td>
                    <td style={{ ...td, fontFamily: 'monospace', color: '#8aa093' }}>{p.pu_code}</td>
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

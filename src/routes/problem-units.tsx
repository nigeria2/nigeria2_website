import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { HomeNav } from '../components/HomeNav'
import { HomeFooter } from '../components/HomeFooter'
import { API_BASE } from '../config'

export const Route = createFileRoute('/problem-units')({ component: ProblemUnitsPage })

type Unit = {
  id: number
  state: string
  lga: string
  ward: string
  polling_unit: string
  pu_code: string
  anomaly_type: string
  severity: string
  description: string
  registered_voters: number
  accredited_voters: number
  votes_cast: number
  election_year: string
}
type Meta = { states: string[]; anomaly_types: string[]; total: number }

const sevColor = (s: string) => (s === 'High' ? '#c0392b' : '#b8860b')

const thStyle: React.CSSProperties = { textAlign: 'left', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '11px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#5c6b60', padding: '12px 14px', whiteSpace: 'nowrap' }
const tdStyle: React.CSSProperties = { fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '13px', color: '#0f2a1c', padding: '12px 14px', verticalAlign: 'top' }
const selStyle: React.CSSProperties = { fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '14px', color: '#0f2a1c', background: '#fff', border: '2px solid #cdd8cf', borderRadius: '6px', padding: '10px 14px', cursor: 'pointer' }

function ProblemUnitsPage() {
  const [meta, setMeta] = useState<Meta | null>(null)
  const [state, setState] = useState('')
  const [atype, setAtype] = useState('')
  const [units, setUnits] = useState<Unit[] | null>(null)

  useEffect(() => {
    fetch(`${API_BASE}/api/problem-units/meta`)
      .then((r) => r.json())
      .then((m: Meta) => setMeta(m))
      .catch(() => setMeta({ states: [], anomaly_types: [], total: 0 }))
  }, [])

  useEffect(() => {
    setUnits(null)
    const params = new URLSearchParams()
    if (state) params.set('state', state)
    if (atype) params.set('anomaly_type', atype)
    fetch(`${API_BASE}/api/problem-units?${params.toString()}`)
      .then((r) => r.json())
      .then((d: Unit[]) => setUnits(d))
      .catch(() => setUnits([]))
  }, [state, atype])

  return (
    <div style={{ minHeight: '100vh', background: '#f4f7f2', fontFamily: "'Archivo', sans-serif" }}>
      <HomeNav />

      <div style={{ background: '#0d8244' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '38px 40px 34px' }}>
          <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9fd9b8', marginBottom: '10px' }}>
            2027 Project · electoral integrity
          </div>
          <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '40px', color: '#fff', margin: '0 0 8px', letterSpacing: '-0.01em' }}>Problem Polling Units</h1>
          <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '16px', lineHeight: 1.5, color: '#c7e7d4', margin: '0 0 4px', maxWidth: '68ch' }}>
            Polling units that showed strong anomalies in the 2023 general election — over-voting, impossible turnout,
            single-party sweeps and results that did not match the IReV portal. These are the units to watch in 2027.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '26px 40px 72px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '18px' }}>
          <select value={state} onChange={(e) => setState(e.target.value)} style={selStyle}>
            <option value="">All states</option>
            {(meta?.states ?? []).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select value={atype} onChange={(e) => setAtype(e.target.value)} style={selStyle}>
            <option value="">All anomaly types</option>
            {(meta?.anomaly_types ?? []).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          {(state || atype) && (
            <button onClick={() => { setState(''); setAtype('') }} style={{ ...selStyle, border: '2px solid #0f8a4a', color: '#0f8a4a', background: '#fff' }}>Clear</button>
          )}
          <div style={{ marginLeft: 'auto', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '13px', color: '#5c6b60' }}>
            {units ? `${units.length} flagged unit${units.length === 1 ? '' : 's'}` : ''}
          </div>
        </div>

        {!units ? (
          <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', padding: '60px', textAlign: 'center', fontFamily: "'Archivo Black', sans-serif", fontSize: '18px', color: '#8aa093' }}>Loading…</div>
        ) : units.length === 0 ? (
          <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', padding: '60px', textAlign: 'center', fontFamily: "'Archivo', sans-serif", fontWeight: 700, color: '#8aa093' }}>No flagged units for this filter.</div>
        ) : (
          <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '920px' }}>
              <thead>
                <tr style={{ background: '#f4f7f2' }}>
                  <th style={thStyle}>State / LGA</th>
                  <th style={thStyle}>Polling Unit</th>
                  <th style={thStyle}>Anomaly</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Registered</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Accredited</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Votes cast</th>
                </tr>
              </thead>
              <tbody>
                {units.map((u) => (
                  <tr key={u.id} style={{ borderTop: '1px solid #eef2ee' }}>
                    <td style={tdStyle}>
                      <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '13px', color: '#0f2a1c' }}>{u.state}</div>
                      <div style={{ color: '#5c6b60', fontSize: '12px' }}>{u.lga} · {u.ward}</div>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 800 }}>{u.polling_unit}</div>
                      <div style={{ color: '#8aa093', fontSize: '12px', fontFamily: 'monospace' }}>{u.pu_code}</div>
                    </td>
                    <td style={{ ...tdStyle, maxWidth: '300px' }}>
                      <span style={{ display: 'inline-block', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '11px', color: '#fff', background: sevColor(u.severity), padding: '3px 9px', borderRadius: '20px', marginBottom: '5px' }}>
                        {u.severity} · {u.anomaly_type}
                      </span>
                      <div style={{ color: '#5c6b60', fontSize: '12px', lineHeight: 1.4 }}>{u.description}</div>
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right', fontFamily: "'Archivo Black', sans-serif" }}>{u.registered_voters.toLocaleString()}</td>
                    <td style={{ ...tdStyle, textAlign: 'right', fontFamily: "'Archivo Black', sans-serif", color: u.accredited_voters > u.registered_voters ? '#c0392b' : '#0f2a1c' }}>{u.accredited_voters.toLocaleString()}</td>
                    <td style={{ ...tdStyle, textAlign: 'right', fontFamily: "'Archivo Black', sans-serif", color: u.votes_cast > u.accredited_voters ? '#c0392b' : '#0f2a1c' }}>{u.votes_cast.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '13px', color: '#8aa093', margin: '22px 0 0' }}>
          Figures in red exceed the value on the line above them — a mathematical impossibility that flags the unit for review.
          Illustrative dataset pending the full 2023 forensic reconciliation.
        </p>
      </div>

      <HomeFooter />
    </div>
  )
}

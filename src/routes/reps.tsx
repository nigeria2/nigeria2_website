import { useEffect, useMemo, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { HomeNav } from '../components/HomeNav'
import { HomeFooter } from '../components/HomeFooter'
import { API_BASE } from '../config'
import { stateSlug } from '../stateSlug'
import { politicianSlug } from '../politicianSlug'

export const Route = createFileRoute('/reps')({
  component: RepsPage,
})

const COLORS: Record<string, string> = { APC: '#1f6fd6', PDP: '#c0392b', LP: '#e05a1f', NNPP: '#f0b429', APGA: '#7b3fb5', SDP: '#0f8a4a', NDC: '#0e7490', ADC: '#db2777', YPP: '#00838f' }
const colorOf = (p: string) => COLORS[p] ?? '#5c6b60'

type Rep = { id: number; state: string; constituency: string; name: string; party: string; politician_id: number | null }

const th: React.CSSProperties = { textAlign: 'left', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '11px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#5c6b60', padding: '10px 14px', whiteSpace: 'nowrap' }
const td: React.CSSProperties = { fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '13px', color: '#0f2a1c', padding: '10px 14px', verticalAlign: 'middle' }

function Party({ p }: { p: string }) {
  if (!p) return <span style={{ color: '#8aa093' }}>—</span>
  return <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '11px', color: '#fff', background: colorOf(p), padding: '2px 10px', borderRadius: '20px', whiteSpace: 'nowrap' }}>{p}</span>
}

function RepsPage() {
  const [rows, setRows] = useState<Rep[] | null>(null)
  const [q, setQ] = useState('')

  useEffect(() => {
    fetch(`${API_BASE}/api/reps`).then((r) => (r.ok ? r.json() : [])).then((d: Rep[]) => setRows(d)).catch(() => setRows([]))
  }, [])

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase()
    const list = rows || []
    if (!t) return list
    return list.filter((r) => [r.name, r.state, r.constituency, r.party].join(' ').toLowerCase().includes(t))
  }, [rows, q])

  const states = useMemo(() => new Set((rows || []).map((r) => r.state)).size, [rows])

  return (
    <div style={{ minHeight: '100vh', background: '#f4f7f2', fontFamily: "'Archivo', sans-serif" }}>
      <HomeNav />

      <div style={{ background: '#0d8244' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '30px 40px 26px' }}>
          <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9fd9b8', marginBottom: '8px' }}>10th National Assembly · 2023–2027</div>
          <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '34px', color: '#fff', margin: '0 0 6px' }}>House of Representatives</h1>
          <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '15px', color: '#c7e7d4', margin: 0, maxWidth: '70ch' }}>
            Members by federal constituency. This is a partial roster — Wikipedia's machine-readable pages cover part of the 360 seats and carry no vote counts for the House; we'll fill the rest as better data becomes available.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '26px 40px 72px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by member, state, constituency or party…"
            style={{ flex: 1, minWidth: '260px', border: '2px solid #d7e0d9', borderRadius: '6px', background: '#fff', padding: '11px 14px', fontFamily: "'Archivo', sans-serif", fontSize: '15px', color: '#0f2a1c' }}
          />
          <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '13px', color: '#5c6b60' }}>{filtered.length} member{filtered.length === 1 ? '' : 's'} · {states} states</span>
        </div>

        {!rows ? (
          <div style={{ padding: '60px', textAlign: 'center', fontFamily: "'Archivo Black', sans-serif", color: '#8aa093' }}>Loading…</div>
        ) : (
          <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '640px' }}>
              <thead>
                <tr style={{ background: '#f4f7f2' }}>
                  <th style={th}>Member</th>
                  <th style={th}>State</th>
                  <th style={th}>Federal Constituency</th>
                  <th style={th}>Party</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} style={{ borderTop: '1px solid #eef2ee' }}>
                    <td style={td}>
                      {r.politician_id ? (
                        <Link to="/politician/$id" params={{ id: politicianSlug(r.politician_id, r.name) }} style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '14px', color: '#0f2a1c', textDecoration: 'none' }}>{r.name}</Link>
                      ) : (
                        <span style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '14px', color: '#0f2a1c' }}>{r.name}</span>
                      )}
                    </td>
                    <td style={td}>
                      <Link to="/states/$state" params={{ state: stateSlug(r.state) }} style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '13px', color: '#0f8a4a', textDecoration: 'none' }}>{r.state}</Link>
                    </td>
                    <td style={td}>{r.constituency}</td>
                    <td style={td}><Party p={r.party} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ marginTop: '22px' }}>
          <Link to="/senators" style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '13px', color: '#0f8a4a', textDecoration: 'none' }}>See the Senate →</Link>
        </div>
      </div>

      <HomeFooter />
    </div>
  )
}

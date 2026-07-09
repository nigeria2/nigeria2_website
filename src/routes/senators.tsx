import { useEffect, useMemo, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { HomeNav } from '../components/HomeNav'
import { HomeFooter } from '../components/HomeFooter'
import { API_BASE } from '../config'
import { stateSlug } from '../stateSlug'

export const Route = createFileRoute('/senators')({
  component: SenatorsPage,
})

const COLORS: Record<string, string> = { APC: '#1f6fd6', PDP: '#c0392b', LP: '#e05a1f', NNPP: '#f0b429', APGA: '#7b3fb5', SDP: '#0f8a4a', NDC: '#0e7490', ADC: '#db2777', YPP: '#00838f' }
const colorOf = (p: string) => COLORS[p] ?? '#5c6b60'

type Senator = {
  id: number; name: string; state: string; district: string; party: string
  gender: string | null; age: number | null; terms: number | null
  leadership: string | null; politician_id: number | null
  votes_2023: number | null; constituency: string | null
}

const th: React.CSSProperties = { textAlign: 'left', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '11px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#5c6b60', padding: '10px 14px', whiteSpace: 'nowrap' }
const td: React.CSSProperties = { fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '13px', color: '#0f2a1c', padding: '10px 14px', verticalAlign: 'middle' }

function Party({ p }: { p: string }) {
  if (!p) return <span style={{ color: '#8aa093' }}>—</span>
  return <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '11px', color: '#fff', background: colorOf(p), padding: '2px 10px', borderRadius: '20px', whiteSpace: 'nowrap' }}>{p}</span>
}

function SenatorsPage() {
  const [rows, setRows] = useState<Senator[] | null>(null)
  const [q, setQ] = useState('')

  useEffect(() => {
    fetch(`${API_BASE}/api/senators`)
      .then((r) => (r.ok ? r.json() : []))
      .then((d: Senator[]) => setRows(d))
      .catch(() => setRows([]))
  }, [])

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase()
    const list = rows || []
    if (!t) return list
    return list.filter((s) => [s.name, s.state, s.district, s.party, s.leadership || ''].join(' ').toLowerCase().includes(t))
  }, [rows, q])

  return (
    <div style={{ minHeight: '100vh', background: '#f4f7f2', fontFamily: "'Archivo', sans-serif" }}>
      <HomeNav />

      <div style={{ background: '#0d8244' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '30px 40px 26px' }}>
          <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9fd9b8', marginBottom: '8px' }}>10th National Assembly · 2023–2027</div>
          <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '34px', color: '#fff', margin: '0 0 6px' }}>The Senate</h1>
          <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '15px', color: '#c7e7d4', margin: 0, maxWidth: '66ch' }}>
            All 109 senators of the Federal Republic — three per state plus one for the FCT. Winning vote totals are shown where INEC/Wikipedia published them (some districts list only candidates). Click a name for their full profile.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '26px 40px 72px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, state, district or party…"
            style={{ flex: 1, minWidth: '260px', border: '2px solid #d7e0d9', borderRadius: '6px', background: '#fff', padding: '11px 14px', fontFamily: "'Archivo', sans-serif", fontSize: '15px', color: '#0f2a1c' }}
          />
          <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '13px', color: '#5c6b60' }}>{filtered.length} senator{filtered.length === 1 ? '' : 's'}</span>
        </div>

        {!rows ? (
          <div style={{ padding: '60px', textAlign: 'center', fontFamily: "'Archivo Black', sans-serif", color: '#8aa093' }}>Loading…</div>
        ) : (
          <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '720px' }}>
              <thead>
                <tr style={{ background: '#f4f7f2' }}>
                  <th style={th}>Senator</th>
                  <th style={th}>State</th>
                  <th style={th}>District</th>
                  <th style={th}>Party</th>
                  <th style={{ ...th, textAlign: 'right' }}>2023 Votes</th>
                  <th style={{ ...th, textAlign: 'right' }}>Age</th>
                  <th style={th}>Gender</th>
                  <th style={{ ...th, textAlign: 'right' }}>Terms</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} style={{ borderTop: '1px solid #eef2ee' }}>
                    <td style={td}>
                      {s.politician_id ? (
                        <Link to="/politician/$id" params={{ id: String(s.politician_id) }} style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '14px', color: '#0f2a1c', textDecoration: 'none' }}>{s.name}</Link>
                      ) : (
                        <span style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '14px', color: '#0f2a1c' }}>{s.name}</span>
                      )}
                      {s.leadership && <span style={{ display: 'inline-block', marginLeft: '8px', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '10px', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#0f4a2c', background: '#e7f3ec', padding: '2px 8px', borderRadius: '20px' }}>{s.leadership}</span>}
                    </td>
                    <td style={td}>
                      <Link to="/states/$state" params={{ state: stateSlug(s.state) }} style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '13px', color: '#0f8a4a', textDecoration: 'none' }}>{s.state}</Link>
                    </td>
                    <td style={td}>{s.district}</td>
                    <td style={td}><Party p={s.party} /></td>
                    <td style={{ ...td, textAlign: 'right', fontFamily: "'Archivo Black', sans-serif" }}>{s.votes_2023 != null ? s.votes_2023.toLocaleString() : <span style={{ fontFamily: "'Archivo', sans-serif", color: '#c3ccc6' }}>—</span>}</td>
                    <td style={{ ...td, textAlign: 'right' }}>{s.age ?? '—'}</td>
                    <td style={td}>{s.gender ?? '—'}</td>
                    <td style={{ ...td, textAlign: 'right' }}>{s.terms ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ marginTop: '22px' }}>
          <Link to="/politicians" style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '13px', color: '#0f8a4a', textDecoration: 'none' }}>Explore all politicians →</Link>
        </div>
      </div>

      <HomeFooter />
    </div>
  )
}

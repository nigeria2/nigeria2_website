import { useEffect, useMemo, useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Protected } from '../components/Protected'
import { apiFetch, useAuth } from '../auth'

export const Route = createFileRoute('/admin')({
  component: () => (
    <Protected admin>
      <Admin />
    </Protected>
  ),
})

type View = 'users' | 'experts' | 'traces' | 'predictions' | 'model' | 'ballots' | 'politicians'

const NAV: { id: View; label: string; icon: string }[] = [
  { id: 'users', label: 'Interested Users', icon: '👥' },
  { id: 'experts', label: 'Experts', icon: '🎓' },
  { id: 'traces', label: 'Traces', icon: '🧭' },
  { id: 'predictions', label: 'Predictions', icon: '🎯' },
  { id: 'model', label: 'Prediction Model', icon: '⚙️' },
  { id: 'ballots', label: 'Party Ballots', icon: '🗳️' },
  { id: 'politicians', label: 'Politicians', icon: '🏛️' },
]

const TYPE_LABEL: Record<string, string> = { presidential: 'Presidential', governor: 'Governor', senate: 'Senate' }
const ELECTION_PARTIES: Record<string, string[]> = {
  presidential: ['APC', 'PDP', 'NDC', 'NNPP', 'ADC', 'LP'],
  governor: ['APC', 'PDP', 'LP', 'NNPP', 'APGA', 'SDP'],
  senate: ['APC', 'PDP', 'LP', 'NNPP', 'APGA', 'SDP'],
}

const thStyle: React.CSSProperties = { textAlign: 'left', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '11px', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#8aa093', padding: '12px 16px', whiteSpace: 'nowrap' }
const tdStyle: React.CSSProperties = { padding: '13px 16px', verticalAlign: 'middle', fontFamily: "'Archivo', sans-serif", fontSize: '14px', color: '#33413a', whiteSpace: 'nowrap' }

function Admin() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [view, setView] = useState<View>('users')

  const navBtn = (active: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    textAlign: 'left',
    padding: '12px 14px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontFamily: "'Archivo', sans-serif",
    fontWeight: 800,
    fontSize: '14px',
    background: active ? '#0f8a4a' : 'transparent',
    color: active ? '#fff' : '#33413a',
  })

  return (
    <div style={{ minHeight: '100vh', background: '#eef2ec', fontFamily: "'Archivo', sans-serif" }}>
      {/* top bar */}
      <div style={{ background: '#0a6337', display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 28px' }}>
        <Link to="/" style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '20px', letterSpacing: '-0.01em', color: '#fff', textDecoration: 'none' }}>
          N<span style={{ color: '#ffe14d' }}>2.0</span>
        </Link>
        <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '13px', letterSpacing: '0.14em', color: '#9fd9b8', textTransform: 'uppercase' }}>Admin</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '12px', letterSpacing: '0.04em', color: '#ffe14d', background: 'rgba(255,225,77,0.14)', border: '1px solid rgba(255,225,77,0.4)', borderRadius: '20px', padding: '6px 13px', textTransform: 'uppercase' }}>Administrator</div>
          <div style={{ textAlign: 'right', lineHeight: 1.15 }}>
            <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '14px', color: '#fff' }}>{user?.full_name || 'Admin'}</div>
            <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '12px', color: '#9fd9b8' }}>{user?.email || ''}</div>
          </div>
          <Link to="/dashboard" style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '12px', letterSpacing: '0.04em', color: '#0f4a2c', background: '#ffe14d', borderRadius: '4px', padding: '9px 14px', textDecoration: 'none', textTransform: 'uppercase' }}>Dashboard</Link>
          <button onClick={() => { logout(); navigate({ to: '/' }) }} style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '12px', letterSpacing: '0.04em', color: '#fff', background: 'transparent', border: '2px solid rgba(255,255,255,0.4)', borderRadius: '4px', padding: '8px 14px', textTransform: 'uppercase', cursor: 'pointer' }}>Log out</button>
        </div>
      </div>

      <div className="admin-shell" style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 28px 70px', display: 'flex', gap: '22px', alignItems: 'flex-start' }}>
        {/* sidebar */}
        <div className="admin-sidebar" style={{ width: '240px', flex: 'none', background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', padding: '10px' }}>
          {NAV.map((n) => (
            <button key={n.id} onClick={() => setView(n.id)} style={navBtn(view === n.id)}>
              <span aria-hidden>{n.icon}</span>
              {n.label}
            </button>
          ))}
        </div>

        {/* main */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {view === 'users' ? <SignedUpUsers /> : view === 'experts' ? <Experts /> : view === 'predictions' ? <Predictions /> : view === 'model' ? <ModelScenarios /> : view === 'ballots' ? <PartyBallots /> : view === 'politicians' ? <PoliticiansAdmin /> : <Traces />}
        </div>
      </div>
    </div>
  )
}

type SignupRow = {
  id: number
  full_name: string
  email: string
  location: string
  state: string
  mobile: string
  created_at: string | null
}

function fmtDate(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function SignedUpUsers() {
  const { token } = useAuth()
  const [rows, setRows] = useState<SignupRow[] | null>(null)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')

  useEffect(() => {
    let active = true
    setError('')
    setRows(null)
    apiFetch('/api/admin/interested-users', token)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status))
        return r.json()
      })
      .then((data: SignupRow[]) => {
        if (active) setRows(data)
      })
      .catch(() => {
        if (active) setError('Could not load users. Please try again.')
      })
    return () => {
      active = false
    }
  }, [token])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!rows) return []
    if (!q) return rows
    return rows.filter((r) => [r.full_name, r.email, r.location, r.state, r.mobile].some((v) => (v || '').toLowerCase().includes(q)))
  }, [rows, query])

  const exportCsv = () => {
    const head = ['Name', 'Email', 'Location', 'State', 'Mobile', 'Joined']
    const csv = [head.join(',')]
      .concat(filtered.map((r) => [r.full_name, r.email, r.location, r.state, r.mobile, fmtDate(r.created_at)].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')))
      .join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'n2-interested-users.csv'
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 2000)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '18px' }}>
        <div>
          <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '28px', color: '#0f2a1c', margin: '0 0 4px' }}>Interested users</h1>
          <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '15px', color: '#5c6b60', margin: 0 }}>
            {rows === null ? 'Loading…' : `${rows.length} ${rows.length === 1 ? 'person has' : 'people have'} registered interest — awaiting Google sign-up. Once they sign in they move to Experts.`}
          </p>
        </div>
        {rows && rows.length > 0 && (
          <button onClick={exportCsv} style={{ border: 'none', borderRadius: '4px', background: '#0f8a4a', color: '#fff', fontFamily: "'Archivo Black', sans-serif", fontSize: '14px', padding: '12px 18px', cursor: 'pointer' }}>⭳ Export CSV</button>
        )}
      </div>

      <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #eef2ee' }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, location, state…"
            style={{ width: '100%', maxWidth: '420px', border: '2px solid #d7e0d9', borderRadius: '4px', background: '#f9fbf8', padding: '11px 13px', fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '14px', color: '#0f2a1c' }}
          />
        </div>

        {error ? (
          <div style={{ padding: '44px', textAlign: 'center', fontFamily: "'Archivo', sans-serif", fontWeight: 700, color: '#c0392b' }}>{error}</div>
        ) : rows === null ? (
          <div style={{ padding: '44px', textAlign: 'center', fontFamily: "'Archivo', sans-serif", fontWeight: 700, color: '#8aa093' }}>Loading users…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '44px', textAlign: 'center' }}>
            <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '18px', color: '#0f2a1c', marginBottom: '4px' }}>{rows.length === 0 ? 'No sign-ups yet' : 'No matches'}</div>
            <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '14px', color: '#5c6b60', margin: 0 }}>
              {rows.length === 0 ? 'People who use the “Join the movement” form will appear here.' : 'Try a different search.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '760px' }}>
              <thead>
                <tr style={{ background: '#f4f7f2' }}>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Location</th>
                  <th style={thStyle}>State</th>
                  <th style={thStyle}>Mobile</th>
                  <th style={thStyle}>Joined</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="n2row" style={{ borderTop: '1px solid #eef2ee' }}>
                    <td style={{ ...tdStyle, fontWeight: 800, color: '#0f2a1c' }}>{r.full_name}</td>
                    <td style={tdStyle}>{r.email}</td>
                    <td style={tdStyle}>{r.location}</td>
                    <td style={tdStyle}>{r.state}</td>
                    <td style={tdStyle}>{r.mobile}</td>
                    <td style={{ ...tdStyle, color: '#8aa093', fontWeight: 700 }}>{fmtDate(r.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

const PARTY_COLORS: Record<string, string> = { APC: '#1f6fd6', PDP: '#c0392b', LP: '#e05a1f', NNPP: '#f0b429', APGA: '#7b3fb5', SDP: '#0f8a4a', NDC: '#0e7490', ADC: '#db2777' }

function weekLabel(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  return isNaN(d.getTime()) ? iso : `Week of ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
}

type AnalysisRow = { id: number; contributor_name: string; contributor_email: string; election_type: string; state: string; lga: string; senatorial_district: string; leading_party: string; scores: Record<string, number>; notes: string; measurement_week: string }

function Traces() {
  const { token } = useAuth()
  const [rows, setRows] = useState<AnalysisRow[] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    apiFetch('/api/admin/analyses', token)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status))
        return r.json()
      })
      .then((data: AnalysisRow[]) => setRows(data))
      .catch(() => setError('Could not load analyses.'))
  }, [token])

  const byWeek = useMemo(() => {
    if (!rows) return []
    const m: Record<string, AnalysisRow[]> = {}
    rows.forEach((t) => (m[t.measurement_week] ??= []).push(t))
    return Object.keys(m).sort((a, b) => b.localeCompare(a)).map((w) => ({ week: w, items: m[w] }))
  }, [rows])

  return (
    <div>
      <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '28px', color: '#0f2a1c', margin: '0 0 4px' }}>Traces</h1>
      <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '15px', color: '#5c6b60', margin: '0 0 22px' }}>
        {rows === null ? 'Loading…' : `${rows.length} contributor analyses, grouped by measurement week.`}
      </p>

      {error ? (
        <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', padding: '44px', textAlign: 'center', fontFamily: "'Archivo', sans-serif", fontWeight: 700, color: '#c0392b' }}>{error}</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {byWeek.map(({ week, items }) => (
            <div key={week} style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid #eef2ee', background: '#f4f7f2' }}>
                <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '15px', color: '#0f2a1c' }}>{weekLabel(week)}</div>
                <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '12px', color: '#8aa093' }}>{items.length} analyses</div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '820px' }}>
                  <thead>
                    <tr style={{ background: '#f9fbf8' }}>
                      <th style={thStyle}>Contributor</th>
                      <th style={thStyle}>Location</th>
                      <th style={thStyle}>Race</th>
                      <th style={thStyle}>Projection</th>
                      <th style={thStyle}>Reasoning</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((t) => {
                      const top = Object.entries(t.scores || {}).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).slice(0, 3)
                      return (
                        <tr key={t.id} className="n2row" style={{ borderTop: '1px solid #eef2ee' }}>
                          <td style={tdStyle}>
                            <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '14px', color: '#0f2a1c' }}>{t.contributor_name || '—'}</div>
                            <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '12px', color: '#8aa093' }}>{t.contributor_email}</div>
                          </td>
                          <td style={tdStyle}>
                            <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '14px', color: '#0f2a1c' }}>{t.state}</div>
                            <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '12px', color: '#8aa093' }}>{t.senatorial_district || t.lga || '—'}</div>
                          </td>
                          <td style={tdStyle}><span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '12px', color: '#33413a', background: '#eef2ec', padding: '4px 10px', borderRadius: '20px' }}>{TYPE_LABEL[t.election_type] ?? t.election_type}</span></td>
                          <td style={tdStyle}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: '150px' }}>
                              {top.map(([p, v]) => (
                                <div key={p} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span style={{ width: '40px', fontFamily: "'Archivo Black', sans-serif", fontSize: '10px', color: '#fff', background: PARTY_COLORS[p] ?? '#8aa093', padding: '2px 0', borderRadius: '4px', textAlign: 'center', flex: 'none' }}>{p}</span>
                                  <span style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '12px', color: '#5c6b60' }}>{v}%</span>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td style={{ ...tdStyle, whiteSpace: 'normal', maxWidth: '280px', color: '#33413a', fontWeight: 500 }}>{t.notes}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

type Expert = { id: number; full_name: string; email: string; home_state?: string | null; onboarded: boolean; is_admin: boolean; created_at?: string | null; last_login_at?: string | null }

function Experts() {
  const { token } = useAuth()
  const [rows, setRows] = useState<Expert[] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    apiFetch('/api/admin/users', token)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status))
        return r.json()
      })
      .then((data: Expert[]) => setRows(data))
      .catch(() => setError('Could not load experts.'))
  }, [token])

  return (
    <div>
      <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '28px', color: '#0f2a1c', margin: '0 0 4px' }}>Experts</h1>
      <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '15px', color: '#5c6b60', margin: '0 0 22px' }}>
        {rows === null ? 'Loading…' : `${rows.length} signed-in contributor${rows.length === 1 ? '' : 's'}.`}
      </p>

      {error ? (
        <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', padding: '44px', textAlign: 'center', fontFamily: "'Archivo', sans-serif", fontWeight: 700, color: '#c0392b' }}>{error}</div>
      ) : rows && rows.length === 0 ? (
        <div style={{ background: '#fff', border: '2px dashed #cdd8cf', borderRadius: '10px', padding: '48px', textAlign: 'center' }}>
          <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '18px', color: '#0f2a1c', marginBottom: '4px' }}>No experts yet</div>
          <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '14px', color: '#5c6b60', margin: 0 }}>People who sign in with Google appear here.</p>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '760px' }}>
              <thead>
                <tr style={{ background: '#f4f7f2' }}>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Home state</th>
                  <th style={thStyle}>Onboarded</th>
                  <th style={thStyle}>Role</th>
                  <th style={thStyle}>Joined</th>
                </tr>
              </thead>
              <tbody>
                {(rows ?? []).map((u) => (
                  <tr key={u.id} className="n2row" style={{ borderTop: '1px solid #eef2ee' }}>
                    <td style={{ ...tdStyle, fontWeight: 800, color: '#0f2a1c' }}>{u.full_name || '—'}</td>
                    <td style={tdStyle}>{u.email}</td>
                    <td style={tdStyle}>{u.home_state || '—'}</td>
                    <td style={tdStyle}>{u.onboarded ? '✓' : '—'}</td>
                    <td style={tdStyle}>{u.is_admin ? <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '11px', color: '#0f4a2c', background: '#ffe14d', padding: '3px 9px', borderRadius: '20px' }}>Admin</span> : 'Contributor'}</td>
                    <td style={{ ...tdStyle, color: '#8aa093', fontWeight: 700 }}>{fmtDate(u.created_at ?? null)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

type PredRow = { state: string; scores: Record<string, number>; aggregate: Record<string, number>; trace_count: number }

function Predictions() {
  const { token } = useAuth()
  const [etype, setEtype] = useState('governor')
  const [week, setWeek] = useState('')
  const [weeks, setWeeks] = useState<string[]>([])
  const [rows, setRows] = useState<PredRow[] | null>(null)
  const [values, setValues] = useState<Record<string, Record<string, number>>>({})
  const [saved, setSaved] = useState<Record<string, boolean>>({})
  const [error, setError] = useState('')

  useEffect(() => {
    apiFetch('/api/predictions/meta', token)
      .then((r) => r.json())
      .then((m) => {
        setWeeks(m.weeks || [])
        if (m.weeks?.length) setWeek(m.weeks[0])
      })
      .catch(() => {})
  }, [token])

  useEffect(() => {
    if (!week) return
    setRows(null)
    setError('')
    apiFetch(`/api/admin/predictions?election_type=${encodeURIComponent(etype)}&week=${encodeURIComponent(week)}`, token)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status))
        return r.json()
      })
      .then((data: PredRow[]) => {
        setRows(data)
        const v: Record<string, Record<string, number>> = {}
        data.forEach((row) => {
          v[row.state] = {}
          ;(ELECTION_PARTIES[etype] ?? ELECTION_PARTIES.governor).forEach((p) => (v[row.state][p] = Math.round(row.scores[p] ?? 0)))
        })
        setValues(v)
        setSaved({})
      })
      .catch(() => setError('Could not load predictions.'))
  }, [etype, week, token])

  const parties = ELECTION_PARTIES[etype] ?? ELECTION_PARTIES.governor

  const setVal = (state: string, party: string, val: number) => {
    setValues((s) => ({ ...s, [state]: { ...s[state], [party]: val } }))
    setSaved((s) => ({ ...s, [state]: false }))
  }
  const useAggregate = (row: PredRow) => {
    const v: Record<string, number> = {}
    parties.forEach((p) => (v[p] = Math.round(row.aggregate[p] ?? 0)))
    setValues((s) => ({ ...s, [row.state]: v }))
    setSaved((s) => ({ ...s, [row.state]: false }))
  }
  const save = async (state: string) => {
    try {
      const res = await apiFetch('/api/admin/predictions', token, {
        method: 'PUT',
        body: JSON.stringify({ election_type: etype, week, state, scores: values[state] || {} }),
      })
      if (res.ok) setSaved((s) => ({ ...s, [state]: true }))
    } catch {
      /* ignore */
    }
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '14px', padding: '9px 18px', borderRadius: '30px', cursor: 'pointer', border: '2px solid #0f8a4a', background: active ? '#0f8a4a' : '#fff', color: active ? '#fff' : '#0f8a4a' })
  const numInput: React.CSSProperties = { width: '46px', border: '2px solid #d7e0d9', borderRadius: '4px', background: '#f9fbf8', padding: '6px 2px', fontFamily: "'Archivo Black', sans-serif", fontSize: '13px', color: '#0f2a1c', textAlign: 'center' }

  return (
    <div>
      <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '28px', color: '#0f2a1c', margin: '0 0 4px' }}>Set predictions</h1>
      <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '15px', color: '#5c6b60', margin: '0 0 20px' }}>
        Tune the official per-party projection for each state. The user-trace aggregate is shown for reference — click “Use” to copy it into the inputs, then Save.
      </p>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '18px' }}>
        {['governor', 'presidential'].map((t) => (
          <button key={t} onClick={() => setEtype(t)} style={tabStyle(etype === t)}>{TYPE_LABEL[t]}</button>
        ))}
        <select value={week} onChange={(e) => setWeek(e.target.value)} style={{ marginLeft: 'auto', fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '14px', color: '#0f2a1c', background: '#fff', border: '2px solid #cdd8cf', borderRadius: '6px', padding: '10px 14px', cursor: 'pointer' }}>
          {weeks.map((w) => (
            <option key={w} value={w}>{weekLabel(w)}</option>
          ))}
        </select>
      </div>

      {error ? (
        <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', padding: '44px', textAlign: 'center', fontFamily: "'Archivo', sans-serif", fontWeight: 700, color: '#c0392b' }}>{error}</div>
      ) : !rows ? (
        <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', padding: '44px', textAlign: 'center', fontFamily: "'Archivo', sans-serif", fontWeight: 700, color: '#8aa093' }}>Loading…</div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
            <thead>
              <tr style={{ background: '#f4f7f2' }}>
                <th style={thStyle}>State</th>
                {parties.map((p) => (
                  <th key={p} style={{ ...thStyle, textAlign: 'center' }}><span style={{ color: PARTY_COLORS[p] }}>{p}</span></th>
                ))}
                <th style={thStyle}>User traces (avg)</th>
                <th style={{ ...thStyle, textAlign: 'right' }}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const topAgg = Object.entries(row.aggregate).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).slice(0, 3)
                return (
                  <tr key={row.state} style={{ borderTop: '1px solid #eef2ee' }}>
                    <td style={{ ...tdStyle, fontWeight: 800, color: '#0f2a1c' }}>{row.state}</td>
                    {parties.map((p) => (
                      <td key={p} style={{ ...tdStyle, textAlign: 'center' }}>
                        <input type="number" min={0} max={100} value={values[row.state]?.[p] ?? 0} onChange={(e) => setVal(row.state, p, Number(e.target.value))} style={numInput} />
                      </td>
                    ))}
                    <td style={tdStyle}>
                      {row.trace_count > 0 ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '11px', color: '#0f8a4a', background: '#e7f3ec', padding: '2px 8px', borderRadius: '20px' }}>{row.trace_count}</span>
                          <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '12px', color: '#5c6b60' }}>{topAgg.map(([p, v]) => `${p} ${v}`).join(' · ')}</span>
                          <button onClick={() => useAggregate(row)} style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '11px', color: '#0f8a4a', background: '#fff', border: '2px solid #0f8a4a', borderRadius: '4px', padding: '3px 8px', cursor: 'pointer' }}>Use</button>
                        </div>
                      ) : (
                        <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '12px', color: '#b3c2b8' }}>No traces</span>
                      )}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      <button onClick={() => save(row.state)} style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '12px', color: saved[row.state] ? '#0f8a4a' : '#fff', background: saved[row.state] ? '#e7f3ec' : '#0f8a4a', border: 'none', borderRadius: '4px', padding: '8px 14px', cursor: 'pointer' }}>{saved[row.state] ? '✓ Saved' : 'Save'}</button>
                    </td>
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

type PartyRow = { acronym: string; name: string }

function PartyBallots() {
  const { token } = useAuth()
  const [parties, setParties] = useState<PartyRow[] | null>(null)
  const [rel, setRel] = useState<Record<string, string[]>>({})
  const [etype, setEtype] = useState('presidential')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    apiFetch('/api/parties', token).then((r) => r.json()).then((d: PartyRow[]) => setParties(d)).catch(() => setParties([]))
    apiFetch('/api/parties/elections', token).then((r) => r.json()).then((d: Record<string, string[]>) => setRel(d)).catch(() => {})
  }, [token])

  const selected = new Set(rel[etype] ?? [])
  const toggle = (acr: string) => {
    setSaved(false)
    setRel((r) => {
      const cur = new Set(r[etype] ?? [])
      if (cur.has(acr)) cur.delete(acr)
      else cur.add(acr)
      return { ...r, [etype]: [...cur] }
    })
  }
  const save = async () => {
    const res = await apiFetch('/api/admin/parties/elections', token, {
      method: 'PUT',
      body: JSON.stringify({ election_type: etype, acronyms: rel[etype] ?? [] }),
    })
    if (res.ok) setSaved(true)
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '14px', padding: '9px 18px', borderRadius: '30px', cursor: 'pointer', border: '2px solid #0f8a4a', background: active ? '#0f8a4a' : '#fff', color: active ? '#fff' : '#0f8a4a' })

  return (
    <div>
      <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '28px', color: '#0f2a1c', margin: '0 0 4px' }}>Party ballots</h1>
      <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '15px', color: '#5c6b60', margin: '0 0 20px' }}>
        Choose which parties appear on the ballot for each race. This controls the sliders contributors see and the columns in the predictions editor.
      </p>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '18px' }}>
        {['presidential', 'governor', 'senate'].map((t) => (
          <button key={t} onClick={() => { setEtype(t); setSaved(false) }} style={tabStyle(etype === t)}>{TYPE_LABEL[t]}</button>
        ))}
        <span style={{ marginLeft: 'auto', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '13px', color: '#5c6b60' }}>{selected.size} selected</span>
      </div>

      {!parties ? (
        <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', padding: '44px', textAlign: 'center', fontFamily: "'Archivo', sans-serif", fontWeight: 700, color: '#8aa093' }}>Loading…</div>
      ) : (
        <>
          <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', padding: '18px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '10px' }}>
            {parties.map((p) => {
              const on = selected.has(p.acronym)
              return (
                <label key={p.acronym} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', border: `2px solid ${on ? '#0f8a4a' : '#e4ebe5'}`, background: on ? '#eef7f1' : '#fff' }}>
                  <input type="checkbox" checked={on} onChange={() => toggle(p.acronym)} style={{ width: '17px', height: '17px', accentColor: '#0f8a4a', flex: 'none' }} />
                  <span style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '12px', color: on ? '#0f8a4a' : '#5c6b60', minWidth: '42px', flex: 'none' }}>{p.acronym}</span>
                  <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '12px', color: '#5c6b60', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                </label>
              )
            })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '18px' }}>
            <button onClick={save} style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '15px', color: '#fff', background: '#0f8a4a', border: 'none', borderRadius: '6px', padding: '12px 26px', cursor: 'pointer' }}>Save {TYPE_LABEL[etype]} ballot</button>
            {saved && <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '14px', color: '#0f8a4a' }}>✓ Saved</span>}
          </div>
        </>
      )}
    </div>
  )
}

const ADMIN_STATES = ['Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara']

type PhotoSub = { id: number; politician_id: number; politician_name: string; state: string; author_name: string; image: string; created_at: string | null }

function PoliticiansAdmin() {
  const { token } = useAuth()
  const [subs, setSubs] = useState<PhotoSub[] | null>(null)
  const [form, setForm] = useState({ name: '', state: 'Akwa Ibom', title: '', party: '' })
  const [added, setAdded] = useState('')

  const loadSubs = () => apiFetch('/api/admin/politician-photos', token).then((r) => (r.ok ? r.json() : [])).then(setSubs).catch(() => setSubs([]))
  useEffect(() => {
    if (token) loadSubs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const addPolitician = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    const res = await apiFetch('/api/admin/politicians', token, { method: 'POST', body: JSON.stringify(form) })
    if (res.ok) {
      setAdded(`✓ Added ${form.name}`)
      setForm({ name: '', state: form.state, title: '', party: '' })
    }
  }
  const act = async (id: number, action: 'approve' | 'reject') => {
    const res = await apiFetch(`/api/admin/politician-photos/${id}/${action}`, token, { method: 'POST' })
    if (res.ok) loadSubs()
  }

  const lbl2: React.CSSProperties = { display: 'block', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '11px', letterSpacing: '0.05em', color: '#0f2a1c', textTransform: 'uppercase', marginBottom: '5px' }
  const inp2: React.CSSProperties = { width: '100%', border: '2px solid #d7e0d9', borderRadius: '4px', background: '#f9fbf8', padding: '10px 12px', fontFamily: "'Archivo', sans-serif", fontSize: '14px', color: '#0f2a1c' }

  return (
    <div>
      <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '28px', color: '#0f2a1c', margin: '0 0 4px' }}>Politicians</h1>
      <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '15px', color: '#5c6b60', margin: '0 0 20px' }}>Add political figures and approve the photos contributors submit.</p>

      <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', padding: '22px', marginBottom: '22px' }}>
        <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '16px', color: '#0f2a1c', marginBottom: '14px' }}>Add a politician</div>
        <form onSubmit={addPolitician} style={{ display: 'grid', gridTemplateColumns: '2fr 1.4fr 1.4fr 1fr auto', gap: '10px', alignItems: 'end' }}>
          <div><label style={lbl2}>Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inp2} required /></div>
          <div><label style={lbl2}>State</label><select value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} style={inp2}>{ADMIN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
          <div><label style={lbl2}>Title</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Governor" style={inp2} /></div>
          <div><label style={lbl2}>Party</label><input value={form.party} onChange={(e) => setForm({ ...form, party: e.target.value })} placeholder="APC" style={inp2} /></div>
          <button type="submit" style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '14px', color: '#fff', background: '#0f8a4a', border: 'none', borderRadius: '6px', padding: '11px 20px', cursor: 'pointer' }}>Add</button>
        </form>
        {added && <div style={{ marginTop: '12px', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '13px', color: '#0f8a4a' }}>{added}</div>}
      </div>

      <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '16px', color: '#0f2a1c', marginBottom: '12px' }}>Pending photo submissions {subs ? `(${subs.length})` : ''}</div>
      {!subs ? (
        <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, color: '#8aa093' }}>Loading…</div>
      ) : subs.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', padding: '36px', textAlign: 'center', fontFamily: "'Archivo', sans-serif", fontWeight: 700, color: '#8aa093' }}>No photos awaiting approval.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
          {subs.map((s) => (
            <div key={s.id} style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
              <img src={s.image} alt={s.politician_name} style={{ width: '100%', maxWidth: '150px', aspectRatio: '1', objectFit: 'cover', borderRadius: '10px', margin: '0 auto 10px', display: 'block' }} />
              <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '14px', color: '#0f2a1c' }}>{s.politician_name}</div>
              <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '12px', color: '#8aa093', marginBottom: '12px' }}>{s.state} · by {s.author_name}</div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <button onClick={() => act(s.id, 'approve')} style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '12px', color: '#fff', background: '#0f8a4a', border: 'none', borderRadius: '5px', padding: '8px 14px', cursor: 'pointer' }}>Approve</button>
                <button onClick={() => act(s.id, 'reject')} style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '12px', color: '#c0392b', background: '#fff', border: '2px solid #e3c4c0', borderRadius: '5px', padding: '6px 12px', cursor: 'pointer' }}>Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Prediction Model — build a scenario, then run a resumable background job that
// generates a projection for every state.
// ============================================================================
const MODEL_PARTIES = ['APC', 'PDP', 'LP', 'NNPP', 'APGA', 'ADC', 'SDP', 'NDC']
const SCOPES: { id: string; label: string; hint: string }[] = [
  { id: 'local', label: 'Local', hint: 'His home state only' },
  { id: 'national', label: 'National', hint: 'Every state' },
  { id: 'election', label: 'Election', hint: 'Wherever he ran this race' },
]

type Scenario = { id: number; name: string; description: string; election_type: string; target_year: string; status: string; cursor: number; total: number; percent: number; message: string; log: string[] }
type SPol = { id: number; politician_id: number; politician_name: string; new_party: string; delta_popularity: number; influence_pct: number; scope: string; home_state: string }
type STrend = { id: number; name: string; shift_pct: number; target_party: string; scope_states: string[] }
type ScenarioFull = Scenario & { politicians: SPol[]; trends: STrend[] }
type PolSearchRow = { id: number; name: string; state: string; party: string; title: string }
type PolInfo = { id: number; name: string; state: string; party: string; title: string; runs: { year: string; election_type: string; party: string; state: string; votes: number; percent: number | null }[]; suggested_influence_pct: number; current_party: string }

const statusColor: Record<string, string> = { draft: '#8aa093', running: '#1f6fd6', paused: '#b8860b', done: '#0f8a4a', error: '#c0392b' }

function ModelScenarios() {
  const { token } = useAuth()
  const [list, setList] = useState<Scenario[] | null>(null)
  const [selId, setSelId] = useState<number | null>(null)
  const [sel, setSel] = useState<ScenarioFull | null>(null)
  const [newName, setNewName] = useState('')

  const loadList = () => apiFetch('/api/admin/scenarios', token).then((r) => (r.ok ? r.json() : [])).then(setList).catch(() => setList([]))
  const loadSel = (id: number) => apiFetch(`/api/admin/scenarios/${id}`, token).then((r) => (r.ok ? r.json() : null)).then(setSel).catch(() => setSel(null))

  useEffect(() => { if (token) loadList() /* eslint-disable-next-line */ }, [token])
  useEffect(() => { if (selId != null) loadSel(selId) /* eslint-disable-next-line */ }, [selId])

  // live progress polling while a selected scenario is running
  useEffect(() => {
    if (selId == null || !sel || sel.status !== 'running') return
    const t = setInterval(async () => {
      const r = await apiFetch(`/api/admin/scenarios/${selId}/status`, token)
      if (r.ok) {
        const st: Scenario = await r.json()
        setSel((s) => (s ? { ...s, ...st } : s))
        if (st.status !== 'running') { loadSel(selId); loadList() }
      }
    }, 1200)
    return () => clearInterval(t)
    // eslint-disable-next-line
  }, [selId, sel?.status])

  const create = async () => {
    if (!newName.trim()) return
    const r = await apiFetch('/api/admin/scenarios', token, { method: 'POST', body: JSON.stringify({ name: newName.trim() }) })
    if (r.ok) { const s: ScenarioFull = await r.json(); setNewName(''); await loadList(); setSelId(s.id) }
  }
  const del = async (id: number) => {
    if (!window.confirm('Delete this scenario and all its generated predictions?')) return
    const r = await apiFetch(`/api/admin/scenarios/${id}`, token, { method: 'DELETE' })
    if (r.ok) { setSelId(null); setSel(null); loadList() }
  }
  const run = async (restart = false) => {
    if (selId == null) return
    const r = await apiFetch(`/api/admin/scenarios/${selId}/run${restart ? '?restart=true' : ''}`, token, { method: 'POST' })
    if (r.ok) { const st = await r.json(); setSel((s) => (s ? { ...s, ...st } : s)) }
  }
  const pause = async () => {
    if (selId == null) return
    const r = await apiFetch(`/api/admin/scenarios/${selId}/pause`, token, { method: 'POST' })
    if (r.ok) { const st = await r.json(); setSel((s) => (s ? { ...s, ...st } : s)) }
  }

  const lbl2: React.CSSProperties = { display: 'block', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '11px', letterSpacing: '0.05em', color: '#0f2a1c', textTransform: 'uppercase', marginBottom: '5px' }
  const inp2: React.CSSProperties = { width: '100%', border: '2px solid #d7e0d9', borderRadius: '4px', background: '#f9fbf8', padding: '10px 12px', fontFamily: "'Archivo', sans-serif", fontSize: '14px', color: '#0f2a1c' }

  return (
    <div>
      <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '28px', color: '#0f2a1c', margin: '0 0 4px' }}>Prediction model</h1>
      <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '15px', color: '#5c6b60', margin: '0 0 20px', maxWidth: '70ch' }}>
        Build a scenario from politician swings and popularity trends, then run it. The job generates a projection for every state in the background, is resumable if it dies, and shows live progress.
      </p>

      {/* create + list */}
      <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', padding: '18px', marginBottom: '18px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'end', flexWrap: 'wrap', marginBottom: list && list.length ? '16px' : '0' }}>
          <div style={{ flex: 1, minWidth: '220px' }}><label style={lbl2}>New scenario name</label><input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Obi defects to APGA + Christian swing" style={inp2} /></div>
          <button onClick={create} style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '14px', color: '#fff', background: '#0f8a4a', border: 'none', borderRadius: '6px', padding: '11px 20px', cursor: 'pointer' }}>Create</button>
        </div>
        {list && list.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {list.map((s) => (
              <div key={s.id} onClick={() => setSelId(s.id)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', border: `2px solid ${selId === s.id ? '#0f8a4a' : '#e4ebe5'}`, background: selId === s.id ? '#eef7f1' : '#fff' }}>
                <span style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '14px', color: '#0f2a1c', flex: 1 }}>{s.name}</span>
                {s.status === 'running' && <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '12px', color: '#5c6b60' }}>{s.cursor}/{s.total}</span>}
                <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '10px', textTransform: 'uppercase', color: '#fff', background: statusColor[s.status] ?? '#8aa093', padding: '3px 9px', borderRadius: '20px' }}>{s.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {sel && <ScenarioEditor key={sel.id} scenario={sel} reload={() => loadSel(sel.id)} onRun={run} onPause={pause} onDelete={() => del(sel.id)} />}
    </div>
  )
}

function ScenarioEditor({ scenario, reload, onRun, onPause, onDelete }: { scenario: ScenarioFull; reload: () => void; onRun: (restart?: boolean) => void; onPause: () => void; onDelete: () => void }) {
  const { token } = useAuth()
  const sid = scenario.id
  const running = scenario.status === 'running'

  // politician picker
  const [q, setQ] = useState('')
  const [results, setResults] = useState<PolSearchRow[]>([])
  const [info, setInfo] = useState<PolInfo | null>(null)
  const [pForm, setPForm] = useState({ new_party: 'APC', delta_popularity: 0, influence_pct: 0, scope: 'local' })

  // trend form
  const [tForm, setTForm] = useState({ name: '', shift_pct: 10, target_party: 'APC' })

  useEffect(() => {
    if (q.trim().length < 2) { setResults([]); return }
    const t = setTimeout(() => {
      apiFetch(`/api/admin/politician-search?q=${encodeURIComponent(q.trim())}`, token).then((r) => (r.ok ? r.json() : [])).then(setResults).catch(() => setResults([]))
    }, 250)
    return () => clearTimeout(t)
  }, [q, token])

  const pick = async (id: number) => {
    const r = await apiFetch(`/api/admin/politician-info/${id}`, token)
    if (r.ok) {
      const d: PolInfo = await r.json()
      setInfo(d)
      setResults([])
      setQ(d.name)
      setPForm({ new_party: d.current_party || 'APC', delta_popularity: 0, influence_pct: d.suggested_influence_pct || 0, scope: 'local' })
    }
  }
  const addPol = async () => {
    if (!info) return
    const r = await apiFetch(`/api/admin/scenarios/${sid}/politicians`, token, { method: 'POST', body: JSON.stringify({ politician_id: info.id, ...pForm }) })
    if (r.ok) { setInfo(null); setQ(''); reload() }
  }
  const removePol = async (rid: number) => { const r = await apiFetch(`/api/admin/scenario-politicians/${rid}`, token, { method: 'DELETE' }); if (r.ok) reload() }
  const addTrend = async () => {
    if (!tForm.name.trim()) return
    const r = await apiFetch(`/api/admin/scenarios/${sid}/trends`, token, { method: 'POST', body: JSON.stringify({ ...tForm, scope_states: [] }) })
    if (r.ok) { setTForm({ name: '', shift_pct: 10, target_party: 'APC' }); reload() }
  }
  const removeTrend = async (rid: number) => { const r = await apiFetch(`/api/admin/scenario-trends/${rid}`, token, { method: 'DELETE' }); if (r.ok) reload() }

  const lbl2: React.CSSProperties = { display: 'block', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '11px', letterSpacing: '0.05em', color: '#0f2a1c', textTransform: 'uppercase', marginBottom: '5px' }
  const inp2: React.CSSProperties = { width: '100%', border: '2px solid #d7e0d9', borderRadius: '4px', background: '#f9fbf8', padding: '10px 12px', fontFamily: "'Archivo', sans-serif", fontSize: '14px', color: '#0f2a1c' }
  const card: React.CSSProperties = { background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', padding: '20px', marginBottom: '16px' }
  const chip = (p: string): React.CSSProperties => ({ fontFamily: "'Archivo Black', sans-serif", fontSize: '11px', color: '#fff', background: PARTY_COLORS[p] ?? '#8aa093', padding: '3px 9px', borderRadius: '4px' })

  return (
    <div>
      {/* run controls + progress */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '18px', color: '#0f2a1c' }}>{scenario.name}</div>
            <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '12px', color: '#8aa093' }}>{scenario.politicians.length} politician(s) · {scenario.trends.length} trend(s) · target {scenario.target_year}</div>
          </div>
          {running ? (
            <button onClick={onPause} style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '13px', color: '#fff', background: '#b8860b', border: 'none', borderRadius: '6px', padding: '10px 18px', cursor: 'pointer' }}>❚❚ Pause</button>
          ) : (
            <button onClick={() => onRun(false)} style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '13px', color: '#fff', background: '#0f8a4a', border: 'none', borderRadius: '6px', padding: '10px 18px', cursor: 'pointer' }}>{scenario.status === 'paused' ? '▶ Resume' : '▶ Run'}</button>
          )}
          {(scenario.status === 'done' || scenario.status === 'error') && (
            <button onClick={() => onRun(true)} style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '13px', color: '#0f8a4a', background: '#fff', border: '2px solid #0f8a4a', borderRadius: '6px', padding: '9px 16px', cursor: 'pointer' }}>↻ Re-run</button>
          )}
          <button onClick={onDelete} style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '13px', color: '#c0392b', background: '#fff', border: '2px solid #e3c4c0', borderRadius: '6px', padding: '9px 16px', cursor: 'pointer' }}>Delete</button>
        </div>

        {(running || scenario.cursor > 0 || scenario.status !== 'draft') && (
          <div style={{ marginTop: '16px' }}>
            <div style={{ height: '10px', borderRadius: '6px', background: '#eef2ee', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${scenario.percent}%`, background: statusColor[scenario.status] ?? '#0f8a4a', transition: 'width .3s' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '7px' }}>
              <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '12px', color: '#5c6b60' }}>{scenario.message || '—'}</span>
              <span style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '12px', color: statusColor[scenario.status] }}>{scenario.percent}%</span>
            </div>
            {scenario.log && scenario.log.length > 0 && (
              <div style={{ marginTop: '10px', maxHeight: '130px', overflowY: 'auto', background: '#0f2a1c', borderRadius: '8px', padding: '10px 12px', fontFamily: 'monospace', fontSize: '11px', color: '#9fd9b8', lineHeight: 1.7 }}>
                {scenario.log.slice(-40).map((l, i) => <div key={i}>{l}</div>)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* politicians */}
      <div style={card}>
        <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '16px', color: '#0f2a1c', marginBottom: '4px' }}>Politician swings</div>
        <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '13px', color: '#8aa093', margin: '0 0 14px' }}>Each politician re-allocates a bloc of votes to his new party, scaled by his influence and popularity delta.</p>

        {scenario.politicians.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            {scenario.politicians.map((p) => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', padding: '10px 12px', border: '1px solid #eef2ee', borderRadius: '8px', background: '#f9fbf8' }}>
                <span style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '14px', color: '#0f2a1c' }}>{p.politician_name}</span>
                <span style={chip(p.new_party)}>{p.new_party}</span>
                <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '12px', color: '#5c6b60' }}>{p.influence_pct}% influence · {p.delta_popularity >= 0 ? '+' : ''}{p.delta_popularity}% pop · {p.scope}</span>
                <button onClick={() => removePol(p.id)} style={{ marginLeft: 'auto', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '12px', color: '#c0392b', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
              </div>
            ))}
          </div>
        )}

        {/* search */}
        <div style={{ position: 'relative' }}>
          <label style={lbl2}>Find a politician</label>
          <input value={q} onChange={(e) => { setQ(e.target.value); setInfo(null) }} placeholder="Search by name…" style={inp2} />
          {results.length > 0 && (
            <div style={{ position: 'absolute', zIndex: 5, left: 0, right: 0, background: '#fff', border: '1px solid #dbe4dc', borderRadius: '8px', marginTop: '4px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', maxHeight: '240px', overflowY: 'auto' }}>
              {results.map((r) => (
                <div key={r.id} onClick={() => pick(r.id)} className="n2row" style={{ padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid #f2f5f1' }}>
                  <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '13px', color: '#0f2a1c' }}>{r.name}</span>
                  <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '12px', color: '#8aa093' }}> · {r.state}{r.party ? ` · ${r.party}` : ''}{r.title ? ` · ${r.title}` : ''}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {info && (
          <div style={{ marginTop: '14px', border: '2px solid #d7f0e0', borderRadius: '10px', padding: '16px', background: '#f4fbf6' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
              <span style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '16px', color: '#0f2a1c' }}>{info.name}</span>
              <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '12px', color: '#5c6b60' }}>{info.state} · {info.title || 'politician'} · currently {info.current_party || '—'}</span>
            </div>
            {info.runs.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                {info.runs.slice(0, 8).map((r, i) => (
                  <span key={i} style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '11px', color: '#33413a', background: '#fff', border: '1px solid #dbe4dc', borderRadius: '20px', padding: '3px 10px' }}>
                    {r.year} {TYPE_LABEL[r.election_type] ?? r.election_type} {r.party}{r.votes ? ` · ${r.votes.toLocaleString()}` : ''}{r.percent ? ` (${r.percent}%)` : ''}
                  </span>
                ))}
              </div>
            ) : (
              <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '12px', color: '#8aa093', marginBottom: '12px' }}>No recorded election runs.</div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', alignItems: 'end' }}>
              <div>
                <label style={lbl2}>New party</label>
                <select value={pForm.new_party} onChange={(e) => setPForm({ ...pForm, new_party: e.target.value })} style={inp2}>
                  {MODEL_PARTIES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl2}>Influence %</label>
                <input type="number" min={0} max={100} value={pForm.influence_pct} onChange={(e) => setPForm({ ...pForm, influence_pct: Number(e.target.value) })} style={inp2} />
              </div>
              <div>
                <label style={lbl2}>Δ Popularity %</label>
                <input type="number" value={pForm.delta_popularity} onChange={(e) => setPForm({ ...pForm, delta_popularity: Number(e.target.value) })} style={inp2} />
              </div>
              <div>
                <label style={lbl2}>Influence scope</label>
                <select value={pForm.scope} onChange={(e) => setPForm({ ...pForm, scope: e.target.value })} style={inp2}>
                  {SCOPES.map((s) => <option key={s.id} value={s.id}>{s.label} — {s.hint}</option>)}
                </select>
              </div>
              <button onClick={addPol} style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '14px', color: '#fff', background: '#0f8a4a', border: 'none', borderRadius: '6px', padding: '11px 20px', cursor: 'pointer' }}>Add</button>
            </div>
          </div>
        )}
      </div>

      {/* trends */}
      <div style={card}>
        <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '16px', color: '#0f2a1c', marginBottom: '4px' }}>Popularity trends</div>
        <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '13px', color: '#8aa093', margin: '0 0 14px' }}>A free-form swing (e.g. “Christian vote”) that moves a share of every state’s votes toward one party.</p>

        {scenario.trends.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            {scenario.trends.map((t) => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', padding: '10px 12px', border: '1px solid #eef2ee', borderRadius: '8px', background: '#f9fbf8' }}>
                <span style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '14px', color: '#0f2a1c' }}>{t.name}</span>
                <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '12px', color: '#5c6b60' }}>+{t.shift_pct}% →</span>
                <span style={chip(t.target_party)}>{t.target_party}</span>
                <button onClick={() => removeTrend(t.id)} style={{ marginLeft: 'auto', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '12px', color: '#c0392b', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
          <div><label style={lbl2}>Trend name</label><input value={tForm.name} onChange={(e) => setTForm({ ...tForm, name: e.target.value })} placeholder="Christian vote" style={inp2} /></div>
          <div><label style={lbl2}>Shift %</label><input type="number" min={0} max={100} value={tForm.shift_pct} onChange={(e) => setTForm({ ...tForm, shift_pct: Number(e.target.value) })} style={inp2} /></div>
          <div><label style={lbl2}>Toward</label><select value={tForm.target_party} onChange={(e) => setTForm({ ...tForm, target_party: e.target.value })} style={inp2}>{MODEL_PARTIES.map((p) => <option key={p} value={p}>{p}</option>)}</select></div>
          <button onClick={addTrend} style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '14px', color: '#fff', background: '#0f8a4a', border: 'none', borderRadius: '6px', padding: '11px 20px', cursor: 'pointer' }}>Add</button>
        </div>
      </div>
    </div>
  )
}

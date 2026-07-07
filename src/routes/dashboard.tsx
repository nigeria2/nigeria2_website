import { useEffect, useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Protected } from '../components/Protected'
import { apiFetch, useAuth } from '../auth'

const TYPE_LABEL: Record<string, string> = { presidential: 'Presidential', governor: 'Governor', senate: 'Senate' }
const RACES: { value: string; label: string }[] = [
  { value: 'presidential', label: 'Presidential' },
  { value: 'governor', label: 'Governor' },
  { value: 'senate', label: 'Senate' },
]

export const Route = createFileRoute('/dashboard')({
  component: () => (
    <Protected>
      <Dashboard />
    </Protected>
  ),
})

const ALL_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT Abuja', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
]
const COLORS: Record<string, string> = { APC: '#1f6fd6', PDP: '#c0392b', LP: '#e05a1f', NNPP: '#f0b429', APGA: '#7b3fb5', SDP: '#0f8a4a', NDC: '#0e7490', ADC: '#db2777', Other: '#8aa093' }
const LGAS: Record<string, string[]> = {
  Lagos: ['Agege', 'Alimosho', 'Amuwo-Odofin', 'Apapa', 'Badagry', 'Epe', 'Eti-Osa', 'Ifako-Ijaiye', 'Ikeja', 'Ikorodu', 'Kosofe', 'Lagos Island', 'Lagos Mainland', 'Mushin', 'Ojo', 'Oshodi-Isolo', 'Shomolu', 'Surulere'],
  'FCT Abuja': ['Abaji', 'Bwari', 'Gwagwalada', 'Kuje', 'Kwali', 'AMAC (Municipal)'],
  Rivers: ['Port Harcourt', 'Obio/Akpor', 'Okrika', 'Eleme', 'Ikwerre', 'Emohua', 'Bonny', 'Degema'],
  Kano: ['Kano Municipal', 'Fagge', 'Dala', 'Gwale', 'Tarauni', 'Nassarawa', 'Ungogo', 'Kumbotso'],
  Anambra: ['Awka North', 'Awka South', 'Onitsha North', 'Onitsha South', 'Nnewi North', 'Nnewi South', 'Idemili North', 'Aguata'],
  Oyo: ['Ibadan North', 'Ibadan South-West', 'Ibadan North-East', 'Ogbomosho North', 'Oyo East', 'Egbeda', 'Akinyele'],
  Kaduna: ['Kaduna North', 'Kaduna South', 'Chikun', 'Igabi', 'Zaria', 'Sabon Gari', 'Kajuru'],
  Enugu: ['Enugu East', 'Enugu North', 'Enugu South', 'Nsukka', 'Udi', 'Igbo-Etiti', 'Oji River'],
}
const TIPS = [
  'Focus on the LGA you know best — local insight beats guesswork.',
  'Note the issues driving votes: security, jobs, infrastructure.',
  'Update your call when momentum shifts on the ground.',
]

const lblStyle: React.CSSProperties = { display: 'block', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '12px', letterSpacing: '0.06em', color: '#0f2a1c', textTransform: 'uppercase', marginBottom: '6px' }
const inputStyle: React.CSSProperties = { width: '100%', border: '2px solid #d7e0d9', borderRadius: '4px', background: '#f9fbf8', padding: '13px 14px', fontFamily: "'Archivo', sans-serif", fontSize: '16px', color: '#0f2a1c' }
const textareaStyle: React.CSSProperties = { ...inputStyle, resize: 'vertical', lineHeight: 1.5 }

type Analysis = { id?: number; election_type: string; state: string; lga: string; senatorial_district?: string; leading_party?: string; scores?: Record<string, number>; notes: string; measurement_week?: string; created_at?: string }
// Parties on the ballot per election type (presidential differs from state races).
const ELECTION_PARTIES: Record<string, string[]> = {
  presidential: ['APC', 'PDP', 'NDC', 'NNPP', 'ADC', 'LP'],
  governor: ['APC', 'PDP', 'LP', 'NNPP', 'APGA', 'SDP'],
  senate: ['APC', 'PDP', 'LP', 'NNPP', 'APGA', 'SDP'],
}
const zeroScores = (et: string): Record<string, number> =>
  Object.fromEntries((ELECTION_PARTIES[et] ?? ELECTION_PARTIES.governor).map((p) => [p, 0]))
type Profile = { name: string; email: string; phone: string; state: string; lga: string; bio: string }
type View = 'new' | 'mine' | 'profile'

function Dashboard() {
  const { user, token, logout } = useAuth()
  const navigate = useNavigate()
  const [view, setView] = useState<View>('new')
  const [justSaved, setJustSaved] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [form, setForm] = useState({ election_type: 'governor', state: '', lga: '', senatorial_district: '', notes: '' })
  const [scores, setScores] = useState<Record<string, number>>(zeroScores('governor'))
  const [profile, setProfile] = useState<Profile>({ name: '', email: '', phone: '', state: '', lga: '', bio: '' })
  const [analyses, setAnalyses] = useState<Analysis[]>([])

  // Seed empty profile fields from the signed-in Google user.
  useEffect(() => {
    if (!user) return
    setProfile((p) => ({
      ...p,
      name: p.name || user.full_name || '',
      email: p.email || user.email || '',
      phone: p.phone || user.phone || '',
      state: p.state || user.home_state || '',
      lga: p.lga || user.home_lga || '',
      bio: p.bio || user.bio || '',
    }))
  }, [user])

  // My analyses come from the backend.
  useEffect(() => {
    if (!token) return
    apiFetch('/api/analyses/mine', token)
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Analysis[]) => setAnalyses(data))
      .catch(() => {})
  }, [token])

  useEffect(() => {
    try {
      const p = JSON.parse(localStorage.getItem('n2_profile') || 'null')
      if (p) setProfile((prev) => ({ ...prev, ...p }))
    } catch {
      /* ignore */
    }
  }, [])

  const setF = (patch: Partial<typeof form>) => {
    setForm((s) => ({ ...s, ...patch }))
    setJustSaved(false)
  }
  const setP = (patch: Partial<Profile>) => {
    setProfile((s) => ({ ...s, ...patch }))
    setProfileSaved(false)
  }

  const submitAnalysis = async (e: React.FormEvent) => {
    e.preventDefault()
    if (Object.values(scores).every((v) => v === 0)) return
    try {
      const res = await apiFetch('/api/analyses', token, {
        method: 'POST',
        body: JSON.stringify({
          election_type: form.election_type,
          state: form.state,
          lga: form.lga,
          senatorial_district: form.election_type === 'senate' ? form.senatorial_district : '',
          scores,
          notes: form.notes,
        }),
      })
      if (!res.ok) return
      const rec: Analysis = await res.json()
      setAnalyses((list) => [rec, ...list])
      setJustSaved(true)
      setForm({ election_type: 'governor', state: '', lga: '', senatorial_district: '', notes: '' })
      setScores(zeroScores('governor'))
      setView('mine')
    } catch {
      /* ignore */
    }
  }

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    try {
      localStorage.setItem('n2_profile', JSON.stringify(profile))
    } catch {
      /* ignore */
    }
    setProfileSaved(true)
  }

  const initials = (profile.name || '?').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
  const lgaOptions = LGAS[form.state] || []
  const sliderParties = ELECTION_PARTIES[form.election_type] ?? ELECTION_PARTIES.governor
  const scoreTotal = Object.values(scores).reduce((a, b) => a + b, 0)
  const countLabel = analyses.length === 0 ? "You haven't submitted any analyses yet." : `${analyses.length} analys${analyses.length === 1 ? 'is' : 'es'} submitted.`

  const tabBase: React.CSSProperties = { fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '15px', padding: '16px 20px', background: 'transparent', border: 'none', borderBottom: '3px solid transparent', color: '#5c6b60', cursor: 'pointer' }
  const tabActive: React.CSSProperties = { ...tabBase, color: '#0f8a4a', borderBottom: '3px solid #0f8a4a' }
  const tabs: { id: View; label: string }[] = [
    { id: 'new', label: 'New Analysis' },
    { id: 'mine', label: 'My Analyses' },
    { id: 'profile', label: 'Profile' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#eef2ec', fontFamily: "'Archivo', sans-serif" }}>
      {/* top bar */}
      <div style={{ background: '#0a6337', display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 28px' }}>
        <Link to="/" style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '20px', letterSpacing: '-0.01em', color: '#fff', textDecoration: 'none' }}>
          N<span style={{ color: '#ffe14d' }}>2.0</span>
        </Link>
        <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '13px', letterSpacing: '0.14em', color: '#9fd9b8', textTransform: 'uppercase' }}>Contributor Dashboard</span>
        <Link to="/predictions" style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '12px', letterSpacing: '0.04em', color: '#eafaf0', textDecoration: 'none', textTransform: 'uppercase', borderBottom: '2px solid rgba(255,255,255,0.3)', paddingBottom: '2px' }}>Predictions Board</Link>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ textAlign: 'right', lineHeight: 1.15 }}>
            <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '14px', color: '#fff' }}>{profile.name}</div>
            <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '12px', color: '#9fd9b8' }}>{profile.state}</div>
          </div>
          <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#ffe14d', color: '#0f4a2c', fontFamily: "'Archivo Black', sans-serif", fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{initials}</div>
          {user?.is_admin && (
            <Link to="/admin" style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '12px', letterSpacing: '0.04em', color: '#0f4a2c', background: '#ffe14d', borderRadius: '4px', padding: '9px 14px', textDecoration: 'none', textTransform: 'uppercase' }}>Admin Portal</Link>
          )}
          <button onClick={() => { logout(); navigate({ to: '/' }) }} style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '12px', letterSpacing: '0.04em', color: '#fff', background: 'transparent', border: '2px solid rgba(255,255,255,0.4)', borderRadius: '4px', padding: '8px 14px', textTransform: 'uppercase', cursor: 'pointer' }}>Log out</button>
        </div>
      </div>

      {/* tabs */}
      <div style={{ background: '#fff', borderBottom: '1px solid #dbe4dc', display: 'flex', gap: '4px', padding: '0 24px' }}>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setView(t.id)} style={view === t.id ? tabActive : tabBase}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '34px 28px 70px' }}>
        {view === 'new' && (
          <div>
            <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '30px', color: '#0f2a1c', margin: '0 0 4px' }}>Submit your analysis</h1>
            <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '16px', color: '#5c6b60', margin: '0 0 26px' }}>
              Tell us what you think will happen in your state and LGA. Your on-the-ground read helps sharpen our national picture.
            </p>

            <div className="two-col" style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.9fr', gap: '24px', alignItems: 'start' }}>
              <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '8px', padding: '28px' }}>
                <form onSubmit={submitAnalysis} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div>
                    <label style={lblStyle}>What are you predicting?</label>
                    <div style={{ display: 'flex', gap: '2px', borderBottom: '2px solid #e4ebe5' }}>
                      {RACES.map((r) => {
                        const active = form.election_type === r.value
                        return (
                          <button
                            key={r.value}
                            type="button"
                            onClick={() => { setF({ election_type: r.value }); setScores(zeroScores(r.value)) }}
                            style={{
                              fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '15px', padding: '12px 22px',
                              background: 'transparent', border: 'none', cursor: 'pointer', marginBottom: '-2px',
                              color: active ? '#0f8a4a' : '#5c6b60',
                              borderBottom: active ? '3px solid #0f8a4a' : '3px solid transparent',
                            }}
                          >
                            {r.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={lblStyle}>State</label>
                      <select value={form.state} onChange={(e) => setF({ state: e.target.value, lga: '' })} required style={inputStyle}>
                        <option value="">Select state</option>
                        {ALL_STATES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={lblStyle}>LGA <span style={{ color: '#8aa093', fontWeight: 600 }}>(optional)</span></label>
                      <input value={form.lga} onChange={(e) => setF({ lga: e.target.value })} list="lga-list" placeholder="Select or type LGA" style={inputStyle} />
                      <datalist id="lga-list">
                        {lgaOptions.map((l) => (
                          <option key={l} value={l} />
                        ))}
                      </datalist>
                    </div>
                  </div>

                  {form.election_type === 'senate' && (
                    <div>
                      <label style={lblStyle}>Senatorial district</label>
                      <input value={form.senatorial_district} onChange={(e) => setF({ senatorial_district: e.target.value })} placeholder="e.g. Lagos West" style={inputStyle} />
                    </div>
                  )}

                  <div>
                    <label style={lblStyle}>
                      Party projections <span style={{ color: '#8aa093', fontWeight: 600 }}>· set each party's projected share{scoreTotal > 0 ? ` (total ${scoreTotal}%)` : ''}</span>
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '6px' }}>
                      {sliderParties.map((p) => (
                        <div key={p} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ width: '52px', fontFamily: "'Archivo Black', sans-serif", fontSize: '13px', color: '#fff', background: COLORS[p], padding: '4px 0', borderRadius: '4px', textAlign: 'center', flex: 'none' }}>{p}</span>
                          <input type="range" min="0" max="100" step="1" value={scores[p] ?? 0} onInput={(e) => setScores((s) => ({ ...s, [p]: Number((e.target as HTMLInputElement).value) }))} style={{ flex: 1, accentColor: COLORS[p] }} />
                          <span style={{ width: '44px', textAlign: 'right', fontFamily: "'Archivo Black', sans-serif", fontSize: '14px', color: '#0f2a1c', flex: 'none' }}>{scores[p] ?? 0}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={lblStyle}>Your analysis &amp; reasoning</label>
                    <textarea value={form.notes} onChange={(e) => setF({ notes: e.target.value })} rows={4} placeholder="What are you seeing on the ground? Key issues, candidates, momentum…" style={textareaStyle} />
                  </div>

                  <button type="submit" style={{ border: 'none', borderRadius: '4px', background: '#0f8a4a', color: '#fff', fontFamily: "'Archivo Black', sans-serif", fontSize: '18px', padding: '15px', cursor: 'pointer' }}>
                    Submit Analysis
                  </button>
                  {justSaved && (
                    <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '14px', color: '#0f8a4a', textAlign: 'center' }}>
                      ✓ Analysis saved — view it under "My Analyses".
                    </div>
                  )}
                </form>
              </div>

              <div style={{ background: '#0a6337', borderRadius: '8px', padding: '26px' }}>
                <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '18px', color: '#ffe14d', marginBottom: '12px' }}>Make it count</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {TIPS.map((tip) => (
                    <div key={tip} style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '15px', lineHeight: 1.5, color: '#eafaf0' }}>• {tip}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'mine' && (
          <div>
            <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '30px', color: '#0f2a1c', margin: '0 0 4px' }}>My analyses</h1>
            <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '16px', color: '#5c6b60', margin: '0 0 26px' }}>{countLabel}</p>

            {analyses.length > 0 ? (
              <div className="two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {analyses.map((a, i) => {
                  const color = COLORS[a.leading_party || ''] || '#8aa093'
                  const entries = Object.entries(a.scores || {}).filter(([, v]) => v > 0).sort((x, y) => y[1] - x[1])
                  const emax = Math.max(1, ...entries.map(([, v]) => v))
                  return (
                    <div key={a.id ?? i} style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '8px', padding: '20px 22px', borderLeft: `5px solid ${color}` }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '10px' }}>
                        <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '19px', color: '#0f2a1c' }}>{a.senatorial_district || (a.lga ? `${a.lga}, ${a.state}` : a.state)}</div>
                        <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '12px', color: '#8aa093' }}>{a.measurement_week ?? ''}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '10px 0 12px' }}>
                        <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '12px', color: '#33413a', background: '#eef2ec', padding: '4px 10px', borderRadius: '20px' }}>{TYPE_LABEL[a.election_type] ?? a.election_type}</span>
                        {a.leading_party && <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '12px', color: '#fff', background: color, padding: '4px 10px', borderRadius: '20px' }}>{a.leading_party} leads</span>}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '12px' }}>
                        {entries.map(([p, v]) => (
                          <div key={p} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ width: '42px', fontFamily: "'Archivo Black', sans-serif", fontSize: '10px', color: '#fff', background: COLORS[p] || '#8aa093', padding: '2px 0', borderRadius: '4px', textAlign: 'center', flex: 'none' }}>{p}</span>
                            <div style={{ flex: 1, height: '6px', borderRadius: '4px', background: '#eef2ee', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${Math.round((v / emax) * 100)}%`, background: COLORS[p] || '#8aa093' }} />
                            </div>
                            <span style={{ width: '32px', textAlign: 'right', fontFamily: "'Archivo Black', sans-serif", fontSize: '11px', color: '#5c6b60', flex: 'none' }}>{v}%</span>
                          </div>
                        ))}
                      </div>
                      <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 500, fontSize: '14px', lineHeight: 1.55, color: '#33413a', margin: 0 }}>{a.notes}</p>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div style={{ background: '#fff', border: '2px dashed #cdd8cf', borderRadius: '8px', padding: '48px', textAlign: 'center' }}>
                <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '20px', color: '#0f2a1c', marginBottom: '6px' }}>No analyses yet</div>
                <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '15px', color: '#5c6b60', margin: '0 0 18px' }}>Submit your first prediction to see it here.</p>
                <button onClick={() => setView('new')} style={{ border: 'none', borderRadius: '4px', background: '#0f8a4a', color: '#fff', fontFamily: "'Archivo Black', sans-serif", fontSize: '15px', padding: '12px 22px', cursor: 'pointer' }}>+ New analysis</button>
              </div>
            )}
          </div>
        )}

        {view === 'profile' && (
          <div>
            <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '30px', color: '#0f2a1c', margin: '0 0 4px' }}>My profile</h1>
            <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '16px', color: '#5c6b60', margin: '0 0 26px' }}>Update your contributor details.</p>

            <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '8px', padding: '28px', maxWidth: '640px' }}>
              <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div>
                  <label style={lblStyle}>Full name</label>
                  <input value={profile.name} onChange={(e) => setP({ name: e.target.value })} style={inputStyle} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={lblStyle}>Email</label>
                    <input type="email" value={profile.email} onChange={(e) => setP({ email: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={lblStyle}>Mobile</label>
                    <input type="tel" value={profile.phone} onChange={(e) => setP({ phone: e.target.value })} style={inputStyle} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={lblStyle}>State</label>
                    <select value={profile.state} onChange={(e) => setP({ state: e.target.value })} style={inputStyle}>
                      {ALL_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={lblStyle}>LGA</label>
                    <input value={profile.lga} onChange={(e) => setP({ lga: e.target.value })} placeholder="Your LGA" style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label style={lblStyle}>Bio</label>
                  <textarea value={profile.bio} onChange={(e) => setP({ bio: e.target.value })} rows={3} placeholder="A short note about you and your area…" style={textareaStyle} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <button type="submit" style={{ border: 'none', borderRadius: '4px', background: '#0f8a4a', color: '#fff', fontFamily: "'Archivo Black', sans-serif", fontSize: '17px', padding: '14px 28px', cursor: 'pointer' }}>Save changes</button>
                  {profileSaved && <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '14px', color: '#0f8a4a' }}>✓ Profile updated</span>}
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

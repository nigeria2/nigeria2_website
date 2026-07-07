import { useEffect, useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Protected } from '../components/Protected'
import { useAuth } from '../auth'

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

const lblStyle: React.CSSProperties = { display: 'block', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '12px', letterSpacing: '0.06em', color: '#0f2a1c', textTransform: 'uppercase', marginBottom: '6px' }
const inputStyle: React.CSSProperties = { width: '100%', border: '2px solid #d7e0d9', borderRadius: '4px', background: '#f9fbf8', padding: '13px 14px', fontFamily: "'Archivo', sans-serif", fontSize: '16px', color: '#0f2a1c' }
const textareaStyle: React.CSSProperties = { ...inputStyle, resize: 'vertical', lineHeight: 1.5 }

type Profile = { name: string; email: string; phone: string; state: string; lga: string; bio: string }

function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [profileSaved, setProfileSaved] = useState(false)
  const [profile, setProfile] = useState<Profile>({ name: '', email: '', phone: '', state: '', lga: '', bio: '' })

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

  useEffect(() => {
    try {
      const p = JSON.parse(localStorage.getItem('n2_profile') || 'null')
      if (p) setProfile((prev) => ({ ...prev, ...p }))
    } catch {
      /* ignore */
    }
  }, [])

  const setP = (patch: Partial<Profile>) => {
    setProfile((s) => ({ ...s, ...patch }))
    setProfileSaved(false)
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

  const tabBase: React.CSSProperties = { fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '15px', padding: '16px 20px', background: 'transparent', border: 'none', borderBottom: '3px solid transparent', color: '#5c6b60', cursor: 'pointer', textDecoration: 'none', display: 'inline-block' }
  const tabActive: React.CSSProperties = { ...tabBase, color: '#0f8a4a', borderBottom: '3px solid #0f8a4a' }

  return (
    <div style={{ minHeight: '100vh', background: '#eef2ec', fontFamily: "'Archivo', sans-serif" }}>
      {/* top bar */}
      <div style={{ background: '#0a6337', display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 28px' }}>
        <Link to="/" style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '20px', letterSpacing: '-0.01em', color: '#fff', textDecoration: 'none' }}>
          N<span style={{ color: '#ffe14d' }}>2.0</span>
        </Link>
        <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '13px', letterSpacing: '0.14em', color: '#9fd9b8', textTransform: 'uppercase' }}>Contributor Dashboard</span>
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
        <Link to="/predictions" style={tabBase}>Predictions</Link>
        <span style={tabActive}>Profile</span>
      </div>

      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '34px 28px 70px' }}>
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
      </div>
    </div>
  )
}

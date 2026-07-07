import { useEffect, useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Protected } from '../components/Protected'
import { useAuth, apiFetch } from '../auth'

export const Route = createFileRoute('/onboarding')({
  component: () => (
    <Protected>
      <Onboarding />
    </Protected>
  ),
})

const ALL_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT Abuja', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
]

const lbl: React.CSSProperties = {
  display: 'block',
  fontFamily: "'Archivo', sans-serif",
  fontWeight: 800,
  fontSize: '12px',
  letterSpacing: '0.06em',
  color: '#0f2a1c',
  textTransform: 'uppercase',
  marginBottom: '6px',
}
const inp: React.CSSProperties = {
  width: '100%',
  border: '2px solid #d7e0d9',
  borderRadius: '4px',
  background: '#f9fbf8',
  padding: '14px 15px',
  fontFamily: "'Archivo', sans-serif",
  fontSize: '16px',
  color: '#0f2a1c',
}
const chipBase: React.CSSProperties = {
  fontFamily: "'Archivo', sans-serif",
  fontWeight: 700,
  fontSize: '13px',
  padding: '9px 15px',
  borderRadius: '30px',
  cursor: 'pointer',
  border: '2px solid #cdd8cf',
  background: '#fff',
  color: '#33413a',
}
const chipOn: React.CSSProperties = { ...chipBase, background: '#0f8a4a', color: '#fff', border: '2px solid #0f8a4a' }

type Form = {
  name: string
  phone: string
  gender: string
  yob: string
  state: string
  lga: string
  residence: string
  agree: boolean
}

const TITLES: Record<number, [string, string]> = {
  1: ['Tell us about you', 'A few personal details to set up your profile.'],
  2: ["Where you're based", 'Your location helps us route your analysis to the right races.'],
  3: ['Your expertise', 'Which states can you speak to with confidence?'],
  4: ['Review & confirm', 'Check everything is right before you continue.'],
}

function Onboarding() {
  const navigate = useNavigate()
  const { user, token, refresh } = useAuth()
  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [voter, setVoter] = useState('')
  const [known, setKnown] = useState<string[]>([])
  const [f, setF] = useState<Form>({ name: '', phone: '', gender: '', yob: '', state: '', lga: '', residence: '', agree: false })

  useEffect(() => {
    let stash: { full_name?: string; mobile?: string; state?: string } = {}
    try {
      stash = JSON.parse(localStorage.getItem('n2_interested') || '{}')
    } catch {
      /* ignore */
    }
    setF((prev) => ({
      ...prev,
      name: prev.name || user?.full_name || stash.full_name || '',
      phone: prev.phone || user?.phone || stash.mobile || '',
      state: prev.state || user?.home_state || stash.state || '',
      lga: prev.lga || user?.home_lga || '',
      residence: prev.residence || user?.residence_state || '',
    }))
  }, [user])

  const setField = (k: keyof Form, v: string | boolean) => {
    setF((prev) => ({ ...prev, [k]: v }))
    setError('')
  }
  const toggleState = (s: string) => {
    setKnown((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))
    setError('')
  }

  const validate = (): string => {
    if (step === 1) {
      if (!f.name.trim()) return 'Please enter your full name.'
      if (!f.phone.trim()) return 'Please enter your mobile number.'
      if (!f.gender) return 'Please select your gender.'
      if (!f.yob) return 'Please enter your year of birth.'
    }
    if (step === 2) {
      if (!f.state) return 'Please select your home state.'
      if (!f.lga.trim()) return 'Please enter your home LGA.'
      if (!f.residence) return 'Please tell us where you currently live.'
      if (!voter) return 'Please select your voter status.'
    }
    if (step === 3 && known.length === 0) return 'Select at least one state you know well.'
    if (step === 4 && !f.agree) return 'Please confirm and accept the terms to continue.'
    return ''
  }

  const next = async () => {
    const err = validate()
    if (err) {
      setError(err)
      return
    }
    if (step === 4) {
      setSaving(true)
      try {
        const res = await apiFetch('/auth/me', token, {
          method: 'PATCH',
          body: JSON.stringify({
            full_name: f.name,
            phone: f.phone,
            gender: f.gender,
            year_of_birth: f.yob ? Number(f.yob) : null,
            home_state: f.state,
            home_lga: f.lga,
            residence_state: f.residence,
            voter_status: voter,
            known_states: known,
            onboarded: true,
          }),
        })
        if (!res.ok) throw new Error('save failed')
        try {
          localStorage.removeItem('n2_interested')
        } catch {
          /* ignore */
        }
        await refresh()
        navigate({ to: '/dashboard' })
      } catch {
        setError('Could not save your profile. Please try again.')
        setSaving(false)
      }
      return
    }
    setStep((s) => s + 1)
    setError('')
  }
  const back = () => {
    setStep((s) => Math.max(1, s - 1))
    setError('')
  }

  const summary = [
    { k: 'Name', v: f.name || '—' },
    { k: 'Mobile', v: f.phone || '—' },
    { k: 'Gender · YOB', v: `${f.gender || '—'} · ${f.yob || '—'}` },
    { k: 'Home', v: `${f.lga ? f.lga + ', ' : ''}${f.state || '—'}` },
    { k: 'Lives in', v: f.residence || '—' },
    { k: 'Voter status', v: voter || '—' },
    { k: 'Knows well', v: known.length ? known.join(', ') : '—' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#0d8244', fontFamily: "'Archivo', sans-serif", display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: '#fff', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 32px' }}>
        <span style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '20px', letterSpacing: '-0.01em', color: '#0f8a4a' }}>
          N<span style={{ color: '#0f2a1c' }}>2.0</span>
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px', background: '#f0f7f2', border: '1px solid #d7e8dd', borderRadius: '30px', padding: '5px 12px 5px 6px' }}>
          <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#0f8a4a', color: '#fff', fontFamily: "'Archivo Black', sans-serif", fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {user?.picture ? (
              <img src={user.picture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              (user?.full_name || user?.email || '?').slice(0, 2).toUpperCase()
            )}
          </div>
          <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '13px', color: '#0f2a1c' }}>{user?.email || ''}</span>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '44px 24px 60px' }}>
        <div style={{ width: '100%', maxWidth: '640px' }}>
          <div style={{ textAlign: 'center', marginBottom: '8px' }}>
            <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '12px', letterSpacing: '0.2em', color: '#ffe14d', textTransform: 'uppercase' }}>
              Step {step} of 4
            </div>
            <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '32px', color: '#fff', margin: '8px 0 0', letterSpacing: '-0.01em' }}>{TITLES[step][0]}</h1>
            <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '15px', color: '#cdeeda', margin: '8px 0 0' }}>{TITLES[step][1]}</p>
          </div>

          <div style={{ display: 'flex', gap: '8px', margin: '22px 0' }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ flex: 1, height: '6px', borderRadius: '3px', background: i <= step ? '#ffe14d' : 'rgba(255,255,255,0.25)' }} />
            ))}
          </div>

          <div style={{ background: '#fff', borderRadius: '8px', padding: '32px 30px', boxShadow: '0 20px 50px rgba(10,42,28,0.28)' }}>
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div>
                  <label style={lbl}>Full name <span style={{ color: '#c0392b' }}>*</span></label>
                  <input value={f.name} onChange={(e) => setField('name', e.target.value)} placeholder="e.g. Amaka Okafor" style={inp} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={lbl}>Mobile <span style={{ color: '#c0392b' }}>*</span></label>
                    <input value={f.phone} onChange={(e) => setField('phone', e.target.value)} type="tel" placeholder="080..." style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>Gender <span style={{ color: '#c0392b' }}>*</span></label>
                    <select value={f.gender} onChange={(e) => setField('gender', e.target.value)} style={inp}>
                      <option value="">Select</option>
                      <option>Female</option>
                      <option>Male</option>
                      <option>Prefer not to say</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={lbl}>Year of birth <span style={{ color: '#c0392b' }}>*</span></label>
                  <input value={f.yob} onChange={(e) => setField('yob', e.target.value)} type="number" min="1930" max="2007" placeholder="e.g. 1994" style={inp} />
                </div>
              </div>
            )}

            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={lbl}>Home state <span style={{ color: '#c0392b' }}>*</span></label>
                    <select value={f.state} onChange={(e) => setField('state', e.target.value)} style={inp}>
                      <option value="">Select state</option>
                      {ALL_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>Home LGA <span style={{ color: '#c0392b' }}>*</span></label>
                    <input value={f.lga} onChange={(e) => setField('lga', e.target.value)} placeholder="Your LGA" style={inp} />
                  </div>
                </div>
                <div>
                  <label style={lbl}>Where do you currently live? <span style={{ color: '#c0392b' }}>*</span></label>
                  <select value={f.residence} onChange={(e) => setField('residence', e.target.value)} style={inp}>
                    <option value="">Select location</option>
                    {ALL_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                    <option value="Abroad">Abroad</option>
                  </select>
                </div>
                <div>
                  <label style={lbl}>Voter status <span style={{ color: '#c0392b' }}>*</span></label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {['Registered voter', 'Not yet registered', 'Prefer not to say'].map((v) => (
                      <button key={v} type="button" onClick={() => { setVoter(v); setError('') }} style={voter === v ? chipOn : chipBase}>
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <label style={lbl}>States you know very well <span style={{ color: '#c0392b' }}>*</span></label>
                <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '13px', color: '#5c6b60', margin: '0 0 12px' }}>
                  Pick at least one. Only choose states whose politics you can credibly analyse. {known.length ? `(${known.length} selected)` : ''}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '300px', overflow: 'auto', border: '2px solid #eef2ec', borderRadius: '6px', padding: '14px' }}>
                  {ALL_STATES.map((s) => (
                    <button key={s} type="button" onClick={() => toggleState(s)} style={known.includes(s) ? chipOn : chipBase}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                  {summary.map((row) => (
                    <div key={row.k} style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', borderBottom: '1px solid #eef2ec', paddingBottom: '10px' }}>
                      <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '13px', letterSpacing: '0.04em', color: '#8aa093', textTransform: 'uppercase' }}>{row.k}</span>
                      <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '15px', color: '#0f2a1c', textAlign: 'right' }}>{row.v}</span>
                    </div>
                  ))}
                </div>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '9px', fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '14px', lineHeight: 1.5, color: '#33413a' }}>
                  <input type="checkbox" checked={f.agree} onChange={(e) => setField('agree', e.target.checked)} style={{ width: '17px', height: '17px', marginTop: '2px', accentColor: '#0f8a4a' }} />
                  <span>
                    I confirm the above is accurate and agree to the{' '}
                    <Link to="/privacy" style={{ color: '#0f8a4a', fontWeight: 800 }}>Privacy Policy &amp; Terms</Link>.
                  </span>
                </label>
              </div>
            )}

            {error && (
              <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '14px', color: '#c0392b', background: '#fdecea', borderRadius: '6px', padding: '11px 14px', marginTop: '18px' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '26px' }}>
              {step > 1 && (
                <button onClick={back} style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '16px', color: '#0f8a4a', background: '#fff', border: '2px solid #0f8a4a', borderRadius: '4px', padding: '13px 24px', cursor: 'pointer' }}>
                  ← Back
                </button>
              )}
              <button onClick={next} disabled={saving} style={{ flex: 1, fontFamily: "'Archivo Black', sans-serif", fontSize: '17px', color: '#fff', background: '#0f8a4a', border: 'none', borderRadius: '4px', padding: '14px', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saving…' : step === 4 ? 'Finish & enter dashboard' : 'Continue →'}
              </button>
            </div>
          </div>

          <p style={{ textAlign: 'center', fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '13px', color: '#9fd9b8', margin: '18px 0 0' }}>
            You must complete all steps before entering your dashboard.
          </p>
        </div>
      </div>
    </div>
  )
}

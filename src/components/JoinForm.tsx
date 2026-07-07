import { useState } from 'react'
import { Link } from '@tanstack/react-router'

const API_BASE = 'https://api.nigeria2.com'

const ALL_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT Abuja', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
]

const inputStyle: React.CSSProperties = {
  width: '100%',
  border: 'none',
  borderRadius: '2px',
  background: '#fff',
  padding: '18px',
  fontFamily: "'Archivo', sans-serif",
  fontSize: '17px',
  color: '#0f2a1c',
}

export function JoinForm() {
  const [joined, setJoined] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    const payload = {
      full_name: String(fd.get('full_name') || ''),
      email: String(fd.get('email') || ''),
      location: String(fd.get('location') || ''),
      state: String(fd.get('state') || ''),
      mobile: String(fd.get('mobile') || ''),
    }

    setSubmitting(true)
    try {
      const res = await fetch(`${API_BASE}/api/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        throw new Error(
          res.status === 422 ? 'Please check your details and try again.' : `Something went wrong (${res.status}).`,
        )
      }
      try {
        localStorage.setItem('n2_interested', JSON.stringify(payload))
      } catch {
        /* ignore */
      }
      setJoined(true)
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : 'Could not submit — please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (joined) {
    return (
      <div style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '6px', padding: '32px', textAlign: 'center' }}>
        <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '28px', color: '#ffe14d', marginBottom: '8px' }}>ALMOST THERE 🎉</div>
        <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '16px', lineHeight: 1.55, color: '#eafaf0', margin: '0 0 20px' }}>
          Your details are saved. Finish creating your account with Google — we'll pre-fill everything you just entered.
        </p>
        <Link
          to="/signup"
          style={{ display: 'inline-block', width: '100%', boxSizing: 'border-box', border: 'none', borderRadius: '2px', background: '#ffe14d', color: '#0f4a2c', fontFamily: "'Archivo Black', sans-serif", fontSize: '20px', letterSpacing: '0.02em', padding: '17px', textDecoration: 'none' }}
        >
          COMPLETE SIGN-UP WITH GOOGLE →
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <input type="text" name="full_name" placeholder="Full name" style={inputStyle} required />
        <input type="email" name="email" placeholder="Email address" style={inputStyle} required />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <input type="text" name="location" placeholder="Location" style={inputStyle} required />
        <select name="state" style={{ ...inputStyle, padding: '18px 16px', cursor: 'pointer' }} required defaultValue="">
          <option value="" disabled>
            State
          </option>
          {ALL_STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <input type="tel" name="mobile" placeholder="Mobile number" style={inputStyle} required />

      {error && (
        <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '14px', color: '#0f4a2c', background: '#ffe14d', borderRadius: '4px', padding: '10px 14px' }}>
          {error}
        </div>
      )}

      <p
        style={{
          fontFamily: "'Archivo', sans-serif",
          fontWeight: 600,
          fontSize: '13px',
          lineHeight: 1.5,
          color: '#dff5e8',
          margin: '6px 0 4px',
        }}
      >
        Enter your phone number above to receive updates from Nigeria 2.0. By providing your mobile number, you agree
        to the{' '}
        <Link to="/privacy" style={{ color: '#fff', textDecoration: 'underline' }}>
          Privacy Policy &amp; Terms of Service
        </Link>{' '}
        for recurring campaign messages.
      </p>
      <button
        type="submit"
        disabled={submitting}
        style={{
          width: '100%',
          border: 'none',
          borderRadius: '2px',
          background: '#ffe14d',
          color: '#0f4a2c',
          fontFamily: "'Archivo Black', sans-serif",
          fontSize: '26px',
          letterSpacing: '0.02em',
          padding: '19px',
          cursor: submitting ? 'not-allowed' : 'pointer',
          opacity: submitting ? 0.7 : 1,
        }}
      >
        {submitting ? 'JOINING…' : 'JOIN THE MOVEMENT'}
      </button>
    </form>
  )
}

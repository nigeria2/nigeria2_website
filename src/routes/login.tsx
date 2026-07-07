import { useEffect } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Logo } from '../components/Logo'
import { GoogleSignIn } from '../components/GoogleSignIn'
import { useAuth } from '../auth'

export const Route = createFileRoute('/login')({ component: Login })

function Login() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && user) navigate({ to: user.onboarded ? '/dashboard' : '/onboarding' })
  }, [user, loading, navigate])

  return (
    <div style={{ minHeight: '100vh', background: '#0d8244', fontFamily: "'Archivo', sans-serif", display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: '#fff', display: 'flex', alignItems: 'center', padding: '12px 32px' }}>
        <Logo />
        <Link to="/" style={{ marginLeft: 'auto', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '13px', letterSpacing: '0.06em', color: '#0f2a1c', textTransform: 'uppercase', textDecoration: 'none' }}>
          ← Back to Home
        </Link>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '34px', color: '#fff', letterSpacing: '-0.01em' }}>
              NIGERIA <span style={{ color: '#ffe14d' }}>2.0</span>
            </div>
            <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '12px', letterSpacing: '0.24em', color: '#cdeeda', marginTop: '6px' }}>
              MEMBER LOGIN
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '8px', padding: '40px 34px', boxShadow: '0 20px 50px rgba(10,42,28,0.28)', textAlign: 'center' }}>
            <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '26px', color: '#0f2a1c', margin: '0 0 6px' }}>Welcome back</h1>
            <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '15px', lineHeight: 1.55, color: '#5c6b60', margin: '0 0 26px' }}>
              Sign in with your Google account to submit your election analysis.
            </p>

            <GoogleSignIn />

            <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '12px', lineHeight: 1.5, color: '#8aa093', marginTop: '20px' }}>
              By continuing you agree to our{' '}
              <Link to="/privacy" style={{ color: '#0f8a4a', fontWeight: 800 }}>
                Privacy Policy &amp; Terms
              </Link>
              .
            </div>
          </div>

          <p style={{ textAlign: 'center', fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '15px', color: '#eafaf0', margin: '22px 0 0' }}>
            New here?{' '}
            <Link to="/signup" style={{ color: '#ffe14d', fontWeight: 800, textDecoration: 'none' }}>
              Create an account →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { API_BASE, GOOGLE_CLIENT_ID } from '../config'
import { useAuth, type User } from '../auth'

declare global {
  interface Window {
    google?: any
  }
}

/** Renders the official Google Sign-In button and completes the auth flow. */
export function GoogleSignIn() {
  const buttonRef = useRef<HTMLDivElement>(null)
  const { login } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      setError('Google sign-in is not configured yet.')
      return
    }

    const handleCredential = async (response: { credential?: string }) => {
      if (!response.credential) return
      setBusy(true)
      setError('')
      try {
        const res = await fetch(`${API_BASE}/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential: response.credential }),
        })
        if (!res.ok) throw new Error('auth failed')
        const data = (await res.json()) as { token: string; user: User }
        login(data.token, data.user)
        navigate({ to: data.user.onboarded ? '/dashboard' : '/onboarding' })
      } catch {
        setError('Sign-in failed. Please try again.')
        setBusy(false)
      }
    }

    const init = () => {
      if (!window.google?.accounts?.id || !buttonRef.current) return
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredential,
      })
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'outline',
        size: 'large',
        width: 320,
        text: 'continue_with',
        shape: 'rectangular',
        logo_alignment: 'left',
      })
    }

    const existing = document.getElementById('gsi-client') as HTMLScriptElement | null
    if (existing && window.google) {
      init()
    } else if (!existing) {
      const s = document.createElement('script')
      s.id = 'gsi-client'
      s.src = 'https://accounts.google.com/gsi/client'
      s.async = true
      s.defer = true
      s.onload = init
      document.head.appendChild(s)
    } else {
      existing.addEventListener('load', init)
    }
  }, [login, navigate])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      <div ref={buttonRef} style={{ minHeight: '44px', opacity: busy ? 0.6 : 1 }} />
      {busy && (
        <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '14px', color: '#5c6b60' }}>
          Signing you in…
        </div>
      )}
      {error && (
        <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '13px', color: '#c0392b', textAlign: 'center' }}>
          {error}
        </div>
      )}
    </div>
  )
}

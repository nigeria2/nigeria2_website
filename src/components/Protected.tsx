import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '../auth'

function FullScreen({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#0d8244', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Archivo', sans-serif" }}>
      <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '20px', color: '#fff' }}>{children}</div>
    </div>
  )
}

/**
 * Client-side route guard. Redirects to /login when signed out, and to home
 * when `admin` is required but the user is not an admin.
 */
export function Protected({ children, admin = false }: { children: React.ReactNode; admin?: boolean }) {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (loading) return
    if (!user) {
      navigate({ to: '/login' })
    } else if (admin && !user.is_admin) {
      navigate({ to: '/' })
    }
  }, [user, loading, admin, navigate])

  if (loading) return <FullScreen>Loading…</FullScreen>
  if (!user) return <FullScreen>Redirecting to sign in…</FullScreen>
  if (admin && !user.is_admin) return <FullScreen>Admins only — redirecting…</FullScreen>
  return <>{children}</>
}

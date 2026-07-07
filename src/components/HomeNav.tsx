import { Link, useLocation } from '@tanstack/react-router'
import { useAuth } from '../auth'

const navLink: React.CSSProperties = {
  fontFamily: "'Archivo', sans-serif",
  fontWeight: 800,
  fontSize: '14px',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: '#0f2a1c',
  textDecoration: 'none',
  padding: '2px 0',
}

/** White top navigation bar used across the site. */
export function HomeNav() {
  const { user } = useAuth()
  const pathname = useLocation({ select: (l) => l.pathname })
  const on2027 = pathname === '/2027'
  const onProblem = pathname === '/problem-units'
  return (
    <div
      style={{
        background: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        gap: '22px',
        padding: '12px 32px',
      }}
    >
      <Link
        to="/"
        style={{
          fontFamily: "'Archivo Black', sans-serif",
          fontSize: '20px',
          letterSpacing: '-0.01em',
          color: '#0f8a4a',
          textDecoration: 'none',
        }}
      >
        N<span style={{ color: '#0f2a1c' }}>2.0</span>
      </Link>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '34px' }}>
        <Link to="/2027" className="nav-underline" style={{ ...navLink, borderBottom: on2027 ? '2px solid #ffe14d' : '2px solid transparent' }}>
          2027 Prediction
        </Link>
        <Link to="/problem-units" className="nav-underline" style={{ ...navLink, borderBottom: onProblem ? '2px solid #ffe14d' : '2px solid transparent' }}>
          Problem Polling Units
        </Link>
        <a href="https://forensic.nigeria2.com/" className="nav-underline" style={{ ...navLink, borderBottom: '2px solid transparent' }}>
          2023 Vote Counting
        </a>
      </div>

      <Link
        to={user ? '/dashboard' : '/login'}
        style={{
          fontFamily: "'Archivo Black', sans-serif",
          fontSize: '14px',
          letterSpacing: '0.04em',
          color: '#fff',
          background: '#0f8a4a',
          textDecoration: 'none',
          padding: '7px 20px',
          borderRadius: '3px',
        }}
      >
        {user ? 'DASHBOARD' : 'LOGIN'}
      </Link>
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
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

/** White top navigation bar used across the site. Project pages are grouped under an
 *  "Our Projects" dropdown so the header stays compact. */
export function HomeNav() {
  const { user } = useAuth()
  const pathname = useLocation({ select: (l) => l.pathname })
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  const onResults = /^\/elections\/\d+\/results/.test(pathname)
  const on2027 = pathname === '/elections/2027/prediction'
  const onProblem = pathname === '/problem-units'
  const projectActive = onResults || on2027 || onProblem

  // close the dropdown on outside click or Escape
  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const itemStyle: React.CSSProperties = {
    fontFamily: "'Archivo', sans-serif",
    fontWeight: 800,
    fontSize: '13px',
    letterSpacing: '0.03em',
    textTransform: 'uppercase',
    color: '#0f2a1c',
    textDecoration: 'none',
    padding: '10px 16px',
    whiteSpace: 'nowrap',
    display: 'block',
  }

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

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '24px' }}>
        <div ref={wrapRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={open}
            className="nav-underline"
            style={{
              ...navLink,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              borderBottom: projectActive ? '2px solid #ffe14d' : '2px solid transparent',
            }}
          >
            Our Projects
            <span aria-hidden style={{ fontSize: '10px', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}>▾</span>
          </button>
          {open && (
            <div
              role="menu"
              style={{
                position: 'absolute',
                top: 'calc(100% + 10px)',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#fff',
                border: '1px solid #dbe4dc',
                borderRadius: '10px',
                boxShadow: '0 12px 32px rgba(15,42,28,0.16)',
                padding: '6px',
                minWidth: '240px',
                zIndex: 50,
              }}
            >
              <Link to="/elections/results" onClick={() => setOpen(false)} className="nav-menu-item" style={itemStyle}>
                Election Results Data
              </Link>
              <Link to="/elections/2027/prediction" onClick={() => setOpen(false)} className="nav-menu-item" style={itemStyle}>
                2027 Prediction
              </Link>
              <Link to="/problem-units" onClick={() => setOpen(false)} className="nav-menu-item" style={itemStyle}>
                2027 Problem Polling Units
              </Link>
              <a href="https://forensic.nigeria2.com/" className="nav-menu-item" style={itemStyle}>
                2023 Vote Counting
              </a>
            </div>
          )}
        </div>
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

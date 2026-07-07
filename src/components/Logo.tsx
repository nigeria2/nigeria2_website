import { Link } from '@tanstack/react-router'

/** Compact "N2.0" wordmark used in page top bars. */
export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link
      to="/"
      style={{
        fontFamily: "'Archivo Black', sans-serif",
        fontSize: '20px',
        letterSpacing: '-0.01em',
        color: light ? '#fff' : '#0f8a4a',
        textDecoration: 'none',
      }}
    >
      N<span style={{ color: light ? '#ffe14d' : '#0f2a1c' }}>2.0</span>
    </Link>
  )
}

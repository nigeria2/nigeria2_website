import { Link } from '@tanstack/react-router'
import { HomeNav } from './HomeNav'
import { HomeFooter } from './HomeFooter'

const pill: React.CSSProperties = {
  fontFamily: "'Archivo Black', sans-serif",
  fontSize: '15px',
  textDecoration: 'none',
  padding: '13px 24px',
  borderRadius: '4px',
  whiteSpace: 'nowrap',
}

/** Site-wide 404 page. Rendered by the router's defaultNotFoundComponent for any
 *  unmatched route. */
export function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0d8244', fontFamily: "'Archivo', sans-serif" }}>
      <HomeNav />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 40px' }}>
        <div style={{ maxWidth: '620px', textAlign: 'center' }}>
          <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '96px', lineHeight: 1, color: '#ffe14d', letterSpacing: '-0.02em' }}>404</div>
          <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '34px', color: '#fff', margin: '10px 0 12px', letterSpacing: '-0.01em' }}>
            Page not found
          </h1>
          <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '17px', lineHeight: 1.55, color: '#c7e7d4', margin: '0 0 30px' }}>
            The page you're looking for doesn't exist or may have moved. Let's get you back on track.
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/" style={{ ...pill, color: '#0f4a2c', background: '#ffe14d' }}>← Back home</Link>
            <Link to="/elections/$year/results" params={{ year: '2023' }} style={{ ...pill, color: '#fff', background: '#0a6337', border: '1px solid #2f8a5c' }}>
              Election results
            </Link>
          </div>
        </div>
      </div>
      <HomeFooter />
    </div>
  )
}

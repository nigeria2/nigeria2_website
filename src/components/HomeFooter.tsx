import { Link } from '@tanstack/react-router'

const colTitle: React.CSSProperties = {
  fontFamily: "'Archivo Black', sans-serif",
  fontSize: '12px',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: '#ffe14d',
  marginBottom: '12px',
}

const colLink: React.CSSProperties = {
  fontFamily: "'Archivo', sans-serif",
  fontWeight: 700,
  fontSize: '14px',
  color: '#eafaf0',
  textDecoration: 'none',
}

const socialIcon: React.CSSProperties = {
  width: '30px',
  height: '30px',
  borderRadius: '6px',
  background: '#0f8a4a',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
  fontWeight: 900,
  fontSize: '14px',
  textDecoration: 'none',
}

/** Rich multi-column footer used on the home page. */
export function HomeFooter() {
  return (
    <div style={{ background: '#0a6337', padding: '40px 40px 30px' }}>
      <div
        style={{
          maxWidth: '1080px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '32px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '22px', color: '#fff', marginBottom: '6px' }}>
            NIGERIA <span style={{ color: '#ffe14d' }}>2.0</span>
          </div>
          <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '14px', color: '#9fd9b8' }}>
            A movement for every Nigerian
          </div>
        </div>

        <div style={{ display: 'flex', gap: '56px', flexWrap: 'wrap' }}>
          <div>
            <div style={colTitle}>Projects</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
              <Link to="/elections/2027/prediction" className="footer-link" style={colLink}>2027 Prediction</Link>
              <Link to="/elections/results" className="footer-link" style={colLink}>Election Results Data</Link>
              <Link to="/problem-units" className="footer-link" style={colLink}>2027 Problem Polling Units</Link>
              <a href="https://forensic.nigeria2.com/" className="footer-link" style={colLink}>2023 Vote Counting</a>
            </div>
          </div>
          <div>
            <div style={colTitle}>Data</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
              <Link to="/parties" className="footer-link" style={colLink}>Political Parties</Link>
              <Link to="/senators" className="footer-link" style={colLink}>Senators</Link>
              <Link to="/reps" className="footer-link" style={colLink}>House of Reps</Link>
              <Link to="/politicians" className="footer-link" style={colLink}>Politicians</Link>
              <Link to="/api" className="footer-link" style={colLink}>Public API</Link>
            </div>
          </div>
          <div>
            <div style={colTitle}>About Us</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
              <Link to="/contact" className="footer-link" style={colLink}>Contact</Link>
              <Link to="/team" className="footer-link" style={colLink}>The Team</Link>
              <Link to="/privacy" className="footer-link" style={colLink}>Privacy Policy</Link>
            </div>
          </div>
          <div>
            <div style={colTitle}>Follow</div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <a href="#" aria-label="Facebook" style={socialIcon}>f</a>
              <a href="#" aria-label="Instagram" style={socialIcon}>◎</a>
              <a href="#" aria-label="TikTok" style={socialIcon}>♪</a>
              <a href="#" aria-label="X" style={socialIcon}>✕</a>
              <a href="#" aria-label="YouTube" style={socialIcon}>▶</a>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          maxWidth: '1080px',
          margin: '26px auto 0',
          paddingTop: '18px',
          borderTop: '1px solid rgba(255,255,255,0.14)',
          fontFamily: "'Archivo', sans-serif",
          fontWeight: 600,
          fontSize: '13px',
          color: '#9fd9b8',
        }}
      >
        © 2027 Nigeria 2.0 · Techies for a Better Nigeria
      </div>
    </div>
  )
}

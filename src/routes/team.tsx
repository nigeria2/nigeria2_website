import { createFileRoute, Link } from '@tanstack/react-router'
import { HomeNav } from '../components/HomeNav'
import { HomeFooter } from '../components/HomeFooter'

export const Route = createFileRoute('/team')({ component: Team })

const LEADERS = [
  { name: 'Mark Essien', role: 'Founder', bg: '#0f8a4a', initials: 'ME', bio: 'Founded Nigeria 2.0 to make elections verifiable for every citizen.' },
]

function Team() {
  return (
    <div style={{ minHeight: '100vh', background: '#0d8244', fontFamily: "'Archivo', sans-serif" }}>
      <HomeNav />

      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '52px 40px 24px' }}>
        <div style={{ display: 'inline-block', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '13px', letterSpacing: '0.16em', color: '#0f2a1c', textTransform: 'uppercase', background: '#ffe14d', padding: '7px 14px', borderRadius: '3px', marginBottom: '18px' }}>
          About Us
        </div>
        <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '52px', lineHeight: 0.95, color: '#fff', margin: '0 0 16px', letterSpacing: '-0.01em' }}>The Team</h1>
        <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '19px', lineHeight: 1.55, color: '#eafaf0', maxWidth: '720px', margin: 0 }}>
          Building the tools for a transparent Nigerian democracy.
        </p>
      </div>

      <div style={{ background: '#f4f7f2', marginTop: '34px' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '52px 40px 20px' }}>
          <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '24px', color: '#0f2a1c', margin: '0 0 20px' }}>Leadership</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 260px))', gap: '20px' }}>
            {LEADERS.map((m) => (
              <div key={m.name} style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '8px', padding: '24px', textAlign: 'center' }}>
                <div style={{ width: '88px', height: '88px', borderRadius: '50%', margin: '0 auto 14px', background: m.bg, color: '#fff', fontFamily: "'Archivo Black', sans-serif", fontSize: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{m.initials}</div>
                <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '18px', color: '#0f2a1c' }}>{m.name}</div>
                <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '13px', letterSpacing: '0.04em', color: '#0f8a4a', margin: '4px 0 10px', textTransform: 'uppercase' }}>{m.role}</div>
                <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 500, fontSize: '14px', lineHeight: 1.55, color: '#5c6b60', margin: 0 }}>{m.bio}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '32px 40px 72px' }}>
          <div style={{ background: '#0a6337', borderRadius: '8px', padding: '34px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '24px', color: '#fff', marginBottom: '6px' }}>Want to join us?</div>
              <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '16px', color: '#eafaf0', margin: 0 }}>We're always looking for volunteers, engineers and analysts across all 36 states.</p>
            </div>
            <Link to="/signup" style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '17px', color: '#0f4a2c', background: '#ffe14d', textDecoration: 'none', padding: '15px 28px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
              Become a contributor →
            </Link>
          </div>
        </div>
      </div>

      <HomeFooter />
    </div>
  )
}

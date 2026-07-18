import { createFileRoute, Link } from '@tanstack/react-router'
import { HomeNav } from '../components/HomeNav'
import { JoinForm } from '../components/JoinForm'
import { HomeFooter } from '../components/HomeFooter'

export const Route = createFileRoute('/')({ component: Home })

const ctaStyle: React.CSSProperties = {
  fontFamily: "'Archivo', sans-serif",
  fontWeight: 800,
  fontSize: '14px',
  letterSpacing: '0.02em',
  color: '#fff',
  background: '#0f8a4a',
  textDecoration: 'none',
  padding: '11px 16px',
  borderRadius: '4px',
  textAlign: 'center',
}

type Project = { title: string; desc: string; cta: string } & (
  | { external?: false; href: '/elections/results' }
  | { external: true; href: string }
)

const PROJECTS: Project[] = [
  { title: 'Election Results Data', desc: 'Verified results from past elections, broken down all the way to the local government, ward and polling unit.', href: '/elections/results', cta: 'Explore the data' },
  { title: '2023 Vote Counting', desc: 'Our independent, parallel count of the 2023 general election, transcribed from INEC result sheets.', external: true, href: 'https://forensic.nigeria2.com/', cta: 'Explore the count' },
]

function Home() {
  return (
    <div style={{ minHeight: '100vh', background: '#0d8244', fontFamily: "'Archivo', sans-serif", display: 'flex', flexDirection: 'column' }}>
      <HomeNav />

      {/* header: centered logo */}
      <div style={{ position: 'relative', padding: '26px 40px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '96px' }}>
        <div style={{ textAlign: 'center', lineHeight: 0.86 }}>
          <div
            style={{
              fontFamily: "'Archivo Black', sans-serif",
              fontSize: '58px',
              color: '#ffffff',
              letterSpacing: '-0.01em',
              textShadow: '3px 3px 0 rgba(0,0,0,0.18)',
            }}
          >
            NIGERIA <span style={{ color: '#ffe14d' }}>2.0</span>
          </div>
          <div
            style={{
              fontFamily: "'Archivo', sans-serif",
              fontWeight: 800,
              fontSize: '15px',
              letterSpacing: '0.32em',
              color: '#ffffff',
              marginTop: '6px',
              paddingLeft: '0.32em',
            }}
          >
            TECHIES FOR A BETTER NIGERIA
          </div>
        </div>
      </div>

      {/* main: hero + form */}
      <div
        style={{
          flex: 1,
          maxWidth: '1320px',
          width: '100%',
          margin: '0 auto',
          padding: '20px 40px 36px',
          display: 'grid',
          gridTemplateColumns: '1.18fr 0.9fr',
          gap: '48px',
          alignItems: 'start',
        }}
        className="home-main"
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img
            src="/fpimg.jpg"
            alt="Nigeria 2.0 team"
            style={{ width: '100%', maxWidth: '480px', height: 'auto', display: 'block', borderRadius: '8px' }}
          />
        </div>

        <div>
          <h1
            style={{
              fontFamily: "'Archivo Black', sans-serif",
              fontSize: '34px',
              lineHeight: 1.04,
              color: '#ffffff',
              margin: '0 0 18px',
              letterSpacing: '-0.01em',
            }}
          >
            Our goal is to make the election honest. <span style={{ color: '#ffe14d' }}>Join Us.</span>
          </h1>
          <JoinForm />
        </div>
      </div>

      {/* mission & vision */}
      <div style={{ background: '#0a6337', padding: '64px 40px' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <h2
            style={{
              fontFamily: "'Archivo Black', sans-serif",
              fontSize: '40px',
              lineHeight: 1,
              color: '#fff',
              margin: '0 0 32px',
              textAlign: 'center',
            }}
          >
            Our Mission &amp; Vision
          </h2>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '19px', lineHeight: 1.7, color: '#eafaf0', margin: '0 0 22px' }}>
              <span style={{ color: '#ffe14d', fontFamily: "'Archivo Black', sans-serif" }}>Our mission</span> is to put
              credible, real-time electoral data in the hands of every Nigerian — using technology to make our democracy
              transparent, our votes count, and our leaders accountable. We build tools that turn civic energy into
              measurable impact at the ballot box.
            </p>
            <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '19px', lineHeight: 1.7, color: '#eafaf0', margin: 0 }}>
              <span style={{ color: '#ffe14d', fontFamily: "'Archivo Black', sans-serif" }}>Our vision</span> is a Nigeria
              where every election is free, fair and fully verifiable — a nation powered by an informed, engaged and
              empowered generation of citizens. Nigeria 2.0: a new operating system for the world's largest Black
              democracy.
            </p>
          </div>
        </div>
      </div>

      {/* what we're doing — links into each project */}
      <div style={{ background: '#f4f7f2', padding: '60px 40px' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '34px', lineHeight: 1.05, color: '#0f2a1c', margin: '0 0 10px', textAlign: 'center' }}>What we're doing</h2>
          <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '17px', lineHeight: 1.6, color: '#5c6b60', margin: '0 auto 34px', maxWidth: '760px', textAlign: 'center' }}>
            We turn civic energy into credible electoral data: an open record of past results, a crowd-sourced 2027
            forecast, a watchlist of the polling units that failed in 2023, and an independent count of the last
            election. Explore each below.
          </p>
          <div className="two-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '18px' }}>
            {PROJECTS.map((c) => (
              <div key={c.title} style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '12px', padding: '26px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '19px', color: '#0f2a1c', marginBottom: '10px' }}>{c.title}</div>
                <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '15px', lineHeight: 1.55, color: '#5c6b60', margin: '0 0 20px', flex: 1 }}>{c.desc}</p>
                {c.external ? (
                  <a href={c.href} style={ctaStyle}>{c.cta} →</a>
                ) : (
                  <Link to={c.href} style={ctaStyle}>{c.cta} →</Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <HomeFooter />
    </div>
  )
}

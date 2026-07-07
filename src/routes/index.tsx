import { createFileRoute } from '@tanstack/react-router'
import { HomeNav } from '../components/HomeNav'
import { JoinForm } from '../components/JoinForm'
import { HomePolls } from '../components/HomePolls'
import { HomeFooter } from '../components/HomeFooter'

export const Route = createFileRoute('/')({ component: Home })

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
        <div style={{ width: '100%', aspectRatio: '4 / 3', overflow: 'hidden', background: '#1e8b3f', borderRadius: '6px' }}>
          <img
            src="/fpimg.jpg"
            alt="Nigeria 2.0 team"
            style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center', display: 'block' }}
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

      <HomePolls />

      <HomeFooter />
    </div>
  )
}

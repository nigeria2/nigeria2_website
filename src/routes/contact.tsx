import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { HomeNav } from '../components/HomeNav'
import { HomeFooter } from '../components/HomeFooter'

export const Route = createFileRoute('/contact')({ component: Contact })

const lbl: React.CSSProperties = { display: 'block', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '12px', letterSpacing: '0.06em', color: '#0f2a1c', textTransform: 'uppercase', marginBottom: '6px' }
const input: React.CSSProperties = { width: '100%', border: '2px solid #d7e0d9', borderRadius: '4px', background: '#f9fbf8', padding: '13px 14px', fontFamily: "'Archivo', sans-serif", fontSize: '16px', color: '#0f2a1c' }
const textarea: React.CSSProperties = { ...input, resize: 'vertical', lineHeight: 1.5 }

const CHANNELS = [
  { label: 'Email', value: 'hello@nigeria2.com' },
  { label: 'Media & press', value: 'press@nigeria2.com' },
  { label: 'Phone', value: '+234 (0) 700 NIGERIA2' },
  { label: 'Office', value: 'Yaba, Lagos, Nigeria' },
]
const SOCIALS = ['f', '◎', '✕', '▶']

function Contact() {
  const [sent, setSent] = useState(false)

  return (
    <div style={{ minHeight: '100vh', background: '#0d8244', fontFamily: "'Archivo', sans-serif" }}>
      <HomeNav />

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '52px 40px 24px' }}>
        <div style={{ display: 'inline-block', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '13px', letterSpacing: '0.16em', color: '#0f2a1c', textTransform: 'uppercase', background: '#ffe14d', padding: '7px 14px', borderRadius: '3px', marginBottom: '18px' }}>
          Get in touch
        </div>
        <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '52px', lineHeight: 0.95, color: '#fff', margin: '0 0 16px', letterSpacing: '-0.01em' }}>Contact Us</h1>
        <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '19px', lineHeight: 1.55, color: '#eafaf0', maxWidth: '660px', margin: 0 }}>
          Questions, media enquiries or want to volunteer? We'd love to hear from you.
        </p>
      </div>

      <div style={{ background: '#f4f7f2', marginTop: '34px' }}>
        <div className="two-col" style={{ maxWidth: '960px', margin: '0 auto', padding: '52px 40px 72px', display: 'grid', gridTemplateColumns: '1fr 0.75fr', gap: '28px', alignItems: 'start' }}>
          <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '8px', padding: '28px' }}>
            <h2 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '22px', color: '#0f2a1c', margin: '0 0 18px' }}>Send us a message</h2>
            <form onSubmit={(e) => { e.preventDefault(); setSent(true) }} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={lbl}>Name</label>
                  <input required placeholder="Your name" style={input} />
                </div>
                <div>
                  <label style={lbl}>Email</label>
                  <input type="email" required placeholder="you@example.com" style={input} />
                </div>
              </div>
              <div>
                <label style={lbl}>Subject</label>
                <select style={input}>
                  <option>General enquiry</option>
                  <option>Volunteering</option>
                  <option>Media &amp; press</option>
                  <option>Data &amp; methodology</option>
                  <option>Partnerships</option>
                </select>
              </div>
              <div>
                <label style={lbl}>Message</label>
                <textarea required rows={5} placeholder="How can we help?" style={textarea} />
              </div>
              <button type="submit" style={{ border: 'none', borderRadius: '4px', background: '#0f8a4a', color: '#fff', fontFamily: "'Archivo Black', sans-serif", fontSize: '18px', padding: '15px', cursor: 'pointer' }}>
                {sent ? '✓ Message sent — thank you!' : 'Send message'}
              </button>
            </form>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {CHANNELS.map((c) => (
              <div key={c.label} style={{ background: '#fff', border: '1px solid #dbe4dc', borderLeft: '5px solid #0f8a4a', borderRadius: '6px', padding: '18px 20px' }}>
                <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '12px', letterSpacing: '0.06em', color: '#8aa093', textTransform: 'uppercase', marginBottom: '4px' }}>{c.label}</div>
                <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '16px', color: '#0f2a1c' }}>{c.value}</div>
              </div>
            ))}
            <div style={{ background: '#0a6337', borderRadius: '6px', padding: '20px' }}>
              <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '16px', color: '#ffe14d', marginBottom: '10px' }}>Follow us</div>
              <div style={{ display: 'flex', gap: '10px' }}>
                {SOCIALS.map((s, i) => (
                  <a key={i} href="#" style={{ width: '34px', height: '34px', borderRadius: '6px', background: 'rgba(255,255,255,0.14)', color: '#fff', fontFamily: "'Archivo Black', sans-serif", fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>{s}</a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <HomeFooter />
    </div>
  )
}

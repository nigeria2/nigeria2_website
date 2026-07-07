import { createFileRoute, Link } from '@tanstack/react-router'
import { HomeNav } from '../components/HomeNav'
import { HomeFooter } from '../components/HomeFooter'

export const Route = createFileRoute('/contribute')({ component: Contribute })

const STEPS = [
  { n: '1', title: 'You report what you see locally', body: 'Contributors tell us how their ward or polling unit is leaning, what issues matter on the ground, and what they expect their neighbours to do on election day. Every submission is tied to a location — but never to your identity.' },
  { n: '2', title: 'We group reports by location', body: 'Submissions are pooled by polling unit, ward, local government and state. Because thousands of Nigerians report from the same places, no single voice dominates — the pattern across a community is what counts, not any one opinion.' },
  { n: '3', title: 'We weight each area fairly', body: "Each location's signal is scaled to match its share of registered voters using the INEC register, so a densely-populated LGA and a small rural ward each count for exactly what they are worth in the real electorate — no more, no less." },
  { n: '4', title: 'We roll it up into statistics', body: 'Weighted local signals are aggregated up the chain — unit to ward, ward to state, state to nation — and blended with our polling and historical turnout models to produce the projected shares you see on the map and prediction pages.' },
]

const SAFEGUARDS = [
  { name: 'Anonymous by design', desc: 'We store your location signal, not your name. Reports cannot be traced back to an individual contributor.' },
  { name: 'Outlier detection', desc: "Automated checks flag coordinated or duplicate submissions so a small group cannot skew a community's numbers." },
  { name: 'Weighted, not raw', desc: 'Every area is scaled to its true share of registered voters, so louder communities never drown out quieter ones.' },
  { name: 'Blended with hard data', desc: 'Local knowledge is combined with formal polling and INEC records — it informs the picture, it does not replace evidence.' },
]

function Contribute() {
  return (
    <div style={{ minHeight: '100vh', background: '#0d8244', fontFamily: "'Archivo', sans-serif" }}>
      <HomeNav />

      <div style={{ maxWidth: '820px', margin: '0 auto', padding: '52px 40px 30px' }}>
        <div style={{ display: 'inline-block', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '13px', letterSpacing: '0.16em', color: '#0f2a1c', textTransform: 'uppercase', background: '#ffe14d', padding: '7px 14px', borderRadius: '3px', marginBottom: '18px' }}>
          Powered by Nigerians
        </div>
        <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '52px', lineHeight: 0.95, color: '#fff', margin: '0 0 14px', letterSpacing: '-0.01em' }}>Contribute Your Knowledge</h1>
        <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '19px', lineHeight: 1.55, color: '#eafaf0', maxWidth: '720px', margin: 0 }}>
          You know your street, your ward, your local government better than any pollster. Here is how we turn what
          millions of Nigerians know about their own communities into the statistics you see across this site.
        </p>
      </div>

      <div style={{ background: '#f4f7f2' }}>
        <div style={{ maxWidth: '820px', margin: '0 auto', padding: '52px 40px 40px' }}>
          <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '24px', color: '#0f2a1c', margin: '0 0 24px' }}>From your neighbourhood to the national picture</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {STEPS.map((st) => (
              <div key={st.n} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', background: '#fff', border: '1px solid #e2e8dd', borderRadius: '6px', padding: '22px 24px' }}>
                <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '26px', color: '#fff', background: '#0f8a4a', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>{st.n}</div>
                <div>
                  <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '19px', color: '#0f2a1c', marginBottom: '6px' }}>{st.title}</div>
                  <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 500, fontSize: '16px', lineHeight: 1.6, color: '#33413a', margin: 0 }}>{st.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ maxWidth: '820px', margin: '0 auto', padding: '8px 40px 40px' }}>
          <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '24px', color: '#0f2a1c', margin: '8px 0 16px' }}>How we keep it honest</div>
          <div className="two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {SAFEGUARDS.map((g) => (
              <div key={g.name} style={{ background: '#fff', border: '1px solid #e2e8dd', borderLeft: '5px solid #0f8a4a', borderRadius: '4px', padding: '16px 20px' }}>
                <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '16px', color: '#0f2a1c' }}>{g.name}</div>
                <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '15px', lineHeight: 1.5, color: '#5c6b60', marginTop: '3px' }}>{g.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ maxWidth: '820px', margin: '0 auto', padding: '0 40px 72px' }}>
          <div style={{ background: '#0a6337', borderRadius: '6px', padding: '30px 32px', textAlign: 'center' }}>
            <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '22px', color: '#ffe14d', marginBottom: '8px' }}>Add what you know</div>
            <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '16px', lineHeight: 1.6, color: '#eafaf0', margin: '0 auto 22px', maxWidth: '52ch' }}>
              It takes two minutes. Tell us how your community is leaning, and your local knowledge becomes part of the
              national picture — anonymously and securely.
            </p>
            <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/signup" style={{ display: 'inline-block', fontFamily: "'Archivo Black', sans-serif", fontSize: '16px', color: '#0f4a2c', background: '#ffe14d', textDecoration: 'none', padding: '15px 28px', borderRadius: '3px' }}>Contribute your knowledge</Link>
              <Link to="/methodology" style={{ display: 'inline-block', fontFamily: "'Archivo Black', sans-serif", fontSize: '16px', color: '#fff', border: '2px solid rgba(255,255,255,0.5)', textDecoration: 'none', padding: '13px 26px', borderRadius: '3px' }}>Read the methodology</Link>
            </div>
          </div>
        </div>
      </div>

      <HomeFooter />
    </div>
  )
}

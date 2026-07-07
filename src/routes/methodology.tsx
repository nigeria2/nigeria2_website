import { createFileRoute } from '@tanstack/react-router'
import { HomeNav } from '../components/HomeNav'
import { HomeFooter } from '../components/HomeFooter'

export const Route = createFileRoute('/methodology')({ component: Methodology })

const SECTIONS = [
  { title: 'How we collect data', body: 'Our numbers combine three streams: nationwide opinion polling conducted by our field teams, a standing online panel of registered voters, and on-the-ground reports from our volunteer network across all 36 states and the FCT. Each wave samples voters proportionally to a state’s registered-voter population.' },
  { title: 'How we weight it', body: "Raw responses are weighted to match Nigeria's demographic reality — by state, age band, gender, and urban/rural split — using the latest INEC voter register and national census estimates. This corrects for who we happen to reach so the sample reflects the electorate, not just our respondents." },
  { title: 'How we model projections', body: 'We blend current polling with historical voting patterns and turnout models for each state to project a likely outcome. Governorship and presidential races are modelled separately, because voters often split their tickets. Confidence intervals widen where sample sizes are smaller or races are volatile.' },
  { title: 'How often we update', body: 'Figures refresh as each new polling wave closes — typically every two weeks — and more frequently in the final months before an election. Every update is timestamped, and the trend arrows on our homepage compare the latest wave to the one before it.' },
]

const SOURCES = [
  { name: 'Nigeria 2.0 Field Polls', desc: 'In-person and phone interviews conducted by trained enumerators in all 36 states and the FCT.' },
  { name: 'Registered Voter Panel', desc: 'A recurring online panel of verified, registered voters used to track shifts in opinion over time.' },
  { name: 'Volunteer Network Reports', desc: 'Structured on-the-ground observations from our nationwide volunteer community.' },
  { name: 'INEC Public Records', desc: 'Official voter-register and past-election data used to weight and benchmark our samples.' },
  { name: 'National Census Estimates', desc: 'Demographic baselines used to make each sample representative of the electorate.' },
]

function Methodology() {
  return (
    <div style={{ minHeight: '100vh', background: '#0d8244', fontFamily: "'Archivo', sans-serif" }}>
      <HomeNav />

      <div style={{ maxWidth: '820px', margin: '0 auto', padding: '52px 40px 30px' }}>
        <div style={{ display: 'inline-block', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '13px', letterSpacing: '0.16em', color: '#0f2a1c', textTransform: 'uppercase', background: '#ffe14d', padding: '7px 14px', borderRadius: '3px', marginBottom: '18px' }}>
          Where our data comes from
        </div>
        <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '52px', lineHeight: 0.95, color: '#fff', margin: '0 0 14px', letterSpacing: '-0.01em' }}>Our Methodology</h1>
        <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '19px', lineHeight: 1.55, color: '#eafaf0', maxWidth: '720px', margin: 0 }}>
          How Nigeria 2.0 collects, weights and publishes the numbers behind our election analysis — and why you can
          trust them.
        </p>
      </div>

      <div style={{ background: '#f4f7f2' }}>
        <div style={{ maxWidth: '820px', margin: '0 auto', padding: '52px 40px 40px' }}>
          {SECTIONS.map((sec) => (
            <div key={sec.title} style={{ marginBottom: '34px' }}>
              <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '24px', color: '#0f2a1c', margin: '0 0 10px' }}>{sec.title}</div>
              <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 500, fontSize: '18px', lineHeight: 1.7, color: '#33413a', margin: 0 }}>{sec.body}</p>
            </div>
          ))}

          <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '24px', color: '#0f2a1c', margin: '8px 0 16px' }}>Our data sources</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '12px' }}>
            {SOURCES.map((s) => (
              <div key={s.name} style={{ background: '#fff', border: '1px solid #e2e8dd', borderLeft: '5px solid #0f8a4a', borderRadius: '4px', padding: '16px 20px' }}>
                <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '16px', color: '#0f2a1c' }}>{s.name}</div>
                <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '15px', lineHeight: 1.5, color: '#5c6b60', marginTop: '3px' }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ maxWidth: '820px', margin: '0 auto', padding: '0 40px 72px' }}>
          <div style={{ background: '#0a6337', borderRadius: '6px', padding: '28px 30px' }}>
            <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '18px', color: '#ffe14d', marginBottom: '8px' }}>A note on transparency</div>
            <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '16px', lineHeight: 1.6, color: '#eafaf0', margin: 0 }}>
              The figures shown across this site are illustrative projections, not official results. We publish our
              sample sizes, field dates and margins of error alongside every release, and we correct the record openly
              whenever new data changes the picture.
            </p>
          </div>
        </div>
      </div>

      <HomeFooter />
    </div>
  )
}

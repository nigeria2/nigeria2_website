import { createFileRoute, Link } from '@tanstack/react-router'
import { HomeNav } from '../components/HomeNav'
import { HomeFooter } from '../components/HomeFooter'
import { RESULT_YEARS, isFutureElection } from '../electionYears'

export const Route = createFileRoute('/elections/results')({
  head: () => ({ meta: [{ title: 'Election Results Data | Nigeria 2.0' }] }),
  component: ResultsOverview,
})

const ELECTIONS: Record<string, { blurb: string }> = {
  '2019': { blurb: 'Presidential and governorship results, local government by local government, from the 2019 general election.' },
  '2023': { blurb: 'The 2023 general election — presidential, governorship, senate and House results down to the ward and polling-unit sheets.' },
  '2027': { blurb: 'The next general election. Results will be published here, LGA by LGA, once votes are declared.' },
}

function ResultsOverview() {
  // newest first
  const years = [...RESULT_YEARS].sort((a, b) => Number(b) - Number(a))
  return (
    <div style={{ minHeight: '100vh', background: '#0d8244', fontFamily: "'Archivo', sans-serif" }}>
      <HomeNav />

      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '52px 40px 10px' }}>
        <div style={{ display: 'inline-block', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '13px', letterSpacing: '0.16em', color: '#0f2a1c', textTransform: 'uppercase', background: '#ffe14d', padding: '7px 14px', borderRadius: '3px', marginBottom: '18px' }}>
          Data
        </div>
        <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '46px', lineHeight: 0.98, color: '#fff', margin: '0 0 14px', letterSpacing: '-0.01em' }}>Election Results Data</h1>
        <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '18px', lineHeight: 1.55, color: '#eafaf0', maxWidth: '720px', margin: 0 }}>
          Verified Nigerian election results, published openly and broken down all the way to the local
          government, ward and polling unit. Choose an election to explore.
        </p>
      </div>

      <div style={{ background: '#f4f7f2', marginTop: '34px' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '40px 40px 70px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '18px' }}>
            {years.map((y) => {
              const future = isFutureElection(y)
              const meta = ELECTIONS[y] ?? { blurb: '' }
              return (
                <Link
                  key={y}
                  to="/elections/$year/results"
                  params={{ year: y }}
                  style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '14px', padding: '26px', textDecoration: 'none', display: 'flex', flexDirection: 'column' }}
                >
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '12px' }}>
                    <span style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '34px', color: '#0f2a1c', letterSpacing: '-0.01em' }}>{y}</span>
                    <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '11px', letterSpacing: '0.06em', textTransform: 'uppercase', color: future ? '#b06a00' : '#0f6a38', background: future ? '#fff2d6' : '#d8f0df', padding: '3px 10px', borderRadius: '20px' }}>
                      {future ? 'Not held yet' : 'General election'}
                    </span>
                  </div>
                  <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 500, fontSize: '15px', lineHeight: 1.55, color: '#5c6b60', margin: '0 0 20px', flex: 1 }}>{meta.blurb}</p>
                  <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '14px', letterSpacing: '0.02em', color: future ? '#8aa093' : '#0f8a4a' }}>
                    {future ? 'Preview the page →' : 'View results by state →'}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      <HomeFooter />
    </div>
  )
}

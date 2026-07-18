import { createFileRoute, Link } from '@tanstack/react-router'
import { HomeNav } from '../components/HomeNav'
import { HomeFooter } from '../components/HomeFooter'
import { API_BASE } from '../config'
import { stateSlug } from '../stateSlug'
import { RESULT_YEARS, isFutureElection } from '../electionYears'

type StateRow = {
  geo_id: string; state: string
  has_presidential: boolean; has_governor: boolean; has_senate: boolean; has_house: boolean
  presidential_lga_count: number; governor_lga_count: number; senate_count: number; house_count: number
}
type LoaderData = { year: string; states: StateRow[] }

export const Route = createFileRoute('/elections/$year/results/')({
  loader: async ({ params }): Promise<LoaderData> => {
    try {
      const d = await fetch(`${API_BASE}/api/results/${params.year}`).then((r) => r.json())
      return { year: params.year, states: d.states ?? [] }
    } catch {
      return { year: params.year, states: [] }
    }
  },
  head: ({ params }) => ({ meta: [{ title: `${params.year} Election results by state | Nigeria 2.0` }] }),
  component: ResultsIndex,
})

function YearTabs({ year }: { year: string }) {
  return (
    <div style={{ display: 'flex', gap: '8px', margin: '0 0 4px' }}>
      {RESULT_YEARS.map((y) => (
        <Link
          key={y}
          to="/elections/$year/results"
          params={{ year: y }}
          style={{
            fontFamily: "'Archivo Black', sans-serif", fontSize: '14px', textDecoration: 'none',
            padding: '7px 16px', borderRadius: '20px',
            background: y === year ? '#ffe14d' : 'rgba(255,255,255,0.14)',
            color: y === year ? '#0f2a1c' : '#eafaf0',
          }}
        >
          {y}
        </Link>
      ))}
    </div>
  )
}

function Badge({ label, on }: { label: string; on: boolean }) {
  return (
    <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '11px', color: on ? '#0f4a2c' : '#b6c3b8', background: on ? '#d8f0df' : '#f0f3ef', padding: '3px 10px', borderRadius: '20px' }}>{label}</span>
  )
}

function ResultsIndex() {
  const { year, states } = Route.useLoaderData()
  const future = isFutureElection(year)
  return (
    <div style={{ minHeight: '100vh', background: '#0d8244', fontFamily: "'Archivo', sans-serif" }}>
      <HomeNav />
      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '26px 40px 0' }}>
        <YearTabs year={year} />
        <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '38px', color: '#fff', margin: '12px 0 8px', letterSpacing: '-0.01em' }}>{year} Election results</h1>
        <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '16px', lineHeight: 1.5, color: '#c7e7d4', margin: '0 0 24px', maxWidth: '62ch' }}>
          {future
            ? `The ${year} general election has not been held yet. Results will appear here local government by local government once votes are declared.`
            : 'The verified results, local government by local government. Open a state to see the presidential and governorship breakdowns.'}
        </p>
      </div>
      <div style={{ background: '#f4f7f2' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '30px 40px 64px' }}>
          {states.length === 0 ? (
            <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
              <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '17px', color: '#0f2a1c', marginBottom: '4px' }}>
                {future ? `${year} election not held yet` : 'No results yet'}
              </div>
              <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '14px', color: '#8aa093' }}>
                {future ? 'Check back after the election.' : 'Results have not been captured for this year.'}
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
              {states.map((s) => (
                <Link key={s.geo_id} to="/elections/$year/results/$state" params={{ year, state: stateSlug(s.state) }} style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '12px', padding: '18px 20px', textDecoration: 'none', display: 'block' }}>
                  <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '20px', color: '#0f2a1c', marginBottom: '10px' }}>{s.state}</div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <Badge label={s.has_presidential ? (s.presidential_lga_count ? `Presidential · ${s.presidential_lga_count} LGAs` : 'Presidential') : 'Presidential —'} on={s.has_presidential} />
                    <Badge label={s.has_governor ? `Governor · ${s.governor_lga_count} LGAs` : 'Governor —'} on={s.has_governor} />
                    {(s.has_senate || s.has_house) && <Badge label={s.has_senate ? `Senate · ${s.senate_count}` : 'Senate —'} on={s.has_senate} />}
                    {(s.has_senate || s.has_house) && <Badge label={s.has_house ? `House · ${s.house_count}` : 'House —'} on={s.has_house} />}
                  </div>
                  <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '12px', color: '#0f8a4a', marginTop: '12px' }}>View results →</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      <HomeFooter />
    </div>
  )
}

import { createFileRoute, Link } from '@tanstack/react-router'
import { HomeNav } from '../components/HomeNav'
import { HomeFooter } from '../components/HomeFooter'
import { API_BASE } from '../config'
import { stateSlug } from '../stateSlug'

type StateRow = {
  geo_id: string; state: string
  has_presidential: boolean; has_governor: boolean
  presidential_lga_count: number; governor_lga_count: number
}
type LoaderData = { states: StateRow[] }

export const Route = createFileRoute('/elections/2023/results/')({
  loader: async (): Promise<LoaderData> => {
    try {
      const d = await fetch(`${API_BASE}/api/results/2023`).then((r) => r.json())
      return { states: d.states ?? [] }
    } catch {
      return { states: [] }
    }
  },
  head: () => ({ meta: [{ title: '2023 Election results by state | Nigeria 2.0' }] }),
  component: ResultsIndex,
})

function Badge({ label, on }: { label: string; on: boolean }) {
  return (
    <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '11px', color: on ? '#0f4a2c' : '#b6c3b8', background: on ? '#d8f0df' : '#f0f3ef', padding: '3px 10px', borderRadius: '20px' }}>{label}</span>
  )
}

function ResultsIndex() {
  const { states } = Route.useLoaderData()
  return (
    <div style={{ minHeight: '100vh', background: '#0d8244', fontFamily: "'Archivo', sans-serif" }}>
      <HomeNav />
      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '26px 40px 0' }}>
        <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '38px', color: '#fff', margin: '12px 0 8px', letterSpacing: '-0.01em' }}>2023 Election results</h1>
        <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '16px', lineHeight: 1.5, color: '#c7e7d4', margin: '0 0 24px', maxWidth: '62ch' }}>
          The verified 2023 results, local government by local government. Open a state to see the presidential and governorship breakdowns.
        </p>
      </div>
      <div style={{ background: '#f4f7f2' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '30px 40px 64px' }}>
          {states.length === 0 ? (
            <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
              <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '17px', color: '#0f2a1c', marginBottom: '4px' }}>No results yet</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
              {states.map((s) => (
                <Link key={s.geo_id} to="/elections/2023/results/$state" params={{ state: stateSlug(s.state) }} style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '12px', padding: '18px 20px', textDecoration: 'none', display: 'block' }}>
                  <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '20px', color: '#0f2a1c', marginBottom: '10px' }}>{s.state}</div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <Badge label={s.has_presidential ? `Presidential · ${s.presidential_lga_count} LGAs` : 'Presidential —'} on={s.has_presidential} />
                    <Badge label={s.has_governor ? `Governor · ${s.governor_lga_count} LGAs` : 'Governor —'} on={s.has_governor} />
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

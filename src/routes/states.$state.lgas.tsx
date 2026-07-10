import { useMemo, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { HomeNav } from '../components/HomeNav'
import { HomeFooter } from '../components/HomeFooter'
import { API_BASE } from '../config'
import { STATE_BY_SLUG, stateSlug, geoIdFromSlug, stateGeoId } from '../stateSlug'
import { lgaSlug } from '../lgaSlug'

const COLORS: Record<string, string> = { APC: '#1f6fd6', PDP: '#c0392b', LP: '#e05a1f', NNPP: '#f0b429', APGA: '#7b3fb5', SDP: '#0f8a4a', NDC: '#0e7490', ADC: '#db2777' }
const colorOf = (p: string) => COLORS[p] ?? '#cdd8cf'

type Lga = { id: number; name: string; leading_party: string; total_votes: number; scores: Record<string, number>; ward_count: number; pu_count: number; registered_voters: number | null }
type LoaderData = { state: string; lgas: Lga[] }

export const Route = createFileRoute('/states/$state/lgas')({
  loader: async ({ params }): Promise<LoaderData> => {
    const state = STATE_BY_SLUG[params.state] ?? decodeURIComponent(params.state)
    const geoId = geoIdFromSlug(params.state) ?? stateGeoId(state) ?? ''
    let lgas: Lga[] = []
    try {
      const d = await fetch(`${API_BASE}/api/states/${encodeURIComponent(geoId)}/lgas`).then((r) => r.json())
      lgas = d.lgas ?? []
    } catch {
      /* leave empty */
    }
    return { state, lgas }
  },
  head: ({ params }) => {
    const s = STATE_BY_SLUG[params.state] ?? decodeURIComponent(params.state)
    return { meta: [{ title: `Local governments of ${s} | Nigeria 2.0` }, { name: 'description', content: `Every local government area in ${s} State, Nigeria — 2023 results, wards and polling units.` }] }
  },
  component: LgasPage,
})

function LgasPage() {
  const { state, lgas } = Route.useLoaderData()
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    const rows = term ? lgas.filter((l) => l.name.toLowerCase().includes(term)) : lgas
    return [...rows].sort((a, b) => b.total_votes - a.total_votes)
  }, [lgas, q])

  const totalPu = lgas.reduce((s, l) => s + l.pu_count, 0)
  const totalWards = lgas.reduce((s, l) => s + l.ward_count, 0)

  return (
    <div style={{ minHeight: '100vh', background: '#f4f7f2', fontFamily: "'Archivo', sans-serif" }}>
      <HomeNav />

      <div style={{ background: '#0d8244' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '30px 40px 26px' }}>
          <Link to="/states/$state" params={{ state: stateSlug(state) }} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '13px', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#9fd9b8', textDecoration: 'none', marginBottom: '12px' }}>
            ← {state} State
          </Link>
          <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '34px', color: '#fff', margin: '0 0 6px' }}>Local governments of {state}</h1>
          <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '15px', color: '#c7e7d4', margin: 0 }}>
            {lgas.length} local governments · {totalWards.toLocaleString()} wards · {totalPu.toLocaleString()} polling units. Open one for its full breakdown.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '24px 40px 72px' }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search local government…" style={{ width: '100%', maxWidth: '420px', border: '2px solid #cdd8cf', borderRadius: '6px', background: '#fff', padding: '12px 15px', fontFamily: "'Archivo', sans-serif", fontSize: '15px', color: '#0f2a1c', marginBottom: '22px' }} />

        {filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', fontFamily: "'Archivo', sans-serif", fontWeight: 700, color: '#8aa093' }}>No local governments match your search.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
            {filtered.map((l) => (
              <Link key={l.id} to="/lga/$id" params={{ id: lgaSlug(l.id, l.name) }} style={{ background: '#fff', border: '1px solid #dbe4dc', borderLeft: `4px solid ${l.leading_party ? colorOf(l.leading_party) : '#dbe4dc'}`, borderRadius: '10px', padding: '15px 17px', textDecoration: 'none', display: 'block' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '10px' }}>
                  <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '16px', color: '#0f2a1c' }}>{l.name}</div>
                  {l.leading_party && <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '10px', color: '#fff', background: colorOf(l.leading_party), padding: '2px 9px', borderRadius: '20px' }}>{l.leading_party}</span>}
                </div>
                <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '12px', color: '#8aa093', marginTop: '8px', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                  <span>{l.ward_count} wards</span>
                  <span>{l.pu_count.toLocaleString()} PUs</span>
                  {l.total_votes > 0 && <span style={{ color: '#0f8a4a', fontWeight: 800 }}>{l.total_votes.toLocaleString()} votes ’23</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <HomeFooter />
    </div>
  )
}

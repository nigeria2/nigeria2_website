import { useEffect, useMemo, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { HomeNav } from '../components/HomeNav'
import { HomeFooter } from '../components/HomeFooter'
import { API_BASE } from '../config'
import { STATE_BY_SLUG } from '../stateSlug'

export const Route = createFileRoute('/wards/$state')({
  component: WardsPage,
  head: ({ params }) => {
    const s = STATE_BY_SLUG[params.state] ?? params.state
    return { meta: [{ title: `Wards of ${s} State | Nigeria 2.0` }, { name: 'description', content: `Every electoral ward and polling unit in ${s} State, Nigeria.` }] }
  },
})

type W = { lga: string; ward: string; ward_code: string; pu_count: number; registered_voters: number | null; winner: string; runner_up: string }

const COLORS: Record<string, string> = { APC: '#1f6fd6', LP: '#e05a1f', PDP: '#c0392b', NNPP: '#f0b429' }
const colorOf = (p: string) => COLORS[p] ?? '#cdd8cf'

function WardsPage() {
  const { state: slug } = Route.useParams()
  const state = STATE_BY_SLUG[slug] ?? slug
  const [wards, setWards] = useState<W[] | null>(null)
  const [q, setQ] = useState('')

  useEffect(() => {
    setWards(null)
    fetch(`${API_BASE}/api/states/${encodeURIComponent(state)}/pu-wards`)
      .then((r) => r.json())
      .then((d: W[]) => setWards(d))
      .catch(() => setWards([]))
  }, [state])

  const byLga = useMemo(() => {
    if (!wards) return null
    const term = q.trim().toLowerCase()
    const filtered = term ? wards.filter((w) => w.ward.toLowerCase().includes(term) || w.lga.toLowerCase().includes(term)) : wards
    const groups: Record<string, W[]> = {}
    filtered.forEach((w) => (groups[w.lga] ??= []).push(w))
    return groups
  }, [wards, q])

  const totalPu = wards?.reduce((s, w) => s + w.pu_count, 0) ?? 0

  return (
    <div style={{ minHeight: '100vh', background: '#f4f7f2', fontFamily: "'Archivo', sans-serif" }}>
      <HomeNav />

      <div style={{ background: '#0d8244' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '30px 40px 26px' }}>
          <Link to="/states/$state" params={{ state: slug }} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '13px', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#9fd9b8', textDecoration: 'none', marginBottom: '12px' }}>
            ← {state} State
          </Link>
          <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '34px', color: '#fff', margin: '0 0 6px' }}>Wards of {state}</h1>
          <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '15px', color: '#c7e7d4', margin: 0 }}>
            {wards ? `${wards.length.toLocaleString()} wards · ${totalPu.toLocaleString()} polling units` : 'Loading…'}. Open a ward to see its polling units.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '24px 40px 72px' }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search ward or LGA…" style={{ width: '100%', maxWidth: '420px', border: '2px solid #cdd8cf', borderRadius: '6px', background: '#fff', padding: '12px 15px', fontFamily: "'Archivo', sans-serif", fontSize: '15px', color: '#0f2a1c', marginBottom: '22px' }} />

        {!byLga ? (
          <div style={{ padding: '60px', textAlign: 'center', fontFamily: "'Archivo Black', sans-serif", color: '#8aa093' }}>Loading…</div>
        ) : Object.keys(byLga).length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', fontFamily: "'Archivo', sans-serif", fontWeight: 700, color: '#8aa093' }}>No wards match your search.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {Object.keys(byLga).sort().map((lga) => (
              <div key={lga}>
                <h2 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '18px', color: '#0f2a1c', margin: '0 0 10px' }}>{lga}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '10px' }}>
                  {byLga[lga].map((w) => (
                    <Link key={w.ward_code} to="/ward" search={{ ward: w.ward_code.replace(/\//g, '-') }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', background: '#fff', border: '1px solid #dbe4dc', borderLeft: `4px solid ${w.winner ? colorOf(w.winner) : '#dbe4dc'}`, borderRadius: '9px', padding: '13px 16px', textDecoration: 'none' }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '14px', color: '#0f2a1c', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.ward}</div>
                        <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '12px', color: '#8aa093', display: 'flex', alignItems: 'center', gap: '7px', flexWrap: 'wrap' }}>
                          {w.winner && <span style={{ fontWeight: 800, fontSize: '10px', color: '#fff', background: colorOf(w.winner), padding: '1px 7px', borderRadius: '20px' }}>{w.winner}</span>}
                          {w.registered_voters ? `${w.registered_voters.toLocaleString()} reg.` : (w.winner ? '' : '2023 —')}
                        </div>
                      </div>
                      <span style={{ flex: 'none', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '12px', color: '#0f8a4a', background: '#e7f3ec', padding: '4px 10px', borderRadius: '20px' }}>{w.pu_count} PUs</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <HomeFooter />
    </div>
  )
}

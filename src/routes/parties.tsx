import { useEffect, useMemo, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { HomeNav } from '../components/HomeNav'
import { HomeFooter } from '../components/HomeFooter'
import { API_BASE } from '../config'

export const Route = createFileRoute('/parties')({ component: PartiesPage })

const COLORS: Record<string, string> = {
  APC: '#1f6fd6', PDP: '#c0392b', LP: '#e05a1f', NNPP: '#f0b429', APGA: '#7b3fb5',
  SDP: '#0f8a4a', NDC: '#0e7490', ADC: '#db2777', ANPP: '#0b8457', AD: '#8e44ad',
  ACN: '#16a085', CPC: '#2c3e50', AC: '#27ae60', APP: '#d35400', PPA: '#c0392b',
}
const colorOf = (acr: string) => COLORS[acr] ?? '#5c6b60'

type Registered = { acronym: string; name: string; active: boolean }
type Achieve = {
  acronym: string; name: string; gov_wins: number; pres_state_wins: number
  pres_national_wins: number; first_year: number | null; last_year: number | null
}
type Row = Achieve & { registered: boolean; active: boolean }

function PartiesPage() {
  const [rows, setRows] = useState<Row[] | null>(null)
  const [q, setQ] = useState('')

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/parties`).then((r) => (r.ok ? r.json() : [])).catch(() => []),
      fetch(`${API_BASE}/api/parties/history`).then((r) => (r.ok ? r.json() : [])).catch(() => []),
    ]).then(([reg, hist]: [Registered[], Achieve[]]) => {
      const byAcr = new Map<string, Row>()
      hist.forEach((h) => byAcr.set(h.acronym, { ...h, registered: false, active: false }))
      reg.forEach((p) => {
        const cur = byAcr.get(p.acronym)
        if (cur) byAcr.set(p.acronym, { ...cur, name: p.name || cur.name, registered: true, active: p.active })
        else byAcr.set(p.acronym, { acronym: p.acronym, name: p.name, gov_wins: 0, pres_state_wins: 0, pres_national_wins: 0, first_year: null, last_year: null, registered: true, active: p.active })
      })
      const arr = [...byAcr.values()].filter((r) => r.acronym !== 'OTHERS')
      arr.sort((a, b) => (b.pres_national_wins * 1000 + b.gov_wins * 10 + b.pres_state_wins) - (a.pres_national_wins * 1000 + a.gov_wins * 10 + a.pres_state_wins) || a.acronym.localeCompare(b.acronym))
      setRows(arr)
    })
  }, [])

  const shown = useMemo(() => {
    if (!rows) return null
    const term = q.trim().toLowerCase()
    if (!term) return rows
    return rows.filter((p) => p.name.toLowerCase().includes(term) || p.acronym.toLowerCase().includes(term))
  }, [rows, q])

  const activeParties = useMemo(() => shown?.filter((p) => p.active) ?? null, [shown])
  const inactiveParties = useMemo(() => shown?.filter((p) => !p.active) ?? null, [shown])

  const years = (p: Row) => (p.first_year ? (p.first_year === p.last_year ? `${p.first_year}` : `${p.first_year}–${p.last_year}`) : null)

  return (
    <div style={{ minHeight: '100vh', background: '#f4f7f2', fontFamily: "'Archivo', sans-serif" }}>
      <HomeNav />

      <div style={{ background: '#0d8244' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '38px 40px 34px' }}>
          <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9fd9b8', marginBottom: '10px' }}>
            Political parties
          </div>
          <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '40px', color: '#fff', margin: '0 0 8px', letterSpacing: '-0.01em' }}>Nigeria's Political Parties</h1>
          <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '16px', lineHeight: 1.5, color: '#c7e7d4', margin: '0 0 20px', maxWidth: '62ch' }}>
            Every party that has won a governorship or carried a state for president since 1999 — tap one for its full record.
          </p>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or acronym…"
            style={{ width: '100%', maxWidth: '420px', border: 'none', borderRadius: '6px', background: '#fff', padding: '13px 16px', fontFamily: "'Archivo', sans-serif", fontSize: '15px', color: '#0f2a1c' }}
          />
        </div>
      </div>

      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '34px 40px 72px' }}>
        {!shown ? (
          <div style={{ padding: '60px', textAlign: 'center', fontFamily: "'Archivo Black', sans-serif", fontSize: '18px', color: '#8aa093' }}>Loading parties…</div>
        ) : shown.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', fontFamily: "'Archivo', sans-serif", fontWeight: 700, color: '#8aa093' }}>No parties match “{q}”.</div>
        ) : (
          <>
            <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '13px', color: '#8aa093', marginBottom: '18px' }}>
              {shown.length} {shown.length === 1 ? 'party' : 'parties'}
            </div>
            <PartySection title="Active Parties" subtitle="Fielded at least one candidate in the 2019 general elections." parties={activeParties} years={years} />
            <PartySection title="Inactive Parties" subtitle="Registered, but no 2019 candidates on record — deregistered, merged, or dormant." parties={inactiveParties} years={years} style={{ marginTop: '40px' }} />
          </>
        )}
      </div>

      <HomeFooter />
    </div>
  )
}

function PartySection({ title, subtitle, parties, years, style }: {
  title: string; subtitle: string; parties: Row[] | null; years: (p: Row) => string | null; style?: React.CSSProperties
}) {
  if (!parties || parties.length === 0) return null
  return (
    <div style={style}>
      <h2 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '20px', color: '#0f2a1c', margin: '0 0 4px' }}>{title} <span style={{ color: '#8aa093' }}>({parties.length})</span></h2>
      <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '13px', color: '#8aa093', margin: '0 0 16px' }}>{subtitle}</p>
      <div className="two-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {parties.map((p) => (
          <Link key={p.acronym} to="/party/$acronym" params={{ acronym: p.acronym }} style={{ display: 'block', background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', padding: '18px 20px', textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span style={{ flex: 'none', minWidth: '48px', height: '48px', padding: '0 10px', borderRadius: '10px', background: colorOf(p.acronym), color: '#fff', fontFamily: "'Archivo Black', sans-serif", fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{p.acronym}</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '16px', color: '#0f2a1c', lineHeight: 1.15 }}>{p.name}</div>
                {years(p) && <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '12px', color: '#8aa093' }}>Active {years(p)}</div>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap' }}>
              <Stat n={p.pres_national_wins} label={p.pres_national_wins === 1 ? 'Presidency' : 'Presidencies'} />
              <Stat n={p.gov_wins} label={p.gov_wins === 1 ? 'Governorship' : 'Governorships'} />
              <Stat n={p.pres_state_wins} label="States carried" muted />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

function Stat({ n, label, muted }: { n: number; label: string; muted?: boolean }) {
  return (
    <div>
      <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '20px', color: n > 0 ? (muted ? '#5c6b60' : '#0f8a4a') : '#c3ccc6' }}>{n}</div>
      <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '10px', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#8aa093' }}>{label}</div>
    </div>
  )
}

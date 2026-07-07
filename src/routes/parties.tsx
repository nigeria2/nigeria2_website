import { useEffect, useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { HomeNav } from '../components/HomeNav'
import { HomeFooter } from '../components/HomeFooter'
import { API_BASE } from '../config'

export const Route = createFileRoute('/parties')({ component: PartiesPage })

const COLORS: Record<string, string> = {
  APC: '#1f6fd6', PDP: '#c0392b', LP: '#e05a1f', NNPP: '#f0b429', APGA: '#7b3fb5',
  SDP: '#0f8a4a', NDC: '#0e7490', ADC: '#db2777',
}
const colorOf = (acr: string) => COLORS[acr] ?? '#5c6b60'

type Party = {
  acronym: string
  name: string
  chairman: string
  secretary: string
  treasurer: string
  financial_secretary: string
  legal_adviser: string
  address: string
}

const OFFICIALS: { key: keyof Party; label: string }[] = [
  { key: 'chairman', label: 'National Chairman' },
  { key: 'secretary', label: 'National Secretary' },
  { key: 'treasurer', label: 'National Treasurer' },
  { key: 'financial_secretary', label: 'Financial Secretary' },
  { key: 'legal_adviser', label: 'Legal Adviser' },
  { key: 'address', label: 'Address' },
]

function PartiesPage() {
  const [parties, setParties] = useState<Party[] | null>(null)
  const [q, setQ] = useState('')

  useEffect(() => {
    fetch(`${API_BASE}/api/parties`)
      .then((r) => r.json())
      .then((d: Party[]) => setParties(d))
      .catch(() => setParties([]))
  }, [])

  const shown = useMemo(() => {
    if (!parties) return null
    const term = q.trim().toLowerCase()
    if (!term) return parties
    return parties.filter((p) => p.name.toLowerCase().includes(term) || p.acronym.toLowerCase().includes(term))
  }, [parties, q])

  return (
    <div style={{ minHeight: '100vh', background: '#f4f7f2', fontFamily: "'Archivo', sans-serif" }}>
      <HomeNav />

      <div style={{ background: '#0d8244' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '38px 40px 34px' }}>
          <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9fd9b8', marginBottom: '10px' }}>
            Registered political parties
          </div>
          <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '40px', color: '#fff', margin: '0 0 8px', letterSpacing: '-0.01em' }}>Nigeria's Political Parties</h1>
          <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '16px', lineHeight: 1.5, color: '#c7e7d4', margin: '0 0 20px', maxWidth: '62ch' }}>
            The parties registered to contest Nigerian elections, with their national leadership as filed.
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
            <div className="two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {shown.map((p) => {
                const rows = OFFICIALS.filter((o) => (p[o.key] as string)?.trim())
                return (
                  <div key={p.acronym} style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', padding: '22px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: rows.length ? '16px' : '0' }}>
                      <span style={{ flex: 'none', minWidth: '52px', height: '52px', padding: '0 10px', borderRadius: '10px', background: colorOf(p.acronym), color: '#fff', fontFamily: "'Archivo Black', sans-serif", fontSize: '17px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {p.acronym}
                      </span>
                      <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '18px', color: '#0f2a1c', lineHeight: 1.15 }}>{p.name}</div>
                    </div>
                    {rows.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                        {rows.map((o) => (
                          <div key={o.key} style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '10px', alignItems: 'baseline' }}>
                            <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '11px', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#8aa093' }}>{o.label}</span>
                            <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '14px', color: '#0f2a1c' }}>{p[o.key] as string}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      <HomeFooter />
    </div>
  )
}

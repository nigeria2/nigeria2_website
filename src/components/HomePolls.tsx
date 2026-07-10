import { useEffect, useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { API_BASE } from '../config'

const COLORS: Record<string, string> = { APC: '#1f6fd6', PDP: '#c0392b', LP: '#e05a1f', NNPP: '#f0b429', APGA: '#7b3fb5', SDP: '#0f8a4a', NDC: '#0e7490', ADC: '#db2777' }
const ELECTION_ORDER: Record<string, string[]> = {
  presidential: ['APC', 'PDP', 'NDC', 'NNPP', 'ADC', 'LP'],
  governor: ['APC', 'PDP', 'LP', 'NNPP', 'APGA', 'SDP'],
  senate: ['APC', 'PDP', 'LP', 'NNPP', 'APGA', 'SDP'],
}
const TYPE_LABEL: Record<string, string> = { presidential: 'Presidential', governor: 'Governor', senate: 'Senate' }

type Row = { state: string; party: string; score: number }

export function HomePolls() {
  const [etype, setEtype] = useState('presidential')
  const [week, setWeek] = useState('')
  const [selectedState, setSelectedState] = useState('')
  const [rows, setRows] = useState<Row[] | null>(null)
  const [states, setStates] = useState<string[]>([])
  const [metaLoaded, setMetaLoaded] = useState(false)
  const noForecast = metaLoaded && !week

  useEffect(() => {
    fetch(`${API_BASE}/api/predictions/meta`)
      .then((r) => r.json())
      .then((m) => {
        if (m.weeks?.length) setWeek(m.weeks[0])
      })
      .catch(() => {})
      .finally(() => setMetaLoaded(true))
  }, [])

  useEffect(() => {
    if (!week) return
    setRows(null)
    fetch(`${API_BASE}/api/predictions?election_type=${encodeURIComponent(etype)}&week=${encodeURIComponent(week)}`)
      .then((r) => r.json())
      .then((d: Row[]) => {
        setRows(d)
        setStates([...new Set(d.map((x) => x.state))].sort())
      })
      .catch(() => setRows([]))
  }, [etype, week])

  const bars = useMemo(() => {
    if (!rows) return null
    const order = ELECTION_ORDER[etype] ?? ELECTION_ORDER.governor
    if (selectedState) {
      const m: Record<string, number> = {}
      rows.filter((r) => r.state === selectedState).forEach((r) => (m[r.party] = r.score))
      return order.map((p) => ({ party: p, value: Math.round(m[p] ?? 0) }))
    }
    const sum: Record<string, number> = {}
    const set = new Set(rows.map((r) => r.state))
    rows.forEach((r) => (sum[r.party] = (sum[r.party] || 0) + r.score))
    const n = set.size || 1
    return order.map((p) => ({ party: p, value: Math.round((sum[p] || 0) / n) }))
  }, [rows, selectedState, etype])

  const max = bars ? Math.max(1, ...bars.map((b) => b.value)) : 1

  const tabStyle = (active: boolean): React.CSSProperties => ({
    fontFamily: "'Archivo Black', sans-serif", fontSize: '16px', letterSpacing: '0.02em', padding: '11px 22px',
    borderRadius: '3px', cursor: 'pointer', border: '2px solid #0f8a4a',
    background: active ? '#0f8a4a' : '#fff', color: active ? '#fff' : '#0f8a4a',
  })

  return (
    <div style={{ background: '#f4f7f2', padding: '56px 40px 64px' }}>
      <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '20px', marginBottom: '22px' }}>
          <h2 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '34px', lineHeight: 1.02, color: '#0f2a1c', margin: 0, maxWidth: '640px' }}>
            2027 Election Analysis &amp; Prediction
          </h2>
          <div style={{ textAlign: 'right', lineHeight: 1 }}>
            <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '26px', color: '#0f8a4a' }}>Nigeria</div>
            <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '15px', letterSpacing: '0.24em', color: '#8aa093' }}>BAROMETER</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {['presidential', 'governor', 'senate'].map((t) => (
            <button
              key={t}
              onClick={() => { setEtype(t); setSelectedState('') }}
              style={tabStyle(etype === t)}
            >
              {TYPE_LABEL[t]}
            </button>
          ))}
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            style={{ marginLeft: '8px', fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '15px', color: '#0f2a1c', background: '#fff', border: '2px solid #cdd8cf', borderRadius: '3px', padding: '11px 14px', cursor: 'pointer' }}
          >
            <option value="">— National average —</option>
            {states.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8dd', borderRadius: '6px', padding: '26px 22px 22px', boxShadow: '0 10px 30px rgba(15,42,28,0.06)' }}>
          {noForecast ? (
            <div style={{ height: '312px', display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 24px' }}>
              <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '18px', color: '#0f2a1c' }}>No 2027 forecast published yet</div>
              <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '14px', color: '#8aa093', maxWidth: '44ch' }}>Projections will appear here once contributor analyses are aggregated.</div>
            </div>
          ) : !bars ? (
            <div style={{ height: '312px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Archivo Black', sans-serif", fontSize: '16px', color: '#8aa093' }}>Loading…</div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '12px', alignItems: 'end', height: '280px' }}>
                {bars.map((b) => (
                  <div key={b.party} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                    <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '22px', color: '#0f2a1c', marginBottom: '8px' }}>{b.value}%</div>
                    <div className="chart-bar" style={{ width: '100%', borderRadius: '4px 4px 0 0', background: COLORS[b.party], height: `${Math.round((b.value / max) * 240)}px` }} />
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '12px', marginTop: '2px' }}>
                {bars.map((b) => (
                  <div key={b.party} style={{ textAlign: 'center', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '14px', color: '#0f2a1c', padding: '9px 0', borderTop: `3px solid ${COLORS[b.party]}` }}>
                    {b.party}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '12px', color: '#8aa093', marginTop: '12px' }}>
          {selectedState ? `${TYPE_LABEL[etype]} projection for ${selectedState}` : `National ${TYPE_LABEL[etype].toLowerCase()} projection`} · aggregated from contributor traces
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', marginTop: '16px' }}>
          <Link
            to="/2027"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '14px', letterSpacing: '0.02em', color: '#0f8a4a', background: '#fff', textDecoration: 'none', padding: '12px 18px', borderRadius: '3px', border: '2px solid #0f8a4a' }}
          >
            🗺 View Details →
          </Link>
        </div>
      </div>
    </div>
  )
}

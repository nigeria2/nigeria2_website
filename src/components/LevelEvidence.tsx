/** Shows the evidence behind a geo level's score (ward / LGA / state) in one table —
 *  its roll-up from the level below plus any independent-source figures. Each row is one
 *  piece of evidence (a guess); the level's shown score is a merge of them. */

type PartyRow = { party?: string; votes?: number | null }
export type LevelEvidenceItem = {
  id: number | null
  election_type: string
  year?: string
  kind: string
  source: string
  method?: string
  total_votes?: number | null
  poll_summary?: { registered_voters?: number | null; accredited_voters?: number | null; valid_votes?: number | null }
  party_results?: PartyRow[]
}

const COLORS: Record<string, string> = { APC: '#1f6fd6', LP: '#e05a1f', PDP: '#c0392b', NNPP: '#f0b429' }
const PARTIES = ['APC', 'LP', 'PDP', 'NNPP'] as const
const KIND_LABEL: Record<string, string> = { rollup: 'Roll-up (from below)', declared: 'Declared', inec_declared: 'INEC declared', collation: 'Collation', '2023_transcription': '2023 transcription' }
const KIND_COLOR: Record<string, string> = { rollup: '#0f8a4a', declared: '#b45309', inec_declared: '#1f6fd6', collation: '#7a4bd0', '2023_transcription': '#0e7490' }
const RACE_LABEL: Record<string, string> = { presidential: 'Presidential', governor: 'Governorship', senate: 'Senate', house: 'House of Reps' }

const th: React.CSSProperties = { textAlign: 'left', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '11px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#5c6b60', padding: '10px 12px', whiteSpace: 'nowrap' }
const td: React.CSSProperties = { fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '13px', color: '#0f2a1c', padding: '9px 12px', whiteSpace: 'nowrap' }

export function LevelEvidence({ items, blurb }: { items: LevelEvidenceItem[]; blurb: string }) {
  if (!items || items.length === 0) return null
  const partyMap = (t: LevelEvidenceItem): Record<string, number | null | undefined> => {
    const m: Record<string, number | null | undefined> = {}
    for (const p of t.party_results ?? []) { const k = (p.party ?? '').trim(); if (k) m[k] = p.votes }
    return m
  }
  return (
    <div style={{ marginTop: '26px' }}>
      <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '18px', color: '#0f2a1c', marginBottom: '4px' }}>Evidence ({items.length})</div>
      <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '13px', color: '#8aa093', margin: '0 0 12px' }}>{blurb}</p>
      <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '720px' }}>
          <thead>
            <tr style={{ background: '#f4f7f2' }}>
              <th style={th}>Source</th>
              <th style={th}>Election</th>
              {PARTIES.map((p) => (<th key={p} style={{ ...th, textAlign: 'right', color: COLORS[p] }}>{p}</th>))}
              <th style={{ ...th, textAlign: 'right' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((t, i) => {
              const m = partyMap(t)
              const kindColor = KIND_COLOR[t.kind] ?? '#7a4bd0'
              return (
                <tr key={t.id ?? i} style={{ borderTop: '1px solid #eef2ee' }}>
                  <td style={td}>
                    <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '11px', color: '#fff', background: kindColor, padding: '3px 9px', borderRadius: '20px' }}>{KIND_LABEL[t.kind] ?? t.kind}</span>
                    {t.source && t.source !== t.kind && <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '11px', color: '#8aa093', marginLeft: '8px' }}>{t.source}</span>}
                  </td>
                  <td style={td}>{t.year ? `${t.year} ` : ''}{RACE_LABEL[t.election_type] ?? t.election_type}</td>
                  {PARTIES.map((p) => (
                    <td key={p} style={{ ...td, textAlign: 'right', fontFamily: "'Archivo Black', sans-serif", color: m[p] != null ? '#0f2a1c' : '#c3ccc6' }}>{m[p] != null ? (m[p] as number).toLocaleString() : '—'}</td>
                  ))}
                  <td style={{ ...td, textAlign: 'right', fontFamily: "'Archivo Black', sans-serif" }}>{t.total_votes != null ? t.total_votes.toLocaleString() : '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

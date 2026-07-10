import { useEffect, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Protected } from '../components/Protected'
import { apiFetch, useAuth } from '../auth'
import { HomeNav } from '../components/HomeNav'
import { stateGeoId } from '../stateSlug'

export const Route = createFileRoute('/predictions')({
  component: () => (
    <Protected>
      <PredictionsBoard />
    </Protected>
  ),
})

const COLORS: Record<string, string> = { APC: '#1f6fd6', PDP: '#c0392b', LP: '#e05a1f', NNPP: '#f0b429', APGA: '#7b3fb5', SDP: '#0f8a4a', NDC: '#0e7490', ADC: '#db2777' }
const colorOf = (p: string) => COLORS[p] ?? '#8aa093'
const TYPE_LABEL: Record<string, string> = { presidential: 'Presidential', governor: 'Governor', senate: 'Senate' }
const ELECTION_PARTIES: Record<string, string[]> = {
  presidential: ['APC', 'PDP', 'NDC', 'NNPP', 'ADC', 'LP'],
  governor: ['APC', 'PDP', 'LP', 'NNPP', 'APGA', 'SDP'],
  senate: ['APC', 'PDP', 'LP', 'NNPP', 'APGA', 'SDP'],
}
const zeroScores = (et: string): Record<string, number> =>
  Object.fromEntries((ELECTION_PARTIES[et] ?? ELECTION_PARTIES.governor).map((p) => [p, 0]))

type Pred = {
  id: number; state: string; election_type: string; source: string; label: string; author_name: string
  leading_party: string; scores: Record<string, number>; notes: string; year: string
  is_mine: boolean; can_edit: boolean; created_at: string | null
}
type StateRow = { state: string; count: number }

const lbl: React.CSSProperties = { display: 'block', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '12px', letterSpacing: '0.05em', color: '#0f2a1c', textTransform: 'uppercase', marginBottom: '6px' }
const inputStyle: React.CSSProperties = { width: '100%', border: '2px solid #d7e0d9', borderRadius: '4px', background: '#f9fbf8', padding: '11px 13px', fontFamily: "'Archivo', sans-serif", fontSize: '15px', color: '#0f2a1c' }

function ScoreBars({ scores }: { scores: Record<string, number> }) {
  const entries = Object.entries(scores).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1])
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '10px' }}>
      {entries.map(([p, v]) => (
        <div key={p} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '10px', color: '#fff', background: colorOf(p), padding: '2px 0', borderRadius: '4px', width: '46px', textAlign: 'center', flex: 'none' }}>{p}</span>
          <div style={{ flex: 1, height: '6px', borderRadius: '4px', background: '#eef2ee', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(100, Math.round(v))}%`, background: colorOf(p) }} />
          </div>
          <span style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '11px', color: '#5c6b60', width: '34px', textAlign: 'right', flex: 'none' }}>{Math.round(v)}%</span>
        </div>
      ))}
    </div>
  )
}

function PredictionsBoard() {
  const { user, token } = useAuth()
  const [states, setStates] = useState<StateRow[] | null>(null)
  const [selected, setSelected] = useState('')
  const [preds, setPreds] = useState<Pred[] | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Pred | null>(null)
  const [form, setForm] = useState({ election_type: 'presidential', notes: '', label: '', source: 'expert' })
  const [scores, setScores] = useState<Record<string, number>>(zeroScores('presidential'))
  const [busy, setBusy] = useState(false)

  const loadStates = () => apiFetch('/api/board/states', token).then((r) => (r.ok ? r.json() : [])).then(setStates).catch(() => setStates([]))
  useEffect(() => {
    if (token) loadStates()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const openState = (st: string) => {
    setSelected(st)
    setPreds(null)
    setShowForm(false)
    setEditing(null)
    apiFetch(`/api/board/states/${encodeURIComponent(stateGeoId(st) ?? st)}`, token).then((r) => r.json()).then(setPreds).catch(() => setPreds([]))
  }

  const setEt = (et: string) => {
    setForm((f) => ({ ...f, election_type: et }))
    setScores((s) => ({ ...zeroScores(et), ...Object.fromEntries(Object.entries(s).filter(([k]) => (ELECTION_PARTIES[et] ?? []).includes(k))) }))
  }

  const openAdd = () => {
    setEditing(null)
    setForm({ election_type: 'presidential', notes: '', label: '', source: 'expert' })
    setScores(zeroScores('presidential'))
    setShowForm(true)
  }
  const openEdit = (p: Pred) => {
    setEditing(p)
    setForm({ election_type: p.election_type, notes: p.notes, label: p.label, source: p.source })
    setScores({ ...zeroScores(p.election_type), ...p.scores })
    setShowForm(true)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (Object.values(scores).every((v) => v === 0)) return
    setBusy(true)
    try {
      if (editing) {
        const res = await apiFetch(`/api/board/predictions/${editing.id}`, token, {
          method: 'PUT',
          body: JSON.stringify({ election_type: form.election_type, scores, notes: form.notes, label: form.label }),
        })
        if (!res.ok) return
      } else {
        const body: Record<string, unknown> = { state: selected, election_type: form.election_type, scores, notes: form.notes, label: form.label }
        if (user?.is_admin && form.source === 'past_performance') body.source = 'past_performance'
        const res = await apiFetch('/api/board/predictions', token, { method: 'POST', body: JSON.stringify(body) })
        if (!res.ok) return
      }
      setShowForm(false)
      setEditing(null)
      openState(selected)
      loadStates()
    } finally {
      setBusy(false)
    }
  }

  const remove = async (p: Pred) => {
    if (!window.confirm('Delete this prediction?')) return
    const res = await apiFetch(`/api/board/predictions/${p.id}`, token, { method: 'DELETE' })
    if (res.ok) {
      openState(selected)
      loadStates()
    }
  }

  const sliderParties = ELECTION_PARTIES[form.election_type] ?? ELECTION_PARTIES.governor

  return (
    <div style={{ minHeight: '100vh', background: '#f4f7f2', fontFamily: "'Archivo', sans-serif" }}>
      <HomeNav />

      <div style={{ background: '#0d8244' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '30px 40px 26px' }}>
          <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9fd9b8', marginBottom: '8px' }}>
            Shared board · visible to all members
          </div>
          <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '34px', color: '#fff', margin: '0 0 6px' }}>Predictions</h1>
          <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '15px', color: '#c7e7d4', margin: 0, maxWidth: '64ch' }}>
            Browse predictions state by state. Experts can add their own calls; admins can edit any. Everyone else views.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '26px 40px 72px' }}>
        {!selected ? (
          // ---- state list ----
          !states ? (
            <div style={{ padding: '60px', textAlign: 'center', fontFamily: "'Archivo Black', sans-serif", color: '#8aa093' }}>Loading…</div>
          ) : (
            <div className="two-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
              {states.map((s) => (
                <button
                  key={s.state}
                  onClick={() => openState(s.state)}
                  style={{ textAlign: 'left', cursor: 'pointer', background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}
                >
                  <span style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '15px', color: '#0f2a1c' }}>{s.state}</span>
                  <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '12px', color: s.count ? '#0f8a4a' : '#b3c2b8', background: s.count ? '#e7f3ec' : '#f2f5f1', padding: '4px 10px', borderRadius: '20px', flex: 'none' }}>
                    {s.count} {s.count === 1 ? 'prediction' : 'predictions'}
                  </span>
                </button>
              ))}
            </div>
          )
        ) : (
          // ---- state detail ----
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '18px' }}>
              <div>
                <button onClick={() => { setSelected(''); setShowForm(false) }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '13px', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#0f8a4a', padding: 0, marginBottom: '6px' }}>← All states</button>
                <h2 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '28px', color: '#0f2a1c', margin: 0 }}>{selected}</h2>
              </div>
              {!showForm && (
                <button onClick={openAdd} style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '14px', color: '#fff', background: '#0f8a4a', border: 'none', borderRadius: '6px', padding: '12px 22px', cursor: 'pointer' }}>+ Add prediction</button>
              )}
            </div>

            {showForm && (
              <form onSubmit={submit} style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', padding: '22px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '17px', color: '#0f2a1c' }}>{editing ? 'Edit prediction' : `Add a prediction for ${selected}`}</div>
                <div>
                  <label style={lbl}>Race</label>
                  <div style={{ display: 'flex', gap: '2px', borderBottom: '2px solid #e4ebe5' }}>
                    {['presidential', 'governor', 'senate'].map((t) => {
                      const active = form.election_type === t
                      return (
                        <button key={t} type="button" onClick={() => setEt(t)} style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '14px', padding: '10px 18px', background: 'transparent', border: 'none', cursor: 'pointer', marginBottom: '-2px', color: active ? '#0f8a4a' : '#5c6b60', borderBottom: active ? '3px solid #0f8a4a' : '3px solid transparent' }}>{TYPE_LABEL[t]}</button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label style={lbl}>Party projections</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
                    {sliderParties.map((p) => (
                      <div key={p} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ width: '52px', fontFamily: "'Archivo Black', sans-serif", fontSize: '13px', color: '#fff', background: colorOf(p), padding: '4px 0', borderRadius: '4px', textAlign: 'center', flex: 'none' }}>{p}</span>
                        <input type="range" min="0" max="100" value={scores[p] ?? 0} onInput={(e) => setScores((s) => ({ ...s, [p]: Number((e.target as HTMLInputElement).value) }))} style={{ flex: 1, accentColor: colorOf(p) }} />
                        <span style={{ width: '44px', textAlign: 'right', fontFamily: "'Archivo Black', sans-serif", fontSize: '14px', color: '#0f2a1c', flex: 'none' }}>{scores[p] ?? 0}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {user?.is_admin && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={lbl}>Source</label>
                      <select value={form.source} onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))} style={inputStyle} disabled={!!editing}>
                        <option value="expert">Expert</option>
                        <option value="past_performance">Past performance</option>
                      </select>
                    </div>
                    <div>
                      <label style={lbl}>Label <span style={{ color: '#8aa093', fontWeight: 600 }}>(optional)</span></label>
                      <input value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} placeholder="e.g. 2023 result" style={inputStyle} />
                    </div>
                  </div>
                )}

                <div>
                  <label style={lbl}>Notes &amp; reasoning</label>
                  <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={3} placeholder="What's driving this call?" style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }} />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" disabled={busy} style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '15px', color: '#fff', background: '#0f8a4a', border: 'none', borderRadius: '6px', padding: '12px 24px', cursor: 'pointer' }}>{editing ? 'Save changes' : 'Add prediction'}</button>
                  <button type="button" onClick={() => { setShowForm(false); setEditing(null) }} style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '15px', color: '#5c6b60', background: '#fff', border: '2px solid #cdd8cf', borderRadius: '6px', padding: '12px 24px', cursor: 'pointer' }}>Cancel</button>
                </div>
              </form>
            )}

            {!preds ? (
              <div style={{ padding: '40px', textAlign: 'center', fontFamily: "'Archivo', sans-serif", fontWeight: 700, color: '#8aa093' }}>Loading…</div>
            ) : preds.length === 0 ? (
              <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', padding: '44px', textAlign: 'center', fontFamily: "'Archivo', sans-serif", fontWeight: 700, color: '#8aa093' }}>No predictions yet for {selected}. Be the first to add one.</div>
            ) : (
              <div className="two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {preds.map((p) => {
                  const isModel = p.source === 'model'
                  return (
                    <div key={p.id} style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', padding: '20px 22px' }}>
                      <Link to="/prediction/$id" params={{ id: String(p.id) }} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                          <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '11px', color: '#fff', background: isModel ? '#1f6fd6' : '#0f8a4a', padding: '3px 9px', borderRadius: '20px' }}>
                            {isModel ? 'Model' : 'Expert'}
                          </span>
                          <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '11px', color: '#5c6b60', background: '#f2f5f1', padding: '3px 9px', borderRadius: '20px' }}>{TYPE_LABEL[p.election_type] ?? p.election_type}</span>
                          {p.is_mine && <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '11px', color: '#0f4a2c', background: '#ffe14d', padding: '3px 9px', borderRadius: '20px' }}>Yours</span>}
                        </div>
                        <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '15px', color: '#0f2a1c', marginTop: '6px' }}>
                          {p.label || p.author_name}
                        </div>
                        <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '12px', color: '#8aa093' }}>
                          {p.label ? p.author_name : `by ${p.author_name}`} · leads {p.leading_party}
                        </div>
                        <ScoreBars scores={p.scores} />
                        {p.notes && <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '13px', color: '#5c6b60', lineHeight: 1.5, margin: '12px 0 0' }}>{p.notes}</p>}
                        <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '12px', color: '#0f8a4a', marginTop: '12px' }}>View details →</div>
                      </Link>
                      {p.can_edit && (
                        <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                          <button onClick={() => openEdit(p)} style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '12px', color: '#0f8a4a', background: '#fff', border: '2px solid #0f8a4a', borderRadius: '5px', padding: '6px 14px', cursor: 'pointer' }}>Edit</button>
                          <button onClick={() => remove(p)} style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '12px', color: '#c0392b', background: '#fff', border: '2px solid #e3c4c0', borderRadius: '5px', padding: '6px 14px', cursor: 'pointer' }}>Delete</button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: '30px' }}>
          <Link to="/dashboard" style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '13px', color: '#0f8a4a', textDecoration: 'none' }}>← Back to dashboard</Link>
        </div>
      </div>
    </div>
  )
}

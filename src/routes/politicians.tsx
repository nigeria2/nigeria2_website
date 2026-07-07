import { useEffect, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Protected } from '../components/Protected'
import { apiFetch, useAuth } from '../auth'
import { HomeNav } from '../components/HomeNav'

export const Route = createFileRoute('/politicians')({
  component: () => (
    <Protected>
      <PoliticiansPage />
    </Protected>
  ),
})

const COLORS: Record<string, string> = { APC: '#1f6fd6', PDP: '#c0392b', LP: '#e05a1f', NNPP: '#f0b429', APGA: '#7b3fb5', SDP: '#0f8a4a', NDC: '#0e7490', ADC: '#db2777' }
const colorOf = (p: string) => COLORS[p] ?? '#5c6b60'

type TopLga = { lga: string; count: number }
type Pol = { id: number; name: string; state: string; title: string; party: string; note: string; photo: string; avg_electoral_value: number | null; assessments: number; top_lgas: TopLga[] }
type Assessment = { author_name: string; electoral_value: number; influential_lgas: string[]; reason: string; created_at: string | null }
type PolDetail = Pol & { assessment_list: Assessment[] }

const lbl: React.CSSProperties = { display: 'block', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '12px', letterSpacing: '0.05em', color: '#0f2a1c', textTransform: 'uppercase', marginBottom: '6px' }
const inputStyle: React.CSSProperties = { width: '100%', border: '2px solid #d7e0d9', borderRadius: '4px', background: '#f9fbf8', padding: '11px 13px', fontFamily: "'Archivo', sans-serif", fontSize: '15px', color: '#0f2a1c' }

function initials(name: string) {
  return name.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase()
}

function resizeImage(file: File, max = 420): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height))
        const w = Math.round(img.width * scale)
        const h = Math.round(img.height * scale)
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('no canvas'))
        ctx.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', 0.82))
      }
      img.onerror = reject
      img.src = reader.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function Avatar({ p, size = 56 }: { p: { name: string; party: string; photo: string }; size?: number }) {
  return p.photo ? (
    <img src={p.photo} alt={p.name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flex: 'none', border: '2px solid #eef2ee' }} />
  ) : (
    <div style={{ width: size, height: size, borderRadius: '50%', flex: 'none', background: colorOf(p.party), color: '#fff', fontFamily: "'Archivo Black', sans-serif", fontSize: size * 0.32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{initials(p.name)}</div>
  )
}

function PoliticiansPage() {
  const { token } = useAuth()
  const [pols, setPols] = useState<Pol[] | null>(null)
  const [selId, setSelId] = useState<number | null>(null)
  const [detail, setDetail] = useState<PolDetail | null>(null)
  const [lgaOptions, setLgaOptions] = useState<string[]>([])
  const [photoPreview, setPhotoPreview] = useState('')
  const [photoMsg, setPhotoMsg] = useState('')
  const [ev, setEv] = useState(50)
  const [lgas, setLgas] = useState<string[]>([])
  const [lgaInput, setLgaInput] = useState('')
  const [reason, setReason] = useState('')
  const [assessMsg, setAssessMsg] = useState('')
  const [busy, setBusy] = useState(false)

  const load = () => apiFetch('/api/politicians', token).then((r) => (r.ok ? r.json() : [])).then(setPols).catch(() => setPols([]))
  useEffect(() => {
    if (token) load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const open = (p: Pol) => {
    setSelId(p.id)
    setDetail(null)
    setPhotoPreview('')
    setPhotoMsg('')
    setEv(50)
    setLgas([])
    setLgaInput('')
    setReason('')
    setAssessMsg('')
    apiFetch(`/api/politicians/${p.id}`, token).then((r) => r.json()).then(setDetail).catch(() => {})
    apiFetch(`/api/states/${encodeURIComponent(p.state)}`, token).then((r) => r.json()).then((d) => setLgaOptions(((d.lgas || []) as { lga: string }[]).map((x) => x.lga).sort())).catch(() => setLgaOptions([]))
  }

  const onPickPhoto = async (file: File | undefined) => {
    if (!file) return
    setPhotoMsg('')
    try {
      setPhotoPreview(await resizeImage(file))
    } catch {
      setPhotoMsg('Could not read that image.')
    }
  }
  const submitPhoto = async () => {
    if (!photoPreview || selId == null) return
    setBusy(true)
    try {
      const res = await apiFetch(`/api/politicians/${selId}/photo`, token, { method: 'POST', body: JSON.stringify({ image: photoPreview }) })
      if (res.ok) {
        setPhotoMsg('✓ Submitted — an admin will review it before it goes live.')
        setPhotoPreview('')
      } else {
        setPhotoMsg('Could not submit that photo.')
      }
    } finally {
      setBusy(false)
    }
  }

  const addLga = (v: string) => {
    const t = v.trim()
    if (t && !lgas.includes(t)) setLgas([...lgas, t])
    setLgaInput('')
  }
  const submitAssessment = async () => {
    if (selId == null) return
    setBusy(true)
    try {
      const res = await apiFetch(`/api/politicians/${selId}/assessment`, token, { method: 'POST', body: JSON.stringify({ electoral_value: ev, influential_lgas: lgas, reason }) })
      if (res.ok) {
        setAssessMsg('✓ Thanks — your assessment was recorded.')
        setLgas([])
        setReason('')
        const p = pols?.find((x) => x.id === selId)
        if (p) apiFetch(`/api/politicians/${p.id}`, token).then((r) => r.json()).then(setDetail).catch(() => {})
        load()
      }
    } finally {
      setBusy(false)
    }
  }

  const selected = pols?.find((p) => p.id === selId) || null
  const byState: Record<string, Pol[]> = {}
  ;(pols || []).forEach((p) => (byState[p.state] ??= []).push(p))

  return (
    <div style={{ minHeight: '100vh', background: '#f4f7f2', fontFamily: "'Archivo', sans-serif" }}>
      <HomeNav />

      <div style={{ background: '#0d8244' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '30px 40px 26px' }}>
          <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9fd9b8', marginBottom: '8px' }}>Contributors welcome</div>
          <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '34px', color: '#fff', margin: '0 0 6px' }}>Politicians</h1>
          <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '15px', color: '#c7e7d4', margin: 0, maxWidth: '66ch' }}>
            Key political figures by state. Submit a photo, estimate their electoral value, and tell us the LGAs where they carry real weight.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '26px 40px 72px' }}>
        {!pols ? (
          <div style={{ padding: '60px', textAlign: 'center', fontFamily: "'Archivo Black', sans-serif", color: '#8aa093' }}>Loading…</div>
        ) : selected ? (
          // ---- detail ----
          <div>
            <button onClick={() => { setSelId(null); setDetail(null) }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '13px', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#0f8a4a', padding: 0, marginBottom: '16px' }}>← All politicians</button>

            <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '12px', padding: '24px', display: 'flex', gap: '18px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '18px' }}>
              <Avatar p={selected} size={84} />
              <div style={{ flex: 1, minWidth: '220px' }}>
                <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '24px', color: '#0f2a1c' }}>{selected.name}</div>
                <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '14px', color: '#5c6b60' }}>{[selected.title, selected.party, selected.state].filter(Boolean).join(' · ')}</div>
              </div>
              <div style={{ textAlign: 'center', flex: 'none' }}>
                <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '30px', color: '#0f8a4a' }}>{selected.avg_electoral_value ?? '—'}</div>
                <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '11px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#8aa093' }}>Electoral value{selected.assessments ? ` · ${selected.assessments} rating${selected.assessments === 1 ? '' : 's'}` : ''}</div>
              </div>
            </div>

            <div className="two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', alignItems: 'start' }}>
              {/* submit photo */}
              <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', padding: '22px' }}>
                <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '17px', color: '#0f2a1c', marginBottom: '4px' }}>Submit a photo</div>
                <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '13px', color: '#5c6b60', margin: '0 0 14px' }}>An admin approves it before it becomes the official photo.</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  {photoPreview ? <img src={photoPreview} alt="preview" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '2px solid #eef2ee' }} /> : <Avatar p={selected} size={72} />}
                  <label style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '13px', color: '#0f8a4a', background: '#fff', border: '2px solid #0f8a4a', borderRadius: '6px', padding: '9px 16px', cursor: 'pointer' }}>
                    Choose image
                    <input type="file" accept="image/*" onChange={(e) => onPickPhoto(e.target.files?.[0])} style={{ display: 'none' }} />
                  </label>
                </div>
                {photoPreview && (
                  <button onClick={submitPhoto} disabled={busy} style={{ marginTop: '14px', fontFamily: "'Archivo Black', sans-serif", fontSize: '14px', color: '#fff', background: '#0f8a4a', border: 'none', borderRadius: '6px', padding: '11px 20px', cursor: 'pointer' }}>Submit for approval</button>
                )}
                {photoMsg && <div style={{ marginTop: '12px', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '13px', color: '#0f8a4a' }}>{photoMsg}</div>}
              </div>

              {/* assessment */}
              <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', padding: '22px' }}>
                <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '17px', color: '#0f2a1c', marginBottom: '14px' }}>Add your assessment</div>
                <label style={lbl}>Electoral value <span style={{ color: '#8aa093', fontWeight: 600 }}>· how much weight they carry (0–100)</span></label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <input type="range" min={0} max={100} value={ev} onChange={(e) => setEv(Number(e.target.value))} style={{ flex: 1, accentColor: '#0f8a4a' }} />
                  <span style={{ width: '42px', textAlign: 'right', fontFamily: "'Archivo Black', sans-serif", fontSize: '16px', color: '#0f2a1c' }}>{ev}</span>
                </div>
                <label style={lbl}>Highly influential LGAs</label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input value={lgaInput} onChange={(e) => setLgaInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLga(lgaInput) } }} list="lga-opts" placeholder="Type an LGA + Enter" style={inputStyle} />
                  <datalist id="lga-opts">{lgaOptions.map((l) => <option key={l} value={l} />)}</datalist>
                  <button type="button" onClick={() => addLga(lgaInput)} style={{ flex: 'none', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '14px', color: '#0f8a4a', background: '#fff', border: '2px solid #0f8a4a', borderRadius: '6px', padding: '0 16px', cursor: 'pointer' }}>Add</button>
                </div>
                {lgas.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                    {lgas.map((l) => (
                      <span key={l} onClick={() => setLgas(lgas.filter((x) => x !== l))} style={{ cursor: 'pointer', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '12px', color: '#0f4a2c', background: '#e7f3ec', padding: '4px 10px', borderRadius: '20px' }}>{l} ✕</span>
                    ))}
                  </div>
                )}
                <label style={lbl}>Why are they influential there?</label>
                <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Godfather structure, grassroots base, control of the machinery…" style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }} />
                <button onClick={submitAssessment} disabled={busy} style={{ marginTop: '14px', fontFamily: "'Archivo Black', sans-serif", fontSize: '14px', color: '#fff', background: '#0f8a4a', border: 'none', borderRadius: '6px', padding: '11px 22px', cursor: 'pointer' }}>Submit assessment</button>
                {assessMsg && <div style={{ marginTop: '12px', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '13px', color: '#0f8a4a' }}>{assessMsg}</div>}
              </div>
            </div>

            {/* aggregates + assessments */}
            {detail && (detail.top_lgas.length > 0 || detail.assessment_list.length > 0) && (
              <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', padding: '22px', marginTop: '18px' }}>
                {detail.top_lgas.length > 0 && (
                  <>
                    <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '15px', color: '#0f2a1c', marginBottom: '10px' }}>Most-cited strongholds</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '18px' }}>
                      {detail.top_lgas.map((t) => (
                        <span key={t.lga} style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '12px', color: '#0f2a1c', background: '#f2f5f1', padding: '5px 11px', borderRadius: '20px' }}>{t.lga} · {t.count}</span>
                      ))}
                    </div>
                  </>
                )}
                {detail.assessment_list.length > 0 && (
                  <>
                    <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '15px', color: '#0f2a1c', marginBottom: '10px' }}>Contributor assessments</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {detail.assessment_list.map((a, i) => (
                        <div key={i} style={{ borderTop: i ? '1px solid #eef2ee' : 'none', paddingTop: i ? '10px' : 0 }}>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <span style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '13px', color: '#0f8a4a' }}>{a.electoral_value}</span>
                            <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '13px', color: '#0f2a1c' }}>{a.author_name}</span>
                            {a.influential_lgas.map((l) => <span key={l} style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '11px', color: '#5c6b60', background: '#f2f5f1', padding: '2px 8px', borderRadius: '20px' }}>{l}</span>)}
                          </div>
                          {a.reason && <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '13px', color: '#5c6b60', margin: '5px 0 0', lineHeight: 1.5 }}>{a.reason}</p>}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ) : pols.length === 0 ? (
          <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', padding: '48px', textAlign: 'center', fontFamily: "'Archivo', sans-serif", fontWeight: 700, color: '#8aa093' }}>No politicians added yet.</div>
        ) : (
          // ---- list grouped by state ----
          <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
            {Object.keys(byState).sort().map((state) => (
              <div key={state}>
                <h2 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '20px', color: '#0f2a1c', margin: '0 0 12px' }}>{state}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                  {byState[state].map((p) => (
                    <button key={p.id} onClick={() => open(p)} style={{ cursor: 'pointer', textAlign: 'left', background: '#fff', border: '1px solid #dbe4dc', borderRadius: '10px', padding: '16px', display: 'flex', gap: '14px', alignItems: 'center' }}>
                      <Avatar p={p} size={56} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '15px', color: '#0f2a1c', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                        <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '12px', color: '#5c6b60', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{[p.title, p.party].filter(Boolean).join(' · ')}</div>
                      </div>
                      <div style={{ textAlign: 'right', flex: 'none' }}>
                        <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '18px', color: '#0f8a4a' }}>{p.avg_electoral_value ?? '—'}</div>
                        <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '10px', color: '#8aa093' }}>value</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: '30px' }}>
          <Link to="/dashboard" style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '13px', color: '#0f8a4a', textDecoration: 'none' }}>← Back to dashboard</Link>
        </div>
      </div>
    </div>
  )
}

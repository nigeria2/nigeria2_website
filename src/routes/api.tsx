import { createFileRoute } from '@tanstack/react-router'
import { HomeNav } from '../components/HomeNav'
import { HomeFooter } from '../components/HomeFooter'
import { API_BASE } from '../config'

export const Route = createFileRoute('/api')({
  head: () => ({ meta: [{ title: 'Public API | Nigeria 2.0' }] }),
  component: ApiDocs,
})

const mono: React.CSSProperties = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }

function Method({ m }: { m: string }) {
  const bg = m === 'GET' ? '#0f8a4a' : '#1f6fd6'
  return (
    <span style={{ ...mono, fontWeight: 800, fontSize: '11px', letterSpacing: '0.06em', color: '#fff', background: bg, padding: '3px 9px', borderRadius: '4px' }}>{m}</span>
  )
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <pre style={{ ...mono, margin: '12px 0 0', background: '#0f2a1c', color: '#eafaf0', fontSize: '12.5px', lineHeight: 1.6, padding: '16px 18px', borderRadius: '10px', overflowX: 'auto' }}>
      {children}
    </pre>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return <div style={{ background: '#fff', border: '1px solid #dbe4dc', borderRadius: '12px', padding: '24px 26px', marginBottom: '20px' }}>{children}</div>
}

const h2: React.CSSProperties = { fontFamily: "'Archivo Black', sans-serif", fontSize: '20px', color: '#0f2a1c', margin: '0 0 6px' }
const label: React.CSSProperties = { fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8aa093', margin: '18px 0 6px' }
const p: React.CSSProperties = { fontFamily: "'Archivo', sans-serif", fontWeight: 500, fontSize: '15px', lineHeight: 1.6, color: '#33414f', margin: '4px 0' }
const th: React.CSSProperties = { textAlign: 'left', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '11px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#8aa093', padding: '8px 12px', borderBottom: '1px solid #eef2ee' }
const td: React.CSSProperties = { fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '13px', color: '#33414f', padding: '9px 12px', borderBottom: '1px solid #f2f6f2', verticalAlign: 'top' }

function ApiDocs() {
  const base = API_BASE
  return (
    <div style={{ minHeight: '100vh', background: '#0d8244', fontFamily: "'Archivo', sans-serif" }}>
      <HomeNav />

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '52px 40px 30px' }}>
        <div style={{ display: 'inline-block', fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '13px', letterSpacing: '0.16em', color: '#0f2a1c', textTransform: 'uppercase', background: '#ffe14d', padding: '7px 14px', borderRadius: '3px', marginBottom: '18px' }}>
          Developers
        </div>
        <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '48px', lineHeight: 0.98, color: '#fff', margin: '0 0 16px', letterSpacing: '-0.01em' }}>Public API</h1>
        <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '18px', lineHeight: 1.55, color: '#eafaf0', maxWidth: '720px', margin: 0 }}>
          Open, no-key endpoints for building on Nigeria 2.0's election data. We start with political
          parties; more resources will follow.
        </p>
      </div>

      <div style={{ background: '#f4f7f2' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '34px 40px 70px' }}>

          <Card>
            <div style={h2}>Getting started</div>
            <p style={p}>
              The API is free, needs no API key or authentication, and returns JSON. All responses set
              <span style={{ ...mono, background: '#eef2ee', padding: '1px 6px', borderRadius: '4px', fontSize: '13px' }}> Access-Control-Allow-Origin: *</span>,
              so you can call it directly from the browser. Please cache responses where you can — the data changes rarely.
            </p>
            <div style={label}>Base URL</div>
            <div style={{ ...mono, fontSize: '15px', fontWeight: 700, color: '#0f6a38' }}>{base}</div>
            <div style={label}>Versioning</div>
            <p style={p}>Public endpoints live under <span style={mono}>/api/v1/</span>. We will not make breaking changes to a version once published.</p>
          </Card>

          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <Method m="GET" />
              <span style={{ ...mono, fontSize: '16px', fontWeight: 700, color: '#0f2a1c' }}>/api/v1/parties</span>
            </div>
            <p style={{ ...p, marginTop: '12px' }}>List every political party we track, with national officers and 2019 activity status.</p>

            <div style={label}>Query parameters</div>
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr><th style={th}>Name</th><th style={th}>Type</th><th style={th}>Description</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ ...td, ...mono, fontWeight: 700 }}>active</td>
                  <td style={td}>boolean · optional</td>
                  <td style={td}>Filter to parties that were active in the 2019 general election (<span style={mono}>true</span>) or not (<span style={mono}>false</span>). Omit for all.</td>
                </tr>
              </tbody>
            </table>

            <div style={label}>Example request</div>
            <Code>{`curl "${base}/api/v1/parties?active=true"`}</Code>

            <div style={label}>Example response</div>
            <Code>{`{
  "count": 18,
  "parties": [
    {
      "acronym": "APC",
      "name": "All Progressives Congress",
      "chairman": "Abdullahi Umar Ganduje",
      "secretary": "Ajibola Basiru",
      "treasurer": "...",
      "financial_secretary": "...",
      "legal_adviser": "...",
      "address": "...",
      "active": true
    }
  ]
}`}</Code>
          </Card>

          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <Method m="GET" />
              <span style={{ ...mono, fontSize: '16px', fontWeight: 700, color: '#0f2a1c' }}>/api/v1/parties/&#123;acronym&#125;</span>
            </div>
            <p style={{ ...p, marginTop: '12px' }}>Fetch a single party by its acronym (case-insensitive). Returns <span style={mono}>404</span> if unknown.</p>

            <div style={label}>Path parameters</div>
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr><th style={th}>Name</th><th style={th}>Type</th><th style={th}>Description</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ ...td, ...mono, fontWeight: 700 }}>acronym</td>
                  <td style={td}>string · required</td>
                  <td style={td}>The party acronym, e.g. <span style={mono}>APC</span>, <span style={mono}>lp</span>, <span style={mono}>pdp</span>.</td>
                </tr>
              </tbody>
            </table>

            <div style={label}>Example request</div>
            <Code>{`curl "${base}/api/v1/parties/APC"`}</Code>

            <div style={label}>Example response</div>
            <Code>{`{
  "acronym": "APC",
  "name": "All Progressives Congress",
  "chairman": "Abdullahi Umar Ganduje",
  "secretary": "Ajibola Basiru",
  "treasurer": "...",
  "financial_secretary": "...",
  "legal_adviser": "...",
  "address": "...",
  "active": true
}`}</Code>
          </Card>

          <Card>
            <div style={h2}>Response fields</div>
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr><th style={th}>Field</th><th style={th}>Type</th><th style={th}>Description</th></tr>
              </thead>
              <tbody>
                {[
                  ['acronym', 'string', 'Short party code (unique), e.g. APC.'],
                  ['name', 'string', 'Full registered party name.'],
                  ['chairman', 'string', 'National chairman.'],
                  ['secretary', 'string', 'National secretary.'],
                  ['treasurer', 'string', 'National treasurer.'],
                  ['financial_secretary', 'string', 'National financial secretary.'],
                  ['legal_adviser', 'string', 'National legal adviser.'],
                  ['address', 'string', 'Registered national headquarters address.'],
                  ['active', 'boolean', 'Fielded at least one candidate in the 2019 general election.'],
                ].map(([f, t, d]) => (
                  <tr key={f}>
                    <td style={{ ...td, ...mono, fontWeight: 700 }}>{f}</td>
                    <td style={td}>{t}</td>
                    <td style={td}>{d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ ...p, marginTop: '14px', fontSize: '13px', color: '#8aa093' }}>
              Officer and address fields may be empty strings where we don't yet hold that detail.
            </p>
          </Card>

          <Card>
            <div style={h2}>Terms</div>
            <p style={p}>
              The data is provided as-is for civic, research and journalistic use. Attribution to
              Nigeria 2.0 is appreciated. Please don't hammer the endpoints — cache where practical.
            </p>
          </Card>

        </div>
      </div>

      <HomeFooter />
    </div>
  )
}

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

/** A category divider that doubles as the scroll anchor the sidebar links to. */
function SectionTitle({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} style={{ scrollMarginTop: '20px', fontFamily: "'Archivo Black', sans-serif", fontSize: '15px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#0f6a38', margin: '10px 0 14px' }}>
      {children}
    </h2>
  )
}

// The API categories, mirrored in the sidebar. Each links to a section anchor and
// lists the endpoints it contains so callers can see the whole surface at a glance.
const API_CATEGORIES: { id: string; title: string; endpoints: string[] }[] = [
  { id: 'getting-started', title: 'Getting started', endpoints: [] },
  { id: 'ai', title: 'Query with AI', endpoints: ['Prompt for an LLM'] },
  { id: 'parties', title: 'Political Parties', endpoints: ['GET /parties', 'GET /parties/{acronym}'] },
  { id: 'results', title: 'Election Results', endpoints: ['GET /states', 'GET /results/{year}', 'GET /results/{year}/{geo_id}'] },
  { id: 'sheets', title: 'Sheets & Transcriptions', endpoints: ['GET /polling-units/{code}/sheets', 'GET /polling-units/{code}/sheets/{office}'] },
  { id: 'outliers', title: 'Outliers', endpoints: ['GET /outliers/{year}'] },
  { id: 'reference', title: 'Reference', endpoints: ['Response fields', 'Terms of use'] },
]

// A succinct, copy-pasteable description of the whole API to hand to an LLM so it can
// query the data on the user's behalf. Kept plain so it survives a copy to any chat.
const AI_PROMPT = `You can query Nigeria 2.0's open election API (no key, returns JSON, CORS-open).
Base URL: https://api.nigeria2.com

Conventions:
- States are keyed by a canonical geo_id like nga_3 (Akwa Ibom). Get the full list from GET /api/v1/states. In browsable URLs a state is a slug (akwa-ibom), an LGA is "{lga_id}-{name}" (e.g. 162-abak), a ward is its INEC code with / written as - (03-01-01), a polling unit is its number (001). The full INEC pu_code uses slashes: 03/01/01/001.
- Election years are 2019 and 2023. Offices: presidential, governor, senate.
- Every figure is evidence (our best reading of INEC result sheets), not an official count.

Endpoints:
- GET /api/v1/parties[?active=true]  — political parties. GET /api/v1/parties/{acronym} for one.
- GET /api/v1/states  — every state with its geo_id.
- GET /api/v1/results/{year}  — all states with results that year + a national summary.
- GET /api/v1/results/{year}/{geo_id}  — one state's LGA-by-party results, senate/house, and evidence.
- GET /elections/{year}/{state}[/{lga}[/{ward}[/{pu}]]]  — browse results down to a polling unit (twins the website).
- GET /api/v1/polling-units/{pu_code}/sheets  — the INEC result sheet(s) for a unit, with our transcription model's status + comment.
- GET /api/v1/polling-units/{pu_code}/sheets/{office}  — the exact transcription JSON we produced for that sheet.
- GET /api/v1/outliers/{year}?state=&office=&rule=&limit=&offset=  — polling units that look anomalous (rules: over_voting = votes >= 2x registered; large_roll = registered > 10000; no_roll = no register but > 2000 votes). Each row includes the sheet link and every vote we recorded grouped by source. limit max 100; paginate with offset (response has has_more/next_offset).

To answer a question, choose the narrowest endpoint, fetch it, and read the JSON. Prefer geo_id over names. Cache where you can.`

/** Sticky left-hand index of the API categories people can use. */
function ApiSidebar({ base }: { base: string }) {
  void base
  return (
    <nav
      aria-label="API categories"
      className="api-sidebar"
      style={{ position: 'sticky', top: '20px', flex: '0 0 236px', width: '236px', alignSelf: 'flex-start' }}
    >
      <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8aa093', margin: '2px 0 12px 12px' }}>
        API Categories
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {API_CATEGORIES.map((c) => (
          <a
            key={c.id}
            href={`#${c.id}`}
            className="api-side-link"
            style={{ display: 'block', textDecoration: 'none', padding: '9px 12px', borderRadius: '8px', borderLeft: '2px solid transparent' }}
          >
            <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '14px', color: '#0f2a1c' }}>{c.title}</span>
            {c.endpoints.length > 0 && (
              <span style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '5px' }}>
                {c.endpoints.map((e) => (
                  <span key={e} style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: '11.5px', color: '#7d8f83', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e}</span>
                ))}
              </span>
            )}
          </a>
        ))}
      </div>
    </nav>
  )
}

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
          Open, no-key endpoints for building on Nigeria 2.0's election data — political parties and
          verified election results, per state, down to the LGA.
        </p>
      </div>

      <div style={{ background: '#f4f7f2' }}>
        <div className="api-layout" style={{ maxWidth: '1180px', margin: '0 auto', padding: '34px 40px 70px', display: 'flex', gap: '36px', alignItems: 'flex-start', flexWrap: 'wrap' }}>

          <ApiSidebar base={base} />

          <div style={{ flex: 1, minWidth: 0 }}>

          <section id="getting-started">
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
          </section>

          <SectionTitle id="ai">Query with AI</SectionTitle>
          <Card>
            <div style={h2}>Let an LLM query the data for you</div>
            <p style={p}>
              Paste the prompt below into ChatGPT, Claude, or any tool that can fetch URLs, then
              ask your question in plain English (e.g. “which Lagos LGAs did the LP win in 2023?”
              or “list the worst over-voting outliers in Kano”). It's a succinct description of
              this whole API, so the model knows exactly which endpoint to call.
            </p>
            <Code>{AI_PROMPT}</Code>
            <p style={{ ...p, fontSize: '13px', color: '#8aa093', marginTop: '10px' }}>
              The API is read-only and public, so this is safe to share. Every figure is our
              transcription of INEC sheets — evidence, not an official count.
            </p>
          </Card>

          <SectionTitle id="parties">Political Parties</SectionTitle>
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

          <SectionTitle id="results">Election Results</SectionTitle>
          <Card>
            <div style={h2}>How results are organised</div>
            <p style={p}>
              Results are organised by <strong>year</strong> then <strong>state</strong>. Every state
              is keyed by a canonical <span style={mono}>geo_id</span> (e.g. Akwa Ibom is
              <span style={{ ...mono, background: '#eef2ee', padding: '1px 6px', borderRadius: '4px', fontSize: '13px' }}> nga_3</span>) —
              always look a state up by its <span style={mono}>geo_id</span>, never by name, since
              spellings vary in the underlying data. Use <span style={mono}>/api/v1/states</span> to get
              the full list of ids.
            </p>
            <p style={{ ...p, fontSize: '13px', color: '#8aa093', marginTop: '10px' }}>
              Note: every figure we publish is <em>evidence</em> — our best reading of the sheets and
              official collation, not a definitive count. A state's score is a merge of the evidence
              behind it, which each result carries in its <span style={mono}>evidence</span> array.
            </p>
          </Card>

          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <Method m="GET" />
              <span style={{ ...mono, fontSize: '16px', fontWeight: 700, color: '#0f2a1c' }}>/api/v1/states</span>
            </div>
            <p style={{ ...p, marginTop: '12px' }}>List all 36 states + the FCT with the canonical <span style={mono}>geo_id</span> every results endpoint uses.</p>

            <div style={label}>Example request</div>
            <Code>{`curl "${base}/api/v1/states"`}</Code>

            <div style={label}>Example response</div>
            <Code>{`{
  "count": 37,
  "states": [
    { "geo_id": "nga_1", "name": "Abia" },
    { "geo_id": "nga_3", "name": "Akwa Ibom" },
    ...
  ]
}`}</Code>
          </Card>

          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <Method m="GET" />
              <span style={{ ...mono, fontSize: '16px', fontWeight: 700, color: '#0f2a1c' }}>/api/v1/results/&#123;year&#125;</span>
            </div>
            <p style={{ ...p, marginTop: '12px' }}>
              Every state we hold results for in a given election year, which races are available for
              each, per-office party totals and winner, plus a national summary. Then drill into one
              state with the endpoint below.
            </p>

            <div style={label}>Path parameters</div>
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr><th style={th}>Name</th><th style={th}>Type</th><th style={th}>Description</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ ...td, ...mono, fontWeight: 700 }}>year</td>
                  <td style={td}>string · required</td>
                  <td style={td}>Election year, e.g. <span style={mono}>2019</span> or <span style={mono}>2023</span>.</td>
                </tr>
              </tbody>
            </table>

            <div style={label}>Example request</div>
            <Code>{`curl "${base}/api/v1/results/2023"`}</Code>

            <div style={label}>Example response</div>
            <Code>{`{
  "year": "2023",
  "states": [
    {
      "geo_id": "nga_3",
      "state": "Akwa Ibom",
      "has_presidential": true,
      "has_governor": true,
      "has_senate": false,
      "has_house": false,
      "party_totals": {
        "presidential": {
          "parties": { "PDP": 214012, "LP": 132683, "APC": 160620 },
          "total": 507315, "winner": "PDP", "level": "lga"
        },
        "governor": { "parties": { "...": 0 }, "winner": "PDP", "level": "lga" }
      }
    }
  ],
  "summary": {
    "presidential": { "parties": { "APC": 8794726, "LP": 6101533 }, "winner": "APC", "states": 37 }
  }
}`}</Code>
          </Card>

          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <Method m="GET" />
              <span style={{ ...mono, fontSize: '16px', fontWeight: 700, color: '#0f2a1c' }}>/api/v1/results/&#123;year&#125;/&#123;geo_id&#125;</span>
            </div>
            <p style={{ ...p, marginTop: '12px' }}>
              One state's full results for a year: presidential and governor as an LGA-by-party table
              (or a state-level summary where we have no LGA breakdown, e.g. 2019 presidential), Senate
              and House of Reps as per-constituency candidate lists, and the <span style={mono}>evidence</span> behind
              the state's score. Returns <span style={mono}>404</span> for an unknown state.
            </p>

            <div style={label}>Path parameters</div>
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr><th style={th}>Name</th><th style={th}>Type</th><th style={th}>Description</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ ...td, ...mono, fontWeight: 700 }}>year</td>
                  <td style={td}>string · required</td>
                  <td style={td}>Election year, e.g. <span style={mono}>2023</span>.</td>
                </tr>
                <tr>
                  <td style={{ ...td, ...mono, fontWeight: 700 }}>geo_id</td>
                  <td style={td}>string · required</td>
                  <td style={td}>Canonical state id from <span style={mono}>/api/v1/states</span>, e.g. <span style={mono}>nga_3</span>.</td>
                </tr>
              </tbody>
            </table>

            <div style={label}>Example request</div>
            <Code>{`curl "${base}/api/v1/results/2023/nga_3"`}</Code>

            <div style={label}>Example response</div>
            <Code>{`{
  "year": "2023",
  "geo_id": "nga_3",
  "state": "Akwa Ibom",
  "presidential": {
    "parties": ["PDP", "APC", "LP"],
    "party_totals": { "PDP": 214012, "APC": 160620, "LP": 132683 },
    "winner": "PDP",
    "total_votes": 507315,
    "lga_count": 31,
    "lgas": [
      { "lga_id": 162, "lga": "Abak",
        "parties": { "PDP": 12345, "APC": 6789, "LP": 2100 }, "total": 21713 }
    ]
  },
  "presidential_state": null,
  "governor": { "parties": ["..."], "lgas": ["..."] },
  "senate": null,
  "house": null,
  "evidence": [
    { "election_type": "presidential", "year": "2023", "kind": "rollup",
      "source": "sum of LGAs", "total_votes": 507315,
      "party_results": [ { "party": "PDP", "votes": 214012 } ] }
  ]
}`}</Code>
          </Card>

          <Card>
            <div style={h2}>Browsable results (mirrors the website)</div>
            <p style={p}>
              Every results page on the website has a data twin here, using the same URL slugs —
              so a page you can browse has a JSON endpoint one step away. Walk down the levels:
              state → LGA → ward → polling unit. Each returns roughly what that page shows.
            </p>
            <table style={{ borderCollapse: 'collapse', width: '100%', marginTop: '8px' }}>
              <thead>
                <tr><th style={th}>Path</th><th style={th}>Returns</th></tr>
              </thead>
              <tbody>
                {[
                  ['/elections/{year}/{state}', 'A state’s results (pres + gov by LGA, senate/house, evidence)'],
                  ['/elections/{year}/{state}/{lga}', 'One LGA: wards, per-party votes, evidence'],
                  ['/elections/{year}/{state}/{lga}/{ward}', 'A ward’s polling units + ward-level result'],
                  ['/elections/{year}/{state}/{lga}/{ward}/{pu}', 'One polling unit: result, every piece of evidence, and the result sheets'],
                ].map(([pth, ret]) => (
                  <tr key={pth}>
                    <td style={{ ...td, ...mono, fontWeight: 700, whiteSpace: 'nowrap' }}>{pth}</td>
                    <td style={td}>{ret}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={label}>Slugs (same as the website)</div>
            <p style={{ ...p, fontSize: '13px' }}>
              <span style={mono}>state</span> = <span style={mono}>akwa-ibom</span> ·
              <span style={mono}> lga</span> = <span style={mono}>162-abak</span> (the leading number is the LGA id) ·
              <span style={mono}> ward</span> = <span style={mono}>03-01-01</span> (INEC ward code, <span style={mono}>/</span> written as <span style={mono}>-</span>) ·
              <span style={mono}> pu</span> = <span style={mono}>001</span> (unit number).
            </p>
            <div style={label}>Example request</div>
            <Code>{`curl "${base}/elections/2023/akwa-ibom/162-abak/03-01-01/001"`}</Code>
          </Card>

          <SectionTitle id="sheets">Sheets &amp; Transcriptions</SectionTitle>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <Method m="GET" />
              <span style={{ ...mono, fontSize: '16px', fontWeight: 700, color: '#0f2a1c' }}>/api/v1/polling-units/&#123;pu_code&#125;/sheets</span>
            </div>
            <p style={{ ...p, marginTop: '12px' }}>
              Every INEC result sheet we hold for a polling unit (one per office), each with its
              link, download status, and our transcription model's analysis of the scan — its
              confidence <span style={mono}>status</span> (valid / unsure / blurry), legibility, the
              check flags, and the model's own <span style={mono}>validity_notes</span> comment. Use the
              full INEC code, e.g. <span style={mono}>03/01/01/001</span>.
            </p>
            <div style={label}>Example request</div>
            <Code>{`curl "${base}/api/v1/polling-units/03/01/01/001/sheets"`}</Code>
          </Card>

          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <Method m="GET" />
              <span style={{ ...mono, fontSize: '16px', fontWeight: 700, color: '#0f2a1c' }}>/api/v1/polling-units/&#123;pu_code&#125;/sheets/&#123;office&#125;</span>
            </div>
            <p style={{ ...p, marginTop: '12px' }}>
              One sheet plus the <strong>exact transcription(s)</strong> we produced of it — the
              verbatim JSON the model returned: party votes, the poll summary, the validity block
              (with the model's comment), and its transcription notes. <span style={mono}>office</span> is
              presidential | governor | senate. This is the raw data behind everything else.
            </p>
            <div style={label}>Example request</div>
            <Code>{`curl "${base}/api/v1/polling-units/03/01/01/001/sheets/presidential"`}</Code>

            <div style={label}>Example response (abridged)</div>
            <Code>{`{
  "pu_code": "03/01/01/001", "election_type": "presidential", "year": "2023",
  "sheet_url": "https://irev.../result-sheet.pdf", "sheet_status": "saved",
  "analysis": {
    "status": "valid", "legibility": "readable", "model": "qwen/qwen3.5-9b",
    "sum_check_passed": true, "totals_consistent": true,
    "validity_notes": "", "discrepancies": null
  },
  "transcriptions": [
    {
      "source_image": "001.jpg",
      "poll_summary": { "1_registered_voters": "179", "7_total_valid_votes": "153" },
      "party_results": [ { "party": "APC", "votes_figures": "87" }, ... ],
      "validity": { "status": "valid", "validity_notes": "" },
      "transcription_notes": { "legibility": "readable", "discrepancies": "" }
    }
  ]
}`}</Code>
          </Card>

          <SectionTitle id="outliers">Outliers</SectionTitle>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <Method m="GET" />
              <span style={{ ...mono, fontSize: '16px', fontWeight: 700, color: '#0f2a1c' }}>/api/v1/outliers/&#123;year&#125;</span>
            </div>
            <p style={{ ...p, marginTop: '12px' }}>
              Polling-unit results that look anomalous — flagged against the canonical INEC
              register (not the transcribed one). Each row lists which rules it tripped. These
              are candidates for review, not proof of fraud. Also reachable at
              <span style={mono}> /elections/&#123;year&#125;/outliers</span>.
            </p>

            <div style={label}>Rules</div>
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr><th style={th}>Rule</th><th style={th}>Flagged when</th></tr>
              </thead>
              <tbody>
                {[
                  ['over_voting', 'Total votes ≥ 2× the registered voters'],
                  ['large_roll', 'Registered voters > 10000'],
                  ['no_roll', 'No registered voters on record, but > 2000 votes'],
                ].map(([r, d]) => (
                  <tr key={r}><td style={{ ...td, ...mono, fontWeight: 700 }}>{r}</td><td style={td}>{d}</td></tr>
                ))}
              </tbody>
            </table>

            <div style={label}>Query parameters</div>
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr><th style={th}>Name</th><th style={th}>Type</th><th style={th}>Description</th></tr>
              </thead>
              <tbody>
                {[
                  ['state', 'string · optional', 'State slug, e.g. akwa-ibom. Omit for all states.'],
                  ['office', 'string · optional', 'presidential | governor | senate.'],
                  ['rule', 'string · optional', 'Limit to one rule (over_voting | large_roll | no_roll).'],
                  ['limit', 'int · optional', 'Page size, default 200, max 1000.'],
                  ['offset', 'int · optional', 'Rows to skip (pagination).'],
                ].map(([n, t, d]) => (
                  <tr key={n}><td style={{ ...td, ...mono, fontWeight: 700 }}>{n}</td><td style={td}>{t}</td><td style={td}>{d}</td></tr>
                ))}
              </tbody>
            </table>

            <div style={label}>Example request</div>
            <Code>{`curl "${base}/api/v1/outliers/2023?office=presidential&rule=over_voting&limit=50"`}</Code>

            <div style={label}>Example response</div>
            <Code>{`{
  "year": "2023",
  "count": 50,
  "total": 4424,
  "limit": 50,
  "offset": 0,
  "rules": { "over_voting": "total votes >= 2x the canonical registered voters", "...": "..." },
  "outliers": [
    {
      "pu_code": "08/24/07/042", "pu_name": "...",
      "state": "Borno", "lga": "...", "ward": "...", "ward_code": "08/24/07",
      "election_type": "presidential", "year": "2023",
      "registered_voters": 512, "total_votes": 1400, "winner": "APC",
      "ratio": 2.73, "rules": ["over_voting"],
      "sheets": [
        { "election_type": "presidential", "year": "2023",
          "url": "https://.../result-sheet.pdf", "status": "saved" }
      ],
      "votes_by_source": [
        { "source": "LLM (qwen3.5-9b)", "kind": "llm", "method": "unsure",
          "valid_votes": 1400, "parties": { "APC": 700, "PDP": 500, "LP": 200 } }
      ]
    }
  ]
}`}</Code>
            <p style={{ ...p, fontSize: '13px', color: '#8aa093', marginTop: '10px' }}>
              <span style={mono}>sheets</span> are the INEC result sheet(s) for the unit (with a
              download link and status, including broken/missing ones). <span style={mono}>votes_by_source</span> lists
              every set of party votes we recorded for that unit and office, grouped by contributor
              (e.g. our qwen transcription) — so you can compare readings side by side.
            </p>
          </Card>

          <SectionTitle id="reference">Reference</SectionTitle>
          <Card>
            <div style={h2}>Party response fields</div>
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
      </div>

      <HomeFooter />
    </div>
  )
}

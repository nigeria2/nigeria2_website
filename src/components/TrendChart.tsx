export type TrendSeries = { party: string; color: string; values: number[] }

/** Minimal multi-line trend chart (inline SVG, no dependencies). */
export function TrendChart({ series, height = 120 }: { series: TrendSeries[]; height?: number }) {
  const w = 300
  const h = height
  const pad = { t: 10, r: 8, b: 8, l: 8 }
  const count = Math.max(1, ...series.map((s) => s.values.length))
  const maxY = Math.max(10, ...series.flatMap((s) => s.values))
  const innerW = w - pad.l - pad.r
  const innerH = h - pad.t - pad.b
  const x = (i: number) => pad.l + (count <= 1 ? innerW / 2 : (i / (count - 1)) * innerW)
  const y = (v: number) => pad.t + innerH - (v / maxY) * innerH

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ display: 'block', overflow: 'visible' }} role="img" aria-label="National share trend">
      {[0.25, 0.5, 0.75].map((g) => (
        <line key={g} x1={pad.l} x2={w - pad.r} y1={pad.t + innerH * g} y2={pad.t + innerH * g} stroke="#eef2ee" strokeWidth={1} />
      ))}
      {series.map((s) => (
        <g key={s.party}>
          <polyline
            fill="none"
            stroke={s.color}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(' ')}
          />
          {s.values.map((v, i) => (
            <circle key={i} cx={x(i)} cy={y(v)} r={2.2} fill={s.color} />
          ))}
        </g>
      ))}
    </svg>
  )
}

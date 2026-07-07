import { NIGERIA_BACKDROP, NIGERIA_STATES, NIGERIA_VIEWBOX } from '../nigeriaStates'

/**
 * Geographic map of Nigeria's 36 states + FCT. Colourless by default; pass
 * `values` (a `{ [stateName]: cssColor }` map) to fill states programmatically.
 */
export function NigeriaMap({
  values = {},
  defaultFill = '#e8efe9',
  stroke = '#0a6337',
  strokeWidth = 1,
  style,
  onStateClick,
}: {
  values?: Record<string, string>
  defaultFill?: string
  stroke?: string
  strokeWidth?: number
  style?: React.CSSProperties
  onStateClick?: (state: string) => void
}) {
  return (
    <svg
      viewBox={NIGERIA_VIEWBOX}
      role="img"
      aria-label="Map of Nigeria by state"
      style={{ width: '100%', height: 'auto', display: 'block', ...style }}
    >
      {NIGERIA_BACKDROP.map((d, i) => (
        <path key={`backdrop-${i}`} d={d} fill={defaultFill} stroke={stroke} strokeWidth={strokeWidth} />
      ))}
      {NIGERIA_STATES.map((s) => (
        <path
          key={s.name}
          d={s.d}
          fill={values[s.name] ?? defaultFill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          style={onStateClick ? { cursor: 'pointer' } : undefined}
          onClick={onStateClick ? () => onStateClick(s.name) : undefined}
        >
          <title>{s.name}</title>
        </path>
      ))}
    </svg>
  )
}

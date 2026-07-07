import { NIGERIA_STATES } from './nigeriaStates'

/** URL-safe slug for a state name, e.g. "Cross River" -> "cross-river". */
export const stateSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-')

/** slug -> canonical state name. */
export const STATE_BY_SLUG: Record<string, string> = Object.fromEntries(
  NIGERIA_STATES.map((s) => [stateSlug(s.name), s.name]),
)

import { NIGERIA_STATES } from './nigeriaStates'

/** URL-safe slug for a state name, e.g. "Cross River" -> "cross-river". */
export const stateSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-')

/** slug -> canonical state name. */
export const STATE_BY_SLUG: Record<string, string> = Object.fromEntries(
  NIGERIA_STATES.map((s) => [stateSlug(s.name), s.name]),
)

// Canonical geo-spatial id per state (GADM-derived: nga_<n>). Mirrors backend
// app/geo.py. Always request states from the API by this id, never by name.
export const STATE_GEO: Record<string, string> = {
  Abia: 'nga_1', Adamawa: 'nga_2', 'Akwa Ibom': 'nga_3', Anambra: 'nga_4', Bauchi: 'nga_5',
  Bayelsa: 'nga_6', Benue: 'nga_7', Borno: 'nga_8', 'Cross River': 'nga_9', Delta: 'nga_10',
  Ebonyi: 'nga_11', Edo: 'nga_12', Ekiti: 'nga_13', Enugu: 'nga_14', FCT: 'nga_15',
  Gombe: 'nga_16', Imo: 'nga_17', Jigawa: 'nga_18', Kaduna: 'nga_19', Kano: 'nga_20',
  Katsina: 'nga_21', Kebbi: 'nga_22', Kogi: 'nga_23', Kwara: 'nga_24', Lagos: 'nga_25',
  Nasarawa: 'nga_26', Niger: 'nga_27', Ogun: 'nga_28', Ondo: 'nga_29', Osun: 'nga_30',
  Oyo: 'nga_31', Plateau: 'nga_32', Rivers: 'nga_33', Sokoto: 'nga_34', Taraba: 'nga_35',
  Yobe: 'nga_36', Zamfara: 'nga_37',
}

/** geo_id for a state name (tolerant of the FCT/Nasarawa spelling variants). */
export const stateGeoId = (name: string): string | undefined =>
  STATE_GEO[name] ??
  STATE_GEO[{ 'Federal Capital Territory': 'FCT', Nassarawa: 'Nasarawa', 'Cross Rivers': 'Cross River' }[name] ?? name]

/** geo_id from a URL slug, e.g. "akwa-ibom" -> "nga_3". */
export const geoIdFromSlug = (slug: string): string | undefined => {
  const name = STATE_BY_SLUG[slug]
  return name ? stateGeoId(name) : undefined
}

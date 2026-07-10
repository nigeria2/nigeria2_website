// Politician URLs are `/politician/<id>-<name-slug>` (e.g. 302-peter-obi). The
// numeric id stays authoritative — it's the leading segment — and the name is
// appended purely for readability/SEO. A bare `/politician/302` still resolves.

// NFKD splits accented letters into base + combining mark; the alnum filter below
// then drops the marks, so "José" -> "jose" without a dedicated accent step.
const slugify = (s: string) =>
  (s || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

/** Build the route param for a politician link, e.g. (302, "Peter Obi") -> "302-peter-obi". */
export const politicianSlug = (id: number | string, name?: string): string => {
  const s = name ? slugify(name) : ''
  return s ? `${id}-${s}` : String(id)
}

/** Extract the numeric id from a route param, tolerating both "302" and "302-peter-obi". */
export const politicianIdFromSlug = (param: string): string => {
  const m = /^\d+/.exec(param)
  return m ? m[0] : param
}

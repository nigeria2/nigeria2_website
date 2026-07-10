// Local-government URLs are `/lga/<id>-<name-slug>` (e.g. 214-ikot-ekpene). Same
// pattern as politician URLs: the numeric canonical Lga id is authoritative, the
// name is appended for readability. A bare `/lga/214` still resolves.

const slugify = (s: string) =>
  (s || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const lgaSlug = (id: number | string, name?: string): string => {
  const s = name ? slugify(name) : ''
  return s ? `${id}-${s}` : String(id)
}

export const lgaIdFromSlug = (param: string): string => {
  const m = /^\d+/.exec(param)
  return m ? m[0] : param
}

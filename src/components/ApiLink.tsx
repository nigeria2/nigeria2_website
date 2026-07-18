/** A small "API" pill for the top-right of a results page header, linking to that page's
 *  public data twin on api.nigeria2.com. Sits absolutely in a position:relative header. */
export function ApiLink({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      title="View this page's data on the public API"
      style={{
        position: 'absolute',
        top: '30px',
        right: '40px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontFamily: "'Archivo', sans-serif",
        fontWeight: 800,
        fontSize: '12px',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: '#0f4a2c',
        background: '#ffe14d',
        textDecoration: 'none',
        padding: '7px 14px',
        borderRadius: '20px',
      }}
    >
      {'{ }'} API
    </a>
  )
}

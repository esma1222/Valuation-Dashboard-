// Converts an inline CSS string (e.g. "padding:10px;color:#fff") into the style
// object React expects. The original artifact authored styles as strings, so this
// lets us reuse them verbatim instead of hand-translating every declaration.
export function css(str) {
  const out = {}
  if (!str) return out
  for (const decl of str.split(';')) {
    const idx = decl.indexOf(':')
    if (idx === -1) continue
    const prop = decl.slice(0, idx).trim()
    const value = decl.slice(idx + 1).trim()
    if (!prop) continue
    const key = prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
    out[key] = value
  }
  return out
}

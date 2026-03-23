/**
 * Normalize admin-entered hex to #RRGGBB (uppercase) for API and preview.
 */
export function normalizeBrandHex(input: string): string {
  const t = input.trim()
  if (!t) {
    return ''
  }
  const hex = t.startsWith('#') ? t.slice(1) : t
  if (!/^[0-9A-Fa-f]{6}$/i.test(hex)) {
    return t
  }
  return `#${hex.toUpperCase()}`
}

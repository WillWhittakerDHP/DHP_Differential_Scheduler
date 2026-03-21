/**
 * Pure display helper for null/undefined and object values in tables and formatters.
 * WHY: Single source of truth for "—" and object serialization across admin tables and appointment field formatters.
 */
export function formatNullValue(value: unknown): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

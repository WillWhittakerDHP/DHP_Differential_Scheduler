/**
 * Shallow merge for PATCH availability payloads (top-level object spread).
 */
export function mergeSettingValues(existingValue: unknown, newValue: unknown): unknown {
  const existing = (typeof existingValue === 'object' && existingValue !== null ? existingValue : {}) as Record<
    string,
    unknown
  >
  const next = (typeof newValue === 'object' && newValue !== null ? newValue : {}) as Record<string, unknown>
  return {
    ...existing,
    ...next,
  }
}

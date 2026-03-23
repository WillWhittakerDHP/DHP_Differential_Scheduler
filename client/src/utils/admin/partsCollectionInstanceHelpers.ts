type WithBulkEditMode = { bulkEditMode?: { value?: boolean } }
type WithToggle = { toggleBulkEditMode?: () => void }

export function firstPartsCollectionInstance<T>(refValue: T[] | T | null): T | null {
  return Array.isArray(refValue) ? refValue[0] ?? null : refValue
}

export function readBulkEditModeFromPartsCollection(instance: unknown): boolean {
  if (!instance || typeof instance !== 'object') return false
  const bm = (instance as WithBulkEditMode).bulkEditMode
  if (!bm || typeof bm !== 'object' || !('value' in bm)) return false
  return Boolean(bm.value)
}

export function callPartsCollectionToggleBulkEdit(target: unknown): void {
  const t = target as WithToggle | null
  if (t && typeof t.toggleBulkEditMode === 'function') {
    t.toggleBulkEditMode()
  }
}

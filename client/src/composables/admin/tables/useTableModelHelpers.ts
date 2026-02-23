/**
 * WHY: Shared table model helpers and base type for formatNullValue
WHY: Table ...
 */
import { computed, type ComputedRef } from 'vue'

/** Shared shape for table models that provide formatNullValue. */
export interface TableModelFormatHelpers {
  formatNullValue: (value: unknown) => string
}

export function formatNullValue(value: unknown): string {
  if (value === null || value === undefined) return '—'
  return String(value)
}

export function createItemsSource<T>(
  data: ComputedRef<T[] | undefined>
): ComputedRef<T[]> {
  return computed(() => {
    const items = data.value
    return Array.isArray(items) ? items : []
  })
}

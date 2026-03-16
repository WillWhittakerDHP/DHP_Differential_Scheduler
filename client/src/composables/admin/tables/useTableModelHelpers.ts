/**
 * WHY: Shared table model helpers and base type for formatNullValue
WHY: Table ...
 */
import { computed } from 'vue'
import type { ComputedRef } from 'vue'

export type { TableModelFormatHelpers } from '@/types/admin/tables/tableModelHelpers'
export { formatNullValue } from '@/utils/formatting/nullDisplay'

/**
 * items prop must be an array or "items is not iterable" is thrown. Reused by createItemsSource
 * and by every :items binding so the contract is enforced in one place.
 */
export function ensureItemsArray<T>(source: unknown): T[] {
  return Array.isArray(source) ? (source as T[]) : []
}

export function createItemsSource<T>(
  data: ComputedRef<T[] | undefined>
): ComputedRef<T[]> {
  return computed(() => ensureItemsArray<T>(data.value))
}

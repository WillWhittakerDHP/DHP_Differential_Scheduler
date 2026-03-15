/**
 * WHY: Shared table model helpers and base type for formatNullValue
WHY: Table ...
 */
import { computed } from 'vue'
import type { ComputedRef } from 'vue'

export type { TableModelFormatHelpers } from '@/types/admin/tables/tableModelHelpers'
export { formatNullValue } from '@/utils/formatting/nullDisplay'

/** Returns items if array, otherwise []. WHY: Vuetify :items expects iterable; wizard refs may be undefined. */
export function ensureItemsArray<T>(items: T[] | undefined | null): T[] {
  return Array.isArray(items) ? items : []
}

export function createItemsSource<T>(
  data: ComputedRef<T[] | undefined>
): ComputedRef<T[]> {
  return computed(() => {
    const items = data.value
    return Array.isArray(items) ? items : []
  })
}

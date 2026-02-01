/**
 * LEARNING: Shared table model helpers
 * WHY: Table model setup patterns are duplicated across usePropertiesTableModel and useUsersTableModel
 * PATTERN: Extract shared helper functions
 * 
 * Used by:
 * - usePropertiesTableModel.ts
 * - useUsersTableModel.ts
 */

import { computed, type ComputedRef } from 'vue'

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

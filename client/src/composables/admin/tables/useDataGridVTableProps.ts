import { computed, type ComputedRef } from 'vue'

/**
 * WHY: Admin tables pass a shallowReactive `grid` with ComputedRefs nested on a plain object.
 * Vue only auto-unwraps refs at the top level of `<script setup>` — `g.isLoading` in a template
 * stays a Ref and breaks VDataTable `loading` (expects boolean | string).
 */
interface DataGridVTableListSlice<TItem> {
  tableItems: ComputedRef<readonly TItem[]>
  isLoading: ComputedRef<boolean>
}

interface DataGridVTableProps<TItem> {
  tableItems: ComputedRef<readonly TItem[]>
  isLoading: ComputedRef<boolean>
}

export function useDataGridVTableProps<TItem>(
  grid: DataGridVTableListSlice<TItem>
): DataGridVTableProps<TItem> {
  const tableItems = computed((): readonly TItem[] => grid.tableItems.value)
  const isLoading = computed((): boolean => grid.isLoading.value)
  return { tableItems, isLoading }
}

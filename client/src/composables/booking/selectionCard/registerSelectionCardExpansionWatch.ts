/**
 * WHY: Model value → expansion sync watch (useSelectionCardGroupState length audit).
 */

import { watch, type Ref } from 'vue'
import type { SelectionCardItem } from '@/components/booking/types/selectionCardTypes'
import { computeNextExpandedCardIds } from '@/utils/booking/selectionCardExpansionSync'

export function registerSelectionCardExpansionWatch(input: {
  modelValue: Ref<unknown>
  configWithDefaults: Ref<{ expansion?: { enabled?: boolean } }>
  items: Ref<SelectionCardItem[]>
  shouldExpand: (item: SelectionCardItem) => boolean
  expandedCardIds: Ref<string[]>
  previousSelectedIds: Ref<string[]>
  recentlyAutoExpanded: Ref<Set<string>>
}): void {
  const {
    modelValue,
    configWithDefaults,
    items,
    shouldExpand,
    expandedCardIds,
    previousSelectedIds,
    recentlyAutoExpanded,
  } = input

  watch(
    () => modelValue.value,
    (newValue) => {
      const config = configWithDefaults.value
      if (!config.expansion?.enabled) return

      const selectedIds = Array.isArray(newValue) ? newValue : newValue ? [newValue] : []

      const sync = computeNextExpandedCardIds({
        expandedCardIds: expandedCardIds.value,
        previousSelectedIds: previousSelectedIds.value,
        selectedIds,
        items: items.value,
        shouldExpand,
      })

      if (sync) {
        expandedCardIds.value = sync.nextExpanded
        sync.autoExpandIds.forEach((id) => {
          recentlyAutoExpanded.value.add(id)
          setTimeout(() => {
            recentlyAutoExpanded.value.delete(id)
          }, 100)
        })
      }

      previousSelectedIds.value = [...selectedIds]
    },
    { immediate: true }
  )
}

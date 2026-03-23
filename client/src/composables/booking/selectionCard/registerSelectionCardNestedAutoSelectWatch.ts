/**
 * WHY: Auto-select all active components when a composite service is first selected.
 * Clears nested state when a service is deselected so re-selection triggers fresh defaults.
 * Gated by `expansion.autoSelectNested` (default true via mergeSelectionCardConfigWithDefaults).
 */

import { watch, type ComputedRef, type Ref } from 'vue'
import type { SelectionCardConfig, SelectionCardItem } from '@/components/booking/types/selectionCardTypes'
import {
  computeAutoSelectedNestedIds,
  computeDeselectedNestedIds,
} from '@/utils/booking/selectionCardNestedAutoSelect'

export function registerSelectionCardNestedAutoSelectWatch(input: {
  modelValue: Ref<unknown>
  items: Ref<SelectionCardItem[]>
  nestedSelections: Ref<Record<string, string[]>>
  configWithDefaults: ComputedRef<SelectionCardConfig>
}): void {
  const { modelValue, items, nestedSelections, configWithDefaults } = input

  watch(
    () => [modelValue.value, configWithDefaults.value.expansion?.autoSelectNested] as const,
    ([newValue, autoSelectNestedFlag]) => {
      const selectedIds: string[] = Array.isArray(newValue)
        ? newValue
        : newValue ? [newValue as string] : []

      const allowAutoSelectNested = autoSelectNestedFlag !== false

      if (allowAutoSelectNested) {
        const additions = computeAutoSelectedNestedIds({
          selectedIds,
          items: items.value,
          currentNestedSelections: nestedSelections.value,
        })

        if (additions) {
          for (const [id, componentIds] of Object.entries(additions)) {
            nestedSelections.value[id] = componentIds
          }
        }
      }

      const removals = computeDeselectedNestedIds({
        selectedIds,
        currentNestedSelections: nestedSelections.value,
      })

      if (removals) {
        for (const id of removals) {
          delete nestedSelections.value[id]
        }
      }
    },
    { immediate: true }
  )
}

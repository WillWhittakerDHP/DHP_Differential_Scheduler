/**
 * WHY: useSelectionCardGroupState Composable
 */
import { computed, ref } from 'vue'
import type { UseSelectionCardGroupStateParams, UseSelectionCardGroupStateReturn } from '@/types/booking/selectionCard/selectionCardGroupState'
import { registerSelectionCardExpansionWatch } from '@/composables/booking/selectionCard/registerSelectionCardExpansionWatch'
import { registerSelectionCardNestedAutoSelectWatch } from '@/composables/booking/selectionCard/registerSelectionCardNestedAutoSelectWatch'

export type { UseSelectionCardGroupStateParams, UseSelectionCardGroupStateReturn } from '@/types/booking/selectionCard/selectionCardGroupState'

/**
 * WHY: useSelectionCardGroupState composable
 * WHY: Extracts state management lo...
 */
export function useSelectionCardGroupState(params: UseSelectionCardGroupStateParams): UseSelectionCardGroupStateReturn {
  const { items, modelValue, configWithDefaults, shouldExpand } = params

  const expandedCardIds = ref<string[]>([])
  const nestedSelections = ref<Record<string, string[]>>({})
  const internalValue = computed(() => modelValue.value)

  const expansionStates = computed(() => {
    const ids = expandedCardIds.value
    return ids.reduce<Record<string, boolean>>((acc, id) => {
      acc[id] = true
      return acc
    }, {})
  })

  const handleNestedSelection = (itemId: string, componentIds: string[]): void => {
    nestedSelections.value[itemId] = componentIds
  }

  const recentlyAutoExpanded = ref<Set<string>>(new Set())

  const toggleCardExpansion = (itemId: string): void => {
    if (recentlyAutoExpanded.value.has(itemId)) {
      recentlyAutoExpanded.value.delete(itemId)
      return
    }

    const index = expandedCardIds.value.indexOf(itemId)
    if (index > -1) {
      expandedCardIds.value.splice(index, 1)
    } else {
      expandedCardIds.value.push(itemId)
    }
  }

  const previousSelectedIds = ref<string[]>([])

  registerSelectionCardExpansionWatch({
    modelValue,
    configWithDefaults,
    items,
    shouldExpand,
    expandedCardIds,
    previousSelectedIds,
    recentlyAutoExpanded,
  })

  registerSelectionCardNestedAutoSelectWatch({
    modelValue,
    items,
    nestedSelections,
    configWithDefaults,
  })

  return {
    expandedCardIds,
    nestedSelections,
    expansionStates,
    internalValue,
    handleNestedSelection,
    toggleCardExpansion,
  }
}

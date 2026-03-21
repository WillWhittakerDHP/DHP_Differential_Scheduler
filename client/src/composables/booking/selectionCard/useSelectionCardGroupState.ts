/**
 * WHY: useSelectionCardGroupState Composable

 */
import { computed, watch, ref, type Ref } from 'vue'
import type { UseSelectionCardGroupStateParams, UseSelectionCardGroupStateReturn } from '@/types/booking/selectionCard/selectionCardGroupState'

export type { UseSelectionCardGroupStateParams, UseSelectionCardGroupStateReturn } from '@/types/booking/selectionCard/selectionCardGroupState'

/**
 * WHY: useSelectionCardGroupState composable

WHY: Extracts state management lo...
 */
export function useSelectionCardGroupState(params: UseSelectionCardGroupStateParams): UseSelectionCardGroupStateReturn {
  const {
    items,
    modelValue,
    configWithDefaults,
    shouldExpand
  } = params

  // WHY: Vue doesn't track Set mutations, so we need an array for proper reactivity
  // PATTERN: Use array with includes() instead of Set with has()
  const expandedCardIds = ref<string[]>([])

  const nestedSelections = ref<Record<string, string[]>>({})

  const internalValue = computed(() => {
    return modelValue.value
  })

  /**
   */
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

  const toggleCardExpansion = (itemId: string, recentlyAutoExpanded: Ref<Set<string>>): void => {
    // PATTERN: Ignore manual toggle if card was auto-expanded within last 100ms
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

  // Track previous selection to detect actual changes (not temporary nulls)
  const previousSelectedIds = ref<string[]>([])

  const recentlyAutoExpanded = ref<Set<string>>(new Set())

  // WHY: Prevents cleanup loop from removing cards during state transitions
  // PATTERN: Track previous selection state and only act on real changes
  watch(() => modelValue.value, (newValue) => {
    const config = configWithDefaults.value
    if (!config.expansion?.enabled) return
    
    const selectedIds = Array.isArray(newValue) ? newValue : (newValue ? [newValue] : [])
    
    // PATTERN: Skip cleanup when selection is empty unless it was explicitly cleared
    if (selectedIds.length > 0 || previousSelectedIds.value.length === 0) {
      /**
       * PATTERN: Always add before removing to maintain consistent state
       */
      const idsToAdd: string[] = []
      selectedIds.forEach(id => {
        const item = items.value.find(item => item.id === id)
        if (item && shouldExpand(item) && !expandedCardIds.value.includes(id)) {
          idsToAdd.push(id)
          // PATTERN: Add to Set, remove after 100ms
          recentlyAutoExpanded.value.add(id)
          setTimeout(() => {
            recentlyAutoExpanded.value.delete(id)
          }, 100)
        }
      })
      
      const idsToRemove = previousSelectedIds.value.filter(prevId => !selectedIds.includes(prevId))
      
      // Step 3: Apply both changes atomically - add new cards, remove old ones
      if (idsToAdd.length > 0 || idsToRemove.length > 0) {
        const newExpandedIds = expandedCardIds.value
          .filter(id => !idsToRemove.includes(id)) // Remove old cards
          .concat(idsToAdd.filter(id => !expandedCardIds.value.includes(id))) // Add new cards (avoid duplicates)
        
        expandedCardIds.value = newExpandedIds
      }
    }
    
    previousSelectedIds.value = [...selectedIds]
  }, { immediate: true })

  return {
    expandedCardIds,
    nestedSelections,
    expansionStates,
    internalValue,
    handleNestedSelection,
    toggleCardExpansion: (itemId: string) => toggleCardExpansion(itemId, recentlyAutoExpanded)
  }
}

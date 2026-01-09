/**
 * useSelectionCardGroupState Composable
 * 
 * LEARNING: Extracts group state management logic from SelectionCardGroup component
 * WHY: Moves expansion state and nested selection state management to composable
 * PATTERN: Composable that provides state management
 */

import { computed, watch, ref, type Ref, type ComputedRef } from 'vue'
import type { SelectionCardItem } from '@/components/booking/types/selectionCardTypes'

/**
 * useSelectionCardGroupState composable parameters
 */
export interface UseSelectionCardGroupStateParams {
  items: ComputedRef<SelectionCardItem[]>
  modelValue: ComputedRef<string | string[] | null>
  configWithDefaults: ComputedRef<{ expansion?: { enabled?: boolean } }>
  shouldExpand: (item: SelectionCardItem) => boolean
}

/**
 * useSelectionCardGroupState composable return type
 */
export interface UseSelectionCardGroupStateReturn {
  expandedCardIds: Ref<string[]>
  nestedSelections: Ref<Record<string, string[]>>
  expansionStates: ComputedRef<Record<string, boolean>>
  internalValue: ComputedRef<string | string[] | null>
  handleNestedSelection: (itemId: string, componentIds: string[]) => void
  toggleCardExpansion: (itemId: string) => void
}

/**
 * useSelectionCardGroupState composable
 * 
 * LEARNING: Provides group state management
 * WHY: Extracts state management logic from component to composable
 * PATTERN: Composable that returns reactive state and handlers
 */
export function useSelectionCardGroupState(params: UseSelectionCardGroupStateParams): UseSelectionCardGroupStateReturn {
  const {
    items,
    modelValue,
    configWithDefaults,
    shouldExpand
  } = params

  // Expansion state management
  // LEARNING: Use array instead of Set for Vue reactivity
  // WHY: Vue doesn't track Set mutations, so we need an array for proper reactivity
  // PATTERN: Use array with includes() instead of Set with has()
  const expandedCardIds = ref<string[]>([])

  // Nested component selection state management
  const nestedSelections = ref<Record<string, string[]>>({})

  /**
   * LEARNING: Computed property for internal model value
   * WHY: Used when group wrapper is enabled (VRadioGroup/VCheckboxGroup)
   * PATTERN: Read-only computed - setter handled by parent component
   */
  const internalValue = computed(() => {
    return modelValue.value
  })

  /**
   * LEARNING: Computed property that creates expansion state object
   * WHY: Ensures Vue tracks array changes properly - Vue tracks object property access
   * PATTERN: Create a computed object where Vue can track property access in template
   */
  const expansionStates = computed(() => {
    // Access expandedCardIds.value to establish reactivity dependency
    const ids = expandedCardIds.value
    // Return a plain object - Vue tracks object property access
    return ids.reduce<Record<string, boolean>>((acc, id) => {
      acc[id] = true
      return acc
    }, {})
  })

  /**
   * LEARNING: Handle nested selection update
   * WHY: Updates nested selection state for a specific card
   * PATTERN: Store nested selections in record keyed by item ID
   */
  const handleNestedSelection = (itemId: string, componentIds: string[]): void => {
    nestedSelections.value[itemId] = componentIds
    // Emit would be handled by parent component
  }

  /**
   * LEARNING: Toggle card expansion
   * WHY: Manual toggle for expansion button clicks
   * PATTERN: Check if card was recently auto-expanded and ignore toggle if so
   */
  const toggleCardExpansion = (itemId: string, recentlyAutoExpanded: Ref<Set<string>>): void => {
    // LEARNING: Prevent toggle if card was recently auto-expanded
    // WHY: When user clicks card, auto-expansion happens, then expansion button click fires
    // PATTERN: Ignore manual toggle if card was auto-expanded within last 100ms
    if (recentlyAutoExpanded.value.has(itemId)) {
      recentlyAutoExpanded.value.delete(itemId)
      return
    }
    
    // Use composable method but update local state
    const index = expandedCardIds.value.indexOf(itemId)
    if (index > -1) {
      expandedCardIds.value.splice(index, 1)
    } else {
      expandedCardIds.value.push(itemId)
    }
  }

  // Track previous selection to detect actual changes (not temporary nulls)
  const previousSelectedIds = ref<string[]>([])

  // Track when cards are auto-expanded to prevent immediate manual toggle
  const recentlyAutoExpanded = ref<Set<string>>(new Set())

  // Auto-expand when card is selected (if it has visible components)
  // LEARNING: Only add/remove based on actual selection changes, not temporary null values
  // WHY: Prevents cleanup loop from removing cards during state transitions
  // PATTERN: Track previous selection state and only act on real changes
  watch(() => modelValue.value, (newValue) => {
    const config = configWithDefaults.value
    if (!config.expansion?.enabled) return
    
    const selectedIds = Array.isArray(newValue) ? newValue : (newValue ? [newValue] : [])
    
    // LEARNING: Only process if we have a valid selection (not null/empty during transitions)
    // WHY: Prevents cleanup loop from running when modelValue is temporarily null
    // PATTERN: Skip cleanup when selection is empty unless it was explicitly cleared
    if (selectedIds.length > 0 || previousSelectedIds.value.length === 0) {
      /**
       * WHY: If we remove first, the computed property recomputes with empty array, causing collapse
       * PATTERN: Always add before removing to maintain consistent state
       */
      const idsToAdd: string[] = []
      selectedIds.forEach(id => {
        const item = items.value.find(item => item.id === id)
        if (item && shouldExpand(item) && !expandedCardIds.value.includes(id)) {
          idsToAdd.push(id)
          // LEARNING: Mark card as recently auto-expanded to prevent immediate manual toggle
          // WHY: When user clicks card, auto-expansion happens, then expansion button click fires
          // PATTERN: Add to Set, remove after 100ms
          recentlyAutoExpanded.value.add(id)
          setTimeout(() => {
            recentlyAutoExpanded.value.delete(id)
          }, 100)
        }
      })
      
      // Step 2: Calculate which cards to remove (but don't remove yet)
      const idsToRemove = previousSelectedIds.value.filter(prevId => !selectedIds.includes(prevId))
      
      // Step 3: Apply both changes atomically - add new cards, remove old ones
      if (idsToAdd.length > 0 || idsToRemove.length > 0) {
        // Create new array with additions and removals in one operation
        const newExpandedIds = expandedCardIds.value
          .filter(id => !idsToRemove.includes(id)) // Remove old cards
          .concat(idsToAdd.filter(id => !expandedCardIds.value.includes(id))) // Add new cards (avoid duplicates)
        
        expandedCardIds.value = newExpandedIds
      }
    }
    
    // Update previous selection state
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



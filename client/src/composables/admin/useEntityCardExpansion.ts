/**
 * LEARNING: Entity Card Expansion State Management
 * WHY: Encapsulates expansion state logic for VExpansionPanel integration
 * PATTERN: Composable for managing single card expansion state
 * 
 * Used by:
 * - EntityCard.vue
 */

import { ref, computed, watch, isRef, type Ref } from 'vue'

export interface UseEntityCardExpansionOptions {
  expanded: Ref<boolean> | boolean
}

export interface UseEntityCardExpansionReturn {
  isExpanded: Ref<boolean>
  handleExpansionChange: (event: { value: boolean }) => void
}

/**
 * LEARNING: Manage expansion state for EntityCard
 * WHY: Tracks expansion state synced with VExpansionPanel group:selected events
 * PATTERN: Internal ref synced with props and panel events
 */
export function useEntityCardExpansion(
  options: UseEntityCardExpansionOptions
): UseEntityCardExpansionReturn {
  const expandedValue = isRef(options.expanded) ? options.expanded.value : options.expanded
  
  // LEARNING: Internal expansion state
  // WHY: group:selected reflects actual VExpansionPanel state even if parent props lag
  // PATTERN: Initialize from props, then sync from group:selected events
  const internalExpanded = ref(expandedValue ?? true)

  // LEARNING: Keep internal state in sync with prop updates
  // WHY: Parent may programmatically control expansion (e.g., auto-expand on create)
  // PATTERN: Watch prop changes, but allow group:selected to be the primary source of truth
  if (isRef(options.expanded)) {
    watch(options.expanded, (newValue) => {
      internalExpanded.value = newValue ?? true
    })
  }

  // LEARNING: Handle panel selection changes from Vuetify group
  // WHY: Ensures expansion state reflects the actual UI state
  // PATTERN: Update internal state when VExpansionPanel emits group:selected
  function handleExpansionChange(event: { value: boolean }): void {
    internalExpanded.value = event.value
  }

  // LEARNING: Use internal ref for expansion state
  // WHY: Internal ref is updated by group:selected, ensuring UI and state are aligned
  // PATTERN: Computed reads from reactive ref
  const isExpanded = computed(() => {
    return internalExpanded.value
  })

  return {
    isExpanded,
    handleExpansionChange,
  }
}

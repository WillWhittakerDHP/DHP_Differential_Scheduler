/**
 * WHY: Entity Card Expansion State Management
WHY: Encapsulates expansion state...
 */
import { ref, computed, watch, isRef } from 'vue'
import type { UseEntityCardExpansionOptions, UseEntityCardExpansionReturn } from '@/types/admin/entityCardExpansion'

export type { UseEntityCardExpansionOptions, UseEntityCardExpansionReturn } from '@/types/admin/entityCardExpansion'

export function useEntityCardExpansion(
  options: UseEntityCardExpansionOptions
): UseEntityCardExpansionReturn {
  const expandedValue = isRef(options.expanded) ? options.expanded.value : options.expanded
  
  // LEARNING: Internal expansion state
  // WHY: group:selected reflects actual VExpansionPanel state even if parent props lag
  // PATTERN: Initialize from props, then sync from group:selected events
  const internalExpanded = ref(expandedValue ?? true)

  // LEARNING: Keep internal state in sync with prop updates
  // PATTERN: Watch prop changes, but allow group:selected to be the primary source of truth
  if (isRef(options.expanded)) {
    watch(options.expanded, (newValue) => {
      internalExpanded.value = newValue ?? true
    })
  }

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

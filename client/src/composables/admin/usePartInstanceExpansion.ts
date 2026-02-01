/**
 * Composable for part instance expansion handlers
 * WHY: Extracts expansion toggle logic from PartsCollection template
 * PATTERN: Helper function for expansion state management
 */

import type { Ref } from 'vue'

export interface UsePartInstanceExpansionOptions {
  expandedPartInstances: Ref<string[]>
}

export interface UsePartInstanceExpansionReturn {
  togglePartInstanceExpansion: (instanceId: string) => void
}

/**
 * Composable for managing part instance expansion
 * WHY: Centralizes expansion toggle logic
 * PATTERN: Returns function to toggle expansion state
 */
export function usePartInstanceExpansion(
  options: UsePartInstanceExpansionOptions
): UsePartInstanceExpansionReturn {
  const { expandedPartInstances } = options

  /**
   * Toggle part instance expansion
   * WHY: Handles expansion/collapse of part instance panels
   * PATTERN: Add/remove instance ID from expanded array
   */
  const togglePartInstanceExpansion = (instanceId: string): void => {
    // PATTERN: Access array directly, not through .value
    const currentExpanded = expandedPartInstances.value
    const index = currentExpanded.indexOf(instanceId)
    if (index === -1) {
      currentExpanded.push(instanceId)
    } else {
      currentExpanded.splice(index, 1)
    }
  }

  return {
    togglePartInstanceExpansion
  }
}

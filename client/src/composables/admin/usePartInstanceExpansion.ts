/**
 * WHY: Composable for part instance expansion handlers
WHY: Extracts expansion ...
 */
import type { Ref } from 'vue'

export interface UsePartInstanceExpansionOptions {
  expandedPartInstances: Ref<string[]>
}

export interface UsePartInstanceExpansionReturn {
  togglePartInstanceExpansion: (instanceId: string) => void
}

export function usePartInstanceExpansion(
  options: UsePartInstanceExpansionOptions
): UsePartInstanceExpansionReturn {
  const { expandedPartInstances } = options

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

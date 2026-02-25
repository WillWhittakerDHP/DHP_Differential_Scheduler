/**
 * WHY: Composable for part instance expansion handlers
WHY: Extracts expansion ...
 */
import type { UsePartInstanceExpansionOptions, UsePartInstanceExpansionReturn } from '@/types/admin/partInstanceExpansion'

export type { UsePartInstanceExpansionOptions, UsePartInstanceExpansionReturn } from '@/types/admin/partInstanceExpansion'

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

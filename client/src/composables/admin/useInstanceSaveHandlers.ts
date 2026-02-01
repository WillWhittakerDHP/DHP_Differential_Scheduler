/**
 * Composable for instance save handlers
 * WHY: Extracts save handler logic from InstancesTab
 * PATTERN: Simple handler functions
 */

import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'

export interface UseInstanceSaveHandlersReturn {
  handleExistingBlockInstanceSaved: (entity: GlobalEntity<GlobalEntityKey>) => void
}

/**
 * Composable for handling instance save events
 * WHY: Handles save events for existing instances
 * PATTERN: Handler functions that manage state after save
 */
export function useInstanceSaveHandlers(): UseInstanceSaveHandlersReturn {
  /**
   * Handle save on existing BlockInstance - keep card expanded
   * WHY: User expects instance to remain visible after saving changes, not disappear
   * PATTERN: Don't remove instance ID from expandedInstances - keep card expanded
   * FIX: Removed auto-collapse behavior - instance stays visible after save
   */
  const handleExistingBlockInstanceSaved = (_entity: GlobalEntity<GlobalEntityKey>): void => {
    // PATTERN: Don't auto-collapse - let user manually collapse if desired
  }

  return {
    handleExistingBlockInstanceSaved
  }
}

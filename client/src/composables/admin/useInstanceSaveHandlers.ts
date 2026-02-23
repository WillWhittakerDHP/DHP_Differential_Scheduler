
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'

export interface UseInstanceSaveHandlersReturn {
  handleExistingBlockInstanceSaved: (entity: GlobalEntity<GlobalEntityKey>) => void
}

export function useInstanceSaveHandlers(): UseInstanceSaveHandlersReturn {
  /**
   * Handle save on existing BlockInstance - keep card expanded
   * FIX: Removed auto-collapse behavior - instance stays visible after save
   */
  const handleExistingBlockInstanceSaved = (_entity: GlobalEntity<GlobalEntityKey>): void => {
    // PATTERN: Don't auto-collapse - let user manually collapse if desired
  }

  return {
    handleExistingBlockInstanceSaved
  }
}

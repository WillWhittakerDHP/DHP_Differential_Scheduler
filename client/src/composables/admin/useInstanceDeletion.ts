/**
 * Composable for instance deletion handlers
 * WHY: Extracts deletion handler logic from components
 * PATTERN: Simple no-op handlers (EntityCard handles actual deletion)
 */

export interface UseInstanceDeletionReturn {
  handleDeleteBlockInstance: (id: string) => void
}

/**
 * Composable for handling instance deletion
 * WHY: EntityCard already handles deletion internally, these are just notification handlers
 * PATTERN: No-op handlers - EntityCard handles all deletion logic including confirmation
 * NOTE: EntityCard emits 'delete' event after successful deletion for parent awareness
 */
export function useInstanceDeletion(): UseInstanceDeletionReturn {
  /**
   * Handle delete BlockInstance event
   * WHY: EntityCard already handled the deletion - this is just for parent awareness
   * PATTERN: No-op handler - card handles all deletion logic, Vue Query will automatically refetch
   */
  const handleDeleteBlockInstance = (_id: string): void => {
    // EntityCard already handled the deletion - this is just for parent awareness
    // Vue Query will automatically refetch and update the UI
  }

  return {
    handleDeleteBlockInstance
  }
}

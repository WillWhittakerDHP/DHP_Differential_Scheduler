/**
 * Composable for part instance deletion handlers
 * WHY: Extracts deletion handler logic from PartsCollection
 * PATTERN: Simple no-op handler (EntityCard handles actual deletion)
 */

export interface UsePartInstanceDeletionReturn {
  handleDeletePartInstance: (id: string) => void
}

/**
 * Composable for handling part instance deletion
 * WHY: EntityCard already handles deletion internally, this is just a notification handler
 * PATTERN: No-op handler - EntityCard handles all deletion logic including confirmation
 * NOTE: EntityCard emits 'delete' event after successful deletion for parent awareness
 */
export function usePartInstanceDeletion(): UsePartInstanceDeletionReturn {
  /**
   * LEARNING: Handle delete PartInstance event
   * WHY: EntityCard already handled the deletion - this is just for parent awareness
   * PATTERN: No-op handler - card handles all deletion logic, Vue Query will automatically refetch
   */
  const handleDeletePartInstance = (_id: string): void => {
    // EntityCard already handled the deletion
    // Vue Query will automatically refetch and update the UI
  }

  return {
    handleDeletePartInstance
  }
}

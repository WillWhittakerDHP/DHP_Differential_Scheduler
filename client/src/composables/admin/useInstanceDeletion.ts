/**
 * Composable for instance deletion handlers
 */

export interface UseInstanceDeletionReturn {
  handleDeleteBlockInstance: (id: string) => void
}

/**
 * Composable for handling instance deletion
 * NOTE: EntityCard emits 'delete' event after successful deletion for parent awareness
 */
export function useInstanceDeletion(): UseInstanceDeletionReturn {
  /**
   * Handle delete BlockInstance event
   */
  const handleDeleteBlockInstance = (_id: string): void => {
  }

  return {
    handleDeleteBlockInstance
  }
}

/**
 * Composable for shape deletion handlers
 * WHY: Extracts deletion handler logic from ShapesTab
 * PATTERN: Simple no-op handlers (EntityCard handles actual deletion)
 */

export interface UseShapeDeletionReturn {
  handleDeleteBlockShape: (id: string) => void
  handleDeletePartShape: (id: string) => void
  handleDeleteAnnotationShape: (id: string) => void
}

/**
 * Composable for handling shape deletion
 * WHY: EntityCard already handles deletion internally, these are just notification handlers
 * PATTERN: No-op handlers - EntityCard handles all deletion logic including confirmation
 * NOTE: EntityCard emits 'delete' event after successful deletion for parent awareness
 */
export function useShapeDeletion(): UseShapeDeletionReturn {
  /**
   * WHY: Event handler for deleting BlockShape
   * WHY: EntityCard already handles deletion internally, this is just a notification handler
   * PATTERN: No-op handler - EntityCard handles all deletion logic including confirmation
   * NOTE: EntityCard emits 'delete' event after successful deletion for parent awareness
   */
  const handleDeleteBlockShape = (_id: string): void => {
    // EntityCard already handled the deletion - this is just for parent awareness
    // Vue Query will automatically refetch and update the UI
  }

  /**
   * WHY: Event handler for deleting PartShape
   * WHY: EntityCard already handles deletion internally, this is just a notification handler
   * PATTERN: No-op handler - EntityCard handles all deletion logic including confirmation
   * NOTE: EntityCard emits 'delete' event after successful deletion for parent awareness
   */
  const handleDeletePartShape = (_id: string): void => {
    // EntityCard already handled the deletion - this is just for parent awareness
    // Vue Query will automatically refetch and update the UI
  }

  /**
   * WHY: Event handler for deleting AnnotationShape
   * WHY: EntityCard handles deletion internally, this is just a notification handler
   * PATTERN: No-op handler - card handles all deletion logic
   */
  const handleDeleteAnnotationShape = (_id: string): void => {
    // EntityCard already handled the deletion - this is just for parent awareness
    // Vue Query will automatically refetch and update the UI
  }

  return {
    handleDeleteBlockShape,
    handleDeletePartShape,
    handleDeleteAnnotationShape
  }
}

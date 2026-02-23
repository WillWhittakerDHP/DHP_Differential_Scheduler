/**
 * Composable for shape deletion handlers
 */

export interface UseShapeDeletionReturn {
  handleDeleteBlockShape: (id: string) => void
  handleDeletePartShape: (id: string) => void
  handleDeleteAnnotationShape: (id: string) => void
}

/**
 * Composable for handling shape deletion
 * NOTE: EntityCard emits 'delete' event after successful deletion for parent awareness
 */
export function useShapeDeletion(): UseShapeDeletionReturn {
  /**
   * NOTE: EntityCard emits 'delete' event after successful deletion for parent awareness
   */
  const handleDeleteBlockShape = (_id: string): void => {
  }

  /**
   * NOTE: EntityCard emits 'delete' event after successful deletion for parent awareness
   */
  const handleDeletePartShape = (_id: string): void => {
  }

  /**
   */
  const handleDeleteAnnotationShape = (_id: string): void => {
  }

  return {
    handleDeleteBlockShape,
    handleDeletePartShape,
    handleDeleteAnnotationShape
  }
}

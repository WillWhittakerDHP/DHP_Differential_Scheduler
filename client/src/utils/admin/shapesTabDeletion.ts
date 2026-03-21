/**
 * Deletion and save handlers for Shapes tab (no-op deletes; collapse on save).
 * Keeps ShapesTab.vue under vue-architecture limits. No Vue reactivity used internally.
 */
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'
import type { ShapesTabBaseParams } from '@/types/admin/shapesTabDeletion'


export interface UseShapesTabDeletionReturn {
  handleDeletePartShape: (_id: string) => void
  handleDeleteBlockShape: (_id: string) => void
  handleDeleteAnnotationShape: (_id: string) => void
  handleDeleteEventShape: (_id: string) => void
  handleExistingShapeSaved: (entity: GlobalEntity<GlobalEntityKey>) => void
}

export function useShapesTabDeletion(params: ShapesTabBaseParams): UseShapesTabDeletionReturn {
  const { expandedShapes } = params

  const handleDeletePartShape = (_id: string): void => {
  }

  const handleDeleteBlockShape = (_id: string): void => {
  }

  const handleDeleteAnnotationShape = (_id: string): void => {
  }

  const handleDeleteEventShape = (_id: string): void => {
  }

  const handleExistingShapeSaved = (entity: GlobalEntity<GlobalEntityKey>): void => {
    expandedShapes.value = expandedShapes.value.filter(id => id !== String(entity.id))
  }

  return {
    handleDeletePartShape,
    handleDeleteBlockShape,
    handleDeleteAnnotationShape,
    handleDeleteEventShape,
    handleExistingShapeSaved,
  }
}

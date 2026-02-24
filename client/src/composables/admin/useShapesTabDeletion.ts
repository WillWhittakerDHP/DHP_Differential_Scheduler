/**
 * PATTERN: Deletion and save handlers for Shapes tab (no-op deletes; collapse on save).
 * WHY: Keeps ShapesTab.vue under vue-architecture limits (script size, function count).
 */
import type { Ref } from 'vue'
import type { GlobalEntity, GlobalEntityKey } from '@/types/entities'

export interface UseShapesTabDeletionParams {
  expandedShapes: Ref<string[]>
}

export function useShapesTabDeletion(params: UseShapesTabDeletionParams) {
  const { expandedShapes } = params

  const handleDeletePartShape = (_id: string): void => {
    // No-op: deletion handled by EntityCard/entity CRUD
  }

  const handleDeleteBlockShape = (_id: string): void => {
    // No-op: deletion handled by EntityCard/entity CRUD
  }

  const handleDeleteAnnotationShape = (_id: string): void => {
    // No-op: deletion handled by EntityCard/entity CRUD
  }

  const handleDeleteEventShape = (_id: string): void => {
    // No-op: deletion handled by EntityCard/entity CRUD
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

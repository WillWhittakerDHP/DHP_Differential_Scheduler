/**
 * PATTERN: Deletion and save handlers for Shapes tab (no-op deletes; collapse on save).
 * WHY: Keeps ShapesTab.vue under vue-architecture limits (script size, function count).
 */
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'
import type { ShapesTabBaseParams } from '@/types/admin/shapesTabDeletion'

export type { ShapesTabBaseParams } from '@/types/admin/shapesTabDeletion'

export function useShapesTabDeletion(params: ShapesTabBaseParams) {
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

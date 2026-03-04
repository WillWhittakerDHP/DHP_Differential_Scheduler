/**
 * PATTERN: Composable for shape edit modal handlers
PATTERN: Composable that manage...
 */
import { ref } from 'vue'
import type { UseShapeEditModalOptions, UseShapeEditModalReturn } from '@/types/admin/shapeEditModal'

/**
 * WHY: Composable for managing shape edit modal
WHY: Centralizes shape edit mod...
 */
export function useShapeEditModal(
  options: UseShapeEditModalOptions
): UseShapeEditModalReturn {
  const { expandedBlockShapes } = options

  /**
   */
  const shapeEditModalOpen = ref<Map<string, boolean>>(new Map())

  const toggleShapeEditModal = (blockShapeId: string): void => {
    const current = shapeEditModalOpen.value.get(blockShapeId) || false
    shapeEditModalOpen.value.set(blockShapeId, !current)
  }

  const handleExistingBlockShapeSaved = (shapeId: string): void => {
    shapeEditModalOpen.value.set(shapeId, false)
    expandedBlockShapes.value = expandedBlockShapes.value.filter(id => id !== shapeId)
  }

  return {
    shapeEditModalOpen,
    toggleShapeEditModal,
    handleExistingBlockShapeSaved
  }
}

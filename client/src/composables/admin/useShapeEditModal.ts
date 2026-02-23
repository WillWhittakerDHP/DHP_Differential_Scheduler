/**
 * PATTERN: Composable for shape edit modal handlers
PATTERN: Composable that manage...
 */
import { ref, type Ref } from 'vue'
import type { Ref as VueRef } from 'vue'

export interface UseShapeEditModalOptions {
  expandedBlockShapes: VueRef<string[]>
}

export interface UseShapeEditModalReturn {
  shapeEditModalOpen: Ref<Map<string, boolean>>
  toggleShapeEditModal: (blockShapeId: string) => void
  handleExistingBlockShapeSaved: (shapeId: string) => void
}

/**
 * WHY: Composable for managing shape edit modal
WHY: Centralizes shape edit mod...
 */
export function useShapeEditModal(
  options: UseShapeEditModalOptions
): UseShapeEditModalReturn {
  const { expandedBlockShapes } = options

  /**
   * LEARNING: Shape edit modal state per BlockShape
   */
  const shapeEditModalOpen = ref<Map<string, boolean>>(new Map())

  const toggleShapeEditModal = (blockShapeId: string): void => {
    const current = shapeEditModalOpen.value.get(blockShapeId) || false
    shapeEditModalOpen.value.set(blockShapeId, !current)
  }

  const handleExistingBlockShapeSaved = (shapeId: string): void => {
    shapeEditModalOpen.value.set(shapeId, false)
    // Also collapse the card if it was expanded (for backward compatibility)
    expandedBlockShapes.value = expandedBlockShapes.value.filter(id => id !== shapeId)
  }

  return {
    shapeEditModalOpen,
    toggleShapeEditModal,
    handleExistingBlockShapeSaved
  }
}

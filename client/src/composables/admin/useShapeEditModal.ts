/**
 * Composable for shape edit modal handlers
 * WHY: Extracts shape edit modal handler logic from InstancesTab
 * PATTERN: Composable that manages modal state and handlers
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
 * Composable for managing shape edit modal
 * WHY: Centralizes shape edit modal state and handlers
 * PATTERN: Returns reactive state and handler functions
 */
export function useShapeEditModal(
  options: UseShapeEditModalOptions
): UseShapeEditModalReturn {
  const { expandedBlockShapes } = options

  /**
   * LEARNING: Shape edit modal state per BlockShape
   * WHY: Tracks which BlockShapes have shape edit modal open
   * PATTERN: Map of BlockShape ID to boolean
   */
  const shapeEditModalOpen = ref<Map<string, boolean>>(new Map())

  /**
   * LEARNING: Toggle shape edit modal for a BlockShape
   * WHY: Opens/closes shape edit modal
   * PATTERN: Function that toggles boolean in Map
   */
  const toggleShapeEditModal = (blockShapeId: string): void => {
    const current = shapeEditModalOpen.value.get(blockShapeId) || false
    shapeEditModalOpen.value.set(blockShapeId, !current)
  }

  /**
   * LEARNING: Handle save on existing BlockShape - close modal and refresh
   * WHY: User expects modal to close after saving changes
   * PATTERN: Close modal and let EntityCard handle the save
   * NOTE: MetadataEditModal emits 'saved' with no parameters, so we create a wrapper that captures shapeId
   */
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

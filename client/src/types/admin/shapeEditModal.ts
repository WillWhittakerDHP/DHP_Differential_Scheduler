import type { Ref } from 'vue'

export interface UseShapeEditModalOptions {
  expandedBlockShapes: Ref<string[]>
}

export interface UseShapeEditModalReturn {
  shapeEditModalOpen: Ref<Map<string, boolean>>
  toggleShapeEditModal: (blockShapeId: string) => void
  handleExistingBlockShapeSaved: (shapeId: string) => void
}

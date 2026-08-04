import type { ComputedRef, Ref } from 'vue'
export interface UseInstanceBulkEditReturn {
  bulkEditMode: Ref<Map<string, boolean>>
  bulkEditData: Ref<Map<string, Record<string, unknown>>>
  getBulkEditBaseSqFt: (blockShapeId: string) => ComputedRef<number | undefined>
  getBulkEditData: (blockShapeId: string) => Record<string, unknown>
  toggleBulkEditMode: (blockShapeId: string) => void
  applyBulkEdit: (blockShapeId: string) => Promise<void>
}

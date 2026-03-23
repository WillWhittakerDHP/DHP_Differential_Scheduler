import type { ComputedRef, Ref } from 'vue'
export interface UseInstanceBulkEditReturn {
  bulkEditMode: Ref<Map<string, boolean>>
  bulkEditData: Ref<Map<string, { baseSqFt?: number }>>
  getBulkEditBaseSqFt: (blockShapeId: string) => ComputedRef<number | undefined>
  getBulkEditData: (blockShapeId: string) => { baseSqFt?: number }
  toggleBulkEditMode: (blockShapeId: string) => void
  applyBulkEdit: (blockShapeId: string) => Promise<void>
}

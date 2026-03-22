import type { ComputedRef, Ref } from 'vue'
import type { UseInstanceBlockInstancesByShapeOptions } from '@/types/admin/instanceComposableOptions'

export type UseInstanceBulkEditOptions = UseInstanceBlockInstancesByShapeOptions

export interface UseInstanceBulkEditReturn {
  bulkEditMode: Ref<Map<string, boolean>>
  bulkEditData: Ref<Map<string, { baseSqFt?: number }>>
  getBulkEditBaseSqFt: (blockShapeId: string) => ComputedRef<number | undefined>
  getBulkEditData: (blockShapeId: string) => { baseSqFt?: number }
  toggleBulkEditMode: (blockShapeId: string) => void
  applyBulkEdit: (blockShapeId: string) => Promise<void>
}

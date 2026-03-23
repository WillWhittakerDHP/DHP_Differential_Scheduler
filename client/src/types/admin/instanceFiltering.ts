import type { ComputedRef } from 'vue'
import type { GlobalEntity } from '@/types/entities'
export interface UseInstanceFilteringReturn {
  mainInstancesByShape: ComputedRef<Map<string, GlobalEntity<'blockInstance'>[]>>
  groupedInstancesByShape: ComputedRef<Map<string, GlobalEntity<'blockInstance'>[]>>
  groupedPanelValue: (blockShapeId: string) => string
}

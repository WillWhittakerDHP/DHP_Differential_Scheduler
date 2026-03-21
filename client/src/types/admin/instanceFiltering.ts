import type { ComputedRef } from 'vue'
import type { GlobalEntity } from '@/types/entities'
import type { UseInstanceBlockInstancesByShapeOptions } from '@/types/admin/instanceComposableOptions'

export type UseInstanceFilteringOptions = UseInstanceBlockInstancesByShapeOptions

export interface UseInstanceFilteringReturn {
  mainInstancesByShape: ComputedRef<Map<string, GlobalEntity<'blockInstance'>[]>>
  groupedInstancesByShape: ComputedRef<Map<string, GlobalEntity<'blockInstance'>[]>>
  groupedPanelValue: (blockShapeId: string) => string
}

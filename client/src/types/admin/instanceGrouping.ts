import type { ComputedRef, Ref } from 'vue'
import type { GlobalEntity } from '@/types/entities'

export interface UseInstanceGroupingOptions {
  activeTab?: Ref<string>
}

export interface UseInstanceGroupingReturn {
  sortedBlockShapes: ComputedRef<GlobalEntity<'blockShape'>[]>
  blockInstancesByShape: ComputedRef<Map<string, GlobalEntity<'blockInstance'>[]>>
  blockInstancesCountByShape: ComputedRef<Map<string, number>>
  blockShapeComposable: ComputedRef<Map<string, boolean>>
  blockShapeStateControl: ComputedRef<Map<string, boolean>>
  blockShapeValidCascades: ComputedRef<Map<string, string[]>>
}

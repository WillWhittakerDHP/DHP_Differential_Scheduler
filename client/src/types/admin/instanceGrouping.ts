import type { ComputedRef, MaybeRefOrGetter, Ref } from 'vue'
import type { GlobalEntity } from '@/types/entities'
import type { BlockShapeType } from '@/constants/blockShapeTypes'

export interface UseInstanceGroupingOptions {
  activeTab?: Ref<string>
  /** When set, only these block shape types appear in instance admin lists (domain-tab split). */
  allowedBlockShapeTypes?: MaybeRefOrGetter<readonly BlockShapeType[] | undefined>
  /** Orchestration tab: only block instances with `orchestrator === true` (FEATURE_20 admin acceptance). */
  orchestratorInstancesOnly?: MaybeRefOrGetter<boolean | undefined>
}

export interface UseInstanceGroupingReturn {
  sortedBlockShapes: ComputedRef<GlobalEntity<'blockShape'>[]>
  blockInstancesByShape: ComputedRef<Map<string, GlobalEntity<'blockInstance'>[]>>
  blockInstancesCountByShape: ComputedRef<Map<string, number>>
  blockShapeComposable: ComputedRef<Map<string, boolean>>
  blockShapeStateControl: ComputedRef<Map<string, boolean>>
  blockShapeValidBookingCascades: ComputedRef<Map<string, string[]>>
}

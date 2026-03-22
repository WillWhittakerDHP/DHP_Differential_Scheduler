import type { Ref, ComputedRef } from 'vue'
import type { PerspectiveKey } from '@/types/appointment'

export interface UsePerspectiveMappingParams {
  startTimeType: Ref<'major' | 'minor' | 'nonDifferential'>
}

export interface UsePerspectiveMappingReturn {
  perspective: ComputedRef<PerspectiveKey>
}

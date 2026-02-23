/**
 * PATTERN: usePerspectiveMapping Composable

PATTERN: Composable that provides comp...
 */
import { computed, type ComputedRef, type Ref } from 'vue'
import type { PerspectiveKey } from '@/types/appointment'

export interface UsePerspectiveMappingParams {
  startTimeType: Ref<'major' | 'minor' | 'nonDifferential'>
}

export interface UsePerspectiveMappingReturn {
  perspective: ComputedRef<PerspectiveKey>
}

/**
 * WHY: usePerspectiveMapping composable

WHY: Extracts mapping logic from compo...
 */
export function usePerspectiveMapping(
  params: UsePerspectiveMappingParams
): UsePerspectiveMappingReturn {
  const { startTimeType } = params

  /**
   * PATTERN: Direct mapping since both use same terminology
   */
  const perspective = computed<PerspectiveKey>(() => {
    return startTimeType.value
  })

  return {
    perspective
  }
}

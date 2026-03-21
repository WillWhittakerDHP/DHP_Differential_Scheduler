/**
 * PATTERN: usePerspectiveMapping Composable

PATTERN: Composable that provides comp...
 */
import { computed } from 'vue'
import type { PerspectiveKey } from '@/types/appointment'
import type { UsePerspectiveMappingParams, UsePerspectiveMappingReturn } from '@/types/booking/perspectiveMapping'


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

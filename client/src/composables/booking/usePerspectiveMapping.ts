/**
 * usePerspectiveMapping Composable
 * 
 * LEARNING: Maps startTimeType (UI labels) to PerspectiveKey (logic names)
 * WHY: Extracts perspective mapping logic from AvailabilityStep component
 * PATTERN: Composable that provides computed property for perspective mapping
 */

import { computed, type ComputedRef, type Ref } from 'vue'
import type { PerspectiveKey } from '@/types/appointment'

/**
 * usePerspectiveMapping composable parameters
 */
export interface UsePerspectiveMappingParams {
  /**
   * Start time type (UI labels: 'inspector', 'client', 'nonDifferential')
   */
  startTimeType: Ref<'inspector' | 'client' | 'nonDifferential'>
}

/**
 * usePerspectiveMapping composable return type
 */
export interface UsePerspectiveMappingReturn {
  /**
   * Perspective key (logic names: 'onSite', 'clientPresent', 'nonDifferential')
   * LEARNING: Maps startTimeType to PerspectiveKey
   * WHY: startTimeType uses UI labels, PerspectiveKey uses logic names
   */
  perspective: ComputedRef<PerspectiveKey>
}

/**
 * usePerspectiveMapping composable
 * 
 * LEARNING: Maps startTimeType to PerspectiveKey
 * WHY: Extracts mapping logic from component to composable
 * PATTERN: Composable that returns reactive computed property
 */
export function usePerspectiveMapping(
  params: UsePerspectiveMappingParams
): UsePerspectiveMappingReturn {
  const { startTimeType } = params

  /**
   * LEARNING: Map startTimeType to PerspectiveKey
   * WHY: startTimeType uses UI labels, PerspectiveKey uses logic names
   * PATTERN: Map UI labels to logic keys
   */
  const perspective = computed<PerspectiveKey>(() => {
    if (startTimeType.value === 'inspector') return 'onSite'
    if (startTimeType.value === 'client') return 'clientPresent'
    return 'nonDifferential'
  })

  return {
    perspective
  }
}

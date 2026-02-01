/**
 * useAvailabilitySlotColor Composable
 * 
 * LEARNING: Determines color for appointment slot grid based on start time type
 * WHY: Extracts color selection logic from AvailabilityStep component
 * PATTERN: Composable that provides computed property for slot color
 */

import { computed, type ComputedRef, type Ref } from 'vue'

export interface UseAvailabilitySlotColorParams {
  startTimeType: Ref<'major' | 'minor' | 'nonDifferential'>
}

export interface UseAvailabilitySlotColorReturn {
  /**
   * Color for appointment slot grid
   * LEARNING: Maps startTimeType to Vuetify color prop
   * WHY: Provides visual distinction between major and minor perspectives
   * PATTERN: Minor uses secondary color, major/nonDifferential use primary color
   */
  slotColor: ComputedRef<'primary' | 'secondary'>
}

/**
 * useAvailabilitySlotColor composable
 * 
 * LEARNING: Determines color for appointment slot grid based on start time type
 * WHY: Extracts color selection logic from component to composable
 * PATTERN: Composable that returns reactive computed property
 */
export function useAvailabilitySlotColor(
  params: UseAvailabilitySlotColorParams
): UseAvailabilitySlotColorReturn {
  const { startTimeType } = params

  /**
   * LEARNING: Map startTimeType to color
   * WHY: Minor perspective uses secondary color, major/nonDifferential use primary color
   * PATTERN: Return 'secondary' for minor, 'primary' for major/nonDifferential
   */
  const slotColor = computed<'primary' | 'secondary'>(() => {
    if (startTimeType.value === 'minor') {
      return 'secondary'
    }
    return 'primary'
  })

  return {
    slotColor
  }
}

/**
 * useAvailabilityStepData Composable
 * 
 * LEARNING: Extracts step data aggregation and time slot transformation logic from AvailabilityStep component
 * WHY: Moves data transformation and step data exposure logic to composable
 * PATTERN: Composable that provides computed properties for step data and transformations
 */

import { computed, type Ref } from 'vue'
import type { AppointmentSlot } from '@/types/appointment'
import type { MoveableSchedulingOptions } from '@/types/moveableScheduling'
import {
  buildAvailabilityStepData,
  buildSelectedTimeSlots,
  type AvailabilityStepData,
  type SelectedTimeSlot,
} from '@/utils/booking/availabilityStepData'
import type { ISO8601Date } from '@/types/datetime'

export type { SelectedTimeSlot, AvailabilityStepData }

/**
 * useAvailabilityStepData composable parameters
 */
export interface UseAvailabilityStepDataParams {
  selectedDate: Ref<{ start: ISO8601Date | null; end: ISO8601Date | null }>
  selectedSlot: Ref<AppointmentSlot | null>
  moveableScheduling?: Ref<MoveableSchedulingOptions | null>
}

/**
 * useAvailabilityStepData composable return type
 */
export interface UseAvailabilityStepDataReturn {
  selectedTimeSlots: ComputedRef<SelectedTimeSlot[] | null>
  stepData: ComputedRef<AvailabilityStepData>
}

/**
 * useAvailabilityStepData composable
 * 
 * LEARNING: Provides computed properties for step data aggregation and time slot transformation
 * WHY: Extracts data transformation logic from component to composable
 * PATTERN: Composable that returns reactive computed properties
 */
export function useAvailabilityStepData(params: UseAvailabilityStepDataParams): UseAvailabilityStepDataReturn {
  const {
    selectedDate,
    selectedSlot,
    moveableScheduling
  } = params

  /**
   * LEARNING: Transform selected time slots to API format
   * WHY: Converts AppointmentSlot totals to ISO timestamps with duration for API
   * PATTERN: Computed that transforms AppointmentSlot to API format
   */
  const selectedTimeSlots = computed<SelectedTimeSlot[] | null>(() => {
    return buildSelectedTimeSlots({
      selectedDateStart: selectedDate.value.start,
      selectedSlot: selectedSlot.value,
    })
  })

  /**
   * LEARNING: Step data computed property for exposing to parent wizard
   * WHY: Enables parent to collect availability data for appointment creation
   * PATTERN: Computed ref that exposes step data
   */
  const stepData = computed<AvailabilityStepData>(() =>
    buildAvailabilityStepData({
      selectedDate: selectedDate.value,
      selectedTimeSlots: selectedTimeSlots.value,
      moveableScheduling: moveableScheduling?.value ?? null,
    })
  )

  return {
    selectedTimeSlots,
    stepData
  }
}


/**
 * useAvailabilityStepData Composable
 * 
 * LEARNING: Extracts step data aggregation and time slot transformation logic from AvailabilityStep component
 * WHY: Moves data transformation and step data exposure logic to composable
 * PATTERN: Composable that provides computed properties for step data and transformations
 */

import { computed, type Ref, type ComputedRef } from 'vue'
import type { TimeSlot } from '@/types/appointment'
import {
  buildAvailabilityStepData,
  buildSelectedTimeSlots,
  type AvailabilityStepData,
  type SelectedTimeSlot,
} from '@/utils/booking/availabilityStepData'

export type { SelectedTimeSlot, AvailabilityStepData }

/**
 * useAvailabilityStepData composable parameters
 */
export interface UseAvailabilityStepDataParams {
  selectedDate: Ref<{ start: string | null; end: string | null }>
  inspectorTimeSlot: Ref<TimeSlot | null>
  clientTimeSlot: Ref<TimeSlot | null>
  onSiteTotal: ComputedRef<number>
  presentationDuration: ComputedRef<number>
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
    inspectorTimeSlot,
    clientTimeSlot,
    onSiteTotal,
    presentationDuration
  } = params

  /**
   * LEARNING: Transform selected time slots to API format
   * WHY: Converts TimeSlot objects to ISO timestamps with duration for API
   * PATTERN: Computed that transforms TimeSlot objects to API format
   */
  const selectedTimeSlots = computed<SelectedTimeSlot[] | null>(() => {
    return buildSelectedTimeSlots({
      selectedDateStart: selectedDate.value.start,
      inspectorTimeSlot: inspectorTimeSlot.value,
      clientTimeSlot: clientTimeSlot.value,
      onSiteTotal: onSiteTotal.value,
      presentationDuration: presentationDuration.value,
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
    })
  )

  return {
    selectedTimeSlots,
    stepData
  }
}


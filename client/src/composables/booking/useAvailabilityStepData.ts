/**
 * WHY: useAvailabilityStepData Composable

WHY: Moves data transformation and s...
 */
import { computed, type ComputedRef, type Ref } from 'vue'
import type { MoveableSchedulingOptions } from '@/types/moveableScheduling'
import {
  buildAvailabilityStepData,
  buildSelectedTimeSlots,
  type AvailabilityStepData,
  type SelectedTimeSlot,
} from '@/utils/booking/availabilityStepData'
import type { AvailabilityStepParamsBase } from '@/types/availabilityStepParams'

export type { SelectedTimeSlot, AvailabilityStepData }

/** Extends shared base (P2 type-similarity). */
export interface UseAvailabilityStepDataParams extends AvailabilityStepParamsBase {
  moveableScheduling?: Ref<MoveableSchedulingOptions | null>
}

export interface UseAvailabilityStepDataReturn {
  selectedTimeSlots: ComputedRef<SelectedTimeSlot[] | null>
  stepData: ComputedRef<AvailabilityStepData>
}

/**
 * WHY: useAvailabilityStepData composable

WHY: Extracts data transformation lo...
 */
export function useAvailabilityStepData(params: UseAvailabilityStepDataParams): UseAvailabilityStepDataReturn {
  const {
    selectedDate,
    selectedSlot,
    moveableScheduling
  } = params


  /**
   * WHY: /**
LEARNING: Transform selected time slots to API format
WHY: Converts ...
   */
  const selectedTimeSlots = computed<SelectedTimeSlot[] | null>(() => {
    return buildSelectedTimeSlots({
      selectedDateStart: selectedDate.value.start,
      selectedSlot: selectedSlot.value,
    })
  })

  /**
   */
  const stepData = computed<AvailabilityStepData>(() =>
    buildAvailabilityStepData({
      candidateDate: selectedDate.value,
      candidateTimeSlots: selectedTimeSlots.value,
      moveableScheduling: moveableScheduling?.value ?? null,
    })
  )

  return {
    selectedTimeSlots,
    stepData
  }
}


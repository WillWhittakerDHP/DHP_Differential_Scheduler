/**
 * WHY: useAvailabilityStepData Composable

WHY: Moves data transformation and s...
 */
import { computed } from 'vue'
import { buildAvailabilityStepData, buildSelectedTimeSlots } from '@/utils/booking/availabilityStepData'
import type {
  SelectedTimeSlot,
  AvailabilityStepData,
  UseAvailabilityStepDataParams,
  UseAvailabilityStepDataReturn,
} from '@/types/booking/availabilityStepData'

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

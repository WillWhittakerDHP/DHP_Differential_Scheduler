/**
 * WHY: useAvailabilityStepData Composable

WHY: Moves data transformation and s...
 */
import { computed } from 'vue'
import {
  buildAvailabilityStepData,
  buildSelectedTimeSlots,
  totalDriveMinutesFromAppointmentSlot,
} from '@/utils/booking/availabilityStepData'
import type { SlotTimeBounds } from '@shared/types/availabilityTypes'
import type {
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
    minimizerScheduling
  } = params

  const selectedTimeSlots = computed<SlotTimeBounds[] | null>(() => {
    return buildSelectedTimeSlots({
      selectedDateStart: selectedDate.value.start,
      selectedSlot: selectedSlot.value,
    })
  })

  const totalDriveMinutes = computed(() => totalDriveMinutesFromAppointmentSlot(selectedSlot.value))

  /**
   */
  const stepData = computed<AvailabilityStepData>(() =>
    buildAvailabilityStepData({
      candidateDate: selectedDate.value,
      candidateTimeSlots: selectedTimeSlots.value,
      minimizerScheduling: minimizerScheduling?.value ?? null,
      totalDriveMinutes: totalDriveMinutes.value,
    })
  )

  return {
    selectedTimeSlots,
    stepData
  }
}

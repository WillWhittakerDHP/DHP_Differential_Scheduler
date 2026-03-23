/**
 * PATTERN: useAvailabilityDevPanel Composable

PATTERN: Singleton pattern with shar...
 */
import { computed, ref, type ComputedRef, type Ref } from 'vue'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { AppointmentSlot, AppointmentShape } from '@/types/appointment'
import type { RFC3339DateTime } from '@shared/types/primitiveBrands'
import type { BusyTimeRange } from '@shared/types/availabilityTypes'
import type { UseAvailabilityDevPanelParams } from '@/types/booking/availabilityDevPanel'
import type { MoveableSchedulingWindow } from '@/types/booking/moveableSchedulingWindow'

/**
 * WHY: Shared dev panel data state
 */
const sharedDevPanelData = ref<{
  selectedBlockInstances?: ComputedRef<BookingBlockInstance[]>
  appointmentSlots?: ComputedRef<AppointmentSlot[]>
  appointmentShape?: ComputedRef<AppointmentShape | null>
  selectedDate?: ComputedRef<string | undefined>
  selectedTime?: ComputedRef<string | undefined>
  dateRange?: ComputedRef<{ start: RFC3339DateTime; end: RFC3339DateTime } | null>
  busyPeriods?: Ref<BusyTimeRange[]> | ComputedRef<BusyTimeRange[]>
  refreshKey?: Ref<number>
  isEffectivelyDifferential?: ComputedRef<boolean>
  moveableSchedulingWindow?: ComputedRef<MoveableSchedulingWindow | null>
}>({})

/**
 * WHY: useAvailabilityDevPanel composable - sets dev panel data

WHY: Allows Av...
 */
export function useAvailabilityDevPanel(
  params: UseAvailabilityDevPanelParams
): void {
  const {
    selectedBlockInstances,
    appointmentSlots,
    appointmentShape,
    selectedDate,
    selectedSlot,
    dateRange,
    busyPeriods,
    refreshKey,
    isEffectivelyDifferential,
    moveableSchedulingWindow,
  } = params

  // PATTERN: Update shared refs that can be accessed from anywhere
  sharedDevPanelData.value = {
    selectedBlockInstances,
    appointmentSlots,
    appointmentShape,
    selectedDate: computed(() => selectedDate.value.start ?? undefined),
    selectedTime: computed(() => {
      if (!selectedSlot.value) {
        return undefined
      }
      if (!selectedSlot.value.totalTimeRange) {
        return undefined
      }
      return selectedSlot.value.totalTimeRange.startTime
    }),
    dateRange,
    busyPeriods,
    refreshKey,
    isEffectivelyDifferential,
    ...(moveableSchedulingWindow !== undefined ? { moveableSchedulingWindow } : {}),
  }
}

type UseDevPanelDataReturn = typeof sharedDevPanelData

export function useDevPanelData(): UseDevPanelDataReturn {
  return sharedDevPanelData
}

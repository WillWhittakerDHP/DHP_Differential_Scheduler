/**
 * PATTERN: useAvailabilityDevPanel Composable

PATTERN: Singleton pattern with shar...
 */
import { computed, ref, type ComputedRef, type Ref } from 'vue'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { AppointmentSlot, AppointmentShape } from '@/types/appointment'
import type { RFC3339DateTime, ISO8601Date } from '@shared/types/primitiveBrands'
import type { BusyTimeRange } from '@shared/types/availabilityTypes'

/**
 * WHY: Shared dev panel data state
LEARNING: Singleton pattern for shared state
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
}>({})

export interface UseAvailabilityDevPanelParams {
  selectedBlockInstances: ComputedRef<BookingBlockInstance[]>
  
  appointmentSlots: ComputedRef<AppointmentSlot[]>
  
  appointmentShape: ComputedRef<AppointmentShape | null>
  
  selectedDate: Ref<{ start: ISO8601Date | null; end: ISO8601Date | null }>
  
  selectedSlot: Ref<AppointmentSlot | null>
  
  dateRange: ComputedRef<{ start: RFC3339DateTime; end: RFC3339DateTime } | null>
  
  busyPeriods: Ref<BusyTimeRange[]> | ComputedRef<BusyTimeRange[]>
  
  refreshKey: Ref<number>
  
  /** Effective differential state - matches what the grid uses */
  isEffectivelyDifferential: ComputedRef<boolean>
}

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
    isEffectivelyDifferential
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
    isEffectivelyDifferential
  }
}

/**
 * useDevPanelData composable - gets dev panel data
 * 
 */
export function useDevPanelData() {
  return sharedDevPanelData
}

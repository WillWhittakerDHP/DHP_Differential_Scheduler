/**
 * useAvailabilityDevPanel Composable
 * 
 * LEARNING: Manages shared dev panel data for floating debug panels
 * WHY: Provides a shared state that both AvailabilityStep and DevPanelsContainer can access
 * PATTERN: Singleton pattern with shared refs that can be updated and accessed from anywhere
 */

import { computed, ref, type ComputedRef, type Ref } from 'vue'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { AppointmentSlot } from '@/types/appointment'
import type { RFC3339DateTime } from '@/types/datetime'
import type { BusyTimeRange } from '@/utils/booking/timeSlotFitter'
import type { ISO8601Date } from '@/types/datetime'

/**
 * Shared dev panel data state
 * LEARNING: Singleton pattern for shared state
 * WHY: Allows both AvailabilityStep and DevPanelsContainer to access the same data
 * PATTERN: Module-level refs that can be updated and accessed from any component
 */
const sharedDevPanelData = ref<{
  selectedBlockInstances?: ComputedRef<BookingBlockInstance[]>
  appointmentSlots?: ComputedRef<AppointmentSlot[]>
  selectedDate?: ComputedRef<string | undefined>
  selectedTime?: ComputedRef<string | undefined>
  dateRange?: ComputedRef<{ start: RFC3339DateTime; end: RFC3339DateTime } | null>
  busyPeriods?: ComputedRef<BusyTimeRange[]>
  refreshKey?: Ref<number>
}>({})

/**
 * useAvailabilityDevPanel composable parameters
 */
export interface UseAvailabilityDevPanelParams {
  /**
   * Selected block instances
   */
  selectedBlockInstances: ComputedRef<BookingBlockInstance[]>
  
  /**
   * Appointment slots
   */
  appointmentSlots: ComputedRef<AppointmentSlot[]>
  
  /**
   * Selected date
   */
  selectedDate: Ref<{ start: ISO8601Date | null; end: ISO8601Date | null }>
  
  /**
   * Selected slot
   */
  selectedSlot: Ref<AppointmentSlot | null>
  
  /**
   * Date range for API
   */
  dateRange: ComputedRef<{ start: RFC3339DateTime; end: RFC3339DateTime } | null>
  
  /**
   * Busy periods
   */
  busyPeriods: ComputedRef<BusyTimeRange[]>
  
  /**
   * Refresh key for mock calendar data
   */
  refreshKey: Ref<number>
}

/**
 * useAvailabilityDevPanel composable - sets dev panel data
 * 
 * LEARNING: Updates shared dev panel data from AvailabilityStep
 * WHY: Allows AvailabilityStep to update shared state that DevPanelsContainer can read
 * PATTERN: Function that updates shared refs
 */
export function useAvailabilityDevPanel(
  params: UseAvailabilityDevPanelParams
): void {
  const {
    selectedBlockInstances,
    appointmentSlots,
    selectedDate,
    selectedSlot,
    dateRange,
    busyPeriods,
    refreshKey
  } = params

  // LEARNING: Update shared dev panel data
  // WHY: Makes data available to DevPanelsContainer which is rendered at App level
  // PATTERN: Update shared refs that can be accessed from anywhere
  sharedDevPanelData.value = {
    selectedBlockInstances,
    appointmentSlots,
    selectedDate: computed(() => selectedDate.value.start ?? undefined),
    selectedTime: computed(() => {
      if (!selectedSlot.value) {
        return undefined
      }
      if (!selectedSlot.value.totalTime) {
        return undefined
      }
      return selectedSlot.value.totalTime.startTime
    }),
    dateRange,
    busyPeriods,
    refreshKey
  }
}

/**
 * useDevPanelData composable - gets dev panel data
 * 
 * LEARNING: Provides access to shared dev panel data
 * WHY: Allows DevPanelsContainer to read the data set by AvailabilityStep
 * PATTERN: Returns shared ref that components can access
 */
export function useDevPanelData() {
  return sharedDevPanelData
}

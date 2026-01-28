/**
 * useAvailabilityDevPanel Composable
 * 
 * LEARNING: Provides dev panel data for floating debug panels
 * WHY: Extracts dev panel data providing logic from AvailabilityStep component
 * PATTERN: Composable that provides reactive computed object via provide
 */

import { computed, provide, type ComputedRef, type Ref } from 'vue'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { AppointmentSlot } from '@/types/appointment'
import type { RFC3339DateTime } from '@/types/datetime'
import type { BusyTimeRange } from '@/utils/booking/timeSlotFitter'
import type { ISO8601Date } from '@/types/datetime'

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
 * useAvailabilityDevPanel composable
 * 
 * LEARNING: Provides dev panel data for floating debug panels
 * WHY: Extracts dev panel data providing logic from component to composable
 * PATTERN: Composable that provides reactive computed object via provide
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

  // LEARNING: Provide dev panel data for floating debug panels
  // WHY: Allows DevPanelsContainer to access availability step data without prop drilling
  // PATTERN: Provide reactive computed object with all needed data
  provide('devPanelData', {
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
  })
}

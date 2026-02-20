/**
 * useAvailabilityDevPanel Composable
 * 
 * LEARNING: Manages shared dev panel data for floating debug panels
 * WHY: Provides a shared state that both AvailabilityStep and DevPanelsContainer can access
 * PATTERN: Singleton pattern with shared refs that can be updated and accessed from anywhere
 */

import { computed, ref, type ComputedRef, type Ref } from 'vue'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { AppointmentSlot, AppointmentShape } from '@/types/appointment'
import type { RFC3339DateTime, ISO8601Date } from '@shared/types/primitiveBrands'
import type { BusyTimeRange } from '@shared/types/availabilityTypes'

/**
 * Shared dev panel data state
 * LEARNING: Singleton pattern for shared state
 * WHY: Allows both AvailabilityStep and DevPanelsContainer to access the same data
 * PATTERN: Module-level refs that can be updated and accessed from any component
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
  
  /** Session 2.1.2: Accept Ref or ComputedRef for busy periods */
  busyPeriods: Ref<BusyTimeRange[]> | ComputedRef<BusyTimeRange[]>
  
  refreshKey: Ref<number>
  
  /** Effective differential state - matches what the grid uses */
  isEffectivelyDifferential: ComputedRef<boolean>
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
 * LEARNING: Provides access to shared dev panel data
 * WHY: Allows DevPanelsContainer to read the data set by AvailabilityStep
 * PATTERN: Returns shared ref that components can access
 */
export function useDevPanelData() {
  return sharedDevPanelData
}

import type { ComputedRef } from 'vue'
import type { BookingData } from '@/types/transformers/bookingData'
import type { UseWizardSettingsReturn } from '@/types/admin/wizardSettings'
import type { UseBookingAvailabilitySettingsReturn } from '@/types/booking/availabilitySettings'

/** Which sub-pipeline is still blocking `isBookingFlowReady` (debug / logging). */
export type BookingFlowPhase = 'global' | 'transform' | 'wizard' | 'availability'

/** Decomposed readiness for the booking wizard shell (global + transform + settings). */
export interface BookingFlowReadiness {
  globalHydrated: boolean
  transformOk: boolean
  wizardSettingsReady: boolean
  availabilitySettled: boolean
}

/**
 * Orchestrates structural booking data (`useBooking`) with wizard and availability settings loads.
 *
 * NOTE: Other components may still call `useAvailabilitySettings()` separately (separate Vue state).
 * `availabilitySettled` / `isBookingFlowReady` reflect only this composable’s availability instance.
 * Phase 2 (optional): dedupe via shared ref or single-flight in `getAvailabilitySettings` (see plan).
 */
export interface UseBookingFlowReturn {
  bookingData: ComputedRef<BookingData | null>
  /** True when global query finished successfully with data (not loading, has `globalData`). */
  globalReady: ComputedRef<boolean>
  wizardSettings: UseWizardSettingsReturn
  /** This composable’s availability slice (readiness metrics); not the only consumer of GET availability. */
  availability: UseBookingAvailabilitySettingsReturn
  readiness: ComputedRef<BookingFlowReadiness>
  isBookingFlowReady: ComputedRef<boolean>
  /** First blocking issue: global query error, availability load error, or null if none surfaced here. */
  bookingFlowError: ComputedRef<Error | null>
}

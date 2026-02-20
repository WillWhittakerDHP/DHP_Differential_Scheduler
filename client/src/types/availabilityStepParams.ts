/**
 * Availability Step Param Bases (P2 type-similarity)
 *
 * LEARNING: Shared param shapes for availability step composables.
 * WHY: UseAvailabilityStepDataParams and UseAvailabilityValidationParams share selectedDate/selectedSlot.
 */

import type { Ref } from 'vue'
import type { AppointmentSlot } from '@/types/appointment'
import type { ISO8601Date } from '@shared/types/primitiveBrands'

/** Base params shared by availability step data and validation composables. */
export interface AvailabilityStepParamsBase {
  selectedDate: Ref<{ start: ISO8601Date | null; end: ISO8601Date | null }>
  selectedSlot: Ref<AppointmentSlot | null>
}

import type { Ref, ComputedRef } from 'vue'
import type { TimeSlot } from '@/types/appointment'
import type { WizardStateData } from '@/utils/transformers/appointmentToWizardTransformer'
import type { ISO8601Date } from '@shared/types/primitiveBrands'
import type { AvailabilityStepData } from '@/types/booking/availabilityStepData'

export interface UseAvailabilityDefaultsOptions {
  loadedWizardState: Ref<WizardStateData | null>
  timeSlots: ComputedRef<TimeSlot[] | null>
  isDifferentialService: ComputedRef<boolean>
  /** Parent step data to restore when returning to step (wizard persistence). */
  restoreFrom?: Ref<AvailabilityStepData | null>
}

export interface UseAvailabilityDefaultsReturn {
  selectedDate: Ref<{ start: ISO8601Date | null; end: ISO8601Date | null }>
  startTimeType: Ref<'major' | 'minor' | 'nonDifferential'>
  appointmentSlotOrderIndex: Ref<number | null>
}

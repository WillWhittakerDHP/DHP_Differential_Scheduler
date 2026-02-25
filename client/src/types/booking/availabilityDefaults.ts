import type { Ref, ComputedRef } from 'vue'
import type { TimeSlot } from '@/types/appointment'
import type { WizardStateData } from '@/utils/transformers/appointmentToWizardTransformer'
import type { ISO8601Date } from '@shared/types/primitiveBrands'

export interface UseAvailabilityDefaultsOptions {
  loadedWizardState: Ref<WizardStateData | null>
  timeSlots: ComputedRef<TimeSlot[] | null>
  isDifferentialService: ComputedRef<boolean>
}

export interface UseAvailabilityDefaultsReturn {
  selectedDate: Ref<{ start: ISO8601Date | null; end: ISO8601Date | null }>
  startTimeType: Ref<'major' | 'minor' | 'nonDifferential'>
  appointmentSlotOrderIndex: Ref<number | null>
}

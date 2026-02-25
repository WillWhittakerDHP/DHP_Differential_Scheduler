import type { Ref } from 'vue'
import type { DisplayedMonth } from '@/composables/booking/useDateRangeDecider'
import type { UseComputedAvailabilityReturn } from '@/composables/booking/useComputedAvailability'
import type { UseBookingWizardReturn } from '@/types/wizard'
import type { WizardStateData } from '@/utils/transformers/appointmentToWizardTransformer'

export interface UseAvailabilityOrchestratorParams {
  wizard: UseBookingWizardReturn
  loadedWizardState: Ref<WizardStateData | null>
  computedAvailability: UseComputedAvailabilityReturn
  propertyDetailsStepData: Ref<{ squareFootage?: number | null; bedrooms?: number | null; bathrooms?: number | null; foundationAccess?: 'basement' | 'crawlspace' | 'slab' | null; additionalUnits?: number | null; [key: string]: unknown } | null>
  displayedMonth: Ref<DisplayedMonth>
  updateDisplayedMonth: (month: DisplayedMonth) => void
  appointmentDurationRef: Ref<number | null>
}

import type { useBookingWizardStepValidators } from '@/composables/booking/useBookingWizardStepValidators'
import type { UseWizardValidationReturn } from '@/types/booking/wizardValidation'
import type { UseBookingWizardReturn } from '@/types/wizard'
import type { UseWizardStepDataRefsReturn } from '@/types/booking/wizardStepDataRefs'

export interface UseWizardStepValidationParams {
  stepDataRefs: UseWizardStepDataRefsReturn
  wizard: UseBookingWizardReturn
}

export interface UseWizardStepValidationReturn {
  stepValidators: ReturnType<typeof useBookingWizardStepValidators>['stepValidators']
  validateStep: UseWizardValidationReturn['validateStep']
}

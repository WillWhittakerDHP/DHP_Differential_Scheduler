import type { useBookingWizardStepValidators } from '@/composables/booking/useBookingWizardStepValidators'
import type { useBookingWizard } from '@/composables/booking/useBookingWizard'
import type { UseWizardValidationReturn } from '@/types/booking/wizardValidation'

import type { UseWizardStepDataRefsReturn } from '@/types/booking/wizardStepDataRefs'
export interface UseWizardStepValidationParams {
  stepDataRefs: UseWizardStepDataRefsReturn
  wizard: ReturnType<typeof useBookingWizard>
}

export interface UseWizardStepValidationReturn {
  stepValidators: ReturnType<typeof useBookingWizardStepValidators>['stepValidators']
  validateStep: UseWizardValidationReturn['validateStep']
}

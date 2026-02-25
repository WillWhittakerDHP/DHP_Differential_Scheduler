import type { UseWizardStepDataRefsReturn } from '@/composables/booking/useWizardStepDataRefs'
import type { useBookingWizardStepValidators } from '@/composables/booking/useBookingWizardStepValidators'
import type { useBookingWizard } from '@/composables/booking/useBookingWizard'
import type { UseWizardValidationReturn } from '@/types/booking/wizardValidation'

export interface UseWizardStepValidationParams {
  stepDataRefs: UseWizardStepDataRefsReturn
  wizard: ReturnType<typeof useBookingWizard>
}

export interface UseWizardStepValidationReturn {
  stepValidators: ReturnType<typeof useBookingWizardStepValidators>['stepValidators']
  validateStep: UseWizardValidationReturn['validateStep']
}

/**
 * PATTERN: Step validators and validateStep for booking wizard (combines step validators + validation).
 * WHY: Keeps BookingWizard.vue under vue-architecture script line limit.
 */
import type { UseWizardStepDataRefsReturn } from '@/composables/booking/useWizardStepDataRefs'
import { useBookingWizardStepValidators } from '@/composables/booking/useBookingWizardStepValidators'
import { useWizardValidation, type UseWizardValidationReturn } from '@/composables/booking/useWizardValidation'
import type { useBookingWizard } from '@/composables/booking/useBookingWizard'

export interface UseWizardStepValidationParams {
  stepDataRefs: UseWizardStepDataRefsReturn
  wizard: ReturnType<typeof useBookingWizard>
}

export function useWizardStepValidation(
  params: UseWizardStepValidationParams
): { stepValidators: ReturnType<typeof useBookingWizardStepValidators>['stepValidators']; validateStep: UseWizardValidationReturn['validateStep'] } {
  const { stepDataRefs, wizard } = params
  const { stepValidators } = useBookingWizardStepValidators({
    selectedUserTypeBlock: wizard.selectedUserTypeBlock,
    selectedServiceTypeBlocks: wizard.selectedServiceTypeBlocks,
    propertyDetailsStepValid: stepDataRefs.propertyDetailsStepValid,
    propertyDetailsStepValidate: stepDataRefs.propertyDetailsStepValidate,
    availabilityStepValid: stepDataRefs.availabilityStepValid,
    availabilityStepValidate: stepDataRefs.availabilityStepValidate,
    contactsStepValid: stepDataRefs.contactsStepValid,
    contactsStepValidate: stepDataRefs.contactsStepValidate,
    confirmationStepValid: stepDataRefs.confirmationStepValid,
    confirmationStepValidate: stepDataRefs.confirmationStepValidate,
  })
  const { validateStep } = useWizardValidation({ stepValidators })
  return { stepValidators, validateStep }
}

/**
 * PATTERN: Step validators and validateStep for booking wizard (combines step validators + validation).
 * WHY: Keeps BookingWizard.vue under vue-architecture script line limit.
 */
import { useBookingWizardStepValidators } from '@/composables/booking/useBookingWizardStepValidators'
import { useWizardValidation } from '@/composables/booking/useWizardValidation'
import type {
  UseWizardStepValidationParams,
  UseWizardStepValidationReturn,
} from '@/types/booking/wizardStepValidation'

export type {
  UseWizardStepValidationParams,
  UseWizardStepValidationReturn,
} from '@/types/booking/wizardStepValidation'

export function useWizardStepValidation(
  params: UseWizardStepValidationParams
): UseWizardStepValidationReturn {
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

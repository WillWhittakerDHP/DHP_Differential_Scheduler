import type { StepValidator } from '@/composables/booking/useWizardValidation'

export type BuildBookingWizardStepValidatorsOptions = {
  hasServiceSelection: boolean
  propertyDetailsStepValidate: (() => boolean) | null
  propertyDetailsStepValid: boolean | null
  availabilityStepValidate: (() => boolean) | null
  availabilityStepValid: boolean | null
  contactsStepValidate: (() => boolean) | null
  contactsStepValid: boolean | null
  confirmationStepValidate?: (() => boolean) | null
  confirmationStepValid?: boolean | null
}

/**
 * Build the step validator map for BookingWizard.
 *
 * LEARNING: Keep the mapping pure so the composable only wires refs/computed.
 * NOTE: Step indices match `configs/wizardSteps.ts`.
 */
export function buildBookingWizardStepValidators(
  options: BuildBookingWizardStepValidatorsOptions
): Record<number, StepValidator | null> {
  return {
    0: () => options.hasServiceSelection,
    1: () => {
      if (options.propertyDetailsStepValidate) return options.propertyDetailsStepValidate()
      if (options.propertyDetailsStepValid !== null) return options.propertyDetailsStepValid
      return false
    },
    2: () => {
      if (options.availabilityStepValidate) return options.availabilityStepValidate()
      if (options.availabilityStepValid !== null) return options.availabilityStepValid
      return false
    },
    3: () => {
      if (options.contactsStepValidate) return options.contactsStepValidate()
      if (options.contactsStepValid !== null) return options.contactsStepValid
      return false
    },
    4: () => {
      if (options.confirmationStepValidate) return options.confirmationStepValidate()
      if (options.confirmationStepValid !== undefined && options.confirmationStepValid !== null) return options.confirmationStepValid
      return true
    },
  }
}



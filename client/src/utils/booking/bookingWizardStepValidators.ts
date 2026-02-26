import type { BuildBookingWizardStepValidatorsOptions } from '@/types/booking/bookingWizardStepValidators'

import type { StepValidator } from '@/types/booking/wizardValidation'
export type { BuildBookingWizardStepValidatorsOptions } from '@/types/booking/bookingWizardStepValidators'

/**
 * WHY: Build the step validator map for BookingWizard
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



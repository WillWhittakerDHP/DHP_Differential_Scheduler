import { computed, type ComputedRef, type Ref } from 'vue'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { StepValidator } from '@/composables/booking/useWizardValidation'
import {
  buildBookingWizardStepValidators,
  type BuildBookingWizardStepValidatorsOptions,
} from '@/utils/booking/bookingWizardStepValidators'

export interface BookingWizardStepValidators {
  stepValidators: ComputedRef<Record<number, StepValidator | null>>
}

export interface UseBookingWizardStepValidatorsOptions {
  selectedUserTypeBlock: Ref<BookingBlockInstance | null>
  selectedServiceTypeBlocks: Ref<BookingBlockInstance[]>

  propertyDetailsStepValid: Ref<boolean> | null
  propertyDetailsStepValidate: Ref<(() => boolean) | null> | (() => boolean) | null

  availabilityStepValid: Ref<boolean> | null
  availabilityStepValidate: Ref<(() => boolean) | null> | (() => boolean) | null

  contactsStepValid: Ref<boolean> | null
  contactsStepValidate: Ref<(() => boolean) | null> | (() => boolean) | null

  confirmationStepValid?: Ref<boolean> | null
  confirmationStepValidate?: Ref<(() => boolean) | null> | (() => boolean) | null
}

export function useBookingWizardStepValidators(
  options: UseBookingWizardStepValidatorsOptions
): BookingWizardStepValidators {
  const {
    selectedUserTypeBlock,
    selectedServiceTypeBlocks,
    propertyDetailsStepValid,
    propertyDetailsStepValidate,
    availabilityStepValid,
    availabilityStepValidate,
    contactsStepValid,
    contactsStepValidate,
    confirmationStepValid,
    confirmationStepValidate,
  } = options

  const stepValidators = computed<Record<number, StepValidator | null>>(() => {
    // Unwrap validate functions if they're refs
    const propertyDetailsStepValidateFn = propertyDetailsStepValidate
      ? ('value' in propertyDetailsStepValidate 
          ? propertyDetailsStepValidate.value 
          : propertyDetailsStepValidate)
      : null
    const availabilityStepValidateFn = availabilityStepValidate
      ? ('value' in availabilityStepValidate 
          ? availabilityStepValidate.value 
          : availabilityStepValidate)
      : null
    const contactsStepValidateFn = contactsStepValidate
      ? ('value' in contactsStepValidate 
          ? contactsStepValidate.value 
          : contactsStepValidate)
      : null
    const confirmationStepValidateFn = confirmationStepValidate
      ? ('value' in confirmationStepValidate 
          ? confirmationStepValidate.value 
          : confirmationStepValidate)
      : null

    const validatorOptions: BuildBookingWizardStepValidatorsOptions = {
      hasServiceSelection: !!(selectedUserTypeBlock.value && selectedServiceTypeBlocks.value.length > 0),
      propertyDetailsStepValidate: propertyDetailsStepValidateFn,
      propertyDetailsStepValid: propertyDetailsStepValid ? propertyDetailsStepValid.value : null,
      availabilityStepValidate: availabilityStepValidateFn,
      availabilityStepValid: availabilityStepValid ? availabilityStepValid.value : null,
      contactsStepValidate: contactsStepValidateFn,
      contactsStepValid: contactsStepValid ? contactsStepValid.value : null,
      confirmationStepValidate: confirmationStepValidateFn ?? null,
      confirmationStepValid: confirmationStepValid ? confirmationStepValid.value : null,
    }
    return buildBookingWizardStepValidators(validatorOptions)
  })

  return { stepValidators }
}



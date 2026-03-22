import type { Ref, ComputedRef } from 'vue'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { StepValidator } from '@/types/booking/wizardValidation'

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

export interface UseBookingWizardStepValidatorsOptions {
  selectedUserTypeBlock: Ref<BookingBlockInstance | null>
  selectedServiceTypeBlocks: Ref<BookingBlockInstance[]>
  propertyDetailsStepValid: Ref<boolean>
  propertyDetailsStepValidate: Ref<(() => boolean) | null>
  availabilityStepValid: Ref<boolean>
  availabilityStepValidate: Ref<(() => boolean) | null>
  contactsStepValid: Ref<boolean>
  contactsStepValidate: Ref<(() => boolean) | null>
  confirmationStepValid?: Ref<boolean>
  confirmationStepValidate?: Ref<(() => boolean) | null>
}

export interface BookingWizardStepValidators {
  stepValidators: ComputedRef<Record<number, StepValidator | null>>
}

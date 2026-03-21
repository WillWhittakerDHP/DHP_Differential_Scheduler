import type { Ref } from 'vue'
import type { PropertyDetailsStepData } from '@/types/wizard'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'

export interface UseWizardValidationErrorsOptions {
  activeStep: Ref<number>
  validateStep: (stepIndex: number) => boolean
  baseHandleNext: () => void
  showError: (message: string) => void
  propertyDetailsStepData: Ref<PropertyDetailsStepData | null>
  propertyDetailsStepValidate: Ref<(() => boolean) | null>
  propertyDetailsFieldErrors: Ref<Record<string, string>>
  contactsStepValidate: Ref<(() => boolean) | null>
  availabilityStepValidate: Ref<(() => boolean) | null>
  selectedPropertyTypeBlocks: Ref<BookingBlockInstance[]>
}

export interface UseWizardValidationErrorsReturn {
  handleNext: () => Promise<void>
}

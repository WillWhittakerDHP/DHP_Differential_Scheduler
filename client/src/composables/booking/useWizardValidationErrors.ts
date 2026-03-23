/**
 * PATTERN: Composable for handling validation errors with user-friendly messages

U...
 */
import { nextTick } from 'vue'
import type {
  UseWizardValidationErrorsOptions,
  UseWizardValidationErrorsReturn,
} from '@/types/booking/wizardValidationErrors'
import { resolveWizardStep1ErrorMessage } from '@/utils/booking/wizardStep1ValidationMessages'

const GENERIC_STEP_ERROR = 'Please complete all required fields before continuing'

export function useWizardValidationErrors(
  options: UseWizardValidationErrorsOptions
): UseWizardValidationErrorsReturn {
  const {
    activeStep,
    validateStep,
    baseHandleNext,
    showError,
    propertyDetailsStepData,
    propertyDetailsStepValidate,
    propertyDetailsFieldErrors,
    contactsStepValidate,
    availabilityStepValidate,
    selectedPropertyTypeBlocks,
  } = options

  const runStepValidators = async (step: number): Promise<void> => {
    if (step === 1 && propertyDetailsStepValidate.value) {
      propertyDetailsStepValidate.value()
      await nextTick()
      return
    }
    if (step === 2 && availabilityStepValidate.value) {
      availabilityStepValidate.value()
      return
    }
    if (step === 3 && contactsStepValidate.value) {
      contactsStepValidate.value()
    }
  }

  const handleNext = async (): Promise<void> => {
    const isValid = validateStep(activeStep.value)
    if (isValid) {
      baseHandleNext()
      return
    }

    await runStepValidators(activeStep.value)

    if (activeStep.value === 1) {
      showError(
        resolveWizardStep1ErrorMessage({
          propertyDetailsFieldErrors,
          propertyDetailsStepData,
          selectedPropertyTypeBlocks,
        })
      )
      return
    }

    showError(GENERIC_STEP_ERROR)
  }

  return {
    handleNext,
  }
}

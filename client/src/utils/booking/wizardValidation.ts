export type StepValidator = (stepIndex: number) => boolean

export type WizardStepValidatorsMap = Record<number, StepValidator | null>

export type UseWizardValidationReturn = {
  validateStep: (stepIndex: number) => boolean
}

/**
 * Pure validation helper for wizard steps.
 */
export function createWizardValidator(stepValidators: WizardStepValidatorsMap): UseWizardValidationReturn {
  const validateStep = (stepIndex: number): boolean => {
    const validator = stepValidators[stepIndex]
    if (validator) return validator(stepIndex)
    return true
  }

  return { validateStep }
}



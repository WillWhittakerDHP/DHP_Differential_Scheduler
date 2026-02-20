export type StepValidator = (stepIndex: number) => boolean

export type UseWizardValidationReturn = {
  validateStep: (stepIndex: number) => boolean
}


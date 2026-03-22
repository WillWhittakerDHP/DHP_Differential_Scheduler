import type { Ref, ComputedRef } from 'vue'

export type StepValidator = (stepIndex: number) => boolean

export interface UseWizardValidationParams {
  stepValidators: ComputedRef<Record<number, StepValidator | null>> | Ref<Record<number, StepValidator | null>> | Record<number, StepValidator | null>
}

export type UseWizardValidationReturn = {
  validateStep: (stepIndex: number) => boolean
}

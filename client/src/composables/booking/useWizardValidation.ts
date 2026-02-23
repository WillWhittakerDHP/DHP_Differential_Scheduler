/**
 * WHY: useWizardValidation Composable

WHY: Moves step validation checking to c...
 */
import { type Ref, type ComputedRef } from 'vue'
import type { StepValidator, UseWizardValidationReturn } from '@/utils/booking/wizardValidation'

export type { StepValidator, UseWizardValidationReturn } from '@/utils/booking/wizardValidation'

export interface UseWizardValidationParams {
  stepValidators: ComputedRef<Record<number, StepValidator | null>> | Ref<Record<number, StepValidator | null>> | Record<number, StepValidator | null>
}

/**
 * WHY: useWizardValidation composable

WHY: Extracts validation from component ...
 */
export function useWizardValidation(params: UseWizardValidationParams): UseWizardValidationReturn {
  const { stepValidators } = params
  
  // LEARNING: Access validators reactively
  // WHY: Ensures validation always uses current validator functions with current values
  // PATTERN: Check if it's a ref/computed and access .value, otherwise use directly
  const getValidators = (): Record<number, StepValidator | null> => {
    if ('value' in stepValidators) {
      return stepValidators.value
    }
    return stepValidators
  }
  
  const validateStep = (stepIndex: number): boolean => {
    const validators = getValidators()
    const validator = validators[stepIndex]
    if (validator) return validator(stepIndex)
    return true
  }

  return { validateStep }
}


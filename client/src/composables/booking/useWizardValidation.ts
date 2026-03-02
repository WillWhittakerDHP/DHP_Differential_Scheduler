/**
 * WHY: useWizardValidation Composable

WHY: Moves step validation checking to c...
 */
import type {
  StepValidator,
  UseWizardValidationParams,
  UseWizardValidationReturn,
} from '@/types/booking/wizardValidation'

export function useWizardValidation(params: UseWizardValidationParams): UseWizardValidationReturn {
  const { stepValidators } = params
  
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

/**
 * useWizardValidation Composable
 * 
 * LEARNING: Extracts validation logic from BookingWizard component
 * WHY: Moves step validation checking to composable
 * PATTERN: Composable that provides validation function
 * FIX: Accept reactive validators so validation always uses current values
 */

import { type Ref, type ComputedRef } from 'vue'
import type { StepValidator } from '@/utils/booking/wizardValidation'

export type { StepValidator } from '@/utils/booking/wizardValidation'

/**
 * useWizardValidation composable parameters
 */
export interface UseWizardValidationParams {
  stepValidators: ComputedRef<Record<number, StepValidator | null>> | Ref<Record<number, StepValidator | null>> | Record<number, StepValidator | null>
}

/**
 * useWizardValidation composable return type
 */
export interface UseWizardValidationReturn {
  validateStep: (stepIndex: number) => boolean
}

/**
 * useWizardValidation composable
 * 
 * LEARNING: Provides validation logic for wizard steps
 * WHY: Extracts validation from component to composable
 * PATTERN: Composable that returns validation function
 * FIX: Access validators reactively to ensure validation always uses current validator functions with current values
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


/**
 * useStepValidation Composable
 * 
 * LEARNING: Generic step validation with config-driven rules
 * WHY: Eliminates validation duplication across wizard steps
 * PATTERN: Accepts dynamic validation rules and custom validators
 */

import { computed, ref, type Ref, type ComputedRef } from 'vue'
import type { ValidationRule } from '@/composables/useFormValidation'

export type CustomValidator = () => true | string

export interface UseStepValidationParams {
  formData: Record<string, Ref<unknown>>
  
  validationRules: ComputedRef<Record<string, ValidationRule[]>> | Record<string, ValidationRule[]>
  
  customValidators?: Record<string, CustomValidator>
}

export interface UseStepValidationReturn {
  validationRules: ComputedRef<Record<string, ValidationRule[]>>
  fieldErrors: Ref<Record<string, string>>
  isFormValid: ComputedRef<boolean>
  validateForm: () => boolean
}

/**
 * Generic step validation composable
 * 
 * LEARNING: Config-driven validation for any wizard step
 * WHY: Eliminates repeated validation patterns
 * PATTERN: Accepts rules object and validates against form data
 */
export function useStepValidation(
  params: UseStepValidationParams
): UseStepValidationReturn {
  const {
    formData,
    validationRules: rulesInput,
    customValidators = {}
  } = params

  const validationRules: ComputedRef<Record<string, ValidationRule[]>> = computed(() => {
    if ('value' in rulesInput) {
      return rulesInput.value as Record<string, ValidationRule[]>
    }
    return rulesInput as Record<string, ValidationRule[]>
  })

  const fieldErrors = ref<Record<string, string>>({})

  /**
   * Validate form and update error state
   */
  const validateForm = (): boolean => {
    const rules = validationRules.value
    const errors: Record<string, string> = {}
    
    for (const [field, fieldRules] of Object.entries(rules)) {
      const value = formData[field]?.value
      for (const rule of fieldRules) {
        const result = rule(value)
        if (result !== true) {
          errors[field] = result as string
          break
        }
      }
    }
    
    for (const [field, validator] of Object.entries(customValidators)) {
      const result = validator()
      if (result !== true) {
        errors[field] = result
      }
    }
    
    fieldErrors.value = errors
    return Object.keys(errors).length === 0
  }

  const isFormValid = computed(() => {
    const rules = validationRules.value
    
    for (const [field, fieldRules] of Object.entries(rules)) {
      const value = formData[field]?.value
      for (const rule of fieldRules) {
        const result = rule(value)
        if (result !== true) {
          return false
        }
      }
    }
    
    for (const validator of Object.values(customValidators)) {
      const result = validator()
      if (result !== true) {
        return false
      }
    }
    
    return true
  })

  return {
    validationRules,
    fieldErrors,
    isFormValid,
    validateForm
  }
}


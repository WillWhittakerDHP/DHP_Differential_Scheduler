import type { Ref, ComputedRef } from 'vue'

import type { ValidationRule } from '@/types/formValidation'
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

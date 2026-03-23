import { computed, type Ref, type ComputedRef } from 'vue'
import type { ValidationRule, ValidationResult } from '@/types/formValidation'
import {
  combineRules,
  createCustomRule,
  createDateNotInPastRule,
  createEmailRule,
  createMaxLengthRule,
  createMaxRule,
  createMinLengthRule,
  createMinRule,
  createPhoneRule,
  createRequiredRule,
  createZipCodeRule,
} from '@/utils/formValidation/validationRuleFactories'
import { validateFormData } from '@/utils/formValidation/validateFormData'

export interface UseFormValidationReturn {
  required: (message?: string) => ValidationRule
  email: (message?: string) => ValidationRule
  phone: (message?: string) => ValidationRule
  minLength: (min: number, message?: string) => ValidationRule
  maxLength: (max: number, message?: string) => ValidationRule
  min: (minValue: number, message?: string) => ValidationRule
  max: (maxValue: number, message?: string) => ValidationRule
  zipCode: (message?: string) => ValidationRule
  dateNotInPast: (message?: string) => ValidationRule
  custom: (validator: (value: unknown) => boolean, message: string) => ValidationRule
  combine: (...rules: ValidationRule[]) => ValidationRule[]
  validateForm: (
    data: Record<string, unknown>,
    rules: Record<string, ValidationRule[]>
  ) => ValidationResult
  useFormValidity: (
    formData: Ref<Record<string, unknown>>,
    rules: Record<string, ValidationRule[]>
  ) => ComputedRef<boolean>
}

export function useFormValidation(): UseFormValidationReturn {
  const useFormValidity = (
    formData: Ref<Record<string, unknown>>,
    rules: Record<string, ValidationRule[]>
  ): ComputedRef<boolean> =>
    computed(() => validateFormData(formData.value, rules).isValid)

  return {
    required: createRequiredRule,
    email: createEmailRule,
    phone: createPhoneRule,
    minLength: createMinLengthRule,
    maxLength: createMaxLengthRule,
    min: createMinRule,
    max: createMaxRule,
    zipCode: createZipCodeRule,
    dateNotInPast: createDateNotInPastRule,
    custom: createCustomRule,
    combine: combineRules,
    validateForm: validateFormData,
    useFormValidity,
  }
}

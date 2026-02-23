/**
 * PATTERN: useStepValidation Composable
PATTERN: Accepts dynamic validation rules a...
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

export function collectErrors(
  rules: Record<string, ValidationRule[]>,
  formDataValues: Record<string, unknown>,
  customValidators: Record<string, CustomValidator>
): Record<string, string> {
  const ruleErrors = Object.entries(rules).reduce<Record<string, string>>((errors, [field, fieldRules]) => {
    const value = formDataValues[field]
    const firstErrorRule = fieldRules.find(rule => rule(value) !== true)
    if (firstErrorRule) {
      errors[field] = firstErrorRule(value) as string
    }
    return errors
  }, {})

  const customErrors = Object.entries(customValidators).reduce<Record<string, string>>((errors, [field, validator]) => {
    const result = validator()
    if (result !== true) errors[field] = result
    return errors
  }, {})

  return { ...ruleErrors, ...customErrors }
}

function getFormValues(formData: Record<string, Ref<unknown>>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(formData).map(([key, r]) => [key, r?.value])
  )
}

/**
 * WHY: Generic step validation composable
WHY: Eliminates repeated validation p...
 */
export function useStepValidation(params: UseStepValidationParams): UseStepValidationReturn {
  const { formData, validationRules: rulesInput, customValidators = {} } = params

  const validationRules: ComputedRef<Record<string, ValidationRule[]>> = computed(() => {
    if ('value' in rulesInput) {
      return rulesInput.value as Record<string, ValidationRule[]>
    }
    return rulesInput as Record<string, ValidationRule[]>
  })

  const fieldErrors = ref<Record<string, string>>({})

  const validateForm = (): boolean => {
    const rules = validationRules.value
    const values = getFormValues(formData)
    const errors = collectErrors(rules, values, customValidators)
    fieldErrors.value = errors
    return Object.keys(errors).length === 0
  }

  const isFormValid = computed(() => {
    const rules = validationRules.value
    const values = getFormValues(formData)
    const errors = collectErrors(rules, values, customValidators)
    return Object.keys(errors).length === 0
  })

  return {
    validationRules,
    fieldErrors,
    isFormValid,
    validateForm
  }
}

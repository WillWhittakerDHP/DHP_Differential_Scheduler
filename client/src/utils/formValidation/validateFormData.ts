import type { ValidationRule, ValidationResult } from '@/types/formValidation'

export function validateFormData(
  data: Record<string, unknown>,
  rules: Record<string, ValidationRule[]>
): ValidationResult {
  const errors: Record<string, string> = {}
  let isValid = true

  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = data[field]

    for (const rule of fieldRules) {
      const result = rule(value)
      if (result !== true) {
        errors[field] = result as string
        isValid = false
        break
      }
    }
  }

  return { isValid, errors }
}

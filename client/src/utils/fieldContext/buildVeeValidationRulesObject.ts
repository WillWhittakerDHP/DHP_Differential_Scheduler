import type { ValidAdminValue } from '@/constants/primitives'
import type { FieldValidationRules } from '@/composables/fieldContext/types'

type VeeFieldRulesShape = Partial<FieldValidationRules> & {
  pattern?: string
}

/**
 * Builds vee-validate `rules` object from {@link FieldValidationRules}.
 */
export function buildVeeValidationRulesObject(providedValidationRules: FieldValidationRules): VeeFieldRulesShape {
  const rules: VeeFieldRulesShape = {}
  const { required, minLength, maxLength, min, max, pattern, validate } = providedValidationRules

  if (required !== undefined && required !== null) {
    rules.required = required
  }
  if (minLength !== undefined && minLength !== null) {
    rules.minLength = minLength
  }
  if (maxLength !== undefined && maxLength !== null) {
    rules.maxLength = maxLength
  }
  if (min !== undefined && min !== null) {
    rules.min = min
  }
  if (max !== undefined && max !== null) {
    rules.max = max
  }
  if (pattern !== undefined && pattern !== null) {
    rules.pattern = pattern instanceof RegExp ? pattern.source : pattern
  }
  if (validate !== undefined && validate !== null) {
    rules.validate = validate as (value: ValidAdminValue) => boolean | string
  }

  return rules
}

/**
 * WHY: Pure helpers for required-fields rule config in business rule form (low nesting in computeds).
 */

export interface RequiredFieldsRuleConfigShape {
  fields: string[]
  condition?: string
}

export function commaStringToFieldArray(value: string): string[] {
  return value
    .split(',')
    .map((f) => f.trim())
    .filter((f) => f.length > 0)
}

export function requiredFieldsConfigFromCommaString(
  prev: RequiredFieldsRuleConfigShape,
  commaString: string
): RequiredFieldsRuleConfigShape {
  return {
    fields: commaStringToFieldArray(commaString),
    condition: prev.condition,
  }
}

export function requiredFieldsConfigWithCondition(
  prev: RequiredFieldsRuleConfigShape,
  condition: string
): RequiredFieldsRuleConfigShape {
  return {
    ...prev,
    condition: condition || undefined,
  }
}

/**
 * WHY: Pure helpers for required-fields rule config in business rule form (low nesting in computeds).
 */

import type { RequiredFieldsRuleConfig } from '@shared/types/businessRulesTypes'

function commaStringToFieldArray(value: string): string[] {
  return value
    .split(',')
    .map((f) => f.trim())
    .filter((f) => f.length > 0)
}

export function requiredFieldsConfigFromCommaString(
  prev: RequiredFieldsRuleConfig,
  commaString: string
): RequiredFieldsRuleConfig {
  return {
    fields: commaStringToFieldArray(commaString),
    condition: prev.condition,
  }
}

export function requiredFieldsConfigWithCondition(
  prev: RequiredFieldsRuleConfig,
  condition: string
): RequiredFieldsRuleConfig {
  return {
    ...prev,
    condition: condition || undefined,
  }
}

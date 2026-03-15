/**
 * Shared Business Rules Constants
 *
 * WHY: Consolidates inline literals (required_fields, requires_agent, etc.) for audit and type safety
 * PATTERN: Exported const object; both client and server derive RuleType from it
 */

/** Route path for business rules API (constants-consolidation: single source for client and server). */
export const BUSINESS_RULES_ROUTE = '/business-rules'

/** Rule type value constants (single source of truth for rule_type column and form defaults) */
export const RULE_TYPE_VALUES = {
  REQUIRED_FIELDS: 'required_fields',
  REQUIRES_AGENT: 'requires_agent',
  CONDITIONAL_VALIDATION: 'conditional_validation',
  VALIDATION_MESSAGE: 'validation_message',
} as const

export type RuleTypeValue = (typeof RULE_TYPE_VALUES)[keyof typeof RULE_TYPE_VALUES]

/**
 * Shared Business Rule Config Types
 *
 * LEARNING: Types shared between client and server for business rule configuration
 * WHY: Single source of truth for rule config interfaces, prevents type drift
 * PATTERN: Shared types directory for cross-cutting concerns (Phase 1.2 type-similarity remediation)
 */

/**
 * Required Fields Rule Config
 * LEARNING: Defines additional required fields when block is selected
 * WHY: Multi-family properties require numberOfUnits, some services require specific fields
 * PATTERN: Array of field names with optional condition
 */
export interface RequiredFieldsRuleConfig {
  fields: string[]
  condition?: string
}

/**
 * Requires Agent Rule Config
 * LEARNING: Indicates service requires agent/client contact information
 * WHY: Some services need agent details (e.g., Buyers Inspection), others don't
 * PATTERN: Simple boolean flag
 */
export interface RequiresAgentRuleConfig {
  requiresAgent: boolean
}

/**
 * Conditional Validation Rule Config
 * LEARNING: Field validation depends on other field values
 * WHY: Complex validation logic (e.g., field X required when field Y equals value Z)
 * PATTERN: Dependent field, condition type, condition value
 */
export interface ConditionalValidationRuleConfig {
  field: string
  dependsOn: string
  condition: string
  value: unknown
}

/**
 * Validation Message Rule Config
 * LEARNING: Custom validation messages for fields/blocks
 * WHY: Admin-configurable error messages instead of hardcoded strings
 * PATTERN: Field name and message type
 */
export interface ValidationMessageRuleConfig {
  field: string
  messageType: 'required' | 'invalid' | 'custom'
}

/**
 * Rule Config Union Type
 * LEARNING: TypeScript union type for all possible rule configs
 * WHY: Type safety for JSONB field based on rule_type
 * PATTERN: Discriminated union based on rule_type
 */
export type RuleConfig =
  | RequiredFieldsRuleConfig
  | RequiresAgentRuleConfig
  | ConditionalValidationRuleConfig
  | ValidationMessageRuleConfig

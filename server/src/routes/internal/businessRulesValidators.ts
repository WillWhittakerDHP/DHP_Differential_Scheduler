/**
 * Business Rules Router Validation Utilities
 * 
 * LEARNING: Extracted validation logic for business rules operations
 * WHY: Improves code reusability, testability, and maintainability
 * PATTERN: Pure validation functions that return validation results
 */

import { ValidationResult } from '../helpers/routerValidators.js'
import { ERROR_MESSAGES, REQUIRED_FIELDS, VALID_RULE_TYPES } from './businessRulesConstants.js'
import type { RuleType } from '../../db/models/admin/business_rule.js'

/**
 * Validate required fields for business rule creation/update
 * LEARNING: Extracted required field validation logic
 * WHY: Reusable validation for business rule operations
 * PATTERN: Check required fields, return validation result
 * 
 * @param data - Business rule data object
 * @returns ValidationResult indicating if required fields are present
 */
export function validateRequiredFields(data: {
  blockInstanceId?: unknown
  ruleType?: unknown
  ruleConfig?: unknown
}): ValidationResult {
  const missingFields: string[] = []
  
  for (const field of REQUIRED_FIELDS.CREATE) {
    if (!data[field as keyof typeof data]) {
      missingFields.push(field)
    }
  }
  
  if (missingFields.length > 0) {
    return {
      valid: false,
      error: ERROR_MESSAGES.MISSING_REQUIRED_FIELDS,
      details: {
        required: REQUIRED_FIELDS.CREATE,
        missing: missingFields,
      }
    }
  }
  
  return { valid: true }
}

/**
 * Validate rule type
 * LEARNING: Extracted rule type validation logic
 * WHY: Reusable validation for business rule operations
 * PATTERN: Check rule type against valid types, return validation result
 * 
 * @param ruleType - Rule type to validate
 * @returns ValidationResult indicating if rule type is valid
 */
export function validateRuleType(ruleType: unknown): ValidationResult {
  if (!VALID_RULE_TYPES.includes(ruleType as RuleType)) {
    return {
      valid: false,
      error: ERROR_MESSAGES.INVALID_RULE_TYPE,
      details: {
        ruleType,
        validRuleTypes: VALID_RULE_TYPES,
      }
    }
  }
  
  return { valid: true }
}

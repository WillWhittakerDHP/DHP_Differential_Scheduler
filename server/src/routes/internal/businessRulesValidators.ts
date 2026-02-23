/**
 * Business Rules Router Validation Utilities
 * 
 */

import type { ValidationResult } from '../helpers/routerValidators.js'
import { ERROR_MESSAGES, REQUIRED_FIELDS, VALID_RULE_TYPES } from './businessRulesConstants.js'
import type { RuleType } from '../../db/models/admin/business_rule.js'

/**
 * Validate required fields for business rule creation/update
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
    if (!(data as Record<string, unknown>)[field]) {
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

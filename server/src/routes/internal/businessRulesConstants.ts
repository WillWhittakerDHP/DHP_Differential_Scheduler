/**
 * Business Rules Router Constants
 * 
 * LEARNING: Centralized constants for business rules router operations
 * WHY: Eliminates magic strings, improves maintainability, enables type safety
 * PATTERN: Const objects with categorized constants
 */

import type { RuleType } from '../../db/models/admin/business_rule.js'

/**
 * Error messages for business rules operations
 * LEARNING: Centralized error messages for consistent API responses
 * WHY: Single source of truth for error messages, easier to maintain and translate
 * PATTERN: Const object with error message values organized by operation type
 */
export const ERROR_MESSAGES = {
  // Business rules CRUD operations
  FETCH_BUSINESS_RULES: 'Failed to fetch business rules',
  FETCH_BUSINESS_RULE: 'Failed to fetch business rule',
  FETCH_BUSINESS_RULES_FOR_BLOCK: 'Failed to fetch business rules for block',
  BUSINESS_RULE_NOT_FOUND: 'Business rule not found',
  CREATE_BUSINESS_RULE: 'Failed to create business rule',
  UPDATE_BUSINESS_RULE: 'Failed to update business rule',
  DELETE_BUSINESS_RULE: 'Failed to delete business rule',
  
  // Validation errors
  MISSING_REQUIRED_FIELDS: 'Missing required fields',
  INVALID_RULE_TYPE: 'Invalid ruleType',
} as const

/**
 * Required fields for business rules
 * LEARNING: Centralized required field lists for validation
 * WHY: Single source of truth for required fields, easier to maintain
 * PATTERN: Const array with required field names
 */
export const REQUIRED_FIELDS = {
  CREATE: ['blockInstanceId', 'ruleType', 'ruleConfig'] as const,
} as const

/**
 * Valid rule types
 * LEARNING: Centralized valid rule types
 * WHY: Single source of truth for rule types, prevents typos
 * PATTERN: Const array with valid rule types
 */
export const VALID_RULE_TYPES: RuleType[] = [
  'required_fields',
  'requires_agent',
  'conditional_validation',
  'validation_message',
]

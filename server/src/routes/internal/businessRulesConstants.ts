
import type { RuleType } from '../../db/models/admin/business_rule.js'

export const ERROR_MESSAGES = {
  FETCH_BUSINESS_RULES: 'Failed to fetch business rules',
  FETCH_BUSINESS_RULE: 'Failed to fetch business rule',
  FETCH_BUSINESS_RULES_FOR_BLOCK: 'Failed to fetch business rules for block',
  BUSINESS_RULE_NOT_FOUND: 'Business rule not found',
  CREATE_BUSINESS_RULE: 'Failed to create business rule',
  UPDATE_BUSINESS_RULE: 'Failed to update business rule',
  DELETE_BUSINESS_RULE: 'Failed to delete business rule',
  
  MISSING_REQUIRED_FIELDS: 'Missing required fields',
  INVALID_RULE_TYPE: 'Invalid ruleType',
} as const

export const REQUIRED_FIELDS = {
  CREATE: ['blockInstanceId', 'ruleType', 'ruleConfig'] as const,
} as const

export const VALID_RULE_TYPES: RuleType[] = [
  'required_fields',
  'requires_agent',
  'conditional_validation',
  'validation_message',
]


import { RULE_TYPE_VALUES as SHARED_RULE_TYPE_VALUES } from '@shared/constants/businessRulesConstants'

/** Base path for business rules API (relative to apiClient baseURL) */
export const BUSINESS_RULES_API_BASE = '/business-rules'

export const BUSINESS_RULES_MESSAGES = {
  FAILED_TO_LOAD: 'Failed to load business rules',
  FAILED_TO_LOAD_FOR_BLOCK: 'Failed to load business rules for block',
  FAILED_TO_CREATE: 'Failed to create business rule',
  FAILED_TO_UPDATE: 'Failed to update business rule',
  FAILED_TO_DELETE: 'Failed to delete business rule',
  FAILED_TO_TOGGLE: 'Failed to toggle business rule',
  CREATED: 'Business rule created successfully',
  UPDATED: 'Business rule updated successfully',
  DELETED: 'Business rule deleted successfully',
  ENABLED: 'Business rule enabled',
  DISABLED: 'Business rule disabled',
} as const

/** Rule type value constants (re-exported from shared for switch/case and form defaults) */
export const RULE_TYPE_VALUES = SHARED_RULE_TYPE_VALUES

/** Condition/operator values for conditional validation configs. */
export const RULE_CONDITION_VALUES = {
  EQUALS: 'equals',
} as const

/** Rule type options for selects (title, value, description) */
export const RULE_TYPE_OPTIONS = [
  { title: 'Required Fields', value: RULE_TYPE_VALUES.REQUIRED_FIELDS, description: 'Additional required fields based on block selection' },
  { title: 'Requires Agent', value: RULE_TYPE_VALUES.REQUIRES_AGENT, description: 'Service requires agent/client contact information' },
  { title: 'Conditional Validation', value: RULE_TYPE_VALUES.CONDITIONAL_VALIDATION, description: 'Field validation depends on other field values' },
  { title: 'Validation Message', value: RULE_TYPE_VALUES.VALIDATION_MESSAGE, description: 'Custom validation messages for fields/blocks' },
] as const

export const BUSINESS_RULES_UI = {
  LOADING_RULES: 'Loading business rules...',
  TITLE: 'Business Rules Configuration',
  DESCRIPTION: 'Configure validation rules for services and dwelling adjustments. Rules control which fields are required, validation messages, and agent requirements per block instance.',
  SELECT_BLOCK_LABEL: 'Select Block Instance',
  SELECT_BLOCK_HINT: 'Choose a service or dwelling adjustment to configure validation rules',
  ADD_RULE: 'Add Rule',
  ADD_FIRST_RULE: 'Add First Rule',
  NO_RULES_TITLE: 'No Rules Configured',
  NO_RULES_MESSAGE: 'Add a business rule to configure validation behavior for this block instance.',
  SELECT_BLOCK_TITLE: 'Select a Block Instance',
  SELECT_BLOCK_MESSAGE: 'Choose a service or dwelling adjustment above to view and configure business rules.',
  DIALOG_ADD_TITLE: 'Add Business Rule',
  DIALOG_EDIT_TITLE: 'Edit Business Rule',
  CANCEL: 'Cancel',
  CREATE: 'Create',
  UPDATE: 'Update',
  RULE_TYPE_LABEL: 'Rule Type',
  REQUIRED_FIELDS_LABEL: 'Required Fields',
  REQUIRED_FIELDS_HINT: 'Comma-separated field names (e.g., numberOfUnits, deckSquareFootage)',
  CONDITION_LABEL: 'Condition (optional)',
  CONDITION_HINT: 'Condition name (e.g., isMultiFamily, hasDeck)',
  REQUIRES_AGENT_LABEL: 'Service Requires Agent',
  REQUIRES_AGENT_HINT: 'Enable if this service requires agent and client contact information',
  CONDITIONAL_VALIDATION_PLACEHOLDER: 'Conditional validation configuration UI coming in future session.',
  VALIDATION_MESSAGE_PLACEHOLDER: 'Validation message configuration UI coming in future session.',
  VALIDATION_MESSAGE_LABEL: 'Validation Message (optional)',
  VALIDATION_MESSAGE_HINT: 'Link to annotation instance for validation message',
  ACTIVE_LABEL: 'Active',
  ACTIVE_HINT: 'Enable this rule for validation',
  TABLE_RULE_TYPE: 'Rule Type',
  TABLE_CONFIGURATION: 'Configuration',
  TABLE_VALIDATION_MESSAGE: 'Validation Message',
  TABLE_STATUS: 'Status',
  TABLE_ACTIONS: 'Actions',
  STATUS_ACTIVE: 'Active',
  STATUS_INACTIVE: 'Inactive',
  VALIDATION_NONE: 'None',
  VALIDATION_LINKED: 'Linked',
} as const

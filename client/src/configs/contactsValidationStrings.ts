/**
 * Contacts Validation UI Strings Configuration
 * 
 * LEARNING: Centralized validation messages for contacts step
 * WHY: Reduces hardcoding audit findings, centralizes all validation text for consistency
 * PATTERN: Single config object with all validation messages grouped by field type
 */
export const CONTACTS_VALIDATION_STRINGS = {
  firstName: {
    required: 'First name is required'
  },
  lastName: {
    required: 'Last name is required'
  },
  email: {
    required: 'Email is required'
  }
} as const

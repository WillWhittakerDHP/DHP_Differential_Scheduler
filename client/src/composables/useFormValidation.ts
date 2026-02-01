
import { computed, type Ref } from 'vue'

/**
 * Validation Rule Type
 * LEARNING: Function that takes a value and returns error message or true
 * WHY: Matches Vuetify's validation rule pattern
 * PATTERN: (value: unknown) => string | boolean
 */
export type ValidationRule = (value: unknown) => string | boolean

/**
 * Validation Result Interface
 * LEARNING: Structure for validation results
 * WHY: Provides type safety for validation state
 * PATTERN: Object with isValid flag and errors object
 */
export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export function useFormValidation() {
  /**
   * Required field validation rule
   * LEARNING: Checks if value is not empty
   * WHY: Common validation for required fields
   * PATTERN: Return error message if invalid, true if valid
   */
  const required = (message = 'This field is required'): ValidationRule => {
    return (value: unknown): string | boolean => {
      if (value === null || value === undefined || value === '') {
        return message
      }
      if (typeof value === 'string' && value.trim() === '') {
        return message
      }
      if (Array.isArray(value) && value.length === 0) {
        return message
      }
      return true
    }
  }

  /**
   * Email format validation rule
   * LEARNING: Validates email format using regex
   * WHY: Ensures email addresses are properly formatted
   * PATTERN: Regex pattern matching for email format
   */
  const email = (message = 'Please enter a valid email address'): ValidationRule => {
    return (value: unknown): string | boolean => {
      if (!value) return true // Allow empty if not required (combine with required rule)
      if (typeof value !== 'string') return message
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(value) || message
    }
  }

  /**
   * Phone number format validation rule
   * LEARNING: Validates phone number format (US format: XXX-XXX-XXXX or (XXX) XXX-XXXX)
   * WHY: Ensures phone numbers are properly formatted
   * PATTERN: Regex pattern matching for phone format
   */
  const phone = (message = 'Please enter a valid phone number'): ValidationRule => {
    return (value: unknown): string | boolean => {
      if (!value) return true // Allow empty if not required (combine with required rule)
      if (typeof value !== 'string') return message
      const phoneRegex = /^[\d\s\-().]+$/
      const digitsOnly = value.replace(/\D/g, '')
      return (phoneRegex.test(value) && digitsOnly.length === 10) || message
    }
  }

  /**
   * Minimum length validation rule
   * LEARNING: Validates string length meets minimum requirement
   * WHY: Ensures text fields have sufficient content
   * PATTERN: Check length property against minimum
   */
  const minLength = (min: number, message?: string): ValidationRule => {
    return (value: unknown): string | boolean => {
      if (!value) return true // Allow empty if not required
      const length = typeof value === 'string' ? value.length : 0
      const errorMessage = message || `Must be at least ${min} characters`
      return length >= min || errorMessage
    }
  }

  /**
   * Maximum length validation rule
   * LEARNING: Validates string length doesn't exceed maximum
   * WHY: Prevents overly long input
   * PATTERN: Check length property against maximum
   */
  const maxLength = (max: number, message?: string): ValidationRule => {
    return (value: unknown): string | boolean => {
      if (!value) return true // Allow empty if not required
      const length = typeof value === 'string' ? value.length : 0
      const errorMessage = message || `Must be no more than ${max} characters`
      return length <= max || errorMessage
    }
  }

  /**
   * Minimum value validation rule (for numbers)
   * LEARNING: Validates numeric value meets minimum requirement
   * WHY: Ensures numeric fields meet minimum requirements
   * PATTERN: Check numeric value against minimum
   */
  const min = (minValue: number, message?: string): ValidationRule => {
    return (value: unknown): string | boolean => {
      if (value === null || value === undefined || value === '') return true
      const numValue = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN
      if (isNaN(numValue)) return true // Let other validators handle NaN
      const errorMessage = message || `Must be at least ${minValue}`
      return numValue >= minValue || errorMessage
    }
  }

  /**
   * Maximum value validation rule (for numbers)
   * LEARNING: Validates numeric value doesn't exceed maximum
   * WHY: Ensures numeric fields don't exceed maximum limits
   * PATTERN: Check numeric value against maximum
   */
  const max = (maxValue: number, message?: string): ValidationRule => {
    return (value: unknown): string | boolean => {
      if (value === null || value === undefined || value === '') return true
      const numValue = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN
      if (isNaN(numValue)) return true // Let other validators handle NaN
      const errorMessage = message || `Must be no more than ${maxValue}`
      return numValue <= maxValue || errorMessage
    }
  }

  /**
   * Zip code format validation rule (US format)
   * LEARNING: Validates US zip code format (5 digits or 5+4 format)
   * WHY: Ensures zip codes are properly formatted
   * PATTERN: Regex pattern matching for zip code format
   */
  const zipCode = (message = 'Please enter a valid zip code'): ValidationRule => {
    return (value: unknown): string | boolean => {
      if (!value) return true // Allow empty if not required
      if (typeof value !== 'string') return message
      const zipRegex = /^\d{5}(-\d{4})?$/
      return zipRegex.test(value) || message
    }
  }

  /**
   * Date validation rule (not in past)
   * LEARNING: Validates date is not in the past
   * WHY: Prevents selecting past dates for appointments
   * PATTERN: Compare date value with today's date (date portions only, not times)
   */
  const dateNotInPast = (message = 'Date cannot be in the past'): ValidationRule => {
    return (value: unknown): string | boolean => {
      if (!value) return true // Allow empty if not required
      if (typeof value !== 'string' && !(value instanceof Date)) return message
      
      // WHY: Ensures correct date comparison regardless of timezone
      // PATTERN: Extract date part if string contains time, create Date in local timezone
      let selectedDate: Date
      if (typeof value === 'string') {
        try {
          const datePart = value.includes('T') ? value.split('T')[0] : value
          const dateParts = datePart.split('-')
          if (dateParts.length !== 3) {
            return message // Invalid date format
          }
          const [year, month, day] = dateParts.map(Number)
          if (isNaN(year) || isNaN(month) || isNaN(day)) {
            return message // Invalid date numbers
          }
          selectedDate = new Date(year, month - 1, day) // Local timezone, midnight
        } catch {
          return message // Error parsing date
        }
      } else {
        selectedDate = value as Date
      }
      
      if (isNaN(selectedDate.getTime())) return message
      
      // LEARNING: Normalize both dates to midnight UTC for comparison
      // WHY: All business logic should use UTC to avoid timezone issues
      // PATTERN: Use Date.UTC() to create dates at midnight UTC, compare date portions only
      const now = new Date()
      const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0))
      const selectedDateOnly = new Date(Date.UTC(
        selectedDate.getUTCFullYear(),
        selectedDate.getUTCMonth(),
        selectedDate.getUTCDate(),
        0, 0, 0, 0
      ))
      
      return selectedDateOnly >= today || message
    }
  }

  /**
   * Custom validation rule generator
   * LEARNING: Creates custom validation rule from function
   * WHY: Allows flexible custom validation logic
   * PATTERN: Wrapper function that returns ValidationRule
   */
  const custom = (validator: (value: unknown) => boolean, message: string): ValidationRule => {
    return (value: unknown): string | boolean => {
      return validator(value) || message
    }
  }

  /**
   * Combine multiple validation rules
   * LEARNING: Combines multiple rules into single rule array
   * WHY: Allows applying multiple validations to a field
   * PATTERN: Array of validation rules
   */
  const combine = (...rules: ValidationRule[]): ValidationRule[] => {
    return rules
  }

  /**
   * Validate form data object
   * LEARNING: Validates entire form object against rules
   * WHY: Enables form-level validation
   * PATTERN: Iterate over rules object, collect errors
   */
  const validateForm = (
    data: Record<string, unknown>,
    rules: Record<string, ValidationRule[]>
  ): ValidationResult => {
    const errors: Record<string, string> = {}
    let isValid = true

    for (const [field, fieldRules] of Object.entries(rules)) {
      const value = data[field]
      
      for (const rule of fieldRules) {
        const result = rule(value)
        if (result !== true) {
          errors[field] = result as string
          isValid = false
          break // Stop at first error for this field
        }
      }
    }

    return { isValid, errors }
  }

  /**
   * Check if form is valid (reactive)
   * LEARNING: Computed property for form validity
   * WHY: Enables reactive form validation state
   * PATTERN: Computed that validates form data against rules
   */
  const useFormValidity = (
    formData: Ref<Record<string, unknown>>,
    rules: Record<string, ValidationRule[]>
  ) => {
    return computed(() => {
      const result = validateForm(formData.value, rules)
      return result.isValid
    })
  }

  return {
    required,
    email,
    phone,
    minLength,
    maxLength,
    min,
    max,
    zipCode,
    dateNotInPast,
    custom,
    combine,
    validateForm,
    useFormValidity,
  }
}


import { computed, type Ref } from 'vue'
import type { ValidationRule, ValidationResult } from '@/types/formValidation'
import { createLogger } from '@/utils/logger'

const logger = createLogger('useFormValidation')

export interface UseFormValidationReturn {
  required: (message?: string) => ValidationRule
  email: (message?: string) => ValidationRule
  phone: (message?: string) => ValidationRule
  minLength: (min: number, message?: string) => ValidationRule
  maxLength: (max: number, message?: string) => ValidationRule
  min: (minValue: number, message?: string) => ValidationRule
  max: (maxValue: number, message?: string) => ValidationRule
  zipCode: (message?: string) => ValidationRule
  dateNotInPast: (message?: string) => ValidationRule
  custom: (validator: (value: unknown) => boolean, message: string) => ValidationRule
  combine: (...rules: ValidationRule[]) => ValidationRule[]
  validateForm: (
    data: Record<string, unknown>,
    rules: Record<string, ValidationRule[]>
  ) => ValidationResult
  useFormValidity: (
    formData: Ref<Record<string, unknown>>,
    rules: Record<string, ValidationRule[]>
  ) => ComputedRef<boolean>
}

export function useFormValidation(): UseFormValidationReturn {
  /**
   * Required field validation rule
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
Email format validation rule
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
Phone number format validation rule
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
Zip code format validation rule (US format)
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
        } catch (err) {
          logger.warn('dateNotInPast parse failed', { value, error: err })
          return message // Error parsing date
        }
      } else {
        selectedDate = value as Date
      }
      
      if (isNaN(selectedDate.getTime())) return message
      
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
   */
  const custom = (validator: (value: unknown) => boolean, message: string): ValidationRule => {
    return (value: unknown): string | boolean => {
      return validator(value) || message
    }
  }

  /**
   * Combine multiple validation rules
   */
  const combine = (...rules: ValidationRule[]): ValidationRule[] => {
    return rules
  }

  /**
   * Validate form data object
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
Check if form is valid (reactive)
WHY: Enables reactive form validat...
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

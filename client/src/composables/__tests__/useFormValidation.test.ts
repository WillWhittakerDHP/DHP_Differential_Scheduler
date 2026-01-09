/**
 * USE FORM VALIDATION TESTS
 * 
 * Unit tests for useFormValidation composable.
 * Tests all validation rules and form-level validation.
 * Phase 4A: Core Composables
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useFormValidation } from '../useFormValidation'
import type { ValidationRule } from '../useFormValidation'

describe('useFormValidation', () => {
  let validation: ReturnType<typeof useFormValidation>

  beforeEach(() => {
    validation = useFormValidation()
  })

  describe('required rule', () => {
    it('should return error for null value', () => {
      const rule = validation.required()
      expect(rule(null)).toBe('This field is required')
    })

    it('should return error for undefined value', () => {
      const rule = validation.required()
      expect(rule(undefined)).toBe('This field is required')
    })

    it('should return error for empty string', () => {
      const rule = validation.required()
      expect(rule('')).toBe('This field is required')
    })

    it('should return error for whitespace-only string', () => {
      const rule = validation.required()
      expect(rule('   ')).toBe('This field is required')
    })

    it('should return error for empty array', () => {
      const rule = validation.required()
      expect(rule([])).toBe('This field is required')
    })

    it('should return true for valid value', () => {
      const rule = validation.required()
      expect(rule('test')).toBe(true)
      expect(rule(0)).toBe(true)
      expect(rule(false)).toBe(true)
      expect(rule([1, 2, 3])).toBe(true)
    })

    it('should use custom message', () => {
      const rule = validation.required('Custom message')
      expect(rule(null)).toBe('Custom message')
    })
  })

  describe('email rule', () => {
    it('should return true for valid email', () => {
      const rule = validation.email()
      expect(rule('test@example.com')).toBe(true)
      expect(rule('user.name@domain.co.uk')).toBe(true)
    })

    it('should return error for invalid email', () => {
      const rule = validation.email()
      expect(rule('invalid')).toBe('Please enter a valid email address')
      expect(rule('invalid@')).toBe('Please enter a valid email address')
      expect(rule('@example.com')).toBe('Please enter a valid email address')
    })

    it('should return true for empty value (if not required)', () => {
      const rule = validation.email()
      expect(rule('')).toBe(true)
      expect(rule(null)).toBe(true)
    })

    it('should return error for non-string value', () => {
      const rule = validation.email()
      expect(rule(123)).toBe('Please enter a valid email address')
    })

    it('should use custom message', () => {
      const rule = validation.email('Custom email message')
      expect(rule('invalid')).toBe('Custom email message')
    })
  })

  describe('phone rule', () => {
    it('should return true for valid phone formats', () => {
      const rule = validation.phone()
      expect(rule('123-456-7890')).toBe(true)
      expect(rule('(123) 456-7890')).toBe(true)
      expect(rule('123.456.7890')).toBe(true)
      expect(rule('1234567890')).toBe(true)
    })

    it('should return error for invalid phone', () => {
      const rule = validation.phone()
      expect(rule('123')).toBe('Please enter a valid phone number')
      expect(rule('123-456')).toBe('Please enter a valid phone number')
      expect(rule('abc-def-ghij')).toBe('Please enter a valid phone number')
    })

    it('should return true for empty value (if not required)', () => {
      const rule = validation.phone()
      expect(rule('')).toBe(true)
      expect(rule(null)).toBe(true)
    })

    it('should return error for non-string value', () => {
      const rule = validation.phone()
      expect(rule(123)).toBe('Please enter a valid phone number')
    })

    it('should use custom message', () => {
      const rule = validation.phone('Custom phone message')
      expect(rule('invalid')).toBe('Custom phone message')
    })
  })

  describe('minLength rule', () => {
    it('should return true for string meeting minimum length', () => {
      const rule = validation.minLength(5)
      expect(rule('hello')).toBe(true)
      expect(rule('hello world')).toBe(true)
    })

    it('should return error for string below minimum length', () => {
      const rule = validation.minLength(5)
      expect(rule('hi')).toBe('Must be at least 5 characters')
      expect(rule('test')).toBe('Must be at least 5 characters')
    })

    it('should return true for empty value (if not required)', () => {
      const rule = validation.minLength(5)
      expect(rule('')).toBe(true)
      expect(rule(null)).toBe(true)
    })

    it('should use custom message', () => {
      const rule = validation.minLength(5, 'Custom min length message')
      expect(rule('hi')).toBe('Custom min length message')
    })
  })

  describe('maxLength rule', () => {
    it('should return true for string within maximum length', () => {
      const rule = validation.maxLength(10)
      expect(rule('hello')).toBe(true) // 5 chars, within 10
      expect(rule('hello test')).toBe(true) // 10 chars, exactly at limit
    })

    it('should return error for string exceeding maximum length', () => {
      const rule = validation.maxLength(5)
      expect(rule('hello world')).toBe('Must be no more than 5 characters')
    })

    it('should return true for empty value (if not required)', () => {
      const rule = validation.maxLength(5)
      expect(rule('')).toBe(true)
      expect(rule(null)).toBe(true)
    })

    it('should use custom message', () => {
      const rule = validation.maxLength(5, 'Custom max length message')
      expect(rule('hello world')).toBe('Custom max length message')
    })
  })

  describe('min rule', () => {
    it('should return true for number meeting minimum', () => {
      const rule = validation.min(5)
      expect(rule(5)).toBe(true)
      expect(rule(10)).toBe(true)
    })

    it('should return error for number below minimum', () => {
      const rule = validation.min(5)
      expect(rule(3)).toBe('Must be at least 5')
      expect(rule(0)).toBe('Must be at least 5')
    })

    it('should handle string numbers', () => {
      const rule = validation.min(5)
      expect(rule('10')).toBe(true)
      expect(rule('3')).toBe('Must be at least 5')
    })

    it('should return true for empty value (if not required)', () => {
      const rule = validation.min(5)
      expect(rule('')).toBe(true)
      expect(rule(null)).toBe(true)
    })

    it('should use custom message', () => {
      const rule = validation.min(5, 'Custom min message')
      expect(rule(3)).toBe('Custom min message')
    })
  })

  describe('max rule', () => {
    it('should return true for number within maximum', () => {
      const rule = validation.max(10)
      expect(rule(5)).toBe(true)
      expect(rule(10)).toBe(true)
    })

    it('should return error for number exceeding maximum', () => {
      const rule = validation.max(10)
      expect(rule(15)).toBe('Must be no more than 10')
    })

    it('should handle string numbers', () => {
      const rule = validation.max(10)
      expect(rule('5')).toBe(true)
      expect(rule('15')).toBe('Must be no more than 10')
    })

    it('should return true for empty value (if not required)', () => {
      const rule = validation.max(10)
      expect(rule('')).toBe(true)
      expect(rule(null)).toBe(true)
    })

    it('should use custom message', () => {
      const rule = validation.max(10, 'Custom max message')
      expect(rule(15)).toBe('Custom max message')
    })
  })

  describe('zipCode rule', () => {
    it('should return true for valid zip codes', () => {
      const rule = validation.zipCode()
      expect(rule('12345')).toBe(true)
      expect(rule('12345-6789')).toBe(true)
    })

    it('should return error for invalid zip codes', () => {
      const rule = validation.zipCode()
      expect(rule('1234')).toBe('Please enter a valid zip code')
      expect(rule('123456')).toBe('Please enter a valid zip code')
      expect(rule('abcde')).toBe('Please enter a valid zip code')
    })

    it('should return true for empty value (if not required)', () => {
      const rule = validation.zipCode()
      expect(rule('')).toBe(true)
      expect(rule(null)).toBe(true)
    })

    it('should return error for non-string value', () => {
      const rule = validation.zipCode()
      expect(rule(12345)).toBe('Please enter a valid zip code')
    })

    it('should use custom message', () => {
      const rule = validation.zipCode('Custom zip message')
      expect(rule('invalid')).toBe('Custom zip message')
    })
  })

  describe('dateNotInPast rule', () => {
    it('should return true for today', () => {
      const rule = validation.dateNotInPast()
      // Create today's date in a timezone-safe way
      // WHY: Using ISO string can cause timezone issues (UTC date may be "yesterday" in local time)
      // PATTERN: Pass Date object directly instead of string to avoid parsing issues
      const today = new Date()
      today.setHours(12, 0, 0, 0) // Set to noon to avoid boundary issues
      expect(rule(today)).toBe(true)
    })

    it('should return true for future date', () => {
      const rule = validation.dateNotInPast()
      const future = new Date()
      future.setDate(future.getDate() + 1)
      expect(rule(future.toISOString())).toBe(true)
    })

    it('should return error for past date', () => {
      const rule = validation.dateNotInPast()
      const past = new Date()
      past.setDate(past.getDate() - 1)
      expect(rule(past.toISOString())).toBe('Date cannot be in the past')
    })

    it('should return true for empty value (if not required)', () => {
      const rule = validation.dateNotInPast()
      expect(rule('')).toBe(true)
      expect(rule(null)).toBe(true)
    })

    it('should return error for invalid date', () => {
      const rule = validation.dateNotInPast()
      expect(rule('invalid-date')).toBe('Date cannot be in the past')
    })

    it('should use custom message', () => {
      const rule = validation.dateNotInPast('Custom date message')
      const past = new Date()
      past.setDate(past.getDate() - 1)
      expect(rule(past.toISOString())).toBe('Custom date message')
    })
  })

  describe('custom rule', () => {
    it('should use custom validator function', () => {
      const rule = validation.custom((value) => value === 'valid', 'Custom error')
      expect(rule('valid')).toBe(true)
      expect(rule('invalid')).toBe('Custom error')
    })
  })

  describe('combine rule', () => {
    it('should combine multiple rules', () => {
      const rules = validation.combine(
        validation.required(),
        validation.minLength(5)
      )
      
      expect(rules).toHaveLength(2)
      expect(rules[0]('')).toBe('This field is required')
      expect(rules[1]('hi')).toBe('Must be at least 5 characters')
    })
  })

  describe('validateForm', () => {
    it('should return valid result for valid form', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
      }
      
      const rules = {
        name: [validation.required()],
        email: [validation.required(), validation.email()],
      }
      
      const result = validation.validateForm(data, rules)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual({})
    })

    it('should return invalid result with errors', () => {
      const data = {
        name: '',
        email: 'invalid-email',
      }
      
      const rules = {
        name: [validation.required()],
        email: [validation.required(), validation.email()],
      }
      
      const result = validation.validateForm(data, rules)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.name).toBe('This field is required')
      expect(result.errors.email).toBe('Please enter a valid email address')
    })

    it('should stop at first error per field', () => {
      const data = {
        email: 'invalid',
      }
      
      const rules = {
        email: [validation.required(), validation.email()],
      }
      
      const result = validation.validateForm(data, rules)
      
      // Should stop at email validation error, not required
      expect(result.errors.email).toBe('Please enter a valid email address')
    })
  })

  describe('useFormValidity', () => {
    it('should return computed validity', () => {
      const formData = ref({
        name: 'John Doe',
        email: 'john@example.com',
      })
      
      const rules = {
        name: [validation.required()],
        email: [validation.required(), validation.email()],
      }
      
      const isValid = validation.useFormValidity(formData, rules)
      
      expect(isValid.value).toBe(true)
    })

    it('should update validity reactively', () => {
      const formData = ref({
        name: '',
        email: 'john@example.com',
      })
      
      const rules = {
        name: [validation.required()],
        email: [validation.required(), validation.email()],
      }
      
      const isValid = validation.useFormValidity(formData, rules)
      
      expect(isValid.value).toBe(false)
      
      formData.value.name = 'John Doe'
      
      expect(isValid.value).toBe(true)
    })
  })
})


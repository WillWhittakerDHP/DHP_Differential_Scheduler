import type { ValidationRule } from '@/types/formValidation'

export function createRequiredRule(message = 'This field is required'): ValidationRule {
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

export function createEmailRule(message = 'Please enter a valid email address'): ValidationRule {
  return (value: unknown): string | boolean => {
    if (!value) return true
    if (typeof value !== 'string') return message
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value) || message
  }
}

export function createPhoneRule(message = 'Please enter a valid phone number'): ValidationRule {
  return (value: unknown): string | boolean => {
    if (!value) return true
    if (typeof value !== 'string') return message
    const phoneRegex = /^[\d\s\-().]+$/
    const digitsOnly = value.replace(/\D/g, '')
    return (phoneRegex.test(value) && digitsOnly.length === 10) || message
  }
}

export function createMinLengthRule(min: number, message?: string): ValidationRule {
  return (value: unknown): string | boolean => {
    if (!value) return true
    const length = typeof value === 'string' ? value.length : 0
    const errorMessage = message || `Must be at least ${min} characters`
    return length >= min || errorMessage
  }
}

export function createMaxLengthRule(max: number, message?: string): ValidationRule {
  return (value: unknown): string | boolean => {
    if (!value) return true
    const length = typeof value === 'string' ? value.length : 0
    const errorMessage = message || `Must be no more than ${max} characters`
    return length <= max || errorMessage
  }
}

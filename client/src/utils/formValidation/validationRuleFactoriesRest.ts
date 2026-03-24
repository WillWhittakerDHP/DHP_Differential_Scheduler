import type { ValidationRule } from '@/types/formValidation'
import { createLogger } from '@/utils/logger'

const logger = createLogger('validationRuleFactories')

export function createMinRule(minValue: number, message?: string): ValidationRule {
  return (value: unknown): string | boolean => {
    if (value === null || value === undefined || value === '') return true
    const numValue = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN
    if (isNaN(numValue)) return true
    const errorMessage = message || `Must be at least ${minValue}`
    return numValue >= minValue || errorMessage
  }
}

export function createMaxRule(maxValue: number, message?: string): ValidationRule {
  return (value: unknown): string | boolean => {
    if (value === null || value === undefined || value === '') return true
    const numValue = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN
    if (isNaN(numValue)) return true
    const errorMessage = message || `Must be no more than ${maxValue}`
    return numValue <= maxValue || errorMessage
  }
}

export function createZipCodeRule(message = 'Please enter a valid zip code'): ValidationRule {
  return (value: unknown): string | boolean => {
    if (!value) return true
    if (typeof value !== 'string') return message
    const zipRegex = /^\d{5}(-\d{4})?$/
    return zipRegex.test(value) || message
  }
}

export function createDateNotInPastRule(message = 'Date cannot be in the past'): ValidationRule {
  return (value: unknown): string | boolean => {
    if (!value) return true
    if (typeof value !== 'string' && !(value instanceof Date)) return message

    let selectedDate: Date
    if (typeof value === 'string') {
      try {
        const datePart = value.includes('T') ? value.split('T')[0] : value
        const dateParts = datePart.split('-')
        if (dateParts.length !== 3) {
          return message
        }
        const [year, month, day] = dateParts.map(Number)
        if (isNaN(year) || isNaN(month) || isNaN(day)) {
          return message
        }
        selectedDate = new Date(year, month - 1, day)
      } catch (err) {
        logger.warn('dateNotInPast parse failed', { value, error: err })
        return message
      }
    } else {
      selectedDate = value as Date
    }

    if (isNaN(selectedDate.getTime())) return message

    const now = new Date()
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0))
    const selectedDateOnly = new Date(
      Date.UTC(
        selectedDate.getUTCFullYear(),
        selectedDate.getUTCMonth(),
        selectedDate.getUTCDate(),
        0,
        0,
        0,
        0
      )
    )

    return selectedDateOnly >= today || message
  }
}

export function createCustomRule(validator: (value: unknown) => boolean, message: string): ValidationRule {
  return (value: unknown): string | boolean => validator(value) || message
}

export function combineRules(...rules: ValidationRule[]): ValidationRule[] {
  return rules
}

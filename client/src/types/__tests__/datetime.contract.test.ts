/**
 * Contract tests for types/datetime.ts.
 * Covers: ISO8601Date, RFC3339DateTime, DayOfWeek and key conversion/validation helpers.
 * Validates: no accidental breaking changes to datetime types and runtime helpers.
 * Dependencies: vitest.
 */

import { describe, it, expect } from 'vitest'
import type { ISO8601Date, RFC3339DateTime } from '@shared/types/primitiveBrands'
import type { DayOfWeek } from '@/types/datetime'
import {
  isRFC3339DateTime,
  validateRFC3339DateTime,
  toRFC3339DateTime,
  toDayOfWeek,
  getDayOfWeek,
} from '@/utils/datetime'

describe('datetime contract', () => {
  describe('ISO8601Date', () => {
    it('accepts YYYY-MM-DD string', () => {
      const d: ISO8601Date = '2026-01-15'
      expect(d).toBe('2026-01-15')
    })
  })

  describe('RFC3339DateTime and validation', () => {
    it('isRFC3339DateTime accepts valid UTC string', () => {
      expect(isRFC3339DateTime('2026-01-15T14:30:00Z')).toBe(true)
    })

    it('isRFC3339DateTime rejects invalid string', () => {
      expect(isRFC3339DateTime('not-a-datetime')).toBe(false)
    })

    it('validateRFC3339DateTime returns value for valid string', () => {
      const value: RFC3339DateTime = validateRFC3339DateTime('2026-01-15T14:30:00Z')
      expect(value).toBe('2026-01-15T14:30:00Z')
    })

    it('validateRFC3339DateTime throws for invalid string', () => {
      expect(() => validateRFC3339DateTime('invalid')).toThrow('Invalid RFC3339DateTime')
    })

    it('toRFC3339DateTime returns branded string from Date', () => {
      const date = new Date('2026-01-15T12:00:00.000Z')
      const value: RFC3339DateTime = toRFC3339DateTime(date)
      expect(value).toBe('2026-01-15T12:00:00.000Z')
    })
  })

  describe('DayOfWeek', () => {
    it('toDayOfWeek accepts 0-6', () => {
      const d: DayOfWeek = toDayOfWeek(0)
      expect(d).toBe(0)
    })

    it('toDayOfWeek throws for out-of-range', () => {
      expect(() => toDayOfWeek(7)).toThrow('Invalid day of week')
    })

    it('getDayOfWeek returns 0-6 from Date', () => {
      const d: DayOfWeek = getDayOfWeek(new Date('2026-01-12')) // Sunday
      expect(d).toBe(0)
    })
  })
})

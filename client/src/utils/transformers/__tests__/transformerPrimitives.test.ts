/**
 * Tests for transformerPrimitives (safeString, safeNumber, safeBoolean, safeArray, safeId).
 * Covers: boundary validation at transformer layer, type guards, fallback behavior, edge cases.
 * Validates: null/undefined/empty string, non-matching types, NaN, optional context.
 * Dependencies: vitest.
 */

import { describe, it, expect } from 'vitest'
import {
  safeString,
  safeNumber,
  safeBoolean,
  safeArray,
  safeId,
  extractOptionalString,
  extractOptionalNumber,
  extractOptionalBoolean,
} from '../transformerPrimitives'

describe('transformerPrimitives', () => {
  describe('safeString', () => {
    it('returns string as-is', () => {
      expect(safeString('hello')).toBe('hello')
      expect(safeString('')).toBe('')
    })
    it('returns empty string for null and undefined', () => {
      expect(safeString(null)).toBe('')
      expect(safeString(undefined)).toBe('')
    })
    it('returns empty string for non-string types', () => {
      expect(safeString(42)).toBe('')
      expect(safeString(true)).toBe('')
      expect(safeString({})).toBe('')
      expect(safeString([])).toBe('')
    })
    it('accepts optional context without throwing', () => {
      expect(safeString('ok', 'field')).toBe('ok')
      expect(safeString(null, 'field')).toBe('')
    })
  })

  describe('safeNumber', () => {
    it('returns finite number as-is', () => {
      expect(safeNumber(0)).toBe(0)
      expect(safeNumber(42)).toBe(42)
      expect(safeNumber(-1)).toBe(-1)
    })
    it('returns 0 for null and undefined', () => {
      expect(safeNumber(null)).toBe(0)
      expect(safeNumber(undefined)).toBe(0)
    })
    it('returns 0 for NaN and non-number types', () => {
      expect(safeNumber(NaN)).toBe(0)
      expect(safeNumber('42')).toBe(0)
      expect(safeNumber(true)).toBe(0)
      expect(safeNumber({})).toBe(0)
    })
    it('accepts optional context without throwing', () => {
      expect(safeNumber(1, 'field')).toBe(1)
      expect(safeNumber(undefined, 'field')).toBe(0)
    })
  })

  describe('safeBoolean', () => {
    it('returns boolean as-is', () => {
      expect(safeBoolean(true)).toBe(true)
      expect(safeBoolean(false)).toBe(false)
    })
    it('returns false for null and undefined', () => {
      expect(safeBoolean(null)).toBe(false)
      expect(safeBoolean(undefined)).toBe(false)
    })
    it('returns false for non-boolean types', () => {
      expect(safeBoolean(0)).toBe(false)
      expect(safeBoolean(1)).toBe(false)
      expect(safeBoolean('')).toBe(false)
      expect(safeBoolean({})).toBe(false)
    })
    it('accepts optional context without throwing', () => {
      expect(safeBoolean(true, 'field')).toBe(true)
      expect(safeBoolean(null, 'field')).toBe(false)
    })
  })

  describe('safeArray', () => {
    it('returns copy of array', () => {
      const arr = [1, 2, 3]
      const result = safeArray(arr)
      expect(result).toEqual([1, 2, 3])
      expect(result).not.toBe(arr)
    })
    it('returns empty array for null and undefined', () => {
      expect(safeArray(null)).toEqual([])
      expect(safeArray(undefined)).toEqual([])
    })
    it('returns empty array for non-array types', () => {
      expect(safeArray('not array')).toEqual([])
      expect(safeArray(42)).toEqual([])
      expect(safeArray({})).toEqual([])
    })
    it('preserves type for typed arrays', () => {
      const strArr: string[] = ['a', 'b']
      expect(safeArray(strArr)).toEqual(['a', 'b'])
      const empty: string[] = []
      expect(safeArray(empty)).toEqual([])
    })
  })

  describe('safeId', () => {
    it('returns non-empty string as-is', () => {
      expect(safeId('id-1')).toBe('id-1')
    })
    it('returns null for null and undefined', () => {
      expect(safeId(null)).toBe(null)
      expect(safeId(undefined)).toBe(null)
    })
    it('returns null for empty string', () => {
      expect(safeId('')).toBe(null)
      expect(safeId('   ')).toBe(null)
    })
    it('returns string for finite number', () => {
      expect(safeId(123)).toBe('123')
    })
    it('returns null for non-string non-number types', () => {
      expect(safeId(true)).toBe(null)
      expect(safeId({})).toBe(null)
      expect(safeId([])).toBe(null)
    })
    it('trims whitespace and returns null when result is empty', () => {
      expect(safeId('  ab  ')).toBe('ab')
      expect(safeId('  ')).toBe(null)
    })
  })

  describe('extractOptionalString', () => {
    it('returns string as-is', () => {
      expect(extractOptionalString('hello', 'field')).toBe('hello')
      expect(extractOptionalString('', 'field')).toBe('')
    })
    it('returns default for null and undefined', () => {
      expect(extractOptionalString(null, 'field')).toBe('')
      expect(extractOptionalString(undefined, 'field')).toBe('')
    })
    it('returns custom default when provided', () => {
      expect(extractOptionalString(null, 'field', 'fallback')).toBe('fallback')
    })
    it('returns default for non-string types', () => {
      expect(extractOptionalString(42, 'field')).toBe('')
    })
  })

  describe('extractOptionalNumber', () => {
    it('returns finite number as-is', () => {
      expect(extractOptionalNumber(42, 'field')).toBe(42)
      expect(extractOptionalNumber(0, 'field')).toBe(0)
    })
    it('returns default for null and undefined', () => {
      expect(extractOptionalNumber(null, 'field')).toBe(0)
      expect(extractOptionalNumber(undefined, 'field')).toBe(0)
    })
    it('returns custom default when provided', () => {
      expect(extractOptionalNumber(null, 'field', 99)).toBe(99)
    })
    it('returns default for NaN and non-number types', () => {
      expect(extractOptionalNumber(NaN, 'field')).toBe(0)
      expect(extractOptionalNumber('42', 'field')).toBe(0)
    })
  })

  describe('extractOptionalBoolean', () => {
    it('returns boolean as-is', () => {
      expect(extractOptionalBoolean(true, 'field')).toBe(true)
      expect(extractOptionalBoolean(false, 'field')).toBe(false)
    })
    it('returns default for null and undefined', () => {
      expect(extractOptionalBoolean(null, 'field')).toBe(false)
      expect(extractOptionalBoolean(undefined, 'field')).toBe(false)
    })
    it('returns custom default when provided', () => {
      expect(extractOptionalBoolean(null, 'field', true)).toBe(true)
    })
    it('returns default for non-boolean types', () => {
      expect(extractOptionalBoolean(1, 'field')).toBe(false)
    })
  })
})

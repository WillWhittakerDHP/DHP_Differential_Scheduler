
import { describe, it, expect } from 'vitest'
import { isComposablePropertyValue } from '@/utils/transformers/composePropertyValue'

describe('composePropertyValue', () => {
  describe('isComposablePropertyValue', () => {
    it('should return true for string values', () => {
      const value = 'test string'
      
      const result = isComposablePropertyValue(value)
      
      expect(result).toBe(true)
    })

    it('should return true for number values', () => {
      const value = 42
      
      const result = isComposablePropertyValue(value)
      
      expect(result).toBe(true)
    })

    it('should return true for boolean values', () => {
      const trueValue = true
      const falseValue = false
      
      const trueResult = isComposablePropertyValue(trueValue)
      const falseResult = isComposablePropertyValue(falseValue)
      
      expect(trueResult).toBe(true)
      expect(falseResult).toBe(true)
    })

    it('should return true for array values', () => {
      const emptyArray: unknown[] = []
      const numberArray = [1, 2, 3]
      const stringArray = ['a', 'b', 'c']
      const mixedArray = [1, 'two', true]
      
      const emptyResult = isComposablePropertyValue(emptyArray)
      const numberResult = isComposablePropertyValue(numberArray)
      const stringResult = isComposablePropertyValue(stringArray)
      const mixedResult = isComposablePropertyValue(mixedArray)
      
      expect(emptyResult).toBe(true)
      expect(numberResult).toBe(true)
      expect(stringResult).toBe(true)
      expect(mixedResult).toBe(true)
    })

    it('should return false for object values', () => {
      const objectValue = { key: 'value' }
      const nullValue = null
      const undefinedValue = undefined
      
      const objectResult = isComposablePropertyValue(objectValue)
      const nullResult = isComposablePropertyValue(nullValue)
      const undefinedResult = isComposablePropertyValue(undefinedValue)
      
      expect(objectResult).toBe(false)
      expect(nullResult).toBe(false)
      expect(undefinedResult).toBe(false)
    })

    it('should return false for function values', () => {
      const functionValue = () => {}
      
      const result = isComposablePropertyValue(functionValue)
      
      expect(result).toBe(false)
    })

    it('should operate on a narrow set of composable value shapes', () => {
      const allowedTypes = [
        'string',
        123,
        true,
        false,
        [],
        [1, 2, 3],
      ]
      
      const disallowedTypes = [
        {},
        null,
        undefined,
        () => {},
        Symbol('test'),
        new Date(),
      ]
      
      allowedTypes.forEach(value => {
        expect(isComposablePropertyValue(value)).toBe(true)
      })
      
      disallowedTypes.forEach(value => {
        expect(isComposablePropertyValue(value)).toBe(false)
      })
    })

    it('should validate input types correctly', () => {
      const validInputs = [
        'string',
        42,
        true,
        [1, 2, 3],
      ]
      
      const invalidInputs = [
        { key: 'value' },
        null,
        undefined,
        () => {},
      ]
      
      validInputs.forEach(input => {
        expect(isComposablePropertyValue(input)).toBe(true)
      })
      
      invalidInputs.forEach(input => {
        expect(isComposablePropertyValue(input)).toBe(false)
      })
    })
  })
})

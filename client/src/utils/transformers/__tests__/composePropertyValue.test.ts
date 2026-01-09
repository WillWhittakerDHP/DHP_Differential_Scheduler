/**
 * COMPOSEPROPERTYVALUE TESTS
 * 
 * Unit tests for composePropertyValue.
 * Priority Score: 8.0 (Reliability: 9, ROI: 8, Independence: 10, Cognitive Load: 0)
 * 
 * Tests verify that the type guard correctly identifies composable property values
 * (string, number, boolean, array) and rejects other types.
 */

import { describe, it, expect } from 'vitest'
import { isComposablePropertyValue } from '@/utils/transformers/composePropertyValue'

describe('composePropertyValue', () => {
  describe('isComposablePropertyValue', () => {
    it('should return true for string values', () => {
      // Arrange
      const value = 'test string'
      
      // Act
      const result = isComposablePropertyValue(value)
      
      // Assert
      expect(result).toBe(true)
    })

    it('should return true for number values', () => {
      // Arrange
      const value = 42
      
      // Act
      const result = isComposablePropertyValue(value)
      
      // Assert
      expect(result).toBe(true)
    })

    it('should return true for boolean values', () => {
      // Arrange
      const trueValue = true
      const falseValue = false
      
      // Act
      const trueResult = isComposablePropertyValue(trueValue)
      const falseResult = isComposablePropertyValue(falseValue)
      
      // Assert
      expect(trueResult).toBe(true)
      expect(falseResult).toBe(true)
    })

    it('should return true for array values', () => {
      // Arrange
      const emptyArray: unknown[] = []
      const numberArray = [1, 2, 3]
      const stringArray = ['a', 'b', 'c']
      const mixedArray = [1, 'two', true]
      
      // Act
      const emptyResult = isComposablePropertyValue(emptyArray)
      const numberResult = isComposablePropertyValue(numberArray)
      const stringResult = isComposablePropertyValue(stringArray)
      const mixedResult = isComposablePropertyValue(mixedArray)
      
      // Assert
      expect(emptyResult).toBe(true)
      expect(numberResult).toBe(true)
      expect(stringResult).toBe(true)
      expect(mixedResult).toBe(true)
    })

    it('should return false for object values', () => {
      // Arrange
      const objectValue = { key: 'value' }
      const nullValue = null
      const undefinedValue = undefined
      
      // Act
      const objectResult = isComposablePropertyValue(objectValue)
      const nullResult = isComposablePropertyValue(nullValue)
      const undefinedResult = isComposablePropertyValue(undefinedValue)
      
      // Assert
      expect(objectResult).toBe(false)
      expect(nullResult).toBe(false)
      expect(undefinedResult).toBe(false)
    })

    it('should return false for function values', () => {
      // Arrange
      const functionValue = () => {}
      
      // Act
      const result = isComposablePropertyValue(functionValue)
      
      // Assert
      expect(result).toBe(false)
    })

    it('should operate on a narrow set of composable value shapes', () => {
      // Arrange - Test that only the allowed types pass
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
      
      // Act & Assert
      // All allowed types should return true
      allowedTypes.forEach(value => {
        expect(isComposablePropertyValue(value)).toBe(true)
      })
      
      // All disallowed types should return false
      disallowedTypes.forEach(value => {
        expect(isComposablePropertyValue(value)).toBe(false)
      })
    })

    it('should validate input types correctly', () => {
      // Arrange
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
      
      // Act & Assert
      validInputs.forEach(input => {
        expect(isComposablePropertyValue(input)).toBe(true)
      })
      
      invalidInputs.forEach(input => {
        expect(isComposablePropertyValue(input)).toBe(false)
      })
    })
  })
})

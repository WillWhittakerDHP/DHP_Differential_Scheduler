/**
 * VALIDATORS TESTS
 * 
 * Unit tests for form validation functions.
 * Tests email, password, URL, number, and string validators.
 */

import { describe, it, expect } from 'vitest'
import {
  requiredValidator,
  emailValidator,
  passwordValidator,
  confirmedValidator,
  betweenValidator,
  integerValidator,
  regexValidator,
  alphaValidator,
  urlValidator,
  lengthValidator,
  alphaDashValidator,
} from '../validators'

describe('validators', () => {
  describe('requiredValidator', () => {
    it('should pass for non-empty string', () => {
      expect(requiredValidator('test')).toBe(true)
    })
    
    it('should fail for empty string', () => {
      expect(requiredValidator('')).toBe('This field is required')
    })
    
    it('should fail for null', () => {
      expect(requiredValidator(null)).toBe('This field is required')
    })
    
    it('should fail for undefined', () => {
      expect(requiredValidator(undefined)).toBe('This field is required')
    })
    
    it('should pass for number zero', () => {
      expect(requiredValidator(0)).toBe(true)
    })
    
    it('should pass for boolean false', () => {
      expect(requiredValidator(false)).toBe(true)
    })
  })
  
  describe('emailValidator', () => {
    it('should pass for valid email', () => {
      expect(emailValidator('test@example.com')).toBe(true)
    })
    
    it('should pass for email with subdomain', () => {
      expect(emailValidator('user@mail.example.com')).toBe(true)
    })
    
    it('should pass for email with plus sign', () => {
      expect(emailValidator('user+tag@example.com')).toBe(true)
    })
    
    it('should fail for invalid email', () => {
      expect(emailValidator('invalid')).toBe('The Email field must be a valid email')
    })
    
    it('should fail for email without @', () => {
      expect(emailValidator('test.example.com')).toBe('The Email field must be a valid email')
    })
    
    it('should fail for email without domain', () => {
      expect(emailValidator('test@')).toBe('The Email field must be a valid email')
    })
    
    it('should pass for empty string', () => {
      expect(emailValidator('')).toBe(true)
    })
  })
  
  describe('passwordValidator', () => {
    it('should pass for password with 8+ characters', () => {
      expect(passwordValidator('password123')).toBe(true)
    })
    
    it('should fail for password with less than 8 characters', () => {
      expect(passwordValidator('pass')).toBe('Password must be at least 8 characters')
    })
    
    it('should pass for exactly 8 characters', () => {
      expect(passwordValidator('12345678')).toBe(true)
    })
    
    it('should pass for empty string', () => {
      expect(passwordValidator('')).toBe(true)
    })
  })
  
  describe('confirmedValidator', () => {
    it('should pass when values match', () => {
      expect(confirmedValidator('password', 'password')).toBe(true)
    })
    
    it('should fail when values do not match', () => {
      expect(confirmedValidator('password', 'different')).toBe('The Confirm Password field confirmation does not match')
    })
    
    it('should pass for empty strings', () => {
      expect(confirmedValidator('', '')).toBe(true)
    })
  })
  
  describe('betweenValidator', () => {
    it('should pass for value within range', () => {
      expect(betweenValidator(5, 1, 10)).toBe(true)
    })
    
    it('should pass for value at min boundary', () => {
      expect(betweenValidator(1, 1, 10)).toBe(true)
    })
    
    it('should pass for value at max boundary', () => {
      expect(betweenValidator(10, 1, 10)).toBe(true)
    })
    
    it('should fail for value below min', () => {
      expect(betweenValidator(0, 1, 10)).toBe('The Between field must be between 1 and 10')
    })
    
    it('should fail for value above max', () => {
      expect(betweenValidator(11, 1, 10)).toBe('The Between field must be between 1 and 10')
    })
    
    it('should pass for empty string', () => {
      expect(betweenValidator('', 1, 10)).toBe(true)
    })
  })
  
  describe('integerValidator', () => {
    it('should pass for integer', () => {
      expect(integerValidator(42)).toBe(true)
    })
    
    it('should pass for integer string', () => {
      expect(integerValidator('42')).toBe(true)
    })
    
    it('should fail for decimal', () => {
      expect(integerValidator(42.5)).toBe('This field must be an integer')
    })
    
    it('should fail for decimal string', () => {
      expect(integerValidator('42.5')).toBe('This field must be an integer')
    })
    
    it('should fail for non-numeric string', () => {
      expect(integerValidator('abc')).toBe('This field must be an integer')
    })
    
    it('should pass for empty string', () => {
      expect(integerValidator('')).toBe(true)
    })
  })
  
  describe('regexValidator', () => {
    it('should pass for matching pattern', () => {
      expect(regexValidator('abc123', /^[a-z0-9]+$/)).toBe(true)
    })
    
    it('should fail for non-matching pattern', () => {
      expect(regexValidator('ABC', /^[a-z]+$/)).toBe('The Regex field format is invalid')
    })
    
    it('should work with string regex', () => {
      expect(regexValidator('123', '^[0-9]+$')).toBe(true)
    })
    
    it('should pass for empty string', () => {
      expect(regexValidator('', /^[a-z]+$/)).toBe(true)
    })
  })
  
  describe('alphaValidator', () => {
    it('should pass for alphabetic characters', () => {
      expect(alphaValidator('abc')).toBe(true)
    })
    
    it('should pass for mixed case', () => {
      expect(alphaValidator('AbC')).toBe(true)
    })
    
    it('should fail for numbers', () => {
      expect(alphaValidator('abc123')).toBe('The Alpha field may only contain alphabetic characters')
    })
    
    it('should fail for special characters', () => {
      expect(alphaValidator('abc!')).toBe('The Alpha field may only contain alphabetic characters')
    })
    
    it('should pass for empty string', () => {
      expect(alphaValidator('')).toBe(true)
    })
  })
  
  describe('urlValidator', () => {
    it('should pass for valid HTTP URL', () => {
      expect(urlValidator('http://example.com')).toBe(true)
    })
    
    it('should pass for valid HTTPS URL', () => {
      expect(urlValidator('https://example.com')).toBe(true)
    })
    
    it('should pass for URL with path', () => {
      expect(urlValidator('https://example.com/path/to/page')).toBe(true)
    })
    
    it('should pass for URL with query params', () => {
      expect(urlValidator('https://example.com?param=value')).toBe(true)
    })
    
    it('should fail for invalid URL', () => {
      expect(urlValidator('not-a-url')).toBe('URL is invalid')
    })
    
    it('should fail for URL without protocol', () => {
      expect(urlValidator('example.com')).toBe('URL is invalid')
    })
    
    it('should pass for empty string', () => {
      expect(urlValidator('')).toBe(true)
    })
  })
  
  describe('lengthValidator', () => {
    it('should pass for exact length', () => {
      expect(lengthValidator('12345', 5)).toBe(true)
    })
    
    it('should fail for shorter length', () => {
      expect(lengthValidator('1234', 5)).toBe('The Length field must be 5 characters')
    })
    
    it('should fail for longer length', () => {
      expect(lengthValidator('123456', 5)).toBe('The Length field must be 5 characters')
    })
    
    it('should pass for empty string when length is 0', () => {
      expect(lengthValidator('', 0)).toBe(true)
    })
  })
  
  describe('alphaDashValidator', () => {
    it('should pass for alphanumeric', () => {
      expect(alphaDashValidator('abc123')).toBe(true)
    })
    
    it('should pass for alphanumeric with dashes', () => {
      expect(alphaDashValidator('abc-123')).toBe(true)
    })
    
    it('should pass for alphanumeric with underscores', () => {
      expect(alphaDashValidator('abc_123')).toBe(true)
    })
    
    it('should fail for special characters', () => {
      expect(alphaDashValidator('abc@123')).toBe('All Character is not valid')
    })
    
    it('should fail for spaces', () => {
      expect(alphaDashValidator('abc 123')).toBe('All Character is not valid')
    })
    
    it('should pass for empty string', () => {
      expect(alphaDashValidator('')).toBe(true)
    })
  })
})


/**
 * USESTEPVALIDATION TESTS
 * 
 * Unit tests for useStepValidation composable.
 * Tests generic step validation logic.
 * 
 * What it covers:
 * - validationRules: Rules normalization
 * - fieldErrors: Error tracking
 * - isFormValid: Computed validity
 * - validateForm: Manual validation
 * 
 * How it works:
 * - Tests field-based validation rules
 * - Tests custom validators
 * - Tests reactive rules
 * 
 * Dependencies:
 * - vitest for testing
 * - vue ref/computed for reactive state
 */

import { describe, it, expect, vi } from 'vitest'
import { ref, computed, nextTick } from 'vue'
import { useStepValidation } from '../useStepValidation'
import type { ValidationRule } from '@/composables/useFormValidation'

const required = (message: string): ValidationRule => 
  (value: unknown) => (value !== null && value !== undefined && value !== '') ? true : message

const minLength = (min: number, message: string): ValidationRule =>
  (value: unknown) => (typeof value === 'string' && value.length >= min) ? true : message

describe('useStepValidation', () => {
  describe('validationRules', () => {
    it('should normalize plain object rules', () => {
      const formData = { name: ref('') }
      const rules = { name: [required('Name is required')] }
      
      const { validationRules } = useStepValidation({
        formData,
        validationRules: rules,
      })
      
      expect(validationRules.value).toEqual(rules)
    })

    it('should unwrap computed rules', () => {
      const formData = { name: ref('') }
      const rules = computed(() => ({ name: [required('Name is required')] }))
      
      const { validationRules } = useStepValidation({
        formData,
        validationRules: rules,
      })
      
      expect(validationRules.value).toEqual(rules.value)
    })
  })

  describe('isFormValid', () => {
    it('should return false when required field is empty', () => {
      const formData = { name: ref('') }
      const rules = { name: [required('Name is required')] }
      
      const { isFormValid } = useStepValidation({
        formData,
        validationRules: rules,
      })
      
      expect(isFormValid.value).toBe(false)
    })

    it('should return true when all fields pass validation', () => {
      const formData = { name: ref('John') }
      const rules = { name: [required('Name is required')] }
      
      const { isFormValid } = useStepValidation({
        formData,
        validationRules: rules,
      })
      
      expect(isFormValid.value).toBe(true)
    })

    it('should return false when custom validator fails', () => {
      const formData = { name: ref('John') }
      const rules = { name: [required('Name is required')] }
      const customValidators = {
        customCheck: () => 'Custom validation failed' as string | true,
      }
      
      const { isFormValid } = useStepValidation({
        formData,
        validationRules: rules,
        customValidators,
      })
      
      expect(isFormValid.value).toBe(false)
    })

    it('should return true when custom validator passes', () => {
      const formData = { name: ref('John') }
      const rules = { name: [required('Name is required')] }
      const customValidators = {
        customCheck: () => true as string | true,
      }
      
      const { isFormValid } = useStepValidation({
        formData,
        validationRules: rules,
        customValidators,
      })
      
      expect(isFormValid.value).toBe(true)
    })

    it('should be reactive to form data changes', async () => {
      const formData = { name: ref('') }
      const rules = { name: [required('Name is required')] }
      
      const { isFormValid } = useStepValidation({
        formData,
        validationRules: rules,
      })
      
      expect(isFormValid.value).toBe(false)
      
      formData.name.value = 'John'
      await nextTick()
      
      expect(isFormValid.value).toBe(true)
    })
  })

  describe('validateForm', () => {
    it('should populate fieldErrors when validation fails', () => {
      const formData = { 
        name: ref(''),
        email: ref(''),
      }
      const rules = { 
        name: [required('Name is required')],
        email: [required('Email is required')],
      }
      
      const { validateForm, fieldErrors } = useStepValidation({
        formData,
        validationRules: rules,
      })
      
      validateForm()
      
      expect(fieldErrors.value.name).toBe('Name is required')
      expect(fieldErrors.value.email).toBe('Email is required')
    })

    it('should clear errors for valid fields', () => {
      const formData = { 
        name: ref('John'),
        email: ref(''),
      }
      const rules = { 
        name: [required('Name is required')],
        email: [required('Email is required')],
      }
      
      const { validateForm, fieldErrors } = useStepValidation({
        formData,
        validationRules: rules,
      })
      
      validateForm()
      
      expect(fieldErrors.value.name).toBeUndefined()
      expect(fieldErrors.value.email).toBe('Email is required')
    })

    it('should return true when all validations pass', () => {
      const formData = { name: ref('John') }
      const rules = { name: [required('Name is required')] }
      
      const { validateForm } = useStepValidation({
        formData,
        validationRules: rules,
      })
      
      const result = validateForm()
      expect(result).toBe(true)
    })

    it('should return false when any validation fails', () => {
      const formData = { name: ref('') }
      const rules = { name: [required('Name is required')] }
      
      const { validateForm } = useStepValidation({
        formData,
        validationRules: rules,
      })
      
      const result = validateForm()
      expect(result).toBe(false)
    })

    it('should include custom validator errors', () => {
      const formData = { name: ref('John') }
      const rules = { name: [required('Name is required')] }
      const customValidators = {
        customCheck: () => 'Custom error' as string | true,
      }
      
      const { validateForm, fieldErrors } = useStepValidation({
        formData,
        validationRules: rules,
        customValidators,
      })
      
      validateForm()
      
      expect(fieldErrors.value.customCheck).toBe('Custom error')
    })
  })

  describe('multiple validation rules', () => {
    it('should stop at first failing rule', () => {
      const formData = { name: ref('a') }
      const rules = { 
        name: [
          required('Name is required'),
          minLength(3, 'Name must be at least 3 characters'),
        ],
      }
      
      const { validateForm, fieldErrors } = useStepValidation({
        formData,
        validationRules: rules,
      })
      
      validateForm()
      
      expect(fieldErrors.value.name).toBe('Name must be at least 3 characters')
    })
  })
})

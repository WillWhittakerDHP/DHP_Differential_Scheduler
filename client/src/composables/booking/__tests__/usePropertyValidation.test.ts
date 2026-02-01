/**
 * USEPROPERTYVALIDATION TESTS
 * 
 * Unit tests for usePropertyValidation composable.
 * Tests property step validation logic.
 * 
 * What it covers:
 * - isFormValid: Overall step validity
 * - validateForm: Validation function
 * - fieldErrors: Field-level error messages
 * 
 * How it works:
 * - Tests address validation
 * - Tests city/state/zip validation
 * - Tests property size validation
 * - Tests multi-family unit validation
 * - Tests property type block validation
 * 
 * Dependencies:
 * - vitest for testing
 * - vue ref/computed for reactive state
 */

import { describe, it, expect } from 'vitest'
import { ref, computed } from 'vue'
import { usePropertyValidation } from '../usePropertyValidation'

describe('usePropertyValidation', () => {
  function createFormData() {
    return {
      address: ref(''),
      city: ref(''),
      state: ref(''),
      zipCode: ref(''),
      propertySize: ref<number | null>(null),
      numberOfUnits: ref<number | null>(null),
    }
  }

  describe('isFormValid', () => {
    it('should return false when required fields are empty', () => {
      const formData = createFormData()
      
      const { isFormValid } = usePropertyValidation({
        formData,
        isMultiFamily: computed(() => false),
        hasPropertyTypeBlock: computed(() => true),
      })
      
      expect(isFormValid.value).toBe(false)
    })

    it('should return false when no property type block selected', () => {
      const formData = createFormData()
      formData.address.value = '123 Main St'
      formData.city.value = 'Chicago'
      formData.state.value = 'IL'
      formData.zipCode.value = '60601'
      formData.propertySize.value = 2500
      
      const { isFormValid } = usePropertyValidation({
        formData,
        isMultiFamily: computed(() => false),
        hasPropertyTypeBlock: computed(() => false),
      })
      
      expect(isFormValid.value).toBe(false)
    })

    it('should return true when all required fields are valid', () => {
      const formData = createFormData()
      formData.address.value = '123 Main St'
      formData.city.value = 'Chicago'
      formData.state.value = 'IL'
      formData.zipCode.value = '60601'
      formData.propertySize.value = 2500
      
      const { isFormValid } = usePropertyValidation({
        formData,
        isMultiFamily: computed(() => false),
        hasPropertyTypeBlock: computed(() => true),
      })
      
      expect(isFormValid.value).toBe(true)
    })

    it('should require numberOfUnits when multi-family', () => {
      const formData = createFormData()
      formData.address.value = '123 Main St'
      formData.city.value = 'Chicago'
      formData.state.value = 'IL'
      formData.zipCode.value = '60601'
      formData.propertySize.value = 2500
      
      const { isFormValid } = usePropertyValidation({
        formData,
        isMultiFamily: computed(() => true),
        hasPropertyTypeBlock: computed(() => true),
      })
      
      expect(isFormValid.value).toBe(false)
    })

    it('should be valid with numberOfUnits when multi-family', () => {
      const formData = createFormData()
      formData.address.value = '123 Main St'
      formData.city.value = 'Chicago'
      formData.state.value = 'IL'
      formData.zipCode.value = '60601'
      formData.propertySize.value = 2500
      formData.numberOfUnits.value = 4
      
      const { isFormValid } = usePropertyValidation({
        formData,
        isMultiFamily: computed(() => true),
        hasPropertyTypeBlock: computed(() => true),
      })
      
      expect(isFormValid.value).toBe(true)
    })
  })

  describe('fieldErrors', () => {
    it('should have address error for short address', () => {
      const formData = createFormData()
      formData.address.value = 'ab' // Too short
      formData.city.value = 'Chicago'
      formData.state.value = 'IL'
      formData.zipCode.value = '60601'
      formData.propertySize.value = 2500
      
      const { fieldErrors, validateForm } = usePropertyValidation({
        formData,
        isMultiFamily: computed(() => false),
        hasPropertyTypeBlock: computed(() => true),
      })
      
      validateForm()
      expect(fieldErrors.value.address).toBeDefined()
    })

    it('should have zipCode error for invalid zip', () => {
      const formData = createFormData()
      formData.address.value = '123 Main St'
      formData.city.value = 'Chicago'
      formData.state.value = 'IL'
      formData.zipCode.value = 'invalid'
      formData.propertySize.value = 2500
      
      const { fieldErrors, validateForm } = usePropertyValidation({
        formData,
        isMultiFamily: computed(() => false),
        hasPropertyTypeBlock: computed(() => true),
      })
      
      validateForm()
      expect(fieldErrors.value.zipCode).toBeDefined()
    })

    it('should have propertySize error for size too large', () => {
      const formData = createFormData()
      formData.address.value = '123 Main St'
      formData.city.value = 'Chicago'
      formData.state.value = 'IL'
      formData.zipCode.value = '60601'
      formData.propertySize.value = 200000 // Too large
      
      const { fieldErrors, validateForm } = usePropertyValidation({
        formData,
        isMultiFamily: computed(() => false),
        hasPropertyTypeBlock: computed(() => true),
      })
      
      validateForm()
      expect(fieldErrors.value.propertySize).toBeDefined()
    })
  })
})

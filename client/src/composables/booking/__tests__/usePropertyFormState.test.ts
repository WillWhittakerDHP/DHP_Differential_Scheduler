/**
 * USEPROPERTYFORMSTATE TESTS
 * 
 * Unit tests for usePropertyFormState composable.
 * Tests property form field ref creation and management.
 * 
 * What it covers:
 * - formData: Consolidated object with all form field refs
 * 
 * How it works:
 * - Tests all form fields are created as refs
 * - Tests default values
 * - Tests reactivity of form fields
 * 
 * What it validates:
 * - All expected form fields exist
 * - Fields have correct default values
 * - Fields are reactive refs
 * 
 * Dependencies:
 * - vitest for testing
 * - vue isRef for ref detection
 */

import { describe, it, expect } from 'vitest'
import { isRef, nextTick } from 'vue'
import { usePropertyFormState } from '../usePropertyFormState'

describe('usePropertyFormState', () => {
  describe('formData', () => {
    it('should return formData object', () => {
      const { formData } = usePropertyFormState()
      
      expect(formData).toBeDefined()
      expect(typeof formData).toBe('object')
    })

    it('should have address ref with empty string default', () => {
      const { formData } = usePropertyFormState()
      
      expect(isRef(formData.address)).toBe(true)
      expect(formData.address.value).toBe('')
    })

    it('should have unit ref with empty string default', () => {
      const { formData } = usePropertyFormState()
      
      expect(isRef(formData.unit)).toBe(true)
      expect(formData.unit.value).toBe('')
    })

    it('should have city ref with empty string default', () => {
      const { formData } = usePropertyFormState()
      
      expect(isRef(formData.city)).toBe(true)
      expect(formData.city.value).toBe('')
    })

    it('should have state ref with empty string default', () => {
      const { formData } = usePropertyFormState()
      
      expect(isRef(formData.state)).toBe(true)
      expect(formData.state.value).toBe('')
    })

    it('should have zipCode ref with empty string default', () => {
      const { formData } = usePropertyFormState()
      
      expect(isRef(formData.zipCode)).toBe(true)
      expect(formData.zipCode.value).toBe('')
    })

    it('should have propertySize ref with null default', () => {
      const { formData } = usePropertyFormState()
      
      expect(isRef(formData.propertySize)).toBe(true)
      expect(formData.propertySize.value).toBeNull()
    })

    it('should have numberOfUnits ref with null default', () => {
      const { formData } = usePropertyFormState()
      
      expect(isRef(formData.numberOfUnits)).toBe(true)
      expect(formData.numberOfUnits.value).toBeNull()
    })

    it('should have mlsNumber ref with empty string default', () => {
      const { formData } = usePropertyFormState()
      
      expect(isRef(formData.mlsNumber)).toBe(true)
      expect(formData.mlsNumber.value).toBe('')
    })

    it('should have squareFootage ref with null default', () => {
      const { formData } = usePropertyFormState()
      
      expect(isRef(formData.squareFootage)).toBe(true)
      expect(formData.squareFootage.value).toBeNull()
    })

    it('should have bedrooms ref with null default', () => {
      const { formData } = usePropertyFormState()
      
      expect(isRef(formData.bedrooms)).toBe(true)
      expect(formData.bedrooms.value).toBeNull()
    })

    it('should have bathrooms ref with null default', () => {
      const { formData } = usePropertyFormState()
      
      expect(isRef(formData.bathrooms)).toBe(true)
      expect(formData.bathrooms.value).toBeNull()
    })

    it('should have foundationAccess ref with null default', () => {
      const { formData } = usePropertyFormState()
      
      expect(isRef(formData.foundationAccess)).toBe(true)
      expect(formData.foundationAccess.value).toBeNull()
    })

    it('should have additionalUnits ref with null default', () => {
      const { formData } = usePropertyFormState()
      
      expect(isRef(formData.additionalUnits)).toBe(true)
      expect(formData.additionalUnits.value).toBeNull()
    })
  })

  describe('reactivity', () => {
    it('should update address ref', async () => {
      const { formData } = usePropertyFormState()
      
      formData.address.value = '123 Main St'
      await nextTick()
      
      expect(formData.address.value).toBe('123 Main St')
    })

    it('should update squareFootage ref', async () => {
      const { formData } = usePropertyFormState()
      
      formData.squareFootage.value = 2500
      await nextTick()
      
      expect(formData.squareFootage.value).toBe(2500)
    })

    it('should update foundationAccess ref', async () => {
      const { formData } = usePropertyFormState()
      
      formData.foundationAccess.value = 'basement'
      await nextTick()
      
      expect(formData.foundationAccess.value).toBe('basement')
    })
  })

  describe('isolation', () => {
    it('should create independent form state per call', () => {
      const { formData: formData1 } = usePropertyFormState()
      const { formData: formData2 } = usePropertyFormState()
      
      formData1.address.value = 'Address 1'
      formData2.address.value = 'Address 2'
      
      expect(formData1.address.value).toBe('Address 1')
      expect(formData2.address.value).toBe('Address 2')
    })
  })
})

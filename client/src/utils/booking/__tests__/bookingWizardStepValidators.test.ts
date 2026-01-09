/**
 * BOOKING WIZARD STEP VALIDATORS TESTS
 * 
 * Unit tests for bookingWizardStepValidators utility.
 * Tests step validator building logic for the booking wizard.
 * 
 * What it covers:
 * - buildBookingWizardStepValidators: Creates step validator map
 * 
 * How it works:
 * - Tests each step validator with various option configurations
 * - Tests validation function priority (validate fn > valid flag > false)
 * 
 * What it validates:
 * - Step 0: Service selection validator
 * - Step 1: Property details validator (function > flag > false)
 * - Step 2: Availability validator (function > flag > false)
 * - Step 3: Contacts validator (function > flag > false)
 * - Step 4: Confirmation (always true)
 * 
 * Dependencies:
 * - vitest for testing
 * - BuildBookingWizardStepValidatorsOptions type
 */

import { describe, it, expect, vi } from 'vitest'
import {
  buildBookingWizardStepValidators,
  type BuildBookingWizardStepValidatorsOptions,
} from '../bookingWizardStepValidators'

// Helper to create default options
function createOptions(
  overrides: Partial<BuildBookingWizardStepValidatorsOptions> = {}
): BuildBookingWizardStepValidatorsOptions {
  return {
    hasServiceSelection: false,
    propertyDetailsStepValidate: null,
    propertyDetailsStepValid: null,
    availabilityStepValidate: null,
    availabilityStepValid: null,
    contactsStepValidate: null,
    contactsStepValid: null,
    ...overrides,
  }
}

describe('bookingWizardStepValidators', () => {
  describe('buildBookingWizardStepValidators', () => {
    describe('step 0 - service selection', () => {
      it('should return true when hasServiceSelection is true', () => {
        const validators = buildBookingWizardStepValidators(
          createOptions({ hasServiceSelection: true })
        )
        
        expect(validators[0]?.()).toBe(true)
      })

      it('should return false when hasServiceSelection is false', () => {
        const validators = buildBookingWizardStepValidators(
          createOptions({ hasServiceSelection: false })
        )
        
        expect(validators[0]?.()).toBe(false)
      })
    })

    describe('step 1 - property details', () => {
      it('should call propertyDetailsStepValidate function when provided', () => {
        const mockValidate = vi.fn(() => true)
        const validators = buildBookingWizardStepValidators(
          createOptions({ propertyDetailsStepValidate: mockValidate })
        )
        
        const result = validators[1]?.()
        
        expect(mockValidate).toHaveBeenCalled()
        expect(result).toBe(true)
      })

      it('should return propertyDetailsStepValidate result (false)', () => {
        const mockValidate = vi.fn(() => false)
        const validators = buildBookingWizardStepValidators(
          createOptions({ propertyDetailsStepValidate: mockValidate })
        )
        
        expect(validators[1]?.()).toBe(false)
      })

      it('should use propertyDetailsStepValid flag when no validate function', () => {
        const validators = buildBookingWizardStepValidators(
          createOptions({ 
            propertyDetailsStepValidate: null,
            propertyDetailsStepValid: true 
          })
        )
        
        expect(validators[1]?.()).toBe(true)
      })

      it('should return false when propertyDetailsStepValid is false', () => {
        const validators = buildBookingWizardStepValidators(
          createOptions({ 
            propertyDetailsStepValidate: null,
            propertyDetailsStepValid: false 
          })
        )
        
        expect(validators[1]?.()).toBe(false)
      })

      it('should return false when both validate and valid are null', () => {
        const validators = buildBookingWizardStepValidators(
          createOptions({ 
            propertyDetailsStepValidate: null,
            propertyDetailsStepValid: null 
          })
        )
        
        expect(validators[1]?.()).toBe(false)
      })

      it('should prefer validate function over valid flag', () => {
        const mockValidate = vi.fn(() => false)
        const validators = buildBookingWizardStepValidators(
          createOptions({ 
            propertyDetailsStepValidate: mockValidate,
            propertyDetailsStepValid: true // Would be true if validate wasn't called
          })
        )
        
        expect(validators[1]?.()).toBe(false)
      })
    })

    describe('step 2 - availability', () => {
      it('should call availabilityStepValidate function when provided', () => {
        const mockValidate = vi.fn(() => true)
        const validators = buildBookingWizardStepValidators(
          createOptions({ availabilityStepValidate: mockValidate })
        )
        
        const result = validators[2]?.()
        
        expect(mockValidate).toHaveBeenCalled()
        expect(result).toBe(true)
      })

      it('should use availabilityStepValid flag when no validate function', () => {
        const validators = buildBookingWizardStepValidators(
          createOptions({ 
            availabilityStepValidate: null,
            availabilityStepValid: true 
          })
        )
        
        expect(validators[2]?.()).toBe(true)
      })

      it('should return false when both are null', () => {
        const validators = buildBookingWizardStepValidators(
          createOptions({ 
            availabilityStepValidate: null,
            availabilityStepValid: null 
          })
        )
        
        expect(validators[2]?.()).toBe(false)
      })
    })

    describe('step 3 - contacts', () => {
      it('should call contactsStepValidate function when provided', () => {
        const mockValidate = vi.fn(() => true)
        const validators = buildBookingWizardStepValidators(
          createOptions({ contactsStepValidate: mockValidate })
        )
        
        const result = validators[3]?.()
        
        expect(mockValidate).toHaveBeenCalled()
        expect(result).toBe(true)
      })

      it('should use contactsStepValid flag when no validate function', () => {
        const validators = buildBookingWizardStepValidators(
          createOptions({ 
            contactsStepValidate: null,
            contactsStepValid: true 
          })
        )
        
        expect(validators[3]?.()).toBe(true)
      })

      it('should return false when both are null', () => {
        const validators = buildBookingWizardStepValidators(
          createOptions({ 
            contactsStepValidate: null,
            contactsStepValid: null 
          })
        )
        
        expect(validators[3]?.()).toBe(false)
      })
    })

    describe('step 4 - confirmation', () => {
      it('should always return true', () => {
        const validators = buildBookingWizardStepValidators(createOptions())
        
        expect(validators[4]?.()).toBe(true)
      })

      it('should return true regardless of other options', () => {
        const validators = buildBookingWizardStepValidators(
          createOptions({
            hasServiceSelection: false,
            propertyDetailsStepValid: false,
            availabilityStepValid: false,
            contactsStepValid: false,
          })
        )
        
        expect(validators[4]?.()).toBe(true)
      })
    })

    describe('validator map structure', () => {
      it('should return validators for steps 0-4', () => {
        const validators = buildBookingWizardStepValidators(createOptions())
        
        expect(validators).toHaveProperty('0')
        expect(validators).toHaveProperty('1')
        expect(validators).toHaveProperty('2')
        expect(validators).toHaveProperty('3')
        expect(validators).toHaveProperty('4')
      })

      it('should return functions for all steps', () => {
        const validators = buildBookingWizardStepValidators(createOptions())
        
        expect(typeof validators[0]).toBe('function')
        expect(typeof validators[1]).toBe('function')
        expect(typeof validators[2]).toBe('function')
        expect(typeof validators[3]).toBe('function')
        expect(typeof validators[4]).toBe('function')
      })
    })
  })
})

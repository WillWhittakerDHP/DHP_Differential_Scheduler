/**
 * WIZARD VALIDATION TESTS
 * 
 * Unit tests for wizardValidation utility functions.
 * Tests step validator creation and validation logic.
 * 
 * What it covers:
 * - createWizardValidator: Creates validateStep function from validators map
 * 
 * How it works:
 * - Tests validator lookup by step index
 * - Tests default behavior when no validator exists
 * - Tests validator function invocation
 * 
 * What it validates:
 * - Step validators are called with correct step index
 * - Returns validator result when validator exists
 * - Returns true when no validator defined
 * - Handles null validators
 * 
 * Dependencies:
 * - vitest for testing
 * - WizardStepValidatorsMap type
 */

import { describe, it, expect, vi } from 'vitest'
import {
  createWizardValidator,
  type WizardStepValidatorsMap,
} from '../wizardValidation'

describe('wizardValidation', () => {
  describe('createWizardValidator', () => {
    it('should return validateStep function', () => {
      const validators: WizardStepValidatorsMap = {}
      
      const { validateStep } = createWizardValidator(validators)
      
      expect(typeof validateStep).toBe('function')
    })

    describe('validateStep', () => {
      it('should call validator with step index', () => {
        const mockValidator = vi.fn(() => true)
        const validators: WizardStepValidatorsMap = {
          0: mockValidator,
        }
        
        const { validateStep } = createWizardValidator(validators)
        validateStep(0)
        
        expect(mockValidator).toHaveBeenCalledWith(0)
      })

      it('should return validator result (true)', () => {
        const validators: WizardStepValidatorsMap = {
          0: () => true,
        }
        
        const { validateStep } = createWizardValidator(validators)
        
        expect(validateStep(0)).toBe(true)
      })

      it('should return validator result (false)', () => {
        const validators: WizardStepValidatorsMap = {
          0: () => false,
        }
        
        const { validateStep } = createWizardValidator(validators)
        
        expect(validateStep(0)).toBe(false)
      })

      it('should return true when no validator for step', () => {
        const validators: WizardStepValidatorsMap = {
          0: () => true,
        }
        
        const { validateStep } = createWizardValidator(validators)
        
        expect(validateStep(1)).toBe(true)
      })

      it('should return true when validator is null', () => {
        const validators: WizardStepValidatorsMap = {
          0: null,
        }
        
        const { validateStep } = createWizardValidator(validators)
        
        expect(validateStep(0)).toBe(true)
      })

      it('should return true for empty validators map', () => {
        const validators: WizardStepValidatorsMap = {}
        
        const { validateStep } = createWizardValidator(validators)
        
        expect(validateStep(0)).toBe(true)
        expect(validateStep(1)).toBe(true)
        expect(validateStep(99)).toBe(true)
      })

      it('should validate multiple steps independently', () => {
        const validators: WizardStepValidatorsMap = {
          0: () => true,
          1: () => false,
          2: () => true,
        }
        
        const { validateStep } = createWizardValidator(validators)
        
        expect(validateStep(0)).toBe(true)
        expect(validateStep(1)).toBe(false)
        expect(validateStep(2)).toBe(true)
      })

      it('should handle dynamic validator results', () => {
        let isValid = false
        const validators: WizardStepValidatorsMap = {
          0: () => isValid,
        }
        
        const { validateStep } = createWizardValidator(validators)
        
        expect(validateStep(0)).toBe(false)
        
        isValid = true
        expect(validateStep(0)).toBe(true)
      })

      it('should pass correct step index to different validators', () => {
        const mockValidator0 = vi.fn(() => true)
        const mockValidator1 = vi.fn(() => true)
        const validators: WizardStepValidatorsMap = {
          0: mockValidator0,
          1: mockValidator1,
        }
        
        const { validateStep } = createWizardValidator(validators)
        validateStep(0)
        validateStep(1)
        
        expect(mockValidator0).toHaveBeenCalledWith(0)
        expect(mockValidator1).toHaveBeenCalledWith(1)
      })
    })
  })
})

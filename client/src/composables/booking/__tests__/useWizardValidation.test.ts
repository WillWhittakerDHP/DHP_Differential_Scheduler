/**
 * USEWIZARDVALIDATION TESTS
 * 
 * Unit tests for useWizardValidation composable.
 * Tests wizard step validation logic.
 * 
 * What it covers:
 * - validateStep: Step validation function
 * 
 * How it works:
 * - Tests validator execution
 * - Tests reactive validators
 * - Tests fallback for missing validators
 * 
 * Dependencies:
 * - vitest for testing
 * - vue ref/computed for reactive state
 */

import { describe, it, expect, vi } from 'vitest'
import { ref, computed } from 'vue'
import { useWizardValidation } from '../useWizardValidation'
import type { StepValidator } from '@/utils/booking/wizardValidation'

describe('useWizardValidation', () => {
  describe('validateStep', () => {
    it('should call validator for step', () => {
      const validator = vi.fn(() => true)
      const stepValidators: Record<number, StepValidator | null> = {
        0: validator,
      }
      
      const { validateStep } = useWizardValidation({ stepValidators })
      
      validateStep(0)
      
      expect(validator).toHaveBeenCalledWith(0)
    })

    it('should return true when validator passes', () => {
      const stepValidators: Record<number, StepValidator | null> = {
        0: () => true,
      }
      
      const { validateStep } = useWizardValidation({ stepValidators })
      
      expect(validateStep(0)).toBe(true)
    })

    it('should return false when validator fails', () => {
      const stepValidators: Record<number, StepValidator | null> = {
        0: () => false,
      }
      
      const { validateStep } = useWizardValidation({ stepValidators })
      
      expect(validateStep(0)).toBe(false)
    })

    it('should return true when no validator for step', () => {
      const stepValidators: Record<number, StepValidator | null> = {
        0: () => true,
      }
      
      const { validateStep } = useWizardValidation({ stepValidators })
      
      expect(validateStep(1)).toBe(true)
    })

    it('should return true when validator is null', () => {
      const stepValidators: Record<number, StepValidator | null> = {
        0: null,
      }
      
      const { validateStep } = useWizardValidation({ stepValidators })
      
      expect(validateStep(0)).toBe(true)
    })

    it('should work with ref validators', () => {
      const stepValidators = ref<Record<number, StepValidator | null>>({
        0: () => true,
      })
      
      const { validateStep } = useWizardValidation({ stepValidators })
      
      expect(validateStep(0)).toBe(true)
    })

    it('should work with computed validators', () => {
      const baseValidators = ref<Record<number, StepValidator | null>>({
        0: () => false,
      })
      const stepValidators = computed(() => baseValidators.value)
      
      const { validateStep } = useWizardValidation({ stepValidators })
      
      expect(validateStep(0)).toBe(false)
    })
  })
})

/**
 * WIZARD STEP CONTENT TESTS
 *
 * Unit tests for wizardStepContent utility function.
 * Tests step-to-component mapping for the booking wizard.
 *
 * What it covers:
 * - getBookingWizardStepContent: Maps step index to async Vue component
 *
 * How it works:
 * - Verifies each step index returns a valid component (async component object)
 * - Tests boundary conditions (invalid step indices)
 *
 * What it validates:
 * - Steps 0–4 return a valid component (object, not null)
 * - Invalid steps return null
 *
 * Dependencies:
 * - vitest for testing
 */

import { describe, it, expect } from 'vitest'
import { getBookingWizardStepContent } from '../wizardStepContent'

function isComponentLike(value: unknown): value is object {
  return value !== null && typeof value === 'object'
}

describe('wizardStepContent', () => {
  describe('getBookingWizardStepContent', () => {
    it('should return a valid component for step 0', () => {
      const component = getBookingWizardStepContent(0)
      expect(component).toBeDefined()
      expect(isComponentLike(component)).toBe(true)
    })

    it('should return a valid component for step 1', () => {
      const component = getBookingWizardStepContent(1)
      expect(component).toBeDefined()
      expect(isComponentLike(component)).toBe(true)
    })

    it('should return a valid component for step 2', () => {
      const component = getBookingWizardStepContent(2)
      expect(component).toBeDefined()
      expect(isComponentLike(component)).toBe(true)
    })

    it('should return a valid component for step 3', () => {
      const component = getBookingWizardStepContent(3)
      expect(component).toBeDefined()
      expect(isComponentLike(component)).toBe(true)
    })

    it('should return a valid component for step 4', () => {
      const component = getBookingWizardStepContent(4)
      expect(component).toBeDefined()
      expect(isComponentLike(component)).toBe(true)
    })

    describe('invalid step indices', () => {
      it('should return null for negative step', () => {
        expect(getBookingWizardStepContent(-1)).toBeNull()
      })

      it('should return null for step beyond valid range', () => {
        expect(getBookingWizardStepContent(5)).toBeNull()
        expect(getBookingWizardStepContent(10)).toBeNull()
        expect(getBookingWizardStepContent(100)).toBeNull()
      })
    })

    describe('step order validation', () => {
      it('should return a valid component for each step 0–4', () => {
        const stepComponents = [
          getBookingWizardStepContent(0),
          getBookingWizardStepContent(1),
          getBookingWizardStepContent(2),
          getBookingWizardStepContent(3),
          getBookingWizardStepContent(4),
        ]
        expect(stepComponents.every(c => c !== null && typeof c === 'object')).toBe(true)
      })
    })
  })
})

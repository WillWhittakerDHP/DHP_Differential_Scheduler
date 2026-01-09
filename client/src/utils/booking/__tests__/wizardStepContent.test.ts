/**
 * WIZARD STEP CONTENT TESTS
 * 
 * Unit tests for wizardStepContent utility function.
 * Tests step-to-component mapping for the booking wizard.
 * 
 * What it covers:
 * - getBookingWizardStepContent: Maps step index to Vue component
 * 
 * How it works:
 * - Verifies each step index returns the correct component
 * - Tests boundary conditions (invalid step indices)
 * 
 * What it validates:
 * - Step 0 → ServiceSelectionStep
 * - Step 1 → PropertyDetailsStep
 * - Step 2 → AvailabilityStep
 * - Step 3 → ContactsStep
 * - Step 4 → ConfirmationStep
 * - Invalid steps → null
 * 
 * Dependencies:
 * - vitest for testing
 * - Vue component imports (mocked)
 */

import { describe, it, expect, vi } from 'vitest'

// Mock the Vue components to avoid importing actual .vue files in tests
vi.mock('@/components/booking/steps/ServiceSelectionStep.vue', () => ({
  default: { name: 'ServiceSelectionStep' }
}))
vi.mock('@/components/booking/steps/PropertyDetailsStep.vue', () => ({
  default: { name: 'PropertyDetailsStep' }
}))
vi.mock('@/components/booking/steps/AvailabilityStep.vue', () => ({
  default: { name: 'AvailabilityStep' }
}))
vi.mock('@/components/booking/steps/ContactsStep.vue', () => ({
  default: { name: 'ContactsStep' }
}))
vi.mock('@/components/booking/steps/ConfirmationStep.vue', () => ({
  default: { name: 'ConfirmationStep' }
}))

import { getBookingWizardStepContent } from '../wizardStepContent'

describe('wizardStepContent', () => {
  describe('getBookingWizardStepContent', () => {
    it('should return ServiceSelectionStep for step 0', () => {
      const component = getBookingWizardStepContent(0)
      
      expect(component).toBeDefined()
      expect((component as { name: string }).name).toBe('ServiceSelectionStep')
    })

    it('should return PropertyDetailsStep for step 1', () => {
      const component = getBookingWizardStepContent(1)
      
      expect(component).toBeDefined()
      expect((component as { name: string }).name).toBe('PropertyDetailsStep')
    })

    it('should return AvailabilityStep for step 2', () => {
      const component = getBookingWizardStepContent(2)
      
      expect(component).toBeDefined()
      expect((component as { name: string }).name).toBe('AvailabilityStep')
    })

    it('should return ContactsStep for step 3', () => {
      const component = getBookingWizardStepContent(3)
      
      expect(component).toBeDefined()
      expect((component as { name: string }).name).toBe('ContactsStep')
    })

    it('should return ConfirmationStep for step 4', () => {
      const component = getBookingWizardStepContent(4)
      
      expect(component).toBeDefined()
      expect((component as { name: string }).name).toBe('ConfirmationStep')
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
      it('should map all wizard steps in correct sequence', () => {
        const stepComponents = [
          getBookingWizardStepContent(0),
          getBookingWizardStepContent(1),
          getBookingWizardStepContent(2),
          getBookingWizardStepContent(3),
          getBookingWizardStepContent(4),
        ]
        
        // All steps should have components
        expect(stepComponents.every(c => c !== null)).toBe(true)
        
        // Components should be in expected order
        const componentNames = stepComponents.map(c => (c as { name: string }).name)
        expect(componentNames).toEqual([
          'ServiceSelectionStep',
          'PropertyDetailsStep',
          'AvailabilityStep',
          'ContactsStep',
          'ConfirmationStep',
        ])
      })
    })
  })
})

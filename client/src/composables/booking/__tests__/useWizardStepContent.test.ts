/**
 * USEWIZARDSTEPCONTENT TESTS
 * 
 * Unit tests for useWizardStepContent composable.
 * Tests step content component mapping.
 * 
 * What it covers:
 * - getStepContent: Function that returns component for step number
 * 
 * How it works:
 * - Tests delegation to getBookingWizardStepContent utility
 * - Tests various step numbers return valid components
 * 
 * What it validates:
 * - Composable returns getStepContent function
 * - Function delegates to utility correctly
 * - Valid steps return component references
 * - Invalid steps return null
 * 
 * Dependencies:
 * - vitest for testing
 * - wizardStepContent utility (tested separately)
 */

import { describe, it, expect } from 'vitest'
import { useWizardStepContent } from '../useWizardStepContent'

describe('useWizardStepContent', () => {
  describe('getStepContent', () => {
    it('should return getStepContent function', () => {
      const { getStepContent } = useWizardStepContent()
      
      expect(typeof getStepContent).toBe('function')
    })

    it('should return component for step 0 (service selection)', () => {
      const { getStepContent } = useWizardStepContent()
      
      const component = getStepContent(0)
      
      expect(component).not.toBeNull()
    })

    it('should return component for step 1 (property details)', () => {
      const { getStepContent } = useWizardStepContent()
      
      const component = getStepContent(1)
      
      expect(component).not.toBeNull()
    })

    it('should return component for step 2 (availability)', () => {
      const { getStepContent } = useWizardStepContent()
      
      const component = getStepContent(2)
      
      expect(component).not.toBeNull()
    })

    it('should return component for step 3 (contacts)', () => {
      const { getStepContent } = useWizardStepContent()
      
      const component = getStepContent(3)
      
      expect(component).not.toBeNull()
    })

    it('should return component for step 4 (confirmation)', () => {
      const { getStepContent } = useWizardStepContent()
      
      const component = getStepContent(4)
      
      expect(component).not.toBeNull()
    })

    it('should return null for step 5 (out of range)', () => {
      const { getStepContent } = useWizardStepContent()
      
      const component = getStepContent(5)
      
      expect(component).toBeNull()
    })

    it('should return null for step beyond range', () => {
      const { getStepContent } = useWizardStepContent()
      
      const component = getStepContent(10)
      
      expect(component).toBeNull()
    })

    it('should return null for negative step', () => {
      const { getStepContent } = useWizardStepContent()
      
      const component = getStepContent(-1)
      
      expect(component).toBeNull()
    })
  })
})

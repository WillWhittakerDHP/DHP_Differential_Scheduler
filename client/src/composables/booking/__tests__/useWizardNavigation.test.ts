/**
 * USEWIZARDNAVIGATION TESTS
 * 
 * Unit tests for useWizardNavigation composable.
 * Tests step navigation, validation, and state management logic.
 * 
 * Coverage:
 * - activeStep tracking
 * - completedSteps set management
 * - isLastStep computed
 * - Navigation handlers (next, prev, step click)
 * - Step state and accessibility
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useWizardNavigation, type StepDefinition } from '../useWizardNavigation'

describe('useWizardNavigation', () => {
  // Test fixtures
  const mockSteps: StepDefinition[] = [
    { icon: 'mdi-home', title: 'Step 1', subtitle: 'First step' },
    { icon: 'mdi-account', title: 'Step 2', subtitle: 'Second step' },
    { icon: 'mdi-check', title: 'Step 3', subtitle: 'Third step' },
  ]

  let validateStep: ReturnType<typeof vi.fn>
  let showError: ReturnType<typeof vi.fn>

  beforeEach(() => {
    validateStep = vi.fn(() => true) // Default: all validations pass
    showError = vi.fn()
  })

  describe('initial state', () => {
    it('should start at step 0', () => {
      const { activeStep } = useWizardNavigation({
        steps: mockSteps,
        validateStep,
      })

      expect(activeStep.value).toBe(0)
    })

    it('should have empty completed steps initially', () => {
      const { completedSteps } = useWizardNavigation({
        steps: mockSteps,
        validateStep,
      })

      expect(completedSteps.value.size).toBe(0)
    })

    it('should not be on last step initially', () => {
      const { isLastStep } = useWizardNavigation({
        steps: mockSteps,
        validateStep,
      })

      expect(isLastStep.value).toBe(false)
    })
  })

  describe('isLastStep', () => {
    it('should return true on final step', () => {
      const { activeStep, isLastStep } = useWizardNavigation({
        steps: mockSteps,
        validateStep,
      })

      activeStep.value = 2 // Last step (0-indexed)
      expect(isLastStep.value).toBe(true)
    })

    it('should return false on intermediate step', () => {
      const { activeStep, isLastStep } = useWizardNavigation({
        steps: mockSteps,
        validateStep,
      })

      activeStep.value = 1
      expect(isLastStep.value).toBe(false)
    })
  })

  describe('markStepCompleted', () => {
    it('should add step to completed set', () => {
      const { completedSteps, markStepCompleted } = useWizardNavigation({
        steps: mockSteps,
        validateStep,
      })

      markStepCompleted(0)
      expect(completedSteps.value.has(0)).toBe(true)
    })

    it('should allow marking multiple steps as completed', () => {
      const { completedSteps, markStepCompleted } = useWizardNavigation({
        steps: mockSteps,
        validateStep,
      })

      markStepCompleted(0)
      markStepCompleted(1)
      expect(completedSteps.value.has(0)).toBe(true)
      expect(completedSteps.value.has(1)).toBe(true)
      expect(completedSteps.value.size).toBe(2)
    })
  })

  describe('arePreviousStepsCompleted', () => {
    it('should return true for step 0 (no previous steps)', () => {
      const { arePreviousStepsCompleted } = useWizardNavigation({
        steps: mockSteps,
        validateStep,
      })

      expect(arePreviousStepsCompleted(0)).toBe(true)
    })

    it('should return false when previous step is not completed', () => {
      const { arePreviousStepsCompleted } = useWizardNavigation({
        steps: mockSteps,
        validateStep,
      })

      expect(arePreviousStepsCompleted(1)).toBe(false)
    })

    it('should return true when all previous steps are completed', () => {
      const { arePreviousStepsCompleted, markStepCompleted } = useWizardNavigation({
        steps: mockSteps,
        validateStep,
      })

      markStepCompleted(0)
      expect(arePreviousStepsCompleted(1)).toBe(true)
    })

    it('should check all previous steps for step 2', () => {
      const { arePreviousStepsCompleted, markStepCompleted } = useWizardNavigation({
        steps: mockSteps,
        validateStep,
      })

      markStepCompleted(0)
      expect(arePreviousStepsCompleted(2)).toBe(false) // Step 1 not completed

      markStepCompleted(1)
      expect(arePreviousStepsCompleted(2)).toBe(true)
    })
  })

  describe('handleNext', () => {
    it('should call validateStep with current step', () => {
      const { handleNext } = useWizardNavigation({
        steps: mockSteps,
        validateStep,
      })

      handleNext()
      expect(validateStep).toHaveBeenCalledWith(0)
    })

    it('should advance to next step when validation passes', () => {
      const { activeStep, handleNext } = useWizardNavigation({
        steps: mockSteps,
        validateStep,
      })

      handleNext()
      expect(activeStep.value).toBe(1)
    })

    it('should mark current step as completed when advancing', () => {
      const { completedSteps, handleNext } = useWizardNavigation({
        steps: mockSteps,
        validateStep,
      })

      handleNext()
      expect(completedSteps.value.has(0)).toBe(true)
    })

    it('should not advance when validation fails', () => {
      validateStep.mockReturnValue(false)

      const { activeStep, handleNext } = useWizardNavigation({
        steps: mockSteps,
        validateStep,
      })

      handleNext()
      expect(activeStep.value).toBe(0)
    })

    it('should not advance past last step', () => {
      const { activeStep, handleNext } = useWizardNavigation({
        steps: mockSteps,
        validateStep,
      })

      activeStep.value = 2 // Last step
      handleNext()
      expect(activeStep.value).toBe(2)
    })
  })

  describe('handlePrev', () => {
    it('should go to previous step', () => {
      const { activeStep, handlePrev } = useWizardNavigation({
        steps: mockSteps,
        validateStep,
      })

      activeStep.value = 1
      handlePrev()
      expect(activeStep.value).toBe(0)
    })

    it('should not go below step 0', () => {
      const { activeStep, handlePrev } = useWizardNavigation({
        steps: mockSteps,
        validateStep,
      })

      handlePrev()
      expect(activeStep.value).toBe(0)
    })
  })

  describe('handleStepClick', () => {
    it('should allow backward navigation without validation', () => {
      const { activeStep, handleStepClick } = useWizardNavigation({
        steps: mockSteps,
        validateStep,
      })

      activeStep.value = 2
      handleStepClick(0)
      expect(activeStep.value).toBe(0)
      expect(validateStep).not.toHaveBeenCalled()
    })

    it('should validate current step for forward navigation', () => {
      const { handleStepClick } = useWizardNavigation({
        steps: mockSteps,
        validateStep,
      })

      handleStepClick(1)
      expect(validateStep).toHaveBeenCalledWith(0)
    })

    it('should show error when validation fails', () => {
      validateStep.mockReturnValue(false)

      const { activeStep, handleStepClick } = useWizardNavigation({
        steps: mockSteps,
        validateStep,
        showError,
      })

      handleStepClick(1)
      expect(showError).toHaveBeenCalledWith('Please complete all required fields before continuing')
      expect(activeStep.value).toBe(0)
    })

    it('should mark step as completed when validation passes', () => {
      const { completedSteps, handleStepClick } = useWizardNavigation({
        steps: mockSteps,
        validateStep,
      })

      handleStepClick(1)
      expect(completedSteps.value.has(0)).toBe(true)
    })

    it('should navigate to clicked step when validation passes', () => {
      const { activeStep, handleStepClick } = useWizardNavigation({
        steps: mockSteps,
        validateStep,
      })

      handleStepClick(1)
      expect(activeStep.value).toBe(1)
    })
  })

  describe('getStepState', () => {
    it('should return "step-active" for current step', () => {
      const { getStepState } = useWizardNavigation({
        steps: mockSteps,
        validateStep,
      })

      expect(getStepState(0)).toBe('step-active')
    })

    it('should return "step-completed" for completed step', () => {
      const { getStepState, markStepCompleted } = useWizardNavigation({
        steps: mockSteps,
        validateStep,
      })

      markStepCompleted(0)
      expect(getStepState(0)).toBe('step-completed')
    })

    it('should return "step-pending" for pending step', () => {
      const { getStepState } = useWizardNavigation({
        steps: mockSteps,
        validateStep,
      })

      expect(getStepState(1)).toBe('step-pending')
    })

    it('should prioritize "step-completed" over "step-active"', () => {
      const { activeStep, getStepState, markStepCompleted } = useWizardNavigation({
        steps: mockSteps,
        validateStep,
      })

      markStepCompleted(0)
      activeStep.value = 0 // Still on step 0 but marked completed
      expect(getStepState(0)).toBe('step-completed')
    })
  })

  describe('isStepAccessible', () => {
    it('should allow access to current step', () => {
      const { isStepAccessible } = useWizardNavigation({
        steps: mockSteps,
        validateStep,
      })

      expect(isStepAccessible(0)).toBe(true)
    })

    it('should allow access to previous steps', () => {
      const { activeStep, isStepAccessible } = useWizardNavigation({
        steps: mockSteps,
        validateStep,
      })

      activeStep.value = 2
      expect(isStepAccessible(0)).toBe(true)
      expect(isStepAccessible(1)).toBe(true)
    })

    it('should allow access to next immediate step', () => {
      const { isStepAccessible } = useWizardNavigation({
        steps: mockSteps,
        validateStep,
      })

      expect(isStepAccessible(1)).toBe(true) // Can click next step
    })

    it('should not allow access to steps further ahead without completed intermediate steps', () => {
      const { isStepAccessible } = useWizardNavigation({
        steps: mockSteps,
        validateStep,
      })

      expect(isStepAccessible(2)).toBe(false) // Step 1 not completed
    })

    it('should allow access to future steps when all intermediate steps completed', () => {
      const { isStepAccessible, markStepCompleted } = useWizardNavigation({
        steps: mockSteps,
        validateStep,
      })

      markStepCompleted(0)
      markStepCompleted(1)
      expect(isStepAccessible(2)).toBe(true)
    })
  })

  describe('integration scenarios', () => {
    it('should complete full wizard flow', () => {
      const { activeStep, completedSteps, isLastStep, handleNext } = useWizardNavigation({
        steps: mockSteps,
        validateStep,
      })

      // Navigate through all steps
      handleNext() // 0 -> 1
      expect(activeStep.value).toBe(1)
      expect(completedSteps.value.has(0)).toBe(true)

      handleNext() // 1 -> 2
      expect(activeStep.value).toBe(2)
      expect(completedSteps.value.has(1)).toBe(true)

      expect(isLastStep.value).toBe(true)
    })

    it('should handle mixed forward/backward navigation', () => {
      const { activeStep, completedSteps, handleNext, handlePrev, handleStepClick } = useWizardNavigation({
        steps: mockSteps,
        validateStep,
      })

      handleNext() // 0 -> 1
      handleNext() // 1 -> 2
      handlePrev() // 2 -> 1
      expect(activeStep.value).toBe(1)

      handleStepClick(0) // Jump back to 0
      expect(activeStep.value).toBe(0)

      // Completed steps should persist
      expect(completedSteps.value.has(0)).toBe(true)
      expect(completedSteps.value.has(1)).toBe(true)
    })
  })
})

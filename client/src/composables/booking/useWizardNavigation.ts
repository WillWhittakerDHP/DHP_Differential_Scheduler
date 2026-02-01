/**
 * useWizardNavigation Composable
 * 
 * LEARNING: Extracts navigation logic from BookingWizard component
 * WHY: Moves step navigation, validation checking, and step state management to composable
 * PATTERN: Composable that provides navigation functions and computed properties
 */

import { ref, computed, type Ref, type ComputedRef } from 'vue'

export interface StepDefinition {
  icon: string
  title: string
  subtitle: string
}

export interface UseWizardNavigationParams {
  steps: StepDefinition[]
  validateStep: (stepIndex: number) => boolean
  showError?: (message: string) => void
}

export interface UseWizardNavigationReturn {
  activeStep: Ref<number>
  completedSteps: Ref<Set<number>>
  isLastStep: ComputedRef<boolean>
  markStepCompleted: (stepIndex: number) => void
  arePreviousStepsCompleted: (targetStep: number) => boolean
  handleNext: () => void
  handlePrev: () => void
  handleStepClick: (index: number) => void
  getStepState: (index: number) => string
  isStepAccessible: (index: number) => boolean
}

/**
 * useWizardNavigation composable
 * 
 * LEARNING: Provides navigation logic for wizard steps
 * WHY: Extracts navigation from component to composable
 * PATTERN: Composable that returns navigation functions and state
 */
export function useWizardNavigation(params: UseWizardNavigationParams): UseWizardNavigationReturn {
  const { steps, validateStep, showError } = params

  /**
   * LEARNING: Reactive state for tracking current step
   * WHY: Enables step navigation and visual feedback
   * PATTERN: Simple ref for step index (0-based)
   */
  const activeStep = ref(0)

  /**
   * LEARNING: Track completed steps for navigation guards
   * WHY: Prevents jumping to future steps if intermediate steps aren't completed
   * PATTERN: Set of completed step indices
   */
  const completedSteps = ref<Set<number>>(new Set())

  /**
   * LEARNING: Computed property for last step detection
   * WHY: Changes button text and behavior on final step
   * PATTERN: Computed boolean based on step index
   */
  const isLastStep = computed(() => activeStep.value === steps.length - 1)

  /**
   * LEARNING: Mark step as completed
   * WHY: Tracks which steps have been successfully completed
   * PATTERN: Add step index to completed steps set
   */
  const markStepCompleted = (stepIndex: number): void => {
    completedSteps.value.add(stepIndex)
  }

  /**
   * LEARNING: Check if all steps up to target are completed
   * WHY: Prevents jumping to future steps if intermediate steps aren't completed
   * PATTERN: Check if all steps from 0 to target-1 are in completedSteps set
   */
  const arePreviousStepsCompleted = (targetStep: number): boolean => {
    for (let i = 0; i < targetStep; i++) {
      if (!completedSteps.value.has(i)) {
        return false
      }
    }
    return true
  }

  /**
   * LEARNING: Navigation handlers for step progression
   * WHY: Enables Previous/Next navigation and step clicking
   * PATTERN: Simple increment/decrement with bounds checking and validation
   */
  const handleNext = (): void => {
    // Validate current step before allowing navigation
    const isValid = validateStep(activeStep.value)
    
    if (!isValid) {
      return
    }
    
    markStepCompleted(activeStep.value)
    
    if (activeStep.value < steps.length - 1) {
      activeStep.value++
    }
  }

  const handlePrev = (): void => {
    if (activeStep.value > 0) {
      activeStep.value--
    }
  }

  /**
   * LEARNING: Handle step click with validation
   * WHY: Prevents navigation to future steps if current step is invalid or intermediate steps aren't completed
   * PATTERN: Validate current step and check completion of intermediate steps before allowing navigation
   */
  const handleStepClick = (index: number): void => {
    if (index < activeStep.value) {
      activeStep.value = index
      return
    }
    
    // For forward navigation, validate current step and check intermediate steps
    if (index > activeStep.value) {
      const currentStepValid = validateStep(activeStep.value)
      if (!currentStepValid) {
        showError?.('Please complete all required fields before continuing')
        return
      }
      
      markStepCompleted(activeStep.value)
      
      // If jumping multiple steps forward, validate all intermediate steps
      for (let i = activeStep.value + 1; i < index; i++) {
        if (!completedSteps.value.has(i)) {
          // Validate intermediate step
          const intermediateValid = validateStep(i)
          if (!intermediateValid) {
            showError?.(`Please complete step ${i + 1} before proceeding`)
            return
          }
          markStepCompleted(i)
        }
      }
    }
    
    activeStep.value = index
  }

  /**
   * LEARNING: Helper to determine step state classes
   * WHY: Provides visual feedback for step states (active, completed, pending)
   * PATTERN: Function returning class names
   */
  const getStepState = (index: number): string => {
    if (completedSteps.value.has(index)) {
      return 'step-completed'
    }
    if (index === activeStep.value) {
      return 'step-active'
    }
    return 'step-pending'
  }

  /**
   * LEARNING: Check if step is accessible (can be navigated to)
   * WHY: Prevents clicking on future steps that aren't accessible yet
   * PATTERN: Step is accessible if it's the current step, a completed step, or the next step after all completed steps
   */
  const isStepAccessible = (index: number): boolean => {
    if (index <= activeStep.value) {
      return true
    }
    
    if (index === activeStep.value + 1) {
      return true
    }
    
    return arePreviousStepsCompleted(index)
  }

  return {
    activeStep,
    completedSteps,
    isLastStep,
    markStepCompleted,
    arePreviousStepsCompleted,
    handleNext,
    handlePrev,
    handleStepClick,
    getStepState,
    isStepAccessible
  }
}




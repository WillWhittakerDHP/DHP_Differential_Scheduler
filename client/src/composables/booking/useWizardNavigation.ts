/**
 * WHY: useWizardNavigation Composable

WHY: Moves step navigation, validation c...
 */
import { ref, computed } from 'vue'
import type { WizardStepConfig } from '@/configs/wizardSteps'
import type {
  UseWizardNavigationParams,
  UseWizardNavigationReturn,
} from '@/types/booking/wizardNavigation'

export type { WizardStepConfig }
export type { UseWizardNavigationParams, UseWizardNavigationReturn } from '@/types/booking/wizardNavigation'

/**
 * WHY: useWizardNavigation composable

WHY: Extracts navigation from component ...
 */
export function useWizardNavigation(params: UseWizardNavigationParams): UseWizardNavigationReturn {
  const { steps, validateStep, showError } = params

  /**
   * LEARNING: Reactive state for tracking current step
   */
  const activeStep = ref(0)

  const completedSteps = ref<Set<number>>(new Set())

  const isLastStep = computed(() => activeStep.value === steps.length - 1)

  /**
   * LEARNING: Mark step as completed
   */
  const markStepCompleted = (stepIndex: number): void => {
    completedSteps.value.add(stepIndex)
  }

  const arePreviousStepsCompleted = (targetStep: number): boolean => {
    for (let i = 0; i < targetStep; i++) {
      if (!completedSteps.value.has(i)) {
        return false
      }
    }
    return true
  }

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




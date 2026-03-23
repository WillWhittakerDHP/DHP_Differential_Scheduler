import type { ComputedRef, Ref } from 'vue'
import type { UseWizardNavigationReturn } from '@/types/booking/wizardNavigation'

/**
 * Single return object for useWizardNavigation (returns-count threshold).
 */
export function buildWizardNavigationReturn(parts: {
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
}): UseWizardNavigationReturn {
  return {
    activeStep: parts.activeStep,
    completedSteps: parts.completedSteps,
    isLastStep: parts.isLastStep,
    markStepCompleted: parts.markStepCompleted,
    arePreviousStepsCompleted: parts.arePreviousStepsCompleted,
    handleNext: parts.handleNext,
    handlePrev: parts.handlePrev,
    handleStepClick: parts.handleStepClick,
    getStepState: parts.getStepState,
    isStepAccessible: parts.isStepAccessible,
  }
}

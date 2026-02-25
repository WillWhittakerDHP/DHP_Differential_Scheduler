import type { Ref, ComputedRef } from 'vue'
import type { WizardStepConfig } from '@/configs/wizardSteps'

export interface UseWizardNavigationParams {
  steps: WizardStepConfig[]
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

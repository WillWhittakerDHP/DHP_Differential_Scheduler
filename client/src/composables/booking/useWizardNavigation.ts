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
import {
  arePreviousStepsCompleted as arePreviousStepsCompletedSet,
  computeWizardStepState,
  isWizardStepAccessible,
  tryForwardWizardJump,
} from '@/utils/booking/wizardNavigationStepFlow'
import { buildWizardNavigationReturn } from '@/utils/booking/buildWizardNavigationReturn'

export type { WizardStepConfig }

/**
 * WHY: useWizardNavigation composable

WHY: Extracts navigation from component ...
 */
export function useWizardNavigation(params: UseWizardNavigationParams): UseWizardNavigationReturn {
  const { steps, validateStep, showError } = params

  const activeStep = ref(0)

  const completedSteps = ref<Set<number>>(new Set())

  const isLastStep = computed(() => activeStep.value === steps.length - 1)

  const markStepCompleted = (stepIndex: number): void => {
    completedSteps.value.add(stepIndex)
  }

  const arePreviousStepsCompleted = (targetStep: number): boolean => {
    return arePreviousStepsCompletedSet(completedSteps.value, targetStep)
  }

  const handleNext = (): void => {
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

    if (index > activeStep.value) {
      const ok = tryForwardWizardJump({
        activeIndex: activeStep.value,
        targetIndex: index,
        completedSteps: completedSteps.value,
        validateStep,
        showError,
        markStepCompleted,
      })
      if (!ok) {
        return
      }
    }

    activeStep.value = index
  }

  const getStepState = (index: number): string => {
    return computeWizardStepState(completedSteps.value, index, activeStep.value)
  }

  const isStepAccessible = (index: number): boolean => {
    return isWizardStepAccessible(index, activeStep.value, completedSteps.value)
  }

  return buildWizardNavigationReturn({
    activeStep,
    completedSteps,
    isLastStep,
    markStepCompleted,
    arePreviousStepsCompleted,
    handleNext,
    handlePrev,
    handleStepClick,
    getStepState,
    isStepAccessible,
  })
}

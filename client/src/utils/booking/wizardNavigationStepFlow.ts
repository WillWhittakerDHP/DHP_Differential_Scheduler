/**
 * Pure / imperative step flow helpers for useWizardNavigation (function-governance extraction).
 */

function arePreviousStepsCompletedCore(completedSteps: Set<number>, targetStep: number): boolean {
  for (let i = 0; i < targetStep; i++) {
    if (!completedSteps.has(i)) {
      return false
    }
  }
  return true
}

export function arePreviousStepsCompleted(completedSteps: Set<number>, targetStep: number): boolean {
  return arePreviousStepsCompletedCore(completedSteps, targetStep)
}

export function computeWizardStepState(
  completedSteps: Set<number>,
  index: number,
  activeIndex: number
): string {
  if (completedSteps.has(index)) {
    return 'step-completed'
  }
  if (index === activeIndex) {
    return 'step-active'
  }
  return 'step-pending'
}

export function isWizardStepAccessible(
  index: number,
  activeIndex: number,
  completedSteps: Set<number>
): boolean {
  if (index <= activeIndex) {
    return true
  }
  if (index === activeIndex + 1) {
    return true
  }
  return arePreviousStepsCompletedCore(completedSteps, index)
}

interface TryForwardWizardJumpParams {
  activeIndex: number
  targetIndex: number
  completedSteps: Set<number>
  validateStep: (stepIndex: number) => boolean
  showError?: (message: string) => void
  markStepCompleted: (stepIndex: number) => void
}

/**
 * Validates current + intermediate steps when jumping forward; mutates completedSteps via markStepCompleted.
 * @returns whether navigation to targetIndex is allowed
 */
export function tryForwardWizardJump(params: TryForwardWizardJumpParams): boolean {
  const { activeIndex, targetIndex, completedSteps, validateStep, showError, markStepCompleted } = params

  if (targetIndex <= activeIndex) {
    return true
  }

  if (!validateStep(activeIndex)) {
    showError?.('Please complete all required fields before continuing')
    return false
  }

  markStepCompleted(activeIndex)

  for (let i = activeIndex + 1; i < targetIndex; i++) {
    if (!completedSteps.has(i)) {
      if (!validateStep(i)) {
        showError?.(`Please complete step ${i + 1} before proceeding`)
        return false
      }
      markStepCompleted(i)
    }
  }

  return true
}

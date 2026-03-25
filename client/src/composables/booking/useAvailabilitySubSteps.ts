/**
 * Sub-step model for the availability mini-wizard (Phase 6.9).
 * Exposes visible sub-steps, current index, and completed set for the accordion
 * (expandable cards) and for 6.9.3 (a11y) / 6.9.4 (5th content).
 *
 * Task 6.9.2.2: State is explicit — currentStepIndex and completedStepIndices are stable
 * and consumed by AvailabilityStep (auto-expand), AvailabilitySubStepHeader (badge/summary),
 * and will be used by 6.9.3 (a11y focus/aria) and 6.9.4 (5th step content).
 */
import { computed, type ComputedRef, type Ref } from 'vue'

export interface AvailabilitySubStepDef {
  index: number
  label: string
  visible: boolean
}

interface UseAvailabilitySubStepsParams {
  hasOptions: Ref<boolean>
  hasDateSelected: Ref<boolean>
  isEffectivelyDifferential: Ref<boolean>
  hasMinimizerPartsGated: Ref<boolean>
  /** When false (e.g. contingency "No"), step 4 is skipped — minimizer confirms without completion UI. */
  showMinimizerSubstep: Ref<boolean>
  /** Step 1 tailor: options done (if hasOptions) and contingency+deadline done (if gated). */
  tailorSubStepComplete: Ref<boolean>
  selectedOptionTypeBlockId: Ref<string | null>
  userHasChosenTimeBasisFromGraph: Ref<boolean>
  hasSlotSelected: Ref<boolean>
  hasMinimizerConfirmed: Ref<boolean>
  /** When provided, panel opens first unconfirmed step (prefilled vs confirmed). Omit for completion-based behavior. */
  confirmationState?: { isConfirmed: (stepIndex: number) => boolean }
  /** Admin-configurable card titles. Perspective (2) uses differentialGraphDefaultLabel. */
  subStepLabels?: Ref<{ 0?: string; 1?: string; 2?: string; 3?: string; 4?: string }>
}

export interface UseAvailabilitySubStepsReturn {
  /** Visible sub-steps (1–5) with labels; step 2/3/5 visibility from params. */
  visibleSubSteps: ComputedRef<AvailabilitySubStepDef[]>
  /** 0-based index of the current (active) sub-step. */
  currentStepIndex: ComputedRef<number>
  /** 0-based indices of completed sub-steps (for done indicator when collapsed). */
  completedStepIndices: ComputedRef<Set<number>>
}

const SUB_STEP_LABELS: Record<number, string> = {
  0: 'Pick a day',
  1: 'Options',
  2: 'Perspective',
  3: 'Pick a time',
  4: 'Confirm minimizer details',
}

export function useAvailabilitySubSteps(
  params: UseAvailabilitySubStepsParams
): UseAvailabilitySubStepsReturn {
  const visibleSubSteps = computed<AvailabilitySubStepDef[]>(() => {
    const labels = params.subStepLabels?.value
    const label = (i: number) => labels?.[i as 0 | 1 | 2 | 3 | 4] ?? SUB_STEP_LABELS[i]
    const steps: AvailabilitySubStepDef[] = []
    const push = (i: number, visible: boolean): void => {
      steps.push({ index: i, label: label(i), visible })
    }
    // WHY: Tailor step shows cascade options and/or minimizer contingency; same DOM order (1 then 0) when visible.
    const showTailorStep = params.hasOptions.value || params.hasMinimizerPartsGated.value
    if (showTailorStep) {
      push(1, true)
      push(0, true)
    } else {
      push(0, true)
      push(1, false)
    }
    push(2, false)
    push(3, true)
    push(4, params.showMinimizerSubstep.value)
    return steps
  })

  const completedStepIndices = computed<Set<number>>(() => {
    const conf = params.confirmationState
    if (conf) {
      const completed = new Set<number>()
      if (conf.isConfirmed(0)) completed.add(0)
      if (conf.isConfirmed(1)) completed.add(1)
      if (conf.isConfirmed(2)) completed.add(2)
      if (conf.isConfirmed(3)) completed.add(3)
      if (conf.isConfirmed(4)) completed.add(4)
      return completed
    }
    const completed = new Set<number>()
    if (params.hasDateSelected.value) completed.add(0)
    if (params.tailorSubStepComplete.value) completed.add(1)
    if (!params.isEffectivelyDifferential.value || params.userHasChosenTimeBasisFromGraph.value) completed.add(2)
    if (params.hasSlotSelected.value) completed.add(3)
    if (!params.hasMinimizerPartsGated.value || params.hasMinimizerConfirmed.value) completed.add(4)
    return completed
  })

  const currentStepIndex = computed<number>(() => {
    const visible = visibleSubSteps.value.filter((s) => s.visible)
    const conf = params.confirmationState
    if (conf) {
      const firstUnconfirmed = visible.find((s) => !conf.isConfirmed(s.index))
      if (firstUnconfirmed) return firstUnconfirmed.index
      if (visible.length > 0) return -1
    } else {
      const completed = completedStepIndices.value
      const firstIncomplete = visible.find((s) => !completed.has(s.index))
      if (firstIncomplete) return firstIncomplete.index
      if (visible.length > 0) return -1
    }
    return 0
  })

  return {
    visibleSubSteps,
    currentStepIndex,
    completedStepIndices,
  }
}

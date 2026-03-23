/**
 * Prefilled vs confirmed state for the availability sub-step accordion (Phase 6.9).
 * Separates "data exists" from "user confirmed in this session" so the accordion
 * opens the first unconfirmed step (e.g. when resuming a loaded appointment).
 */
import { reactive } from 'vue'

interface AvailabilityConfirmationState {
  dateConfirmed: boolean
  optionConfirmed: boolean
  perspectiveConfirmed: boolean
  slotConfirmed: boolean
  moveableConfirmed: boolean
}

export interface UseAvailabilityConfirmationStateReturn {
  /** Reactive confirmation flags per sub-step. */
  state: AvailabilityConfirmationState
  /** Mark step as confirmed (call when user interacts). */
  confirm: (stepIndex: number) => void
  /** Check if step is confirmed. */
  isConfirmed: (stepIndex: number) => boolean
  /** Reset all flags (e.g. when entering with loaded appointment). */
  reset: () => void
}

const INITIAL_STATE: AvailabilityConfirmationState = {
  dateConfirmed: false,
  optionConfirmed: false,
  perspectiveConfirmed: false,
  slotConfirmed: false,
  moveableConfirmed: false,
}

const STEP_FLAG_KEYS: (keyof AvailabilityConfirmationState)[] = [
  'dateConfirmed',
  'optionConfirmed',
  'perspectiveConfirmed',
  'slotConfirmed',
  'moveableConfirmed',
]

function setConfirmationForStep(state: AvailabilityConfirmationState, stepIndex: number): void {
  const key = STEP_FLAG_KEYS[stepIndex]
  if (key !== undefined) {
    state[key] = true
  }
}

function getConfirmationForStep(state: AvailabilityConfirmationState, stepIndex: number): boolean {
  const key = STEP_FLAG_KEYS[stepIndex]
  return key !== undefined ? state[key] : false
}

function resetConfirmationState(state: AvailabilityConfirmationState): void {
  for (const key of STEP_FLAG_KEYS) {
    state[key] = false
  }
}

export function useAvailabilityConfirmationState(): UseAvailabilityConfirmationStateReturn {
  const state = reactive<AvailabilityConfirmationState>({ ...INITIAL_STATE })

  const confirm = (stepIndex: number): void => setConfirmationForStep(state, stepIndex)

  const isConfirmed = (stepIndex: number): boolean => getConfirmationForStep(state, stepIndex)

  const reset = (): void => resetConfirmationState(state)

  return {
    state,
    confirm,
    isConfirmed,
    reset,
  }
}

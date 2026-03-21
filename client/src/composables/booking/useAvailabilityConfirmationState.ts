/**
 * Prefilled vs confirmed state for the availability sub-step accordion (Phase 6.9).
 * Separates "data exists" from "user confirmed in this session" so the accordion
 * opens the first unconfirmed step (e.g. when resuming a loaded appointment).
 */
import { reactive } from 'vue'

export interface AvailabilityConfirmationState {
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

export function useAvailabilityConfirmationState(): UseAvailabilityConfirmationStateReturn {
  const state = reactive<AvailabilityConfirmationState>({ ...INITIAL_STATE })

  const confirm = (stepIndex: number): void => {
    if (stepIndex === 0) state.dateConfirmed = true
    else if (stepIndex === 1) state.optionConfirmed = true
    else if (stepIndex === 2) state.perspectiveConfirmed = true
    else if (stepIndex === 3) state.slotConfirmed = true
    else if (stepIndex === 4) state.moveableConfirmed = true
  }

  const isConfirmed = (stepIndex: number): boolean => {
    if (stepIndex === 0) return state.dateConfirmed
    if (stepIndex === 1) return state.optionConfirmed
    if (stepIndex === 2) return state.perspectiveConfirmed
    if (stepIndex === 3) return state.slotConfirmed
    if (stepIndex === 4) return state.moveableConfirmed
    return false
  }

  const reset = (): void => {
    state.dateConfirmed = false
    state.optionConfirmed = false
    state.perspectiveConfirmed = false
    state.slotConfirmed = false
    state.moveableConfirmed = false
  }

  return {
    state,
    confirm,
    isConfirmed,
    reset,
  }
}

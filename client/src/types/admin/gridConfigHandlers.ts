import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import type { WizardCopyLabelFields } from '@shared/types/wizardSettingsTypes'

type GridDifferentialLabels = Required<WizardCopyLabelFields>

/**
 * State shape required by useGridConfigHandlers.
 * Reactive/unwrapped view of formState + differential from BUSINESS_CONTROLS_STATE_KEY.
 */
export interface GridConfigState {
  formState: {
    minuteIncrement: number
    setMinuteIncrement: (v: number) => void
  }
  differential: GridDifferentialLabels & {
    majorAttendees: GlobalEntityId[]
    minorAttendees: GlobalEntityId[]
  }
}

export interface UseGridConfigHandlersReturn {
  handleMinuteIncrement: (v: number | string) => void
  handleMajorAttendees: (v: unknown) => void
  handleMinorAttendees: (v: unknown) => void
  handleMajorLabel: (v: string) => void
  handleMinorLabel: (v: string) => void
  handleDifferentialGraphDefaultLabel: (v: string) => void
  handleMoveableFallbackLabel: (v: string) => void
  handleMajorStateLabel: (v: string) => void
  handleMinorStateLabel: (v: string) => void
  handleSubStepLabelPickDay: (v: string) => void
  handleSubStepLabelOptions: (v: string) => void
  handleSubStepLabelPickTime: (v: string) => void
  handleSubStepLabelConfirmMoveable: (v: string) => void
  handleMoveableNoFeasibleCompletionSlotsMessage: (v: string) => void
}

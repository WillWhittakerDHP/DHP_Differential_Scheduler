import type { GlobalEntityId } from '@shared/types/primitiveBrands'

/**
 * State shape required by useGridConfigHandlers.
 * Reactive/unwrapped view of formState + differential from BUSINESS_CONTROLS_STATE_KEY.
 */
export interface GridConfigState {
  formState: {
    minuteIncrement: number
    setMinuteIncrement: (v: number) => void
  }
  differential: {
    majorAttendees: GlobalEntityId[]
    minorAttendees: GlobalEntityId[]
    majorLabel: string
    minorLabel: string
    differentialGraphDefaultLabel: string
    moveableFallbackLabel: string
    majorStateLabel: string
    minorStateLabel: string
    subStepLabelPickDay: string
    subStepLabelOptions: string
    subStepLabelPickTime: string
    subStepLabelConfirmMoveable: string
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
}

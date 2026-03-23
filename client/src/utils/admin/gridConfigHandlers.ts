import type {
  GridConfigState,
  UseGridConfigHandlersReturn,
} from '@/types/admin/gridConfigHandlers'

/**
 * Returns handlers for GridConfigPanel that write into formState and differential.
 * Keeps the panel thin (vue-architecture audit).
 */
export function useGridConfigHandlers(state: GridConfigState): UseGridConfigHandlersReturn {
  const { formState, differential } = state

  return {
    handleMinuteIncrement(v: number | string): void {
      formState.setMinuteIncrement(Number(v))
    },
    handleMajorAttendees(v: unknown): void {
      differential.majorAttendees = v as typeof differential.majorAttendees
    },
    handleMinorAttendees(v: unknown): void {
      differential.minorAttendees = v as typeof differential.minorAttendees
    },
    handleMajorLabel(v: string): void {
      differential.majorLabel = v
    },
    handleMinorLabel(v: string): void {
      differential.minorLabel = v
    },
    handleDifferentialGraphDefaultLabel(v: string): void {
      differential.differentialGraphDefaultLabel = v
    },
    handleMoveableFallbackLabel(v: string): void {
      differential.moveableFallbackLabel = v
    },
    handleMajorStateLabel(v: string): void {
      differential.majorStateLabel = v
    },
    handleMinorStateLabel(v: string): void {
      differential.minorStateLabel = v
    },
    handleSubStepLabelPickDay(v: string): void {
      differential.subStepLabelPickDay = v
    },
    handleSubStepLabelOptions(v: string): void {
      differential.subStepLabelOptions = v
    },
    handleSubStepLabelPickTime(v: string): void {
      differential.subStepLabelPickTime = v
    },
    handleSubStepLabelConfirmMoveable(v: string): void {
      differential.subStepLabelConfirmMoveable = v
    },
    handleMoveableNoFeasibleCompletionSlotsMessage(v: string): void {
      differential.moveableNoFeasibleCompletionSlotsMessage = v
    },
  }
}

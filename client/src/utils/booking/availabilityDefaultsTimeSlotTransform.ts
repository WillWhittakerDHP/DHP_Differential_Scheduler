/**
 * WHY: Map wizard persisted candidate slots into LoadedTimeSlot[] for matchLoadedTimeSlots.
 */

import type { RFC3339DateTime } from '@shared/types/primitiveBrands'
import type { LoadedTimeSlot } from '@/types/booking/timeSlotMatching'

export interface WizardCandidateTimeSlotPersisted {
  time: string
  duration: number
}

export function wizardCandidateSlotsToLoadedSlots(
  candidateTimeSlots: WizardCandidateTimeSlotPersisted[]
): LoadedTimeSlot[] {
  return candidateTimeSlots.map((slot) => ({
    startTime: slot.time as RFC3339DateTime,
    endTime: undefined,
  }))
}

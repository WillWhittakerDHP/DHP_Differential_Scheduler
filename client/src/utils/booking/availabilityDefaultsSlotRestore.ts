/**
 * WHY: Pure restore of per-date slot index from persisted wizard candidate slots.
 */

import type { TimeSlot } from '@/types/appointment'
import { findMatchingTimeSlot } from '@/utils/booking/timeSlotMatching'

export interface WizardRestoreCandidateSlot {
  startTime?: string
  time?: string
}

export function computeSlotRestoreUpdate(
  restoreVal: unknown,
  slots: TimeSlot[] | null | undefined,
  dateStart: string | null
): { dateKey: string; index: number } | null {
  const data = restoreVal as { candidateTimeSlots?: WizardRestoreCandidateSlot[] } | null | undefined
  const slotList = slots ?? []
  if (!data?.candidateTimeSlots?.length || slotList.length === 0 || !dateStart) {
    return null
  }
  const first = data.candidateTimeSlots[0]
  const startKey = first?.startTime ?? first?.time
  if (!startKey) {
    return null
  }
  const matched = findMatchingTimeSlot(startKey, slotList)
  if (!matched) {
    return null
  }
  const index = slotList.indexOf(matched)
  if (index < 0) {
    return null
  }
  return { dateKey: dateStart, index }
}

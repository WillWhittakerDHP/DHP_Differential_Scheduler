/**
 * WHY: Moveable stepper + confirm rows need the same local-calendar Today/Tomorrow/weekday rules as slot times.
 * Pure transforms — copy strings passed from composables (no AVAILABILITY_SUBSTEP_UI import here).
 */
import type { RFC3339DateTime } from '@shared/types/primitiveBrands'
import {
  addLocalCalendarDays,
  formatLocalCalendarKeyWithWeekday,
  localCalendarDateKeyFromDate,
} from '@/utils/time/localCalendarDisplay'

export interface MoveableStepperDayLabelCopy {
  noSelection: string
  today: string
  tomorrow: string
}

export interface MoveableSlotRowDayLabelCopy {
  today: string
  tomorrow: string
}

export function resolveMoveableStepperAnchorDate(
  selectedUtcDayKey: string,
  slots: readonly { startTime: string }[]
): Date {
  if (slots.length === 0) {
    return new Date(`${selectedUtcDayKey}T12:00:00.000Z`)
  }
  let bestMs = new Date(slots[0].startTime).getTime()
  let bestStart = slots[0].startTime
  for (let i = 1; i < slots.length; i += 1) {
    const ms = new Date(slots[i].startTime).getTime()
    if (ms < bestMs) {
      bestMs = ms
      bestStart = slots[i].startTime
    }
  }
  return new Date(bestStart)
}

function formatLocalRelativeDayHeading(
  anchor: Date,
  copy: MoveableSlotRowDayLabelCopy
): string {
  const anchorLocal = localCalendarDateKeyFromDate(anchor)
  const todayLocal = localCalendarDateKeyFromDate(new Date())
  const tomorrowLocal = addLocalCalendarDays(todayLocal, 1)
  if (anchorLocal === todayLocal) return copy.today
  if (anchorLocal === tomorrowLocal) return copy.tomorrow
  return formatLocalCalendarKeyWithWeekday(anchorLocal)
}

export function computeMoveableStepperDayLabel(
  selectedUtcDayKey: string | null,
  slots: readonly { startTime: string }[],
  copy: MoveableStepperDayLabelCopy
): string {
  if (!selectedUtcDayKey) return copy.noSelection
  const anchor = resolveMoveableStepperAnchorDate(selectedUtcDayKey, slots)
  return formatLocalRelativeDayHeading(anchor, copy)
}

export function computeMoveableSlotRowDayLabel(
  slotStartIso: RFC3339DateTime,
  copy: MoveableSlotRowDayLabelCopy
): string {
  return formatLocalRelativeDayHeading(new Date(slotStartIso), copy)
}

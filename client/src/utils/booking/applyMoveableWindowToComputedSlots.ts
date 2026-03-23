import type { ComputedSlot } from '@shared/types/availabilityTypes'
import type { RFC3339DateTime } from '@shared/types/primitiveBrands'
import { toRFC3339DateTime } from '@/utils/datetime'
import type { MoveableSchedulingOptions } from '@/types/moveableScheduling'
import type { MoveableSchedulingWindow } from '@/types/booking/moveableSchedulingWindow'

export type MoveableWindowApplicationMode = 'exclude' | 'markUnavailable'

export const MOVEABLE_WINDOW_VIOLATION_BEFORE_ONSITE = 'range.moveableWindow.beforeOnsiteEnd' as const
export const MOVEABLE_WINDOW_VIOLATION_AFTER_DEADLINE = 'range.moveableWindow.afterDeadline' as const
export const INSPECTION_DEADLINE_VIOLATION = 'range.inspectionDeadline.noRoomForMoveable' as const

/**
 * Mark or drop inspection ComputedSlots where onsite end leaves no time for moveable work + buffer before deadline.
 * Compares slot.endTime (UTC) to deadline minus (moveableDurationMinutes + bufferMinutes).
 */
export function applyDeadlineConstraintToInspectionSlots(
  slots: ComputedSlot[],
  deadlineUtcMs: number | null,
  moveableDurationMinutes: number,
  bufferMinutes: number,
  mode: MoveableWindowApplicationMode
): ComputedSlot[] {
  if (deadlineUtcMs === null || Number.isNaN(deadlineUtcMs) || moveableDurationMinutes <= 0) {
    return slots
  }
  const reserveMs = (moveableDurationMinutes + bufferMinutes) * 60_000
  const latestViableEndMs = deadlineUtcMs - reserveMs
  if (Number.isNaN(latestViableEndMs)) {
    return slots
  }

  const violates = (slot: ComputedSlot): boolean => {
    const endMs = new Date(slot.endTime).getTime()
    return !Number.isNaN(endMs) && endMs > latestViableEndMs
  }

  if (mode === 'exclude') {
    return slots.filter((slot) => !violates(slot))
  }

  return slots.map((slot) => {
    if (!violates(slot)) {
      return slot
    }
    return {
      ...slot,
      isAvailable: false,
      violations: [...slot.violations, INSPECTION_DEADLINE_VIOLATION],
    }
  })
}

/**
 * First UTC calendar day (YYYY-MM-DD) on which moveable work may start — onsite end + appointment buffer.
 * Use this for moveable day pickers and allowed-date predicates (not raw innerBoundary date).
 */
export function earliestMoveableUtcDayKey(
  innerBoundaryIso: string,
  afterBufferMinutes: number
): string | null {
  const innerMs = new Date(innerBoundaryIso).getTime()
  if (Number.isNaN(innerMs)) return null
  const bufferMs = afterBufferMinutes * 60_000
  return toRFC3339DateTime(new Date(innerMs + bufferMs)).slice(0, 10)
}

/**
 * Build the transient moveable window from persisted moveable options + buffer + whether contingency has a closing datetime.
 */
export function buildMoveableSchedulingWindow(
  opts: MoveableSchedulingOptions | null,
  afterBufferMinutes: number,
  hasContingencyClosingDate: boolean
): MoveableSchedulingWindow | null {
  if (!opts) return null
  const innerMs = new Date(opts.innerBoundary).getTime()
  if (Number.isNaN(innerMs)) return null

  const bufferMs = afterBufferMinutes * 60_000
  const earliestStart = toRFC3339DateTime(new Date(innerMs + bufferMs))

  let latestEnd: RFC3339DateTime | null = null
  if (hasContingencyClosingDate) {
    const outerMs = new Date(opts.outerBoundary).getTime()
    if (!Number.isNaN(outerMs)) {
      latestEnd = toRFC3339DateTime(new Date(outerMs))
    }
  }

  return { earliestStart, latestEnd }
}

function slotViolatesWindow(
  slot: ComputedSlot,
  window: MoveableSchedulingWindow
): { beforeOnsite: boolean; afterDeadline: boolean } {
  const startMs = new Date(slot.startTime).getTime()
  const endMs = new Date(slot.endTime).getTime()
  const earliestMs = new Date(window.earliestStart).getTime()

  const beforeOnsite = Number.isNaN(startMs) || Number.isNaN(earliestMs) ? true : startMs < earliestMs

  let afterDeadline = false
  if (window.latestEnd !== null) {
    const latestMs = new Date(window.latestEnd).getTime()
    afterDeadline =
      !Number.isNaN(endMs) && !Number.isNaN(latestMs) ? endMs > latestMs : false
  }

  return { beforeOnsite, afterDeadline }
}

/**
 * Apply the client virtual moveable window to server computed slots.
 * - exclude: drop invalid slots (default grid UX).
 * - markUnavailable: keep all rows; mark failing slots unavailable and append violation keys (for dev/teaching).
 */
export function applyMoveableWindowToComputedSlots(
  slots: ComputedSlot[],
  window: MoveableSchedulingWindow | null,
  mode: MoveableWindowApplicationMode
): ComputedSlot[] {
  if (!window) {
    return mode === 'exclude' ? [] : slots
  }

  if (mode === 'exclude') {
    return slots.filter((slot) => {
      const { beforeOnsite, afterDeadline } = slotViolatesWindow(slot, window)
      return !beforeOnsite && !afterDeadline
    })
  }

  return slots.map((slot) => {
    const { beforeOnsite, afterDeadline } = slotViolatesWindow(slot, window)
    if (!beforeOnsite && !afterDeadline) {
      return slot
    }
    const extra: string[] = []
    if (beforeOnsite) extra.push(MOVEABLE_WINDOW_VIOLATION_BEFORE_ONSITE)
    if (afterDeadline) extra.push(MOVEABLE_WINDOW_VIOLATION_AFTER_DEADLINE)
    return {
      ...slot,
      isAvailable: false,
      violations: [...slot.violations, ...extra],
    }
  })
}

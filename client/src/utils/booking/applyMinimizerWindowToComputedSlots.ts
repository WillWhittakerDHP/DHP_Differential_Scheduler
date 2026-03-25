import type { ComputedSlot } from '@shared/types/availabilityTypes'
import type { RFC3339DateTime } from '@shared/types/primitiveBrands'
import { toRFC3339DateTime } from '@/utils/datetime'
import type { MinimizerSchedulingOptions } from '@/types/minimizerScheduling'
import type { MinimizerSchedulingWindow } from '@/types/booking/minimizerSchedulingWindow'

type MinimizerWindowApplicationMode = 'exclude' | 'markUnavailable'

const MINIMIZER_WINDOW_VIOLATION_BEFORE_ONSITE = 'range.minimizerWindow.beforeOnsiteEnd' as const
const MINIMIZER_WINDOW_VIOLATION_AFTER_DEADLINE = 'range.minimizerWindow.afterDeadline' as const
const INSPECTION_DEADLINE_VIOLATION = 'range.inspectionDeadline.noRoomForMinimizer' as const

/**
 * Mark or drop inspection ComputedSlots where onsite end leaves no time for minimizer work + buffer before deadline.
 * Compares slot.endTime (UTC) to deadline minus (minimizerDurationMinutes + bufferMinutes).
 */
export function applyDeadlineConstraintToInspectionSlots(
  slots: ComputedSlot[],
  deadlineUtcMs: number | null,
  minimizerDurationMinutes: number,
  bufferMinutes: number,
  mode: MinimizerWindowApplicationMode
): ComputedSlot[] {
  if (deadlineUtcMs === null || Number.isNaN(deadlineUtcMs) || minimizerDurationMinutes <= 0) {
    return slots
  }
  const reserveMs = (minimizerDurationMinutes + bufferMinutes) * 60_000
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
 * First UTC calendar day (YYYY-MM-DD) on which minimizer work may start — onsite end + appointment buffer.
 * Use this for minimizer day pickers and allowed-date predicates (not raw innerBoundary date).
 */
export function earliestMinimizerUtcDayKey(
  innerBoundaryIso: string,
  afterBufferMinutes: number
): string | null {
  const innerMs = new Date(innerBoundaryIso).getTime()
  if (Number.isNaN(innerMs)) return null
  const bufferMs = afterBufferMinutes * 60_000
  return toRFC3339DateTime(new Date(innerMs + bufferMs)).slice(0, 10)
}

/**
 * Build the transient minimizer window from persisted minimizer options + buffer + whether contingency has a closing datetime.
 */
export function buildMinimizerSchedulingWindow(
  opts: MinimizerSchedulingOptions | null,
  afterBufferMinutes: number,
  hasContingencyClosingDate: boolean
): MinimizerSchedulingWindow | null {
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
  window: MinimizerSchedulingWindow
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
 * Apply the client virtual minimizer window to server computed slots.
 * - exclude: drop invalid slots (default grid UX).
 * - markUnavailable: keep all rows; mark failing slots unavailable and append violation keys (for dev/teaching).
 */
export function applyMinimizerWindowToComputedSlots(
  slots: ComputedSlot[],
  window: MinimizerSchedulingWindow | null,
  mode: MinimizerWindowApplicationMode
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
    if (beforeOnsite) extra.push(MINIMIZER_WINDOW_VIOLATION_BEFORE_ONSITE)
    if (afterDeadline) extra.push(MINIMIZER_WINDOW_VIOLATION_AFTER_DEADLINE)
    return {
      ...slot,
      isAvailable: false,
      violations: [...slot.violations, ...extra],
    }
  })
}

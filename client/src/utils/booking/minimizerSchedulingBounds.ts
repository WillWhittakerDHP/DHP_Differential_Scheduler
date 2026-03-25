/**
 * Pure helpers for minimizer scheduling boundaries. Extracted so composables can share without circular deps.
 */
import type { AppointmentSlot } from '@/types/appointment'
import type { ContingencyPeriod } from '@/types/minimizerScheduling'
import type { RFC3339DateTime } from '@shared/types/primitiveBrands'
import { toRFC3339DateTime } from '@/utils/datetime'
import { parseContingencyDeadlineLocalWallToUtcMs } from '@/utils/booking/clampContingencyDeadlineToEarliest'
import { resolveEventShapes } from '@/utils/booking/perspectiveResolver'
import { DEFAULT_OUTER_BOUNDARY_DAYS } from '@/constants/minimizerScheduling'

/**
 * Compute the outer boundary for minimizer scheduling based on contingency period.
 * When contingency is Yes with both date and time, deadline is **local** wall clock (native inputs) → RFC3339 UTC.
 * If only date is set, falls back like "no deadline" so we do not invent a time.
 * Otherwise falls back to DEFAULT_OUTER_BOUNDARY_DAYS from the inner boundary.
 */
export function computeOuterBoundary(
  contingencyPeriod: ContingencyPeriod,
  innerBoundary: RFC3339DateTime
): RFC3339DateTime {
  if (
    contingencyPeriod.hasContingency === true &&
    contingencyPeriod.endDate &&
    contingencyPeriod.endTime
  ) {
    const ms = parseContingencyDeadlineLocalWallToUtcMs(
      contingencyPeriod.endDate,
      contingencyPeriod.endTime
    )
    if (ms !== null && !Number.isNaN(ms)) {
      return toRFC3339DateTime(new Date(ms))
    }
  }

  const d = new Date(innerBoundary)
  return toRFC3339DateTime(
    new Date(
      Date.UTC(
        d.getUTCFullYear(),
        d.getUTCMonth(),
        d.getUTCDate() + DEFAULT_OUTER_BOUNDARY_DAYS,
        17,
        0,
        0,
        0
      )
    )
  )
}

/**
 * Extract the inner boundary from a slot using the major event's end time.
 */
export function extractInnerBoundary(slot: AppointmentSlot): RFC3339DateTime | null {
  if (slot.shape.slotShape.eventFinals.length > 0) {
    const { majorEventName } = resolveEventShapes(
      slot.shape.slotShape.eventFinals,
      slot.shape.differentialEventRoleOverrides ?? null
    )
    const majorTimeRange = majorEventName
      ? (slot.eventTimeRanges?.[majorEventName] ?? null)
      : null
    if (majorTimeRange?.endTime) return majorTimeRange.endTime
  }
  return slot.totalTimeRange?.endTime ?? null
}

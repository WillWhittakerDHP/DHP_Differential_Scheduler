/**
 * Pure helpers for moveable scheduling boundaries. Extracted so composables can share without circular deps.
 */
import type { AppointmentSlot } from '@/types/appointment'
import type { ContingencyPeriod } from '@/types/moveableScheduling'
import type { RFC3339DateTime } from '@shared/types/primitiveBrands'
import { toRFC3339DateTime } from '@/utils/datetime'
import { resolveEventShapes } from '@/utils/booking/perspectiveResolver'
import { DEFAULT_OUTER_BOUNDARY_DAYS } from '@/constants/moveableScheduling'

/**
 * Compute the outer boundary for moveable scheduling based on contingency period.
 * Falls back to DEFAULT_OUTER_BOUNDARY_DAYS from the inner boundary when no contingency.
 */
export function computeOuterBoundary(
  contingencyPeriod: ContingencyPeriod,
  innerBoundary: RFC3339DateTime
): RFC3339DateTime {
  if (contingencyPeriod.hasContingency && contingencyPeriod.endDate) {
    const [year, month, day] = contingencyPeriod.endDate.split('-').map(Number)
    const hours = contingencyPeriod.endTime
      ? Number(contingencyPeriod.endTime.split(':')[0])
      : 17
    const minutes = contingencyPeriod.endTime
      ? Number(contingencyPeriod.endTime.split(':')[1])
      : 0
    return toRFC3339DateTime(new Date(Date.UTC(year, month - 1, day, hours, minutes, 0, 0)))
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
    const { majorEventName } = resolveEventShapes(slot.shape.slotShape.eventFinals)
    const majorTimeRange = majorEventName
      ? (slot.eventTimeRanges?.[majorEventName] ?? null)
      : null
    if (majorTimeRange?.endTime) return majorTimeRange.endTime
  }
  return slot.totalTimeRange?.endTime ?? null
}

/**
 * SlotShape Lookups
 *
 */

import type { TimeRange } from '@/types/appointment'
import type { SlotShape, EventFinal } from '@/types/appointment'
import { createTimeRange } from './slotTimeUtils'

/**
 * Find EventFinal by event shape name
 *
 * @param slotShape - SlotShape with eventFinals array
 * @param name - Event shape name (e.g. Major, Minor, Moveable)
 * @returns EventFinal if found, undefined otherwise
 */
export function findEventFinalByName(
  slotShape: SlotShape,
  name: string
): EventFinal | undefined {
  return slotShape.eventFinals.find(ef => ef.eventShape.name === name)
}

/**
 * Convert SlotShape + startTime to TimeRange objects
 *
 * @param slotShape - SlotShape with eventFinals array
 * @param startTime - Base start time (ISO string)
 * @returns Object with precomputed TimeRanges including eventTimeRanges Record
 */
export function createTimeRangesFromSlotShape(
  slotShape: SlotShape,
  startTime: string
): {
  totalTimeRange: TimeRange | null
  eventTimeRanges: Record<string, TimeRange | null>
} {
  const eventFinals = Array.isArray(slotShape.eventFinals) ? slotShape.eventFinals : []

  const eventTimeRanges = eventFinals.reduce<Record<string, TimeRange | null>>(
    (acc, eventFinal) => {
      const eventName = eventFinal.eventShape.name
      const duration = eventFinal.roundedDuration
      return duration > 0
        ? { ...acc, [eventName]: createTimeRange(startTime, duration) }
        : { ...acc, [eventName]: null }
    },
    {}
  )

  return {
    totalTimeRange:
      slotShape.roundedDuration > 0
        ? createTimeRange(startTime, slotShape.roundedDuration)
        : null,
    eventTimeRanges
  }
}

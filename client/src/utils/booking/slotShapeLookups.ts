
import type { TimeRange } from '@/types/appointment'
import type { SlotShape, EventFinal } from '@/types/appointment'
import { createTimeRange } from './slotTimeUtils'

export function findEventFinalByName(
  slotShape: SlotShape,
  name: string
): EventFinal | undefined {
  return slotShape.eventFinals.find(ef => ef.eventShape.name === name)
}

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

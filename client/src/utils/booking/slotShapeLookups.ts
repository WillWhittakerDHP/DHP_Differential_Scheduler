
import type { SlotTimeBounds } from '@shared/types/availabilityTypes'
import type { SlotShape, EventFinal } from '@/types/appointment'
import { createTimeRange } from './slotTimeUtils'
import { createPlacedEventTimeRanges } from '@/utils/booking/eventSegmentPlacement'

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
  totalTimeRange: SlotTimeBounds | null
  eventTimeRanges: Record<string, SlotTimeBounds | null>
} {
  if (Array.isArray(slotShape.eventFinals) && slotShape.eventFinals.length > 0) {
    return createPlacedEventTimeRanges(slotShape, startTime)
  }

  return {
    totalTimeRange:
      slotShape.roundedDuration > 0
        ? createTimeRange(startTime, slotShape.roundedDuration)
        : null,
    eventTimeRanges: {}
  }
}

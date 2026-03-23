/**
 * WHY: Pure grouping of time slots by UTC date — dedupes logic between watchers and computeds.
 */

import type { TimeSlot } from '@/types/appointment'
import type { TimeSlotsPerDay } from '@/types/booking/availabilityLogic'
import { utcDateKeyFromSlotStartTime } from '@/utils/booking/utcSlotDateKey'

function groupTimeSlotsByUtcDateCore(slots: TimeSlot[]): Map<string, TimeSlot[]> {
  const slotsByDate = new Map<string, TimeSlot[]>()
  for (const slot of slots) {
    const slotDate = utcDateKeyFromSlotStartTime(slot.startTime)
    const list = slotsByDate.get(slotDate)
    if (list) {
      list.push(slot)
    } else {
      slotsByDate.set(slotDate, [slot])
    }
  }
  return slotsByDate
}

export function groupTimeSlotsByUtcDate(slots: TimeSlot[]): Map<string, TimeSlot[]> {
  return groupTimeSlotsByUtcDateCore(slots)
}

export function buildTimeSlotsPerDayFromSlots(slots: TimeSlot[]): TimeSlotsPerDay[] {
  const grouped = groupTimeSlotsByUtcDateCore(slots)
  return Array.from(grouped.entries()).map(([date, daySlots]) => ({
    date,
    inspectorTimeSlots: daySlots,
    clientTimeSlots: daySlots,
  }))
}

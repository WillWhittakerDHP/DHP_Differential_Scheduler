/**
 */
import type { RFC3339DateTime } from '@shared/types/primitiveBrands'
import type { TimeSlot } from '@/types/appointment'
import type { LoadedTimeSlot, MatchLoadedTimeSlotsResult } from '@/types/booking/timeSlotMatching'
import { createLogger } from '@/utils/logger'
import { rfc3339ToLocalHHmm } from '@/utils/time/localTime'

const logger = createLogger('timeSlotMatching')

export type { LoadedTimeSlot, MatchLoadedTimeSlotsResult } from '@/types/booking/timeSlotMatching'

function extractTimeString(value: string | Date): string | null {
  try {
    let rfc3339: RFC3339DateTime

    if (value instanceof Date) {
      if (isNaN(value.getTime())) {
        return null
      }
      rfc3339 = value.toISOString() as RFC3339DateTime
    } else if (typeof value === 'string') {
      const date = new Date(value)
      if (isNaN(date.getTime())) {
        return null
      }
      rfc3339 = value as RFC3339DateTime
    } else {
      return null
    }

    return rfc3339ToLocalHHmm(rfc3339)
  } catch (err) {
    logger.warn('extractTimeString failed', { value, error: err })
    return null
  }
}

/** Find slot whose startTime matches the given time string. Accepts any array of objects with startTime. */
export function findMatchingTimeSlot<T extends { startTime: string }>(
  timeString: string,
  availableSlots: T[]
): T | undefined {
  const normalizedTime = extractTimeString(timeString)
  if (!normalizedTime) return undefined

  return availableSlots.find((slot) => {
    const slotTimeString = extractTimeString(slot.startTime)
    return slotTimeString === normalizedTime
  })
}

/**
 * Match loaded time slots to available slots and return results (pure, no Vue).
 * Algorithm: first loaded slot → inspector, second → client.
 */
export function matchLoadedTimeSlotsImmutable(
  loadedSlots: LoadedTimeSlot[],
  availableSlots: TimeSlot[]
): MatchLoadedTimeSlotsResult {
  const inspectorSlot =
    loadedSlots.length > 0
      ? findMatchingTimeSlot(loadedSlots[0].startTime, availableSlots)
      : undefined
  const clientSlot =
    loadedSlots.length > 1
      ? findMatchingTimeSlot(loadedSlots[1].startTime, availableSlots)
      : undefined
  return {
    inspectorSlot: inspectorSlot ?? null,
    clientSlot: clientSlot ?? null,
  }
}

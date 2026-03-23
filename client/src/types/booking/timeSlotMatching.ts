import type { TimeSlot } from '@/types/appointment'
import type { SlotTimeBounds } from '@shared/types/availabilityTypes'

/** Narrow slot shape for matching (start required; end optional until resolved). */
export type LoadedTimeSlot = Pick<SlotTimeBounds, 'startTime'> & { endTime?: SlotTimeBounds['endTime'] }

export interface MatchLoadedTimeSlotsResult {
  inspectorSlot: TimeSlot | null
  clientSlot: TimeSlot | null
}

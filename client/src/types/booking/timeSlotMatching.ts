import type { TimeSlot } from '@/types/appointment'
import type { RFC3339DateTime } from '@shared/types/primitiveBrands'

export interface LoadedTimeSlot {
  startTime: RFC3339DateTime
  endTime?: RFC3339DateTime
}

export interface MatchLoadedTimeSlotsResult {
  inspectorSlot: TimeSlot | null
  clientSlot: TimeSlot | null
}

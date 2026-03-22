import type { TimeSlot } from '@/types/appointment'

export interface TimeSlotsPerDay {
  date: string
  inspectorTimeSlots: TimeSlot[]
  clientTimeSlots: TimeSlot[]
}

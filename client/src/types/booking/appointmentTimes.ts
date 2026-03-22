import type { ComputedRef } from 'vue'
import type { AppointmentSlots, TimeSlot, TimeRange } from '@/types/appointment'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'

export interface UseAppointmentTimesParams {
  blockInstances: ComputedRef<BookingBlockInstance[]> | BookingBlockInstance[]
  baseStartTime?: ComputedRef<string | null> | string | null
  isDifferentialService: ComputedRef<boolean> | boolean
}

export interface UseAppointmentTimesReturn {
  appointmentSlots: ComputedRef<AppointmentSlots>
  majorTimeSlots: ComputedRef<TimeSlot[]>
  minorTimeSlots: ComputedRef<TimeSlot[]>
  getMajorTimeSlot: (orderIndex: number) => TimeSlot | TimeRange | null
  getMinorTimeSlot: (orderIndex: number) => TimeSlot | TimeRange | null
}

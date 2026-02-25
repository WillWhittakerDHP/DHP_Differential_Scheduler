import type { ComputedRef } from 'vue'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'

export interface UseAppointmentDurationParams {
  accumulatedBlockInstances: ComputedRef<BookingBlockInstance[]>
}

export interface UseAppointmentDurationReturn {
  appointmentDuration: ComputedRef<number | null>
}

import type { ComputedRef } from 'vue'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { AppointmentShape } from '@/types/appointment'

export interface UseAppointmentShapeParams {
  blockInstances: ComputedRef<BookingBlockInstance[]>
}

export interface UseAppointmentShapeReturn {
  appointmentShape: ComputedRef<AppointmentShape | null>
}

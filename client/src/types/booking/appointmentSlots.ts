import type { ComputedRef, Ref } from 'vue'
import type {
  AppointmentShape,
  AppointmentSlot,
  AppointmentSlots,
  TimeRange,
  PerspectiveKey,
} from '@/types/appointment'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { ComputedSlot } from '@shared/types/availabilityTypes'

export interface UseAppointmentSlotsParams {
  blockInstances: ComputedRef<BookingBlockInstance[]>
  serverSlotsForDay: ComputedRef<ComputedSlot[]>
  selectedButtonIndex: Ref<number | null>
  perspective: ComputedRef<PerspectiveKey>
  isDifferentialService: ComputedRef<boolean>
}

export interface UseAppointmentSlotsReturn {
  appointmentShape: ComputedRef<AppointmentShape | null>
  appointmentSlots: ComputedRef<AppointmentSlots>
  selectedSlot: ComputedRef<AppointmentSlot | null>
  getDisplayTime: (buttonIndex: number) => TimeRange | null
  graphBars: ComputedRef<{
    major: TimeRange | null
    minor: TimeRange | null
  }>
}

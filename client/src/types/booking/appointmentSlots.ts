import type { ComputedRef, Ref } from 'vue'
import type { SlotTimeBounds } from '@shared/types/availabilityTypes'
import type {
  AppointmentShape,
  AppointmentSlot,
  AppointmentSlots,
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
  /** When set, used instead of shape from blockInstances (e.g. minimizer single-duration grid). */
  appointmentShapeOverride?: ComputedRef<AppointmentShape | null>
  /** When set, replaces built-in useAppointmentShape result (orchestrator shares one shape for filter + slots). */
  appointmentShapeFromBlocks?: ComputedRef<AppointmentShape | null>
}

export interface UseAppointmentSlotsReturn {
  appointmentShape: ComputedRef<AppointmentShape | null>
  appointmentSlots: ComputedRef<AppointmentSlots>
  selectedSlot: ComputedRef<AppointmentSlot | null>
  getDisplayTime: (buttonIndex: number) => SlotTimeBounds | null
  graphBars: ComputedRef<{
    major: SlotTimeBounds | null
    minor: SlotTimeBounds | null
  }>
}

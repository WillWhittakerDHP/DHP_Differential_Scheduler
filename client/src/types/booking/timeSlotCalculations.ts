import type { Ref, ComputedRef } from 'vue'
import type { TimeSlot, AppointmentShape } from '@/types/appointment'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'

interface TimeBlock {
  label: string
  duration: string
  timeBlock: string | null
}

/**
 * Time on site blocks structure.
 * Property names 'major' and 'minor' represent major/minor perspectives.
 */
export interface DifferentialTimeBlocks {
  major: TimeBlock
  minor: TimeBlock | null
}

export interface UseTimeSlotCalculationsParams {
  wizard: {
    selectedServiceTypeBlocks: Ref<BookingBlockInstance[]>
  }
  appointmentShape: ComputedRef<AppointmentShape | null>
  majorTimeSlot: Ref<TimeSlot | null>
  minorTimeSlot: Ref<TimeSlot | null>
  isDifferentialService: ComputedRef<boolean>
}

export interface UseTimeSlotCalculationsReturn {
  majorDuration: ComputedRef<number>
  minorDuration: ComputedRef<number>
  differentialTimeBlocks: ComputedRef<DifferentialTimeBlocks>
}

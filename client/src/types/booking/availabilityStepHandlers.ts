import type { Ref, ComputedRef } from 'vue'
import type { AppointmentSlot } from '@/types/appointment'
import type { MinimizerSchedulingOptions, MinimizerSlot } from '@/types/minimizerScheduling'

export interface UseAvailabilityStepHandlersParams {
  appointmentSlotOrderIndex: Ref<number | null>
  hasMinimizerParts: Ref<boolean>
  selectedSlot: Ref<AppointmentSlot | null>
  openMinimizerModal: () => void
  closeMinimizerModal: () => void
  minimizerOptions: Ref<MinimizerSchedulingOptions | null>
  /** Current day's slots for saving to step data on confirm (virtual slots from minimizer grid). */
  minimizerSlotsForConfirm: ComputedRef<MinimizerSlot[]>
  selectedMinimizerSlotIndex: Ref<number | null>
  confirmedMinimizerScheduling: Ref<MinimizerSchedulingOptions | null>
  startTimeType: Ref<'major' | 'minor' | 'nonDifferential'>
}

export interface UseAvailabilityStepHandlersReturn {
  handleAppointmentSlotClick: (buttonIndex: number) => void
  handleMinimizerConfirm: () => void
  handleMinimizerCancel: () => void
  handleTimeBasisChange: (type: 'major' | 'minor') => void
}

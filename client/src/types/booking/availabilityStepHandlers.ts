import type { Ref, ComputedRef } from 'vue'
import type { AppointmentSlot } from '@/types/appointment'
import type { MoveableSchedulingOptions, MoveableSlot } from '@/types/moveableScheduling'

export interface UseAvailabilityStepHandlersParams {
  appointmentSlotOrderIndex: Ref<number | null>
  hasMoveableParts: Ref<boolean>
  selectedSlot: Ref<AppointmentSlot | null>
  openMoveableModal: () => void
  closeMoveableModal: () => void
  moveableOptions: Ref<MoveableSchedulingOptions | null>
  /** Current day's slots for saving to step data on confirm (virtual slots from moveable grid). */
  moveableSlotsForConfirm: ComputedRef<MoveableSlot[]>
  selectedMoveableSlotIndex: Ref<number | null>
  confirmedMoveableScheduling: Ref<MoveableSchedulingOptions | null>
  startTimeType: Ref<'major' | 'minor' | 'nonDifferential'>
}

export interface UseAvailabilityStepHandlersReturn {
  handleAppointmentSlotClick: (buttonIndex: number) => void
  handleMoveableConfirm: () => void
  handleMoveableCancel: () => void
  handleTimeBasisChange: (type: 'major' | 'minor') => void
}

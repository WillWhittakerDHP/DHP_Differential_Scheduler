import type { Ref } from 'vue'
import type { AppointmentSlot } from '@/types/appointment'
import type { MoveableSchedulingOptions } from '@/types/moveableScheduling'

export interface UseAvailabilityStepHandlersParams {
  appointmentSlotOrderIndex: Ref<number | null>
  hasMoveableParts: Ref<boolean>
  selectedSlot: Ref<AppointmentSlot | null>
  openMoveableModal: () => void
  closeMoveableModal: () => void
  moveableOptions: Ref<MoveableSchedulingOptions | null>
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

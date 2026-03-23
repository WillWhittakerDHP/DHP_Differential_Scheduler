import type { Ref } from 'vue'
import type { AppointmentSlot } from '@/types/appointment'
import type { ContingencyPeriod } from '@/types/moveableScheduling'

export interface UseMoveableAvailabilityDataParams {
  hasMoveableParts: Ref<boolean>
  selectedSlot: Ref<AppointmentSlot | null>
  contingencyPeriod: Ref<ContingencyPeriod>
  selectedSlotIndex: Ref<number | null>
  moveableDuration: Ref<number>
  moveablePartShapeName: Ref<string>
  placeId: Ref<string | null | undefined>
  configuredMoveableFallbackLabelRef?: Ref<string>
}

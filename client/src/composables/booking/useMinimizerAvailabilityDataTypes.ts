import type { Ref } from 'vue'
import type { AppointmentSlot } from '@/types/appointment'
import type { ContingencyPeriod } from '@/types/minimizerScheduling'

export interface UseMinimizerAvailabilityDataParams {
  hasMinimizerParts: Ref<boolean>
  selectedSlot: Ref<AppointmentSlot | null>
  contingencyPeriod: Ref<ContingencyPeriod>
  selectedSlotIndex: Ref<number | null>
  minimizerDuration: Ref<number>
  minimizerPartShapeName: Ref<string>
  placeId: Ref<string | null | undefined>
  configuredMinimizerFallbackLabelRef?: Ref<string>
}

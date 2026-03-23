import type { ComputedRef, Ref } from 'vue'
import type { SlotTimeBounds } from '@shared/types/availabilityTypes'
import type { MoveableSchedulingOptions } from '@/types/moveableScheduling'
import type { AvailabilityStepParamsBase } from '@/types/availabilityStepParams'

export interface AvailabilityStepData {
  candidateDate: { start: string | null; end: string | null }
  candidateTimeSlots: SlotTimeBounds[] | null
  moveableScheduling: MoveableSchedulingOptions | null
  /**
   * Sum of drive legs for the selected slot (minutes), when a slot is selected and server provided legs.
   * Null when no slot selected.
   */
  totalDriveMinutes: number | null
}

export interface UseAvailabilityStepDataParams extends AvailabilityStepParamsBase {
  moveableScheduling?: Ref<MoveableSchedulingOptions | null>
}

export interface UseAvailabilityStepDataReturn {
  selectedTimeSlots: ComputedRef<SlotTimeBounds[] | null>
  stepData: ComputedRef<AvailabilityStepData>
}

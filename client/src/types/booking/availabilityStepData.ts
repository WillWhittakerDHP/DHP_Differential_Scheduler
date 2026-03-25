import type { ComputedRef, Ref } from 'vue'
import type { SlotTimeBounds } from '@shared/types/availabilityTypes'
import type { MinimizerSchedulingOptions } from '@/types/minimizerScheduling'
import type { AvailabilityStepParamsBase } from '@/types/availabilityStepParams'

export interface AvailabilityStepData {
  candidateDate: { start: string | null; end: string | null }
  candidateTimeSlots: SlotTimeBounds[] | null
  minimizerScheduling: MinimizerSchedulingOptions | null
  /**
   * Sum of drive legs for the selected slot (minutes), when a slot is selected and server provided legs.
   * Null when no slot selected.
   */
  totalDriveMinutes: number | null
}

export interface UseAvailabilityStepDataParams extends AvailabilityStepParamsBase {
  minimizerScheduling?: Ref<MinimizerSchedulingOptions | null>
}

export interface UseAvailabilityStepDataReturn {
  selectedTimeSlots: ComputedRef<SlotTimeBounds[] | null>
  stepData: ComputedRef<AvailabilityStepData>
}

import type { ComputedRef, Ref } from 'vue'
import type { SlotTimeBounds } from '@shared/types/availabilityTypes'
import type { MoveableSchedulingOptions } from '@/types/moveableScheduling'
import type { AvailabilityStepParamsBase } from '@/types/availabilityStepParams'

/** Selected slot time bounds; extends shared SlotTimeBounds (branded startTime/endTime). */
export type SelectedTimeSlot = SlotTimeBounds

export interface AvailabilityStepData {
  candidateDate: { start: string | null; end: string | null }
  candidateTimeSlots: SelectedTimeSlot[] | null
  moveableScheduling: MoveableSchedulingOptions | null
}

export interface UseAvailabilityStepDataParams extends AvailabilityStepParamsBase {
  moveableScheduling?: Ref<MoveableSchedulingOptions | null>
}

export interface UseAvailabilityStepDataReturn {
  selectedTimeSlots: ComputedRef<SelectedTimeSlot[] | null>
  stepData: ComputedRef<AvailabilityStepData>
}

import type { ComputedRef, Ref } from 'vue'
import type { AppointmentSelectedTimeSlotPayload } from '@shared/types/appointmentTypes'
import type { MinimizerSchedulingOptions } from '@/types/minimizerScheduling'
import type { AvailabilityStepParamsBase } from '@/types/availabilityStepParams'

export interface AvailabilityStepData {
  candidateDate: { start: string | null; end: string | null }
  candidateTimeSlots: AppointmentSelectedTimeSlotPayload[] | null
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
  selectedTimeSlots: ComputedRef<AppointmentSelectedTimeSlotPayload[] | null>
  stepData: ComputedRef<AvailabilityStepData>
}

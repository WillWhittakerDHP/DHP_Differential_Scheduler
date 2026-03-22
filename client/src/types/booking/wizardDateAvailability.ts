import type { Ref, ComputedRef } from 'vue'
import type { RFC3339DateTime } from '@shared/types/primitiveBrands'
import type { DisplayedMonth } from '@/types/booking/dateRangeDecider'
import type { UseComputedAvailabilityReturn } from '@/types/booking/computedAvailability'

import type { UseWizardStepDataRefsReturn } from '@/types/booking/wizardStepDataRefs'
export interface UseWizardDateAvailabilityParams {
  stepDataRefs: UseWizardStepDataRefsReturn
  activeStep: Ref<number>
  /** Entity identity of the appointment being edited (draft or existing). When set, passed to availability for overlap exclusion. */
  currentAppointmentId: Ref<string | null>
}

export interface UseWizardDateAvailabilityReturn {
  displayedMonth: Ref<DisplayedMonth>
  dateRange: ComputedRef<{ start: RFC3339DateTime; end: RFC3339DateTime }>
  appointmentDurationRef: Ref<number | null>
  selectedDateForSlots: ComputedRef<string | null>
  computedAvailability: UseComputedAvailabilityReturn
}

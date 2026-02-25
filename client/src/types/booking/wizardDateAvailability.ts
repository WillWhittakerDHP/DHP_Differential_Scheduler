import type { Ref, ComputedRef } from 'vue'
import type { RFC3339DateTime } from '@shared/types/primitiveBrands'
import type { DisplayedMonth } from '@/types/booking/dateRangeDecider'
import type { UseWizardStepDataRefsReturn } from '@/composables/booking/useWizardStepDataRefs'
import type { UseComputedAvailabilityReturn } from '@/types/booking/computedAvailability'

export interface UseWizardDateAvailabilityParams {
  stepDataRefs: UseWizardStepDataRefsReturn
  activeStep: Ref<number>
}

export interface UseWizardDateAvailabilityReturn {
  displayedMonth: Ref<DisplayedMonth>
  dateRange: ComputedRef<{ start: RFC3339DateTime; end: RFC3339DateTime }>
  appointmentDurationRef: Ref<number | null>
  selectedDateForSlots: ComputedRef<string | null>
  computedAvailability: UseComputedAvailabilityReturn
}

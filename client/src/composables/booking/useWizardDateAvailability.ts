/**
 * PATTERN: Date range, displayed month, appointment duration, and computed availability for booking wizard.
 * WHY: Keeps BookingWizard.vue under vue-architecture script line limit.
 */
import { ref, computed, provide } from 'vue'
import type { Ref } from 'vue'
import { useDateRangeDecider, type DisplayedMonth } from '@/composables/booking/useDateRangeDecider'
import { useComputedAvailability } from '@/composables/booking/useComputedAvailability'
import type { UseWizardStepDataRefsReturn } from '@/composables/booking/useWizardStepDataRefs'

export interface UseWizardDateAvailabilityParams {
  stepDataRefs: UseWizardStepDataRefsReturn
  activeStep: Ref<number>
}

export function useWizardDateAvailability(params: UseWizardDateAvailabilityParams) {
  const { stepDataRefs, activeStep } = params
  const now = new Date()
  const displayedMonth = ref<DisplayedMonth>({
    year: now.getUTCFullYear(),
    month: now.getUTCMonth(),
  })
  provide('displayedMonth', displayedMonth)
  provide('updateDisplayedMonth', (month: DisplayedMonth) => {
    displayedMonth.value = month
  })
  const dateRange = useDateRangeDecider(displayedMonth)
  const appointmentDurationRef = ref<number | null>(null)
  provide('appointmentDuration', appointmentDurationRef)
  const selectedDateForSlots = computed(() => {
    const start = stepDataRefs.availabilityStepData.value?.candidateDate?.start
    return start ? (start.includes('T') ? start.split('T')[0] : start) : null
  })
  const computedAvailability = useComputedAvailability({
    propertyDetailsStepData: stepDataRefs.propertyDetailsStepData,
    dateRange,
    activeStep,
    duration: appointmentDurationRef,
    selectedDate: selectedDateForSlots,
  })
  provide('computedAvailability', computedAvailability)
  return {
    displayedMonth,
    dateRange,
    appointmentDurationRef,
    selectedDateForSlots,
    computedAvailability,
  }
}

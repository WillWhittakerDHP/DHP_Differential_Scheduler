import type { DisplayedMonth } from '@/types/booking/dateRangeDecider'
/**
 * WHY: Keeps BookingWizard.vue under vue-architecture script line limit.
 */
import { ref, computed, provide } from 'vue'
import { useDateRangeDecider } from '@/composables/booking/useDateRangeDecider'
import { useComputedAvailability } from '@/composables/booking/useComputedAvailability'
import {
  displayedMonthKey,
  updateDisplayedMonthKey,
  appointmentDurationKey,
  computedAvailabilityKey,
} from '@/composables/booking/injectionKeys'
import type {
  UseWizardDateAvailabilityParams,
  UseWizardDateAvailabilityReturn,
} from '@/types/booking/wizardDateAvailability'

export function useWizardDateAvailability(params: UseWizardDateAvailabilityParams): UseWizardDateAvailabilityReturn {
  const { stepDataRefs, activeStep, loadedAppointmentId, wizardMode } = params
  const now = new Date()
  const displayedMonth = ref<DisplayedMonth>({
    year: now.getUTCFullYear(),
    month: now.getUTCMonth(),
  })
  provide(displayedMonthKey, displayedMonth)
  provide(updateDisplayedMonthKey, (month: DisplayedMonth) => {
    displayedMonth.value = month
  })
  const dateRange = useDateRangeDecider(displayedMonth)
  const appointmentDurationRef = ref<number | null>(null)
  provide(appointmentDurationKey, appointmentDurationRef)
  const selectedDateForSlots = computed(() => {
    const start = stepDataRefs.availabilityStepData.value?.candidateDate?.start
    return start ? (start.includes('T') ? start.split('T')[0] : start) : null
  })
  const computedAvailability = useComputedAvailability({
    propertyDetailsStepData: stepDataRefs.propertyDetailsStepData,
    dateRange,
    activeStep,
    reschedulingAppointmentId: computed(() =>
      wizardMode.value === 'reschedule' ? loadedAppointmentId.value : null
    ),
    duration: appointmentDurationRef,
    selectedDate: selectedDateForSlots,
  })
  provide(computedAvailabilityKey, computedAvailability)
  return {
    displayedMonth,
    dateRange,
    appointmentDurationRef,
    selectedDateForSlots,
    computedAvailability,
  }
}

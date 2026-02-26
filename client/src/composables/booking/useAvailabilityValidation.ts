import { computed } from 'vue'
import { useFormValidation } from '@/composables/useFormValidation'
import { useStepValidation } from './useStepValidation'
import type { UseAvailabilityValidationParams, UseAvailabilityValidationReturn } from '@/types/booking/availabilityValidation'


import type { ValidationRule } from '@/types/formValidation'
export function useAvailabilityValidation(
  params: UseAvailabilityValidationParams
): UseAvailabilityValidationReturn {
  const { selectedDate, selectedSlot } = params
  const { required, dateNotInPast } = useFormValidation()

  const validationRules = computed<Record<string, ValidationRule[]>>(() => ({
    selectedDate: [required('Please select a date'), dateNotInPast()]
  }))

  const customValidators = {
    selectedTimeSlot: () => {
      if (!selectedSlot.value) {
        return 'Please select a time slot'
      }
      // Validate that selectedSlot has valid totals
      // PATTERN: Use eventTimeRanges or totalTimeRange for time range validation
      const hasValidTimeRange = selectedSlot.value.totalTimeRange || 
        (selectedSlot.value.eventTimeRanges && Object.values(selectedSlot.value.eventTimeRanges).some(tr => tr !== null))
      if (!hasValidTimeRange) {
        return 'Selected time slot is invalid'
      }
      return true
    }
  }

  return useStepValidation({
    formData: {
      selectedDate: computed(() => selectedDate.value.start)
    },
    validationRules,
    customValidators
  })
}


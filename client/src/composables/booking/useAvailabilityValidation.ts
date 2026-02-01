/**
 * useAvailabilityValidation Composable
 * 
 * LEARNING: Thin wrapper around generic useStepValidation
 * WHY: Provides step-specific validation rules using generic pattern
 */

import { computed, type Ref } from 'vue'
import type { AppointmentSlot } from '@/types/appointment'
import { useFormValidation } from '@/composables/useFormValidation'
import type { ValidationRule } from '@/composables/useFormValidation'
import { useStepValidation, type UseStepValidationReturn } from './useStepValidation'
import type { ISO8601Date } from '@/types/datetime'

export interface UseAvailabilityValidationParams {
  selectedDate: Ref<{ start: ISO8601Date | null; end: ISO8601Date | null }>
  selectedSlot: Ref<AppointmentSlot | null>
}

export type UseAvailabilityValidationReturn = UseStepValidationReturn

/**
 * useAvailabilityValidation composable
 * 
 * LEARNING: Thin wrapper around generic useStepValidation
 * WHY: Provides step-specific validation rules using generic pattern
 */
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
      // PATTERN: Use eventTimeRanges or totalTimeRange instead of deprecated majorTimeRange
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


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

/**
 * useAvailabilityValidation composable parameters
 */
export interface UseAvailabilityValidationParams {
  selectedDate: Ref<{ start: ISO8601Date | null; end: ISO8601Date | null }>
  selectedSlot: Ref<AppointmentSlot | null>
}

/**
 * useAvailabilityValidation composable return type
 */
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

  // Define validation rules
  const validationRules = computed<Record<string, ValidationRule[]>>(() => ({
    selectedDate: [required('Please select a date'), dateNotInPast()]
  }))

  // Custom validator for time slot selection
  const customValidators = {
    selectedTimeSlot: () => {
      if (!selectedSlot.value) {
        return 'Please select a time slot'
      }
      // Validate that selectedSlot has valid totals
      if (!selectedSlot.value.totalOnSite && !selectedSlot.value.totalTime) {
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


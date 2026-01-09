/**
 * useAvailabilityValidation Composable
 * 
 * LEARNING: Thin wrapper around generic useStepValidation
 * WHY: Provides step-specific validation rules using generic pattern
 */

import { computed, type Ref } from 'vue'
import type { TimeSlot } from '@/types/appointment'
import { useFormValidation } from '@/composables/useFormValidation'
import type { ValidationRule } from '@/composables/useFormValidation'
import { useStepValidation, type UseStepValidationReturn } from './useStepValidation'

/**
 * useAvailabilityValidation composable parameters
 */
export interface UseAvailabilityValidationParams {
  selectedDate: Ref<{ start: string | null; end: string | null }>
  inspectorTimeSlot: Ref<TimeSlot | null>
  clientTimeSlot: Ref<TimeSlot | null>
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
  const { selectedDate, inspectorTimeSlot, clientTimeSlot } = params
  const { required, dateNotInPast } = useFormValidation()

  // Define validation rules
  const validationRules = computed<Record<string, ValidationRule[]>>(() => ({
    selectedDate: [required('Please select a date'), dateNotInPast()]
  }))

  // Custom validator for time slot selection
  const customValidators = {
    selectedTimeSlot: () => {
      if (!inspectorTimeSlot.value && !clientTimeSlot.value) {
        return 'Please select a time slot'
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


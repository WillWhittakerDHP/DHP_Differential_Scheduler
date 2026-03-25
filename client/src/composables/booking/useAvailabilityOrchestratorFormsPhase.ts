import { computed, type ComputedRef } from 'vue'
import type { AppointmentSlots } from '@/types/appointment'
import type { AvailabilityStepParamsBase } from '@/types/availabilityStepParams'
import type { AvailabilityStepData } from '@/types/booking/availabilityStepData'
import type { UsePerspectiveMappingParams } from '@/types/booking/perspectiveMapping'
import {
  useAvailabilityEmptyState,
  useAvailabilityStepData,
  useAvailabilityValidation,
  type UseAvailabilityLogicReturn,
  type AvailabilityOrchestratorMinimizerGates,
  type AvailabilityOrchestratorSlotsPhaseResult,
} from '@/composables/booking/availabilityOrchestratorFormsBundle'

export interface AvailabilityOrchestratorFormsPhaseResult {
  emptyStateMessage: ReturnType<typeof useAvailabilityEmptyState>['emptyStateMessage']
  stepData: ComputedRef<AvailabilityStepData>
  fieldErrors: ReturnType<typeof useAvailabilityValidation>['fieldErrors']
  validateForm: ReturnType<typeof useAvailabilityValidation>['validateForm']
  isFormValid: ComputedRef<boolean>
}

export function setupAvailabilityOrchestratorFormsPhase(input: {
  isEffectivelyDifferential: UseAvailabilityLogicReturn['isEffectivelyDifferential']
  startTimeType: UsePerspectiveMappingParams['startTimeType']
  appointmentSlots: ComputedRef<AppointmentSlots>
  selectedDate: AvailabilityStepParamsBase['selectedDate']
  selectedSlot: AvailabilityOrchestratorSlotsPhaseResult['selectedSlot']
  confirmedMinimizerScheduling: AvailabilityOrchestratorSlotsPhaseResult['confirmedMinimizerScheduling']
  hasMinimizerPartsGated: AvailabilityOrchestratorMinimizerGates['hasMinimizerPartsGated']
}): AvailabilityOrchestratorFormsPhaseResult {
  const {
    isEffectivelyDifferential,
    startTimeType,
    appointmentSlots,
    selectedDate,
    selectedSlot,
    confirmedMinimizerScheduling,
    hasMinimizerPartsGated,
  } = input

  const { emptyStateMessage } = useAvailabilityEmptyState({
    isEffectivelyDifferential,
    startTimeType,
    appointmentSlotsCount: computed(() => appointmentSlots.value.length),
  })

  const { stepData } = useAvailabilityStepData({
    selectedDate,
    selectedSlot,
    minimizerScheduling: computed(() => confirmedMinimizerScheduling.value),
  })

  const { fieldErrors, isFormValid: baseIsFormValid, validateForm } = useAvailabilityValidation({
    selectedDate,
    selectedSlot,
  })

  const isFormValid = computed(() => {
    if (!baseIsFormValid.value) return false
    if (hasMinimizerPartsGated.value && !confirmedMinimizerScheduling.value) return false
    return true
  })

  return {
    emptyStateMessage,
    stepData,
    fieldErrors,
    validateForm,
    isFormValid,
  }
}

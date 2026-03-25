import { computed, ref, type ComputedRef, type Ref } from 'vue'
import type { ContingencyPeriod } from '@/types/minimizerScheduling'
import type { UseBookingWizardReturn } from '@/types/wizard'
import type { UseAppointmentShapeParams, UseAppointmentShapeReturn } from '@/types/booking/appointmentShape'
import { DEFAULT_CONTINGENCY } from '@/constants/minimizerScheduling'
import { useAppointmentShape } from '@/composables/booking/useAppointmentShape'
import { useAfterAppointmentBufferMinutes } from '@/composables/booking/useAfterAppointmentBufferMinutes'
import { getMinimizerRoundedDurationMinutesFromAppointmentShape } from '@/utils/booking/minimizerDurationFromAppointmentShape'

export interface AvailabilityOrchestratorMinimizerGates {
  contingencyPeriod: Ref<ContingencyPeriod>
  appointmentShapeFromBlocks: UseAppointmentShapeReturn['appointmentShape']
  afterBufferMinutesForInspectionFilter: Ref<number>
  minimizerRoundedDurationForInspectionFilter: ComputedRef<number>
  hasMinimizerParts: ComputedRef<boolean>
  hasMinimizerPartsGated: ComputedRef<boolean>
}

export function setupAvailabilityOrchestratorMinimizerGates(input: {
  accumulatedBlockInstances: UseAppointmentShapeParams['blockInstances']
  wizard: UseBookingWizardReturn
}): AvailabilityOrchestratorMinimizerGates {
  const { accumulatedBlockInstances, wizard } = input

  const contingencyPeriod = ref<ContingencyPeriod>({ ...DEFAULT_CONTINGENCY })
  const { appointmentShape: appointmentShapeFromBlocks } = useAppointmentShape({
    blockInstances: accumulatedBlockInstances,
  })
  const afterBufferMinutesForInspectionFilter = useAfterAppointmentBufferMinutes()
  const minimizerRoundedDurationForInspectionFilter = computed(() =>
    getMinimizerRoundedDurationMinutesFromAppointmentShape(appointmentShapeFromBlocks.value)
  )
  const hasMinimizerParts = computed(() => minimizerRoundedDurationForInspectionFilter.value > 0)
  const hasMinimizerPartsGated = computed(
    () =>
      hasMinimizerParts.value &&
      wizard.selectedServiceTypeBlocks.value.some((b) => b.preClosing === true)
  )

  return {
    contingencyPeriod,
    appointmentShapeFromBlocks,
    afterBufferMinutesForInspectionFilter,
    minimizerRoundedDurationForInspectionFilter,
    hasMinimizerParts,
    hasMinimizerPartsGated,
  }
}

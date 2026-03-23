import { computed, ref, type ComputedRef, type Ref } from 'vue'
import type { ContingencyPeriod } from '@/types/moveableScheduling'
import type { UseBookingWizardReturn } from '@/types/wizard'
import type { UseAppointmentShapeParams, UseAppointmentShapeReturn } from '@/types/booking/appointmentShape'
import { DEFAULT_CONTINGENCY } from '@/constants/moveableScheduling'
import { useAppointmentShape } from '@/composables/booking/useAppointmentShape'
import { useAfterAppointmentBufferMinutes } from '@/composables/booking/useAfterAppointmentBufferMinutes'
import { getMoveableRoundedDurationMinutesFromAppointmentShape } from '@/utils/booking/moveableDurationFromAppointmentShape'

export interface AvailabilityOrchestratorMoveableGates {
  contingencyPeriod: Ref<ContingencyPeriod>
  appointmentShapeFromBlocks: UseAppointmentShapeReturn['appointmentShape']
  afterBufferMinutesForInspectionFilter: Ref<number>
  moveableRoundedDurationForInspectionFilter: ComputedRef<number>
  hasMoveableParts: ComputedRef<boolean>
  hasMoveablePartsGated: ComputedRef<boolean>
}

export function setupAvailabilityOrchestratorMoveableGates(input: {
  accumulatedBlockInstances: UseAppointmentShapeParams['blockInstances']
  wizard: UseBookingWizardReturn
}): AvailabilityOrchestratorMoveableGates {
  const { accumulatedBlockInstances, wizard } = input

  const contingencyPeriod = ref<ContingencyPeriod>({ ...DEFAULT_CONTINGENCY })
  const { appointmentShape: appointmentShapeFromBlocks } = useAppointmentShape({
    blockInstances: accumulatedBlockInstances,
  })
  const afterBufferMinutesForInspectionFilter = useAfterAppointmentBufferMinutes()
  const moveableRoundedDurationForInspectionFilter = computed(() =>
    getMoveableRoundedDurationMinutesFromAppointmentShape(appointmentShapeFromBlocks.value)
  )
  const hasMoveableParts = computed(() => moveableRoundedDurationForInspectionFilter.value > 0)
  const hasMoveablePartsGated = computed(
    () =>
      hasMoveableParts.value &&
      wizard.selectedServiceTypeBlocks.value.some((b) => b.preClosing === true)
  )

  return {
    contingencyPeriod,
    appointmentShapeFromBlocks,
    afterBufferMinutesForInspectionFilter,
    moveableRoundedDurationForInspectionFilter,
    hasMoveableParts,
    hasMoveablePartsGated,
  }
}

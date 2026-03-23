import { computed } from 'vue'
import type { AvailabilityStepData } from '@/types/booking/availabilityStepData'
import type { WizardStateData } from '@/utils/transformers/appointmentToWizardTransformer'
import type { UseBookingWizardReturn } from '@/types/wizard'
import type { Ref } from 'vue'
import { useAvailabilityDefaults } from '@/composables/booking/useAvailabilityDefaults'
import { isDifferentialFromSelectedBlocks } from '@/composables/booking/useAvailabilityLogic'
import type { AvailabilityOrchestratorTimeSlotsShell } from '@/composables/booking/useAvailabilityOrchestratorTimeSlotsShell'

export function setupAvailabilityOrchestratorDefaultsPhase(input: {
  loadedWizardState: Ref<WizardStateData | null>
  availabilityStepData: Ref<AvailabilityStepData | null> | undefined
  wizard: UseBookingWizardReturn
  shell: AvailabilityOrchestratorTimeSlotsShell
}): ReturnType<typeof useAvailabilityDefaults> {
  const { loadedWizardState, availabilityStepData, wizard, shell } = input

  const isEffectivelyDifferentialForDefaults = computed(() =>
    isDifferentialFromSelectedBlocks(wizard.selectedServiceTypeBlocks.value)
  )

  return useAvailabilityDefaults({
    loadedWizardState,
    timeSlots: shell.timeSlotsForDefaults,
    isDifferentialService: isEffectivelyDifferentialForDefaults,
    restoreFrom: availabilityStepData,
  })
}

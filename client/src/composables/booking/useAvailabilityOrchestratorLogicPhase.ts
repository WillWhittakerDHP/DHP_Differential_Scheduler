import { ref, type Ref } from 'vue'
import type { UseAvailabilityUIParams } from '@/types/booking/availabilityUI'
import type { PropertyDetailsData } from '@/types/propertyForm'
import type { WizardStateData } from '@/utils/transformers/appointmentToWizardTransformer'
import type { UseBookingWizardReturn } from '@/types/wizard'
import {
  useAvailabilityLogic,
  type UseAvailabilityLogicReturn,
} from '@/composables/booking/useAvailabilityLogic'
import type { AvailabilityOrchestratorTimeSlotsShell } from '@/composables/booking/useAvailabilityOrchestratorTimeSlotsShell'

export function useAvailabilityOrchestratorLogicPhase(input: {
  selectedDate: UseAvailabilityUIParams['selectedDate']
  propertyDetailsStepData: Ref<PropertyDetailsData | null>
  wizard: UseBookingWizardReturn
  loadedWizardState: Ref<WizardStateData | null>
  shell: AvailabilityOrchestratorTimeSlotsShell
}): UseAvailabilityLogicReturn & { vDatePickerDisplayDate: Ref<Date> } {
  const { selectedDate, propertyDetailsStepData, wizard, loadedWizardState, shell } = input

  const today = new Date()
  const vDatePickerDisplayDate = ref<Date>(new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)))

  const logic = useAvailabilityLogic({
    selectedDate,
    propertyDetailsStepData,
    wizard: {
      selectedUserTypeBlock: wizard.selectedUserTypeBlock,
      selectedServiceTypeBlocks: wizard.selectedServiceTypeBlocks,
      selectedPropertyTypeBlocks: wizard.selectedPropertyTypeBlocks,
      selectedOptionTypeBlocks: wizard.selectedOptionTypeBlocks,
    },
    timeSlots: shell.timeSlotsForLogic,
    loadedWizardState,
  })

  return Object.assign({}, logic, { vDatePickerDisplayDate }) as UseAvailabilityLogicReturn & {
    vDatePickerDisplayDate: Ref<Date>
  }
}

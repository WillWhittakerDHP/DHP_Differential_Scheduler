/**
 * WHY: Apply loaded wizard snapshot onto booking wizard + step refs (extracted from composable for audit).
 */

import type { Ref } from 'vue'
import type { UseBookingWizardReturn } from '@/types/wizard'
import type { WizardStateData } from '@/utils/transformers/appointmentToWizardTransformer'
import { contactsStepDataFromWizardContacts } from '@/utils/booking/wizardContactsStepFromState'

export function applyWizardStateFromAppointment(
  wizard: UseBookingWizardReturn,
  wizardState: WizardStateData,
  stepDataRefs: {
    propertyDetailsStepData: Ref<WizardStateData['propertyDetails'] | null>
    contactsStepData: Ref<unknown>
  }
): void {
  wizard.selectUserTypeBlock(wizardState.userTypeBlock)
  wizard.selectedServiceTypeBlocks.value = [...wizardState.services]
  wizard.selectedPropertyTypeBlocks.value = [...wizardState.propertyTypeBlocks]
  wizard.selectedOptionTypeBlocks.value = [...wizardState.optionTypeBlocks]
  wizard.setWizardMode(wizardState.isQuoteMode ? 'quote' : 'new')
  stepDataRefs.propertyDetailsStepData.value = wizardState.propertyDetails
  stepDataRefs.contactsStepData.value = contactsStepDataFromWizardContacts(wizardState.contacts)
}

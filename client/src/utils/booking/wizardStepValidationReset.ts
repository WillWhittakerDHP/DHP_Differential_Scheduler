/**
 * WHY: Clear wizard step payloads + validation refs on reset (no wizard block APIs).
 */

import type { Ref } from 'vue'

export interface WizardStepValidationResetRefs {
  propertyDetailsStepData: Ref<unknown>
  contactsStepData: Ref<unknown>
  availabilityStepData: Ref<unknown>
  propertyDetailsStepValid: Ref<boolean>
  propertyDetailsStepValidate: Ref<(() => boolean) | null>
  propertyDetailsFieldErrors: Ref<Record<string, string>>
  contactsStepValid: Ref<boolean>
  contactsStepValidate: Ref<(() => boolean) | null>
  availabilityStepValid: Ref<boolean>
  availabilityStepValidate: Ref<(() => boolean) | null>
  activeStep: Ref<number>
}

export function resetWizardStepValidationRefs(refs: WizardStepValidationResetRefs): void {
  refs.propertyDetailsStepData.value = null
  refs.contactsStepData.value = null
  refs.availabilityStepData.value = null
  refs.propertyDetailsStepValid.value = false
  refs.propertyDetailsStepValidate.value = null
  refs.propertyDetailsFieldErrors.value = {}
  refs.contactsStepValid.value = false
  refs.contactsStepValidate.value = null
  refs.availabilityStepValid.value = false
  refs.availabilityStepValidate.value = null
  refs.activeStep.value = 0
}

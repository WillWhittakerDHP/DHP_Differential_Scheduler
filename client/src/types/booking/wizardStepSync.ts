import type { Ref } from 'vue'

export interface UseWizardStepSyncParams<TStepData> {
  stepData: Ref<TStepData>
  isFormValid: Ref<boolean>
  validateForm: () => boolean
  stepDataKey: string
  stepValidKey: string
  /** Step validate key for injection (e.g., 'availabilityStepValidate', 'propertyDetailsStepValidate') */
  stepValidateKey: string
  fieldErrors?: Ref<Record<string, string>>
  fieldErrorsKey?: string
}

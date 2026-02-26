import type { InjectionKey, Ref } from 'vue'

export interface UseWizardStepSyncParams<TStepData> {
  stepData: Ref<TStepData>
  isFormValid: Ref<boolean>
  validateForm: () => boolean
  stepDataKey: InjectionKey<Ref<TStepData | null>>
  stepValidKey: InjectionKey<Ref<boolean>>
  stepValidateKey: InjectionKey<Ref<(() => boolean) | null>>
  fieldErrors?: Ref<Record<string, string>>
  fieldErrorsKey?: InjectionKey<Ref<Record<string, string>>>
}

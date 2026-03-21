import type { InjectionKey, Ref, ComputedRef } from 'vue'

export interface UseWizardStepSyncParams<TStepData> {
  stepData: Ref<TStepData> | ComputedRef<TStepData>
  isFormValid: Ref<boolean> | ComputedRef<boolean>
  /** Sync validator returns boolean; async validator returns Promise (e.g. availability step). */
  validateForm: (() => boolean) | (() => Promise<void>)
  stepDataKey: InjectionKey<Ref<TStepData | null>>
  stepValidKey: InjectionKey<Ref<boolean>>
  stepValidateKey: InjectionKey<Ref<((() => boolean) | (() => Promise<void>)) | null>>
  fieldErrors?: Ref<Record<string, string>>
  fieldErrorsKey?: InjectionKey<Ref<Record<string, string>>>
}

/**
 * Injection key for Business Controls tab shared state.
 */
import type { InjectionKey, Ref } from 'vue'
import type { WizardSettingsData } from '@/configs/wizardSettings'
import type { BusinessControlsState } from '@/types/admin/businessControlsState'

export type { BusinessControlsState } from '@/types/admin/businessControlsState'

export const BUSINESS_CONTROLS_STATE_KEY: InjectionKey<BusinessControlsState> = Symbol('businessControlsState')

/** Ref to `useAdminWizardSettings` form payload (avoid nesting `Ref` inside `reactive()`; use `provide` + inject). */
export const WIZARD_FORM_DATA_KEY: InjectionKey<Ref<WizardSettingsData | null>> = Symbol('wizardFormData')

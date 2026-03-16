import type { Ref } from 'vue'
import type { WizardSettingsData } from '@/configs/wizardSettings'

export interface UseAdminWizardSettingsOptions {
  enabled?: Ref<boolean>
}

export interface UseAdminWizardSettingsReturn {
  formData: Ref<WizardSettingsData | null>
  loading: Ref<boolean>
  saving: Ref<boolean>
  error: Ref<string | null>
  success: Ref<string | null>
  loadSettings: () => Promise<void>
  saveSettings: () => Promise<void>
}

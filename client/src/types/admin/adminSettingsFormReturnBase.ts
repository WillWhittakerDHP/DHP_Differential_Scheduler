import type { Ref } from 'vue'

/**
 * Shared shell for admin tab composables that load/save a single settings document.
 * Per-domain `formData` is the type parameter; extend with tab-specific methods.
 */
export interface UseAdminSettingsFormReturnBase<TForm> {
  formData: Ref<TForm | null>
  loading: Ref<boolean>
  saving: Ref<boolean>
  error: Ref<string | null>
  success: Ref<string | null>
  loadSettings: () => Promise<void>
  saveSettings: () => Promise<void>
}

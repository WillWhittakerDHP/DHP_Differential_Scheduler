import type { Ref } from 'vue'
import type { CalendarSettingsData } from '@/configs/calendarSettings'

export interface UseAdminCalendarSettingsOptions {
  enabled?: Ref<boolean>
}

export interface UseAdminCalendarSettingsReturn {
  formData: Ref<CalendarSettingsData | null>
  loading: Ref<boolean>
  saving: Ref<boolean>
  error: Ref<string | null>
  success: Ref<string | null>
  loadSettings: () => Promise<void>
  saveSettings: () => Promise<void>
}

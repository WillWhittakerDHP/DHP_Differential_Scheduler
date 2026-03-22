import type { ComputedRef } from 'vue'
import type { SelectOption } from '@/composables/useSelectOptions'
import type { useAttendeeQuickSelect } from '@/composables/admin/useAttendeeQuickSelect'

export interface UseSelectInputsAsyncOptions {
  options: ComputedRef<SelectOption[]>
  handleChange: (value: string | string[] | null) => Promise<void>
}

export interface UseSelectInputsAsyncReturn {
  validOptionIds: ComputedRef<string[]>
  handleQuickSelectMajor: () => Promise<void>
  handleQuickSelectMinor: () => Promise<void>
  handleQuickSelectAll: () => Promise<void>
  quickSelect: ReturnType<typeof useAttendeeQuickSelect>
}

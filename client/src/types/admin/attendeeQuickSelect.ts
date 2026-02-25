import type { Ref } from 'vue'

export interface UseAttendeeQuickSelectReturn {
  isLoading: Ref<boolean>
  error: Ref<string | null>
  hasMajorAttendees: Ref<boolean>
  hasMinorAttendees: Ref<boolean>
  selectMajor: (validOptionIds: string[]) => string[]
  selectMinor: (validOptionIds: string[]) => string[]
  selectAll: (validOptionIds: string[]) => string[]
}

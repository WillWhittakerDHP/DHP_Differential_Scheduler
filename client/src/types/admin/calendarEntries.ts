import type { Ref } from 'vue'
import type { CalendarEntry } from '@/configs/availabilitySettings'

export interface UseCalendarEntriesReturn {
  entries: Ref<CalendarEntry[]>
  addEntry: () => void
  removeEntry: (index: number) => void
  updateEntry: (index: number, updates: Partial<CalendarEntry>) => void
  setReadFrom: (index: number, value: boolean) => void
  setWriteTo: (index: number, value: boolean) => void
  writeToIndex: Ref<number>
  validationError: Ref<string | null>
  isValid: Ref<boolean>
}

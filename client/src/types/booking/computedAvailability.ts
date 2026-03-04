import type { Ref, ComputedRef } from 'vue'
import type { RFC3339DateTime } from '@shared/types/primitiveBrands'
import type { PropertyDetailsStepData } from '@/types/wizard'
import type { CalendarEvent } from '@/services/calendarApiService'
import type {
  Constraint,
  ComputedSlot,
  ComputedSlotAvailabilityData,
} from '@shared/types/availabilityTypes'

export interface UseComputedAvailabilityParams {
  propertyDetailsStepData: Ref<PropertyDetailsStepData | null>
  dateRange: ComputedRef<{ start: RFC3339DateTime; end: RFC3339DateTime }>
  activeStep: Ref<number>
  /** Entity identity of appointment being edited; passed to availability API for overlap exclusion. */
  appointmentId?: Ref<string | null>
  duration?: Ref<number | null>
  selectedDate?: Ref<string | null>
  dataSource?: Ref<'real' | 'mock' | 'none'>
}

export interface UseComputedAvailabilityReturn {
  calendarEvents: Ref<CalendarEvent[]>
  slotsByDay: Ref<Map<string, ComputedSlot[]>>
  constraints: Ref<Constraint[]>
  computedData: ComputedRef<ComputedSlotAvailabilityData | null>
  isLoading: Ref<boolean>
  error: Ref<Error | null>
}

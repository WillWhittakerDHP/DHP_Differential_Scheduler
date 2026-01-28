/**
 * useAvailabilityUI Composable
 * 
 * LEARNING: Extracts UI-specific logic from AvailabilityStep component
 * WHY: Moves responsive layout and date handling logic to composable
 * PATTERN: Composable that provides UI state management and handlers
 * 
 * NOTE: Appointment slot selection logic has moved to useAppointmentSlots composable.
 * This composable now only handles responsive layout and date validation.
 */

import { computed, type Ref, type ComputedRef } from 'vue'
import { useDisplay } from 'vuetify'
import { useFormValidation } from '@/composables/useFormValidation'
import type { ISO8601Date } from '@/types/datetime'

/**
 * useAvailabilityUI composable parameters
 */
export interface UseAvailabilityUIParams {
  selectedDate: Ref<{ start: ISO8601Date | null; end: ISO8601Date | null }>
  selectedButtonIndex: Ref<number | null>
  fieldErrors: Ref<Record<string, string>>
}

/**
 * useAvailabilityUI composable return type
 */
export interface UseAvailabilityUIReturn {
  shouldShowGridInline: ComputedRef<boolean> // LEARNING: Renamed from shouldMoveGridBelow - true when grid should be inline (side-by-side)
  handleDateChange: (value: string | Date | string[] | Date[] | null) => void
}

/**
 * useAvailabilityUI composable
 * 
 * LEARNING: Provides UI state management and handlers for availability step
 * WHY: Extracts responsive layout and date handling logic from component to composable
 * PATTERN: Composable that returns reactive computed properties and handler functions
 * 
 * NOTE: Appointment slot selection is now handled by useAppointmentSlots composable.
 * This composable focuses on responsive layout and date validation.
 * 
 * LEARNING: Uses Vuetify's useDisplay() composable for responsive breakpoints
 * WHY: Trusts Vuetify's breakpoint system instead of custom viewport calculations
 * PATTERN: Mobile-first responsive design - stack below sm breakpoint (600px)
 */
export function useAvailabilityUI(params: UseAvailabilityUIParams): UseAvailabilityUIReturn {
  const {
    fieldErrors
  } = params

  const { dateNotInPast } = useFormValidation()
  
  /**
   * LEARNING: Use Vuetify's display composable for responsive breakpoints
   * WHY: Leverages Vuetify's built-in breakpoint system
   */
  const { width, smAndUp } = useDisplay()

  /**
   * LEARNING: Computed property to determine if grid should be inline (side-by-side with calendar)
   * WHY: Check if there's actually enough space for calendar + grid side-by-side
   * PATTERN: Calculate minimum width needed and compare to viewport width
   */
  const shouldShowGridInline = computed(() => {
    // Calendar has fixed width ~328px, grid needs at least 1 column (140px) + padding
    // Plus gap between columns (~16px) and padding
    const CALENDAR_WIDTH = 328
    const GRID_MIN_WIDTH = 140 + 20 // button width + padding
    const COLUMN_GAP = 16 // Vuetify default gap
    const MIN_TOTAL_WIDTH = CALENDAR_WIDTH + GRID_MIN_WIDTH + COLUMN_GAP
    
    // Show inline if viewport is wide enough OR if sm+ breakpoint (Vuetify handles layout)
    // Use sm+ breakpoint as fallback since Vuetify grid handles the actual layout
    return width.value >= MIN_TOTAL_WIDTH || smAndUp.value
  })

  /**
   * LEARNING: Handler for date change from calendar
   * WHY: Validates date selection and clears errors when valid
   * PATTERN: Function that validates and updates error state
   * NOTE: VDatePicker may return Date object, string, or array - handle all cases
   */
  const handleDateChange = (value: ISO8601Date | Date | ISO8601Date[] | Date[] | null): void => {
    // LEARNING: Normalize date value to ISO 8601 format (YYYY-MM-DD)
    // WHY: VDatePicker may return Date object or string, need consistent ISO 8601 format
    // PATTERN: Convert Date to ISO 8601 string, handle array (take first), handle null
    let dateString: ISO8601Date | null = null
    
    if (value) {
      if (Array.isArray(value)) {
        // Handle array (take first date)
        const firstValue = value[0]
        if (firstValue instanceof Date) {
          dateString = firstValue.toISOString().split('T')[0] as ISO8601Date
        } else if (typeof firstValue === 'string') {
          dateString = (firstValue.includes('T') ? firstValue.split('T')[0] : firstValue) as ISO8601Date
        }
      } else if (value instanceof Date) {
        dateString = value.toISOString().split('T')[0] as ISO8601Date
      } else if (typeof value === 'string') {
        dateString = (value.includes('T') ? value.split('T')[0] : value) as ISO8601Date
      }
    }
    
    // Validate date if selected
    if (dateString) {
      const dateResult = dateNotInPast()(dateString)
      if (dateResult === true) {
        // Date is valid, clear error
        if (fieldErrors.value.selectedDate) {
          const newErrors = { ...fieldErrors.value }
          delete newErrors.selectedDate
          fieldErrors.value = newErrors
        }
      } else {
        // Date is invalid, set error
        fieldErrors.value = {
          ...fieldErrors.value,
          selectedDate: dateResult as string
        }
      }
    } else {
      // No date selected, set required error
      fieldErrors.value = {
        ...fieldErrors.value,
        selectedDate: 'Please select a date'
      }
    }
  }

  return {
    shouldShowGridInline,
    handleDateChange
  }
}

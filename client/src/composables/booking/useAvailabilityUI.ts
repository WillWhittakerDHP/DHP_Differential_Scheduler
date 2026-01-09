/**
 * useAvailabilityUI Composable
 * 
 * LEARNING: Extracts UI-specific logic from AvailabilityStep component
 * WHY: Moves time slot selection, responsive layout, and date handling logic to composable
 * PATTERN: Composable that provides UI state management and handlers
 */

import { computed, ref, onMounted, onUnmounted, type Ref, type ComputedRef } from 'vue'
import type { TimeSlot } from '@/types/appointment'
import { useFormValidation } from '@/composables/useFormValidation'

/**
 * useAvailabilityUI composable parameters
 */
export interface UseAvailabilityUIParams {
  selectedDate: Ref<{ start: string | null; end: string | null }>
  inspectorTimeSlot: Ref<TimeSlot | null>
  clientTimeSlot: Ref<TimeSlot | null>
  startTimeType: Ref<'inspector' | 'client' | null>
  isDifferentialService: ComputedRef<boolean>
  timeSlotsPerDay: Ref<Array<{ date: string; inspectorTimeSlots: TimeSlot[]; clientTimeSlots: TimeSlot[] }>>
  baseCurrentTimeSlots: ComputedRef<TimeSlot[]>
  fieldErrors: Ref<Record<string, string>>
}

/**
 * useAvailabilityUI composable return type
 */
export interface UseAvailabilityUIReturn {
  currentTimeSlots: ComputedRef<TimeSlot[]>
  selectedTimeSlot: ComputedRef<TimeSlot | null>
  shouldMoveGridBelow: ComputedRef<boolean>
  handleTimeSlotClick: (slot: TimeSlot) => void
  handleDateChange: (value: string | Date | string[] | Date[] | null) => void
}

/**
 * useAvailabilityUI composable
 * 
 * LEARNING: Provides UI state management and handlers for availability step
 * WHY: Extracts UI logic from component to composable
 * PATTERN: Composable that returns reactive computed properties and handler functions
 */
export function useAvailabilityUI(params: UseAvailabilityUIParams): UseAvailabilityUIReturn {
  const {
    selectedDate,
    inspectorTimeSlot,
    clientTimeSlot,
    startTimeType,
    isDifferentialService,
    timeSlotsPerDay,
    baseCurrentTimeSlots,
    fieldErrors
  } = params

  const { dateNotInPast } = useFormValidation()

  /**
   * LEARNING: Computed property for current time slots (filtered by startTimeType)
   * WHY: Shows time slots for selected date based on Inspector/Client selection
   * PATTERN: Filter baseCurrentTimeSlots by startTimeType for differential services
   * USER_STORY: When neither selector is active (null), show empty state
   */
  const currentTimeSlots = computed(() => {
    if (!isDifferentialService.value) {
      return baseCurrentTimeSlots.value
    }
    
    // When neither selector is active, show empty state
    if (startTimeType.value === null) {
      return []
    }
    
    // For differential services, filter by startTimeType
    const daySlots = timeSlotsPerDay.value.find(day => day.date === selectedDate.value.start)
    if (!daySlots) {
      return []
    }
    
    return startTimeType.value === 'inspector' ? daySlots.inspectorTimeSlots : daySlots.clientTimeSlots
  })

  /**
   * LEARNING: Computed property for selected time slot
   * WHY: Tracks which time slot is selected based on Inspector/Client mode
   * PATTERN: Computed ref based on startTimeType
   * NOTE: For non-differential services, always use inspector mode
   * USER_STORY: When startTimeType is null, return null (no selection)
   */
  const selectedTimeSlot = computed({
    get: (): TimeSlot | null => {
      // LEARNING: For non-differential services, always use inspector mode
      // WHY: Non-differential services don't have separate inspector/client times
      // PATTERN: Check isDifferentialService, default to inspector mode
      if (!isDifferentialService.value) {
        return inspectorTimeSlot.value
      }
      // When neither selector is active, return null
      if (startTimeType.value === null) {
        return null
      }
      return startTimeType.value === 'inspector' ? inspectorTimeSlot.value : clientTimeSlot.value
    },
    set: (value: TimeSlot | null) => {
      // LEARNING: For non-differential services, always set inspector time slot
      // WHY: Non-differential services don't have separate inspector/client times
      // PATTERN: Check isDifferentialService, set appropriate time slot
      if (!isDifferentialService.value) {
        inspectorTimeSlot.value = value
        return
      }
      // When neither selector is active, don't set time slot
      if (startTimeType.value === null) {
        return
      }
      if (startTimeType.value === 'inspector') {
        inspectorTimeSlot.value = value
      } else {
        clientTimeSlot.value = value
      }
    },
  })

  /**
   * LEARNING: Handler for time slot selection
   * WHY: Updates selected time slot based on Inspector/Client mode
   * PATTERN: Function that sets the appropriate ref with TimeSlot object
   */
  const handleTimeSlotClick = (slot: TimeSlot): void => {
    // LEARNING: Toggle selection - deselect if same slot clicked
    // WHY: Allows users to deselect time slot by clicking again
    // PATTERN: Compare slots, set to null if same, otherwise set to new slot
    const currentSlot = selectedTimeSlot.value
    if (currentSlot && currentSlot.slotStart === slot.slotStart && currentSlot.slotEnd === slot.slotEnd) {
      selectedTimeSlot.value = null
    } else {
      selectedTimeSlot.value = slot
    }
  }

  /**
   * LEARNING: Viewport width tracking for responsive layout
   * WHY: Detects when space is insufficient for side-by-side layout
   * PATTERN: Ref to track viewport width, window resize event listener
   */
  const viewportWidth = ref<number>(typeof window !== 'undefined' ? window.innerWidth : 0)

  /**
   * LEARNING: Window resize handler reference for cleanup
   * WHY: Stores handler function reference for proper cleanup
   */
  let resizeHandler: (() => void) | null = null

  /**
   * LEARNING: Computed property to detect when space is too narrow
   * WHY: Determines when to move grid below calendar (full-width row fallback)
   * PATTERN: Check viewport width against breakpoint threshold
   * NOTE: Uses 600px breakpoint (sm breakpoint) - when below this, move grid to new row
   */
  const shouldMoveGridBelow = computed(() => {
    // LEARNING: Move grid below calendar when viewport is too narrow
    // WHY: Ensures grid is usable even when side-by-side layout doesn't fit
    // PATTERN: Check if viewport width is below sm breakpoint (600px)
    return viewportWidth.value < 600
  })

  /**
   * LEARNING: Handler for date change from calendar
   * WHY: Validates date selection and clears errors when valid
   * PATTERN: Function that validates and updates error state
   * NOTE: VDatePicker may return Date object, string, or array - handle all cases
   */
  const handleDateChange = (value: string | Date | string[] | Date[] | null): void => {
    // LEARNING: Normalize date value to string format (YYYY-MM-DD)
    // WHY: VDatePicker may return Date object or string, need consistent format
    // PATTERN: Convert Date to string, handle array (take first), handle null
    let dateString: string | null = null
    
    if (value) {
      if (Array.isArray(value)) {
        // Handle array (take first date)
        const firstValue = value[0]
        if (firstValue instanceof Date) {
          dateString = firstValue.toISOString().split('T')[0]
        } else if (typeof firstValue === 'string') {
          dateString = firstValue
        }
      } else if (value instanceof Date) {
        dateString = value.toISOString().split('T')[0]
      } else if (typeof value === 'string') {
        dateString = value
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

  onMounted(() => {
    // LEARNING: Set up window resize listener to track viewport width
    // WHY: Enables responsive layout that adapts to window size changes
    // PATTERN: Window resize event listener, cleanup on unmount
    if (typeof window !== 'undefined') {
      viewportWidth.value = window.innerWidth
      
      // LEARNING: Window resize event listener
      // WHY: Updates viewport width when window is resized
      // PATTERN: Add event listener, store handler for cleanup
      resizeHandler = () => {
        viewportWidth.value = window.innerWidth
      }
      window.addEventListener('resize', resizeHandler)
    }
  })

  onUnmounted(() => {
    // LEARNING: Cleanup window resize event listener
    // WHY: Prevents memory leaks when component unmounts
    // PATTERN: Remove event listener if handler exists
    if (resizeHandler && typeof window !== 'undefined') {
      window.removeEventListener('resize', resizeHandler)
      resizeHandler = null
    }
  })

  return {
    currentTimeSlots,
    selectedTimeSlot,
    shouldMoveGridBelow,
    handleTimeSlotClick,
    handleDateChange
  }
}


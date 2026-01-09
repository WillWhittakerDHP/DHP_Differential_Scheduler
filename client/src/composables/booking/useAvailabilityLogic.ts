/**
 * useAvailabilityLogic Composable
 * 
 * LEARNING: Extracts availability step business logic from AvailabilityStep component
 * WHY: Moves date range calculation, property details extraction, and time slot grouping to composable
 * PATTERN: Composable that provides reactive computed properties and data transformations
 */

import { computed, watch, ref, type Ref, type ComputedRef } from 'vue'
import { matchLoadedTimeSlots as matchLoadedTimeSlotsUtil } from '@/utils/booking/timeSlotMatching'
import type { TimeSlot } from '@/types/appointment'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { WizardStateData } from '@/utils/transformers/appointmentToWizardTransformer'

/**
 * Property details structure
 */
export interface PropertyDetails {
  squareFootage?: number | null
  bedrooms?: number | null
  bathrooms?: number | null
  foundationAccess?: 'basement' | 'crawlspace' | 'slab' | null
  additionalUnits?: number | null
}

/**
 * Date range structure
 */
export interface DateRange {
  start: string | null
  end: string | null
}

/**
 * Time slots per day structure
 */
export interface TimeSlotsPerDay {
  date: string
  inspectorTimeSlots: TimeSlot[]
  clientTimeSlots: TimeSlot[]
}

/**
 * useAvailabilityLogic composable parameters
 */
export interface UseAvailabilityLogicParams {
  selectedDate: Ref<DateRange>
  propertyDetailsStepData: Ref<PropertyDetails | null> | null
  wizard: {
    selectedServices: Ref<BookingBlockInstance[]>
    selectedPropertyTypeBlocks: Ref<BookingBlockInstance[]>
    selectedOptionTypeBlocks: Ref<BookingBlockInstance[]>
  }
  timeSlots: ComputedRef<TimeSlot[]>
  loadedWizardState: Ref<WizardStateData | null> | null
}

/**
 * Selected time slot structure for API
 */
export interface SelectedTimeSlot {
  time: string
  duration: number
}

/**
 * useAvailabilityLogic composable return type
 */
export interface UseAvailabilityLogicReturn {
  dateRangeForApi: ComputedRef<{ start: string; end: string } | null>
  propertyDetails: ComputedRef<PropertyDetails | null>
  accumulatedBlockInstances: ComputedRef<BookingBlockInstance[]>
  timeSlotsPerDay: Ref<TimeSlotsPerDay[]>
  selectedDateSingle: ComputedRef<string | null>
  currentTimeSlots: ComputedRef<TimeSlot[]>
  isDifferentialService: ComputedRef<boolean>
  selectedTimeSlots: ComputedRef<SelectedTimeSlot[] | null>
  matchLoadedTimeSlots: (loadedSlots: Array<{ time: string }>, availableSlots: TimeSlot[], inspectorTimeSlot: Ref<TimeSlot | null>, clientTimeSlot: Ref<TimeSlot | null>) => void
}

/**
 * useAvailabilityLogic composable
 * 
 * LEARNING: Provides reactive computed properties for availability step logic
 * WHY: Extracts business logic from component to composable
 * PATTERN: Composable that returns reactive computed properties
 */
export function useAvailabilityLogic(params: UseAvailabilityLogicParams): UseAvailabilityLogicReturn {
  const {
    selectedDate,
    propertyDetailsStepData,
    wizard,
    timeSlots,
    // loadedWizardState available for future loaded appointment state handling
  } = params

  /**
   * LEARNING: Computed property for date range for API call
   * WHY: Creates date range from selected date (start date + 1 day for end date)
   * PATTERN: Computed that creates date range when date is selected
   */
  const dateRangeForApi = computed(() => {
    if (!selectedDate.value.start) return null
    
    const startDate = new Date(selectedDate.value.start)
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 1) // Add 1 day for end date
    
    const result = {
      start: startDate.toISOString().split('T')[0], // YYYY-MM-DD format
      end: endDate.toISOString().split('T')[0]
    }
    return result
  })

  /**
   * LEARNING: Computed property for property details
   * WHY: Provides property details to availability calculations
   * PATTERN: Computed that extracts property details from step data
   */
  const propertyDetails = computed(() => {
    if (!propertyDetailsStepData?.value) return null
    return {
      squareFootage: propertyDetailsStepData.value.squareFootage,
      bedrooms: propertyDetailsStepData.value.bedrooms,
      bathrooms: propertyDetailsStepData.value.bathrooms,
      foundationAccess: propertyDetailsStepData.value.foundationAccess,
      additionalUnits: propertyDetailsStepData.value.additionalUnits
    }
  })

  /**
   * LEARNING: Computed property for all accumulated block instances
   * WHY: Duration calculation needs all selected blocks (service, property type block, availability options)
   * PATTERN: Collect all selected block instances into array
   */
  const accumulatedBlockInstances = computed(() => {
    const result = [
      ...wizard.selectedServices.value,
      ...wizard.selectedPropertyTypeBlocks.value,
      ...wizard.selectedOptionTypeBlocks.value
    ]
    return result
  })

  /**
   * LEARNING: Time slots structure for date range support
   * WHY: Supports time slots per day for date range selection
   * PATTERN: Ref that watches timeSlots and selectedDate, transforms into per-day structure
   */
  const timeSlotsPerDay = ref<TimeSlotsPerDay[]>([])

  /**
   * LEARNING: Watch timeSlots and selectedDate to populate timeSlotsPerDay
   * WHY: Transforms API response into component's expected format
   * PATTERN: Watch API response, transform and group by date
   */
  watch([timeSlots, selectedDate], ([slots, date]) => {
    if (!slots || slots.length === 0 || !date?.start) {
      timeSlotsPerDay.value = []
      return
    }

    // Group time slots by date
    const slotsByDate = new Map<string, TimeSlot[]>()
    
    slots.forEach(slot => {
      // LEARNING: Extract date in local timezone, not UTC
      // WHY: Slots are created with local time hours, so we need to extract date in local time to match
      // PATTERN: Use local date methods instead of toISOString() which uses UTC
      const slotDateObj = new Date(slot.slotStart)
      const year = slotDateObj.getFullYear()
      const month = String(slotDateObj.getMonth() + 1).padStart(2, '0')
      const day = String(slotDateObj.getDate()).padStart(2, '0')
      const slotDate = `${year}-${month}-${day}`
      if (!slotsByDate.has(slotDate)) {
        slotsByDate.set(slotDate, [])
      }
      slotsByDate.get(slotDate)!.push(slot)
    })

    // Transform to timeSlotsPerDay format
    timeSlotsPerDay.value = Array.from(slotsByDate.entries()).map(([date, slots]) => {
      /**
       * WHY: Differential scheduling (separate inspector/client times) will be implemented in Feature 4
       * PATTERN: Currently using same time slots for both, will be separated based on service configuration
       */
      return {
        date,
        inspectorTimeSlots: slots,
        clientTimeSlots: slots
      }
    })
  }, { immediate: true })

  /**
   * LEARNING: Computed property for current selected date (single date mode)
   * WHY: Backward compatibility with existing UI (single date picker)
   * PATTERN: Extract start date from date range structure
   */
  const selectedDateSingle = computed({
    get: () => selectedDate.value.start,
    set: (value: string | null) => {
      selectedDate.value = { start: value, end: null }
    }
  })

  /**
   * LEARNING: Computed property for current time slots
   * WHY: Shows time slots for selected date (from timeSlotsPerDay structure)
   * PATTERN: Get time slots from timeSlotsPerDay array based on selected date
   * NOTE: startTimeType filtering is handled in component since it's UI state
   */
  const currentTimeSlots = computed(() => {
    if (!selectedDate.value.start) {
      return []
    }
    
    // Find time slots for selected date
    const daySlots = timeSlotsPerDay.value.find(day => day.date === selectedDate.value.start)
    if (!daySlots) {
      return []
    }
    
    // Return inspector time slots (component will filter by startTimeType if needed)
    return daySlots.inspectorTimeSlots
  })

  /**
   * LEARNING: Computed property to check if service supports differential scheduling
   * WHY: Determines whether to show Inspector/Client toggle
   * PATTERN: Check if any selected service has differential === true
   */
  const isDifferentialService = computed(() => {
    const selectedServices = wizard.selectedServices.value
    return selectedServices.some(s => s.differential === true)
  })

  /**
   * LEARNING: Transform selected time slots to API format
   * WHY: Converts TimeSlot objects to ISO timestamps with duration for API
   * PATTERN: Computed that transforms TimeSlot objects to API format
   * NOTE: Requires onSiteTotal and presentationDuration from useTimeSlotCalculations
   * NOTE: Currently unused - will be used when time slot API is implemented
   */
   
  // @ts-expect-error - Unused function kept for future time slot API implementation
  const _createSelectedTimeSlots = (
    inspectorTimeSlot: TimeSlot | null,
    clientTimeSlot: TimeSlot | null,
    selectedDateStart: string | null,
    onSiteTotal: number,
    presentationDuration: number
  ): SelectedTimeSlot[] | null => {
    if (!inspectorTimeSlot || !selectedDateStart) {
      return null
    }

    const timeSlots: SelectedTimeSlot[] = []

    if (inspectorTimeSlot) {
      timeSlots.push({
        time: inspectorTimeSlot.slotStart,
        duration: onSiteTotal
      })
    }

    // LEARNING: Add client time slot if different from inspector time slot
    // WHY: Differential scheduling may have separate client time
    // PATTERN: Compare TimeSlot objects by slotStart
    if (clientTimeSlot && 
        clientTimeSlot.slotStart !== inspectorTimeSlot.slotStart) {
      timeSlots.push({
        time: clientTimeSlot.slotStart,
        duration: presentationDuration
      })
    }

    return timeSlots.length > 0 ? timeSlots : null
  }

  /**
   * LEARNING: Wrapper around shared matchLoadedTimeSlots utility
   * WHY: Maintains backwards-compatible API while using shared implementation
   * PATTERN: Re-export utility function with same signature
   */
  const matchLoadedTimeSlots = matchLoadedTimeSlotsUtil

  // Placeholder for selectedTimeSlots - will be computed in component using this helper
  const selectedTimeSlots = computed<SelectedTimeSlot[] | null>(() => null)

  return {
    dateRangeForApi,
    propertyDetails,
    accumulatedBlockInstances,
    timeSlotsPerDay,
    selectedDateSingle,
    currentTimeSlots,
    isDifferentialService,
    selectedTimeSlots,
    matchLoadedTimeSlots
  }
}


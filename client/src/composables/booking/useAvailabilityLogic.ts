/**
 * useAvailabilityLogic Composable
 * 
 * LEARNING: Extracts availability step business logic from AvailabilityStep component
 * WHY: Moves date range calculation, property details extraction, and time slot grouping to composable
 * PATTERN: Composable that provides reactive computed properties and data transformations
 */

import { computed, watch, ref, type Ref, type ComputedRef } from 'vue'
import { matchLoadedTimeSlots as matchLoadedTimeSlotsUtil } from '@/utils/booking/timeSlotMatching'
import type { TimeSlot, AppointmentSlots } from '@/types/appointment'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { WizardStateData } from '@/utils/transformers/appointmentToWizardTransformer'
import { calculateAppointmentSlots, normalizeAppointmentSlotsByOrderIndex } from '@/utils/booking/appointmentTimeCalculations'

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
 * Appointment slots per day structure
 */
export interface AppointmentSlotsPerDay {
  date: string
  appointmentSlots: AppointmentSlots
}

/**
 * useAvailabilityLogic composable return type
 */
export interface UseAvailabilityLogicReturn {
  dateRangeForApi: ComputedRef<{ start: string; end: string } | null>
  propertyDetails: ComputedRef<PropertyDetails | null>
  accumulatedBlockInstances: ComputedRef<BookingBlockInstance[]>
  timeSlotsPerDay: Ref<TimeSlotsPerDay[]>
  appointmentSlotsPerDay: Ref<AppointmentSlotsPerDay[]>
  selectedDateSingle: ComputedRef<string | null>
  currentAppointmentSlots: ComputedRef<TimeSlot[]>
  isDifferentialService: ComputedRef<boolean>
  isEffectivelyDifferential: ComputedRef<boolean>
  selectedTimeSlots: ComputedRef<SelectedTimeSlot[] | null>
  matchLoadedTimeSlots: (loadedSlots: Array<{ time: string }>, availableSlots: TimeSlot[], inspectorAppointmentSlot: Ref<TimeSlot | null>, clientAppointmentSlot: Ref<TimeSlot | null>) => void
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
   * WHY: Creates date range from selected date (start date + 1 day for end date) in RFC3339 format
   * PATTERN: Computed that creates RFC3339 datetime range when date is selected
   */
  const dateRangeForApi = computed(() => {
    if (!selectedDate.value.start) return null
    
    // LEARNING: Parse selected date in local timezone
    // WHY: Ensures correct day of week calculation regardless of timezone
    // PATTERN: Extract date part and create Date object in local timezone
    // NOTE: Handle both string and Date object types
    const startValue = selectedDate.value.start
    const dateString = typeof startValue === 'string' 
      ? (startValue.includes('T') ? startValue.split('T')[0] : startValue)
      : (startValue instanceof Date 
          ? `${startValue.getFullYear()}-${String(startValue.getMonth() + 1).padStart(2, '0')}-${String(startValue.getDate()).padStart(2, '0')}`
          : String(startValue))
    const [year, month, day] = dateString.split('-').map(Number)
    const startDate = new Date(year, month - 1, day) // Local timezone, midnight
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 1) // Add 1 day for end date
    
    // LEARNING: Determine start datetime: always use start of day (midnight) for consistency
    // WHY: Busy periods need to cover the entire day to match slots, which start at business hours
    //      The mock generator will filter out past times, so using start of day ensures full coverage
    // PATTERN: Always use start of day, let mock generator handle past time filtering
    const startDateTime = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0) // Start of day
    
    // LEARNING: Early return if date is in the past (not today)
    // WHY: Past dates can't render in UI, but today should be allowed even if midnight has passed
    // PATTERN: Compare date portions only (not times) to allow today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const startDateOnly = new Date(startDateTime)
    startDateOnly.setHours(0, 0, 0, 0)
    
    if (startDateOnly < today) {
      return null // Past dates can't render in UI
    }
    
    // LEARNING: End datetime: end of day (23:59:59) in local timezone
    // WHY: Covers entire day for busy period generation
    // PATTERN: Set hours to end of day, then convert to RFC3339
    const endDateTime = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59)
    
    // LEARNING: Convert to RFC3339 format (ISO 8601 with UTC timezone, matching Google Calendar API)
    // WHY: Consistent format throughout codebase, matches Google Calendar API
    // PATTERN: Use toISOString() to produce RFC3339 format
    return {
      start: startDateTime.toISOString(),
      end: endDateTime.toISOString()
    }
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
   * LEARNING: AppointmentSlots structure for normalized time slot support
   * WHY: Supports complex differential scheduling with normalized positions
   * PATTERN: Ref that watches timeSlots and selectedDate, transforms into AppointmentSlots per day
   */
  const appointmentSlotsPerDay = ref<AppointmentSlotsPerDay[]>([])

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
   * LEARNING: Check if any part instance has differentialOverride: true
   * WHY: Allows explicit override of differential behavior
   * PATTERN: Check all selected services and option type blocks for parts with differentialOverride
   */
  const hasDifferentialOverride = computed(() => {
    // Check selected services
    const serviceHasOverride = wizard.selectedServices.value.some(service =>
      service.partInstances?.some(part => part.differentialOverride === true)
    )
    
    // Check selected option type blocks (e.g., "No Client Presentation" option)
    const optionHasOverride = wizard.selectedOptionTypeBlocks.value.some(option =>
      option.partInstances?.some(part => part.differentialOverride === true)
    )
    
    return serviceHasOverride || optionHasOverride
  })

  /**
   * LEARNING: Effective differential state for UI rendering
   * WHY: Service may be differential but overridden by selected options
   * PATTERN: Returns false if service is not differential OR if override exists
   * 
   * Logic:
   * - If service.differential === false → return false (non-differential)
   * - If service.differential === true AND any part has differentialOverride === true → return false (overridden to non-differential)
   * - If service.differential === true AND no override → return true (differential)
   */
  const isEffectivelyDifferential = computed(() => {
    if (!isDifferentialService.value) return false
    if (hasDifferentialOverride.value) return false
    return true
  })

  /**
   * LEARNING: Watch timeSlots and selectedDate to populate timeSlotsPerDay and appointmentSlotsPerDay
   * WHY: Transforms API response into component's expected format and generates AppointmentSlots
   * PATTERN: Watch API response, transform and group by date, generate AppointmentSlots for each slot
   */
  watch([timeSlots, selectedDate, accumulatedBlockInstances], ([slots, date, blockInstances]) => {
    if (!slots || slots.length === 0 || !date?.start) {
      timeSlotsPerDay.value = []
      appointmentSlotsPerDay.value = []
      return
    }

    // Group time slots by date
    const slotsByDate = new Map<string, TimeSlot[]>()
    
    slots.forEach(slot => {
      // LEARNING: Extract date in local timezone, not UTC
      // WHY: Slots are created with local time hours, so we need to extract date in local time to match
      // PATTERN: Use local date methods instead of toISOString() which uses UTC
      const slotDateObj = new Date(slot.startTime)
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

    // LEARNING: Generate AppointmentSlots for each date
    // WHY: Provides normalized AppointmentSlots structure for complex time slot UI
    // PATTERN: For each date, generate AppointmentSlots for each time slot position
    appointmentSlotsPerDay.value = Array.from(slotsByDate.entries()).map(([date, slots]) => {
      // LEARNING: Generate AppointmentSlots for each slot position
      // WHY: Each available slot position needs normalized AppointmentSlots
      // PATTERN: Map over slots, calculate AppointmentSlots for each slot start time
      const appointmentSlotsForDate: AppointmentSlots = []
      
      slots.forEach((slot, index) => {
        const calculatedSlots = calculateAppointmentSlots(blockInstances, slot.startTime)
        // Normalize orderIndex to match slot position
        const normalized = normalizeAppointmentSlotsByOrderIndex(calculatedSlots.map(calculatedSlot => ({
          ...calculatedSlot,
          orderIndex: index
        })))
        appointmentSlotsForDate.push(...normalized)
      })
      
      return {
        date,
        appointmentSlots: normalizeAppointmentSlotsByOrderIndex(appointmentSlotsForDate)
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
   * LEARNING: Computed property for current appointment slots
   * WHY: Shows appointment slots for selected date (from timeSlotsPerDay structure)
   * PATTERN: Get appointment slots from timeSlotsPerDay array based on selected date
   * NOTE: startTimeType filtering is handled in component since it's UI state
   */
  const currentAppointmentSlots = computed(() => {
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
        time: inspectorTimeSlot.startTime,
        duration: onSiteTotal
      })
    }

    // LEARNING: Add client time slot if different from inspector time slot
    // WHY: Differential scheduling may have separate client time
    // PATTERN: Compare TimeSlot objects by startTime
    if (clientTimeSlot && 
        clientTimeSlot.startTime !== inspectorTimeSlot.startTime) {
      timeSlots.push({
        time: clientTimeSlot.startTime,
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
    appointmentSlotsPerDay,
    selectedDateSingle,
    currentAppointmentSlots,
    isDifferentialService,
    isEffectivelyDifferential,
    selectedTimeSlots,
    matchLoadedTimeSlots
  }
}

/**
 * @deprecated Use AppointmentSlotsPerDay instead
 */
export interface AppointmentTimesPerDay extends AppointmentSlotsPerDay {
  appointmentTimes: AppointmentSlots
}

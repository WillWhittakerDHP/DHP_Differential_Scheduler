/**
 * WHY: useAvailabilityLogic Composable

WHY: Moves date range calculation, prop...
 */
import { computed, watch, ref, type Ref, type ComputedRef } from 'vue'
import { matchLoadedTimeSlots as matchLoadedTimeSlotsUtil } from '@/utils/booking/timeSlotMatching'
import type { TimeSlot, AppointmentSlots } from '@/types/appointment'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { WizardStateData } from '@/utils/transformers/appointmentToWizardTransformer'
import { calculateAppointmentSlots, normalizeAppointmentSlotsByOrderIndex } from '@/utils/booking/appointmentTimeCalculations'
import { parseUTCDate } from '@/utils/booking/dateUtils'
import type { ISO8601Date, RFC3339DateTime } from '@shared/types/primitiveBrands'
import { toRFC3339DateTime } from '@/types/datetime'
import type { PropertyDetails } from '@/types/availability'
import { equals } from '@/utils/ternary/ternaryUtils'
import { useAvailabilitySettings } from '@/composables/booking/useAvailabilitySettings'

/**
LEARNING: Uses ISO 8601 date format (YYYY-MM-DD) fo...
 */
interface DateRange {
  start: ISO8601Date | null
  end: ISO8601Date | null
}

export interface TimeSlotsPerDay {
  date: string
  inspectorTimeSlots: TimeSlot[]
  clientTimeSlots: TimeSlot[]
}

interface UseAvailabilityLogicParams {
  selectedDate: Ref<DateRange>
  propertyDetailsStepData: Ref<PropertyDetails | null> | null
  wizard: {
    selectedUserTypeBlock: Ref<BookingBlockInstance | null>
    selectedServiceTypeBlocks: Ref<BookingBlockInstance[]>
    selectedPropertyTypeBlocks: Ref<BookingBlockInstance[]>
    selectedOptionTypeBlocks: Ref<BookingBlockInstance[]>
  }
  timeSlots: ComputedRef<TimeSlot[]>
  loadedWizardState: Ref<WizardStateData | null> | null
}

export interface SelectedTimeSlot {
  time: string
  duration: number
}

interface AppointmentSlotsPerDay {
  date: string
  appointmentSlots: AppointmentSlots
}

interface UseAvailabilityLogicReturn {
  dateRangeForApi: ComputedRef<{ start: RFC3339DateTime; end: RFC3339DateTime } | null>
  propertyDetails: ComputedRef<PropertyDetails | null>
  accumulatedBlockInstances: ComputedRef<BookingBlockInstance[]>
  timeSlotsPerDay: Ref<TimeSlotsPerDay[]>
  appointmentSlotsPerDay: Ref<AppointmentSlotsPerDay[]>
  selectedDateSingle: ComputedRef<string | null>
  currentAppointmentSlots: ComputedRef<TimeSlot[]>
  isDifferentialService: ComputedRef<boolean>
  isEffectivelyDifferential: ComputedRef<boolean>
  selectedTimeSlots: ComputedRef<SelectedTimeSlot[] | null>
  matchLoadedTimeSlots: (loadedSlots: Array<{ startTime: string; endTime?: string }>, availableSlots: TimeSlot[], majorAppointmentSlot: Ref<TimeSlot | null>, minorAppointmentSlot: Ref<TimeSlot | null>) => void
}

/**
 * WHY: useAvailabilityLogic composable

WHY: Extracts business logic from compo...
 */
export function useAvailabilityLogic(params: UseAvailabilityLogicParams): UseAvailabilityLogicReturn {
  const {
    selectedDate,
    propertyDetailsStepData,
    wizard,
    timeSlots,
    loadedWizardState: _loadedWizardState
  } = params
  
  // PATTERN: Get settings for rounding configuration
  const { settings } = useAvailabilitySettings()

  /**
   * PATTERN: Computed that creates RFC3339 datetime range when date is selected
   */
  const dateRangeForApi = computed(() => {
    if (!selectedDate.value.start) return null
    
    // LEARNING: Parse selected date in UTC using shared utility
    // WHY: All business logic should use UTC to avoid timezone issues
    // PATTERN: Use parseUTCDate utility with built-in validation
    const startValue = selectedDate.value.start
    if (!startValue) return null
    
    const startDate = parseUTCDate(startValue)
    if (!startDate) {
      return null
    }
    // LEARNING: Use UTC methods for all date operations
    // WHY: All business logic should use UTC to avoid timezone issues
    // PATTERN: Use Date.UTC() and UTC getters for date construction and comparison
    const endDate = new Date(Date.UTC(
      startDate.getUTCFullYear(),
      startDate.getUTCMonth(),
      startDate.getUTCDate() + 1, // Add 1 day for end date
      0, 0, 0, 0
    ))
    
    // LEARNING: Determine start datetime: always use start of day (midnight UTC) for consistency
    // PATTERN: Always use start of day UTC, let mock generator handle past time filtering
    const startDateTime = new Date(Date.UTC(
      startDate.getUTCFullYear(),
      startDate.getUTCMonth(),
      startDate.getUTCDate(),
      0, 0, 0, 0
    ))
    
    // PATTERN: Compare date portions only (not times) to allow today, using UTC dates
    const now = new Date()
    const today = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      0, 0, 0, 0
    ))
    const startDateOnly = new Date(Date.UTC(
      startDate.getUTCFullYear(),
      startDate.getUTCMonth(),
      startDate.getUTCDate(),
      0, 0, 0, 0
    ))
    
    if (startDateOnly < today) {
      return null // Past dates can't render in UI
    }
    
    // LEARNING: End datetime: end of day (23:59:59) in UTC
    // PATTERN: Use Date.UTC() to create end of day in UTC, then convert to RFC3339
    const endDateTime = new Date(Date.UTC(
      endDate.getUTCFullYear(),
      endDate.getUTCMonth(),
      endDate.getUTCDate(),
      23, 59, 59, 999
    ))
    
    // LEARNING: Convert to RFC3339 format (ISO 8601 with UTC timezone, matching Google Calendar API)
    // WHY: Consistent format throughout codebase, matches Google Calendar API
    // PATTERN: Use toISOString() to produce RFC3339 format
    return {
      start: toRFC3339DateTime(startDateTime),
      end: toRFC3339DateTime(endDateTime)
    }
  })

  /**
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
   */
  const accumulatedBlockInstances = computed(() => {
    const result = [
      ...(wizard.selectedUserTypeBlock.value ? [wizard.selectedUserTypeBlock.value] : []),
      ...wizard.selectedServiceTypeBlocks.value,
      ...wizard.selectedPropertyTypeBlocks.value,
      ...wizard.selectedOptionTypeBlocks.value
    ]
    return result
  })

  /**
   */
  const timeSlotsPerDay = ref<TimeSlotsPerDay[]>([])

  /**
   * P2-2: Made lazy - calculates only when accessed, not preemptively for all slots
   */
  const appointmentSlotsPerDay = computed<AppointmentSlotsPerDay[]>(() => {
    const slots = timeSlots.value
    const date = selectedDate.value
    const blockInstances = accumulatedBlockInstances.value

    if (!slots || slots.length === 0 || !date?.start) {
      return []
    }

    const slotsByDate = new Map<string, TimeSlot[]>()
    
    slots.forEach(slot => {
      // LEARNING: Extract date in UTC
      // WHY: All business logic should use UTC to avoid timezone issues
      // PATTERN: Use UTC date methods to extract date portion from RFC3339 datetime
      const slotDateObj = new Date(slot.startTime)
      const year = slotDateObj.getUTCFullYear()
      const month = String(slotDateObj.getUTCMonth() + 1).padStart(2, '0')
      const day = String(slotDateObj.getUTCDate()).padStart(2, '0')
      const slotDate = `${year}-${month}-${day}`
      if (!slotsByDate.has(slotDate)) {
        slotsByDate.set(slotDate, [])
      }
      slotsByDate.get(slotDate)!.push(slot)
    })

    // PATTERN: Calculate AppointmentSlots only when this computed is accessed
    return Array.from(slotsByDate.entries()).map(([date, slots]) => {
      const appointmentSlotsForDate: AppointmentSlots = []
      
      slots.forEach((slot, index) => {
        const calculatedSlots = calculateAppointmentSlots(
          blockInstances, 
          slot.startTime,
          undefined, // eventInstances
          undefined, // eventShapes
          undefined, // eventAssignmentsRelationships
          undefined, // partShapeById
          settings.value // settings for rounding
        )
        // PATTERN: Propagate TimeSlot availability data to AppointmentSlot
        // These values are computed during slot generation and need to flow through to UI
        const normalized = normalizeAppointmentSlotsByOrderIndex(calculatedSlots.map(calculatedSlot => ({
          ...calculatedSlot,
          isAvailable: slot.isAvailable,
          flexibleViolations: slot.flexibleViolations,
          orderIndex: index
        })))
        appointmentSlotsForDate.push(...normalized)
      })
      
      return {
        date,
        appointmentSlots: normalizeAppointmentSlotsByOrderIndex(appointmentSlotsForDate)
      }
    })
  })

  /**
   */
  const isDifferentialService = computed(() => {
    const selectedServices = wizard.selectedServiceTypeBlocks.value
    return selectedServices.some(s => equals(s.differential, 'true'))
  })

  /**
   */
  const hasDifferentialOverride = computed(() => {
    const serviceHasOverride = wizard.selectedServiceTypeBlocks.value.some(service =>
      service.differential === 'override'
    )
    
    const optionHasOverride = wizard.selectedOptionTypeBlocks.value.some(option =>
      option.differential === 'override'
    )
    
    return serviceHasOverride || optionHasOverride
  })

  /**
LEARNING: Effective differential state for UI rendering

Logic:
- If...
   */
  const isEffectivelyDifferential = computed(() => {
    if (!isDifferentialService.value) {
      return false
    }
    if (hasDifferentialOverride.value) {
      return false
    }
    return true
  })

  /**
WHY: Transforms API response into component's expected format
P2-2: ...
   */
  watch([timeSlots, selectedDate], ([slots, date]) => {
    if (!slots || slots.length === 0 || !date?.start) {
      timeSlotsPerDay.value = []
      return
    }

    const slotsByDate = new Map<string, TimeSlot[]>()
    
    slots.forEach(slot => {
      // LEARNING: Extract date in UTC
      // WHY: All business logic should use UTC to avoid timezone issues
      // PATTERN: Use UTC date methods to extract date portion from RFC3339 datetime
      const slotDateObj = new Date(slot.startTime)
      const year = slotDateObj.getUTCFullYear()
      const month = String(slotDateObj.getUTCMonth() + 1).padStart(2, '0')
      const day = String(slotDateObj.getUTCDate()).padStart(2, '0')
      const slotDate = `${year}-${month}-${day}`
      if (!slotsByDate.has(slotDate)) {
        slotsByDate.set(slotDate, [])
      }
      slotsByDate.get(slotDate)!.push(slot)
    })

    timeSlotsPerDay.value = Array.from(slotsByDate.entries()).map(([date, slots]) => {
      /**
       */
      return {
        date,
        inspectorTimeSlots: slots,
        clientTimeSlots: slots
      }
    })
  }, { immediate: true })

  /**
   * NOTE: VDatePicker may return Date object, so convert to ISO 8601 date format (YYYY-MM-DD)
   */
  const selectedDateSingle = computed({
    get: () => selectedDate.value.start,
    set: (value: ISO8601Date | Date | null) => {
      // LEARNING: Normalize date value to ISO 8601 format (YYYY-MM-DD)
      // WHY: VDatePicker may return Date object or string, need consistent ISO 8601 format
      // PATTERN: Convert Date to ISO 8601 string, handle null
      let dateString: ISO8601Date | null = null
      
      if (value) {
        if (value instanceof Date) {
          dateString = value.toISOString().split('T')[0] as ISO8601Date
        } else if (typeof value === 'string') {
          dateString = (value.includes('T') ? value.split('T')[0] : value) as ISO8601Date
        }
      }
      
      selectedDate.value = { start: dateString, end: null }
    }
  })

  /**
   * NOTE: startTimeType filtering is handled in component since it's UI state
   */
  const currentAppointmentSlots = computed(() => {
    if (!selectedDate.value.start) {
      return []
    }
    
    const daySlots = timeSlotsPerDay.value.find(day => day.date === selectedDate.value.start)
    if (!daySlots) {
      return []
    }
    
    return daySlots.inspectorTimeSlots
  })

  /**
   */
  const matchLoadedTimeSlots = matchLoadedTimeSlotsUtil

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

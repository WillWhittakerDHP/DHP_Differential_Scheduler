/**
 * useAppointmentTimes Composable
 * 
 * LEARNING: Provides normalized AppointmentSlots and major/minor perspective transformations
 * WHY: Extracts AppointmentSlots calculation and transformation logic from components
 * PATTERN: Composable that provides reactive computed properties for AppointmentSlots
 */

import { computed, type ComputedRef } from 'vue'
import type { AppointmentSlots, TimeSlot, TimeRange } from '@/types/appointment'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import { calculateAppointmentSlots, normalizeAppointmentSlotsByOrderIndex } from '@/utils/booking/appointmentTimeCalculations'
import { transformToMajorPerspective, transformToMinorPerspective } from '@/utils/differentialScheduling'
import { useGlobal } from '@/composables/useGlobal'
import { useAvailabilitySettings } from '@/composables/booking/useAvailabilitySettings'

/**
 * useAppointmentTimes composable parameters
 */
export interface UseAppointmentTimesParams {
  blockInstances: ComputedRef<BookingBlockInstance[]> | BookingBlockInstance[]
  baseStartTime?: ComputedRef<string | null> | string | null
  isDifferentialService: ComputedRef<boolean> | boolean
}

/**
 * useAppointmentTimes composable return type
 */
export interface UseAppointmentTimesReturn {
  appointmentSlots: ComputedRef<AppointmentSlots>
  majorTimeSlots: ComputedRef<TimeSlot[]>  // Major time slots
  minorTimeSlots: ComputedRef<TimeSlot[]>  // Minor time slots
  getMajorTimeSlot: (orderIndex: number) => TimeSlot | TimeRange | null  // Get major time slot
  getMinorTimeSlot: (orderIndex: number) => TimeSlot | TimeRange | null  // Get minor time slot
}

/**
 * useAppointmentTimes composable
 * 
 * LEARNING: Provides normalized AppointmentSlots and perspective-specific time slots
 * WHY: Centralizes AppointmentSlots calculation and transformation logic
 * PATTERN: Composable that returns reactive computed properties
 */
export function useAppointmentTimes(params: UseAppointmentTimesParams): UseAppointmentTimesReturn {
  const {
    blockInstances,
    baseStartTime,
    isDifferentialService
  } = params

  // LEARNING: Convert inputs to computed refs for consistency
  // WHY: Allows both refs and plain values as input
  // PATTERN: Check if value is ComputedRef, wrap if needed
  const blockInstancesRef = computed(() => {
    return 'value' in blockInstances ? blockInstances.value : blockInstances
  })

  const baseStartTimeRef = computed(() => {
    if (!baseStartTime) return null
    // LEARNING: Check if baseStartTime is a ComputedRef (has 'value' property and is an object)
    // WHY: TypeScript doesn't allow 'in' operator on primitives, so check if it's an object first
    // PATTERN: Check if it's an object before using 'in' operator
    if (typeof baseStartTime === 'object' && baseStartTime !== null && 'value' in baseStartTime) {
      return (baseStartTime as ComputedRef<string | null>).value
    }
    return baseStartTime as string | null
  })

  const isDifferentialServiceRef = computed(() => {
    // LEARNING: Check if isDifferentialService is a ComputedRef (has 'value' property and is an object)
    // WHY: TypeScript doesn't allow 'in' operator on primitives, so check if it's an object first
    // PATTERN: Check if it's an object before using 'in' operator
    if (typeof isDifferentialService === 'object' && isDifferentialService !== null && 'value' in isDifferentialService) {
      return (isDifferentialService as ComputedRef<boolean>).value
    }
    return isDifferentialService as boolean
  })

  /**
   * LEARNING: Calculate normalized AppointmentSlots from block instances
   * WHY: Provides base AppointmentSlots structure with durations
   * PATTERN: Use calculation function, normalize by orderIndex
   */
  const appointmentSlots = computed(() => {
    const instances = blockInstancesRef.value
    const startTime = baseStartTimeRef.value
    
    // Calculate AppointmentSlots (may have null TimeSlots if no startTime)
    const calculated = calculateAppointmentSlots(instances, startTime || undefined)
    
    // Normalize by orderIndex
    return normalizeAppointmentSlotsByOrderIndex(calculated)
  })

  /**
   * LEARNING: Transform AppointmentSlots to major perspective
   * WHY: Provides major time slots for UI display
   * PATTERN: Transform each AppointmentSlot using major start time
   */
  const majorTimeSlots = computed(() => {
    const slots = appointmentSlots.value
    const startTime = baseStartTimeRef.value
    
    if (!startTime || slots.length === 0) {
      return []
    }

    // LEARNING: Transform each AppointmentSlot to major perspective
    // WHY: Each normalized position needs major perspective transformation
    // PATTERN: Map over AppointmentSlots, transform each one
    const globalData = useGlobal().getGlobalData()
    const { settings: availabilitySettings } = useAvailabilitySettings()
    
    return slots.map(appointmentSlot => {
      const transformed = transformToMajorPerspective(appointmentSlot, startTime, globalData || undefined, availabilitySettings.value || null)
      // Return the totalTimeRange for major perspective (or first available event time range)
      // NOTE: Uses 'Major'/'Minor' as fallback for backward compatibility
      return transformed.totalTimeRange || transformed.eventTimeRanges?.['Major'] || transformed.eventTimeRanges?.['Minor'] || transformed.eventTimeRanges?.['Moveable'] || null
    }).filter((slot): slot is TimeSlot => slot !== null)
  })

  /**
   * LEARNING: Transform AppointmentSlots to minor perspective
   * WHY: Provides minor time slots for UI display
   * PATTERN: Transform each AppointmentSlot using minor start time
   */
  const minorTimeSlots = computed(() => {
    const slots = appointmentSlots.value
    const startTime = baseStartTimeRef.value
    const isDifferential = isDifferentialServiceRef.value
    
    if (!startTime || slots.length === 0 || !isDifferential) {
      return []
    }

    // LEARNING: For differential services, minor start time is the base start time
    // WHY: Minor arrives at the selected time slot
    // PATTERN: Use baseStartTime as minor start time
    const minorStartTime = startTime

    // LEARNING: Transform each AppointmentSlot to minor perspective
    // WHY: Each normalized position needs minor perspective transformation
    // PATTERN: Map over AppointmentSlots, transform each one
    const globalData = useGlobal().getGlobalData()
    const { settings: availabilitySettings } = useAvailabilitySettings()
    
    return slots.map(appointmentSlot => {
      const transformed = transformToMinorPerspective(appointmentSlot, minorStartTime, globalData || undefined, availabilitySettings.value || null)
      // Return the minorTimeRange for minor perspective (or totalTimeRange or other event time ranges)
      // LEARNING: Use dynamic event names based on attendees (fallback to hardcoded names for backward compatibility)
      // NOTE: Uses 'Minor' as fallback for backward compatibility
      const minorEventName = transformed.eventTimeRanges?.['Minor'] ? 'Minor' : Object.keys(transformed.eventTimeRanges || {})[0] || 'Minor'
      return transformed.eventTimeRanges?.[minorEventName] || transformed.totalTimeRange || transformed.eventTimeRanges?.['Major'] || transformed.eventTimeRanges?.['Moveable'] || null
    }).filter((slot): slot is TimeSlot => slot !== null)
  })

  /**
   * LEARNING: Get major time slot for a specific orderIndex
   * WHY: Allows lookup of major time slot by normalized position
   * PATTERN: Find AppointmentSlot by orderIndex, transform to major perspective, return TimeSlot or TimeRange
   */
  const getMajorTimeSlot = (orderIndex: number): TimeSlot | TimeRange | null => {
    const slots = appointmentSlots.value
    const startTime = baseStartTimeRef.value
    
    if (!startTime) return null

    const appointmentSlot = slots.find(slot => slot.orderIndex === orderIndex)
    if (!appointmentSlot) return null

    const globalData = useGlobal().getGlobalData()
    const { settings: availabilitySettings } = useAvailabilitySettings()
    const transformed = transformToMajorPerspective(appointmentSlot, startTime, globalData || undefined, availabilitySettings.value || null)
    // LEARNING: Return TimeRange properties (no categorized slots in new structure)
    // WHY: New structure uses TimeRanges directly, no categorized TimeSlots
    // PATTERN: Return TimeRange properties from eventTimeRanges
    // NOTE: Uses 'Major'/'Minor' as fallback for backward compatibility
    return transformed.eventTimeRanges?.['Major'] || transformed.totalTimeRange || transformed.eventTimeRanges?.['Minor'] || transformed.eventTimeRanges?.['Moveable'] || null
  }

  /**
   * LEARNING: Get minor time slot for a specific orderIndex
   * WHY: Allows lookup of minor time slot by normalized position
   * PATTERN: Find AppointmentSlot by orderIndex, transform to minor perspective, return TimeSlot or TimeRange
   */
  const getMinorTimeSlot = (orderIndex: number): TimeSlot | TimeRange | null => {
    const slots = appointmentSlots.value
    const startTime = baseStartTimeRef.value
    const isDifferential = isDifferentialServiceRef.value
    
    if (!startTime || !isDifferential) return null

    const appointmentSlot = slots.find(slot => slot.orderIndex === orderIndex)
    if (!appointmentSlot) return null

    const minorStartTime = startTime
    // Get globalData and availabilitySettings for attendee-based logic
    const globalData = useGlobal().getGlobalData()
    const { settings: availabilitySettings } = useAvailabilitySettings()
    const transformed = transformToMinorPerspective(appointmentSlot, minorStartTime, globalData || undefined, availabilitySettings.value || null)
    // LEARNING: Return TimeRange properties (no categorized slots in new structure)
    // WHY: New structure uses TimeRanges directly, no categorized TimeSlots
    // PATTERN: Return TimeRange properties from eventTimeRanges
    // LEARNING: Use dynamic event names based on attendees (fallback to hardcoded names for backward compatibility)
    // NOTE: Uses 'Minor' as fallback for backward compatibility
    const minorEventName = transformed.eventTimeRanges?.['Minor'] ? 'Minor' : Object.keys(transformed.eventTimeRanges || {})[0] || 'Minor'
    return transformed.eventTimeRanges?.[minorEventName] || transformed.totalTimeRange || transformed.eventTimeRanges?.['Major'] || transformed.eventTimeRanges?.['Moveable'] || null
  }

  return {
    appointmentSlots,
    majorTimeSlots,
    minorTimeSlots,
    getMajorTimeSlot,
    getMinorTimeSlot
  }
}


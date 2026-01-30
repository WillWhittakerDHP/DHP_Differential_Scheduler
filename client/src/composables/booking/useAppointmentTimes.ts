/**
 * useAppointmentTimes Composable
 * 
 * LEARNING: Provides normalized AppointmentSlots and inspector/client perspective transformations
 * WHY: Extracts AppointmentSlots calculation and transformation logic from components
 * PATTERN: Composable that provides reactive computed properties for AppointmentSlots
 */

import { computed, type ComputedRef } from 'vue'
import type { AppointmentSlots, TimeSlot, TimeRange } from '@/types/appointment'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import { calculateAppointmentSlots, normalizeAppointmentSlotsByOrderIndex } from '@/utils/booking/appointmentTimeCalculations'
import { transformToInspectorPerspective, transformToClientPerspective } from '@/utils/differentialScheduling'

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
  inspectorTimeSlots: ComputedRef<TimeSlot[]>
  clientTimeSlots: ComputedRef<TimeSlot[]>
  getInspectorTimeSlot: (orderIndex: number) => TimeSlot | TimeRange | null
  getClientTimeSlot: (orderIndex: number) => TimeSlot | TimeRange | null
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
   * LEARNING: Transform AppointmentSlots to inspector perspective
   * WHY: Provides inspector time slots for UI display
   * PATTERN: Transform each AppointmentSlot using inspector start time
   */
  const inspectorTimeSlots = computed(() => {
    const slots = appointmentSlots.value
    const startTime = baseStartTimeRef.value
    
    if (!startTime || slots.length === 0) {
      return []
    }

    // LEARNING: Transform each AppointmentSlot to inspector perspective
    // WHY: Each normalized position needs inspector perspective transformation
    // PATTERN: Map over AppointmentSlots, transform each one
    return slots.map(appointmentSlot => {
      const transformed = transformToInspectorPerspective(appointmentSlot, startTime)
      // Return the totalTimeRange for inspector perspective (or first available)
      return transformed.totalTimeRange || transformed.onSiteTimeRange || transformed.clientPresentTimeRange || transformed.moveableTimeRange
    }).filter((slot): slot is TimeSlot => slot !== null)
  })

  /**
   * LEARNING: Transform AppointmentSlots to client perspective
   * WHY: Provides client time slots for UI display
   * PATTERN: Transform each AppointmentSlot using client start time
   */
  const clientTimeSlots = computed(() => {
    const slots = appointmentSlots.value
    const startTime = baseStartTimeRef.value
    const isDifferential = isDifferentialServiceRef.value
    
    if (!startTime || slots.length === 0 || !isDifferential) {
      return []
    }

    // LEARNING: For differential services, client start time is the base start time
    // WHY: Client arrives at the selected time slot
    // PATTERN: Use baseStartTime as client start time
    const clientStartTime = startTime

    // LEARNING: Transform each AppointmentSlot to client perspective
    // WHY: Each normalized position needs client perspective transformation
    // PATTERN: Map over AppointmentSlots, transform each one (onSiteTotal now comes from SlotShape)
    return slots.map(appointmentSlot => {
      const transformed = transformToClientPerspective(appointmentSlot, clientStartTime)
      // Return the clientPresentTimeRange for client perspective (or totalTimeRange)
      return transformed.clientPresentTimeRange || transformed.totalTimeRange || transformed.onSiteTimeRange || transformed.moveableTimeRange
    }).filter((slot): slot is TimeSlot => slot !== null)
  })

  /**
   * LEARNING: Get inspector time slot for a specific orderIndex
   * WHY: Allows lookup of inspector time slot by normalized position
   * PATTERN: Find AppointmentSlot by orderIndex, transform to inspector perspective, return TimeSlot or TimeRange
   */
  const getInspectorTimeSlot = (orderIndex: number): TimeSlot | TimeRange | null => {
    const slots = appointmentSlots.value
    const startTime = baseStartTimeRef.value
    
    if (!startTime) return null

    const appointmentSlot = slots.find(slot => slot.orderIndex === orderIndex)
    if (!appointmentSlot) return null

    const transformed = transformToInspectorPerspective(appointmentSlot, startTime)
    // LEARNING: Return TimeRange properties (no categorized slots in new structure)
    // WHY: New structure uses TimeRanges directly, no categorized TimeSlots
    // PATTERN: Return TimeRange properties
    return transformed.onSiteTimeRange || transformed.totalTimeRange || transformed.clientPresentTimeRange || transformed.moveableTimeRange || null
  }

  /**
   * LEARNING: Get client time slot for a specific orderIndex
   * WHY: Allows lookup of client time slot by normalized position
   * PATTERN: Find AppointmentSlot by orderIndex, transform to client perspective, return TimeSlot or TimeRange
   */
  const getClientTimeSlot = (orderIndex: number): TimeSlot | TimeRange | null => {
    const slots = appointmentSlots.value
    const startTime = baseStartTimeRef.value
    const isDifferential = isDifferentialServiceRef.value
    
    if (!startTime || !isDifferential) return null

    const appointmentSlot = slots.find(slot => slot.orderIndex === orderIndex)
    if (!appointmentSlot) return null

    const clientStartTime = startTime
    const transformed = transformToClientPerspective(appointmentSlot, clientStartTime)
    // LEARNING: Return TimeRange properties (no categorized slots in new structure)
    // WHY: New structure uses TimeRanges directly, no categorized TimeSlots
    // PATTERN: Return TimeRange properties
    return transformed.clientPresentTimeRange || transformed.totalTimeRange || transformed.onSiteTimeRange || transformed.moveableTimeRange || null
  }

  return {
    appointmentSlots,
    inspectorTimeSlots,
    clientTimeSlots,
    getInspectorTimeSlot,
    getClientTimeSlot
  }
}


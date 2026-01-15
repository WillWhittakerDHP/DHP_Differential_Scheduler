/**
 * useAppointmentSlots Composable
 * 
 * LEARNING: Provides normalized AppointmentSlots and inspector/client perspective transformations
 * WHY: Extracts AppointmentSlots calculation and transformation logic from components
 * PATTERN: Composable that provides reactive computed properties for AppointmentSlots
 */

import { computed, type ComputedRef } from 'vue'
import type { AppointmentSlots, TimeSlot } from '@/types/appointment'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import { calculateAppointmentSlots, normalizeAppointmentSlotsByOrderIndex } from '@/utils/booking/appointmentTimeCalculations'
import { transformToInspectorPerspective, transformToClientPerspective, calculateOnSiteTotal } from '@/utils/differentialScheduling'

/**
 * useAppointmentSlots composable parameters
 */
export interface UseAppointmentSlotsParams {
  blockInstances: ComputedRef<BookingBlockInstance[]> | BookingBlockInstance[]
  baseStartTime?: ComputedRef<string | null> | string | null
  isDifferentialService: ComputedRef<boolean> | boolean
}

/**
 * useAppointmentSlots composable return type
 */
export interface UseAppointmentSlotsReturn {
  appointmentSlots: ComputedRef<AppointmentSlots>
  inspectorTimeSlots: ComputedRef<TimeSlot[]>
  clientTimeSlots: ComputedRef<TimeSlot[]>
  getInspectorTimeSlot: (orderIndex: number) => TimeSlot | TimeRange | null
  getClientTimeSlot: (orderIndex: number) => TimeSlot | TimeRange | null
}

/**
 * useAppointmentSlots composable
 * 
 * LEARNING: Provides normalized AppointmentSlots and perspective-specific time slots
 * WHY: Centralizes AppointmentSlots calculation and transformation logic
 * PATTERN: Composable that returns reactive computed properties
 */
export function useAppointmentSlots(params: UseAppointmentSlotsParams): UseAppointmentSlotsReturn {
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
   * LEARNING: Calculate onSiteTotal for differential transformations
   * WHY: Needed to transform between inspector and client perspectives
   * PATTERN: Sum onSite parts from first service (or all services)
   */
  const onSiteTotal = computed(() => {
    const instances = blockInstancesRef.value
    if (instances.length === 0) return 0
    
    // Use first service for onSiteTotal calculation
    // TODO: Consider summing across all services if needed
    const firstService = instances.find(instance => instance.differential === true) || instances[0]
    return calculateOnSiteTotal(firstService)
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
      // Return the totalTime TimeSlot for inspector perspective (or first available)
      return transformed.totalTime || transformed.timeOnSite || transformed.dataCollection || transformed.earlyArrival || transformed.reportWriting || transformed.clientPresentation
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
    const onSite = onSiteTotal.value

    // LEARNING: Transform each AppointmentSlot to client perspective
    // WHY: Each normalized position needs client perspective transformation
    // PATTERN: Map over AppointmentSlots, transform each one
    return slots.map(appointmentSlot => {
      const transformed = transformToClientPerspective(appointmentSlot, clientStartTime, onSite)
      // Return the clientPresentation TimeSlot for client perspective (or totalTime)
      return transformed.clientPresentation || transformed.totalTime || transformed.timeOnSite || transformed.dataCollection || transformed.earlyArrival || transformed.reportWriting
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
    // LEARNING: Prefer TimeSlot properties (which extend TimeRange), fallback to TimeRange properties
    // WHY: TimeSlot has more information (onSite, clientPresent, moveable), but TimeRange is acceptable fallback
    // PATTERN: Return TimeSlot first, then TimeRange
    return transformed.dataCollection || transformed.earlyArrival || transformed.reportWriting || transformed.clientPresentation || transformed.totalOnSite || transformed.totalTime || null
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
    const onSite = onSiteTotal.value
    const transformed = transformToClientPerspective(appointmentSlot, clientStartTime, onSite)
    // LEARNING: Prefer TimeSlot properties (which extend TimeRange), fallback to TimeRange properties
    // WHY: TimeSlot has more information (onSite, clientPresent, moveable), but TimeRange is acceptable fallback
    // PATTERN: Return TimeSlot first, then TimeRange
    return transformed.clientPresentation || transformed.dataCollection || transformed.earlyArrival || transformed.reportWriting || transformed.totalOnSite || transformed.totalTime || null
  }

  return {
    appointmentSlots,
    inspectorTimeSlots,
    clientTimeSlots,
    getInspectorTimeSlot,
    getClientTimeSlot
  }
}

/**
 * @deprecated Use useAppointmentSlots instead
 */
export function useAppointmentTimes(params: UseAppointmentTimesParams): UseAppointmentTimesReturn {
  const result = useAppointmentSlots(params)
  return {
    appointmentTimes: result.appointmentSlots,
    inspectorTimeSlots: result.inspectorTimeSlots,
    clientTimeSlots: result.clientTimeSlots,
    getInspectorTimeSlot: result.getInspectorTimeSlot,
    getClientTimeSlot: result.getClientTimeSlot
  }
}

/**
 * @deprecated Use UseAppointmentSlotsParams instead
 */
export interface UseAppointmentTimesParams extends UseAppointmentSlotsParams {}

/**
 * @deprecated Use UseAppointmentSlotsReturn instead
 */
export interface UseAppointmentTimesReturn {
  appointmentTimes: ComputedRef<AppointmentSlots>
  inspectorTimeSlots: ComputedRef<TimeSlot[]>
  clientTimeSlots: ComputedRef<TimeSlot[]>
  getInspectorTimeSlot: (orderIndex: number) => TimeSlot | TimeRange | null
  getClientTimeSlot: (orderIndex: number) => TimeSlot | TimeRange | null
}

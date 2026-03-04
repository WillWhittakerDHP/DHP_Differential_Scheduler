/**
 * PATTERN: useAppointmentTimes Composable

PATTERN: Composable that provides reacti...
 */
import { computed, unref } from 'vue'
import { calculateAppointmentSlots, normalizeAppointmentSlotsByOrderIndex } from '@/utils/booking/appointmentTimeCalculations'
import { transformToMajorPerspective, transformToMinorPerspective } from '@/utils/differentialScheduling'
import { useAvailabilitySettings } from '@/composables/booking/useAvailabilitySettings'
import type { TimeSlot, TimeRange } from '@/types/appointment'
import type { UseAppointmentTimesParams, UseAppointmentTimesReturn } from '@/types/booking/appointmentTimes'

export type { UseAppointmentTimesParams, UseAppointmentTimesReturn } from '@/types/booking/appointmentTimes'

/**
 * PATTERN: useAppointmentTimes composable

PATTERN: Composable that returns reactiv...
 */
export function useAppointmentTimes(params: UseAppointmentTimesParams): UseAppointmentTimesReturn {
  const {
    blockInstances,
    baseStartTime,
    isDifferentialService
  } = params

  // WHY: Allows both refs and plain values as input
  // PATTERN: Check if value is ComputedRef, wrap if needed
  const blockInstancesRef = computed(() => {
    return 'value' in blockInstances ? blockInstances.value : blockInstances
  })

  const baseStartTimeRef = computed(() => unref(baseStartTime ?? null))
  const isDifferentialServiceRef = computed(() => unref(isDifferentialService))

  // PATTERN: Get settings for rounding configuration
  const { settings } = useAvailabilitySettings()

  const appointmentSlots = computed(() => {
    const instances = blockInstancesRef.value
    const startTime = baseStartTimeRef.value
    
    const calculated = calculateAppointmentSlots(
      instances, 
      startTime || undefined,
      undefined, // eventInstances
      undefined, // eventShapes
      undefined, // eventAssignmentsRelationships
      undefined, // partShapeById
      settings.value // settings for rounding
    )
    
    return normalizeAppointmentSlotsByOrderIndex(calculated)
  })

  /**
   */
  const majorTimeSlots = computed(() => {
    const slots = appointmentSlots.value
    const startTime = baseStartTimeRef.value
    
    if (!startTime || slots.length === 0) {
      return []
    }

    // PATTERN: Map over AppointmentSlots, transform each one
    return slots.map(appointmentSlot => {
      const transformed = transformToMajorPerspective(appointmentSlot, startTime)
      return transformed.totalTimeRange || null
    }).filter((slot): slot is TimeSlot => slot !== null)
  })

  const minorTimeSlots = computed(() => {
    const slots = appointmentSlots.value
    const startTime = baseStartTimeRef.value
    const isDifferential = isDifferentialServiceRef.value
    
    if (!startTime || slots.length === 0 || !isDifferential) {
      return []
    }

    const minorStartTime = startTime

    return slots.map(appointmentSlot => {
      const transformed = transformToMinorPerspective(appointmentSlot, minorStartTime)
      // PATTERN: Use eventTimeRanges keys instead of hardcoded 'Minor'
      const eventTimeRanges = transformed.eventTimeRanges !== undefined && transformed.eventTimeRanges !== null ? transformed.eventTimeRanges : {}
      const firstEventTimeRange = Object.values(eventTimeRanges).find(tr => tr !== null) || null
      return firstEventTimeRange || transformed.totalTimeRange || null
    }).filter((slot): slot is TimeSlot => slot !== null)
  })

  const getMajorTimeSlot = (orderIndex: number): TimeSlot | TimeRange | null => {
    const slots = appointmentSlots.value
    const startTime = baseStartTimeRef.value
    
    if (!startTime) return null

    const appointmentSlot = slots.find(slot => slot.orderIndex === orderIndex)
    if (!appointmentSlot) return null

    const transformed = transformToMajorPerspective(appointmentSlot, startTime)
    return transformed.totalTimeRange || null
  }

  const getMinorTimeSlot = (orderIndex: number): TimeSlot | TimeRange | null => {
    const slots = appointmentSlots.value
    const startTime = baseStartTimeRef.value
    const isDifferential = isDifferentialServiceRef.value
    
    if (!startTime || !isDifferential) return null

    const appointmentSlot = slots.find(slot => slot.orderIndex === orderIndex)
    if (!appointmentSlot) return null

    const minorStartTime = startTime
    const transformed = transformToMinorPerspective(appointmentSlot, minorStartTime)
    // PATTERN: Return first available event time range from eventTimeRanges, or fall back to totalTimeRange
    const eventTimeRanges = transformed.eventTimeRanges !== undefined && transformed.eventTimeRanges !== null ? transformed.eventTimeRanges : {}
    const firstEventTimeRange = Object.values(eventTimeRanges).find(tr => tr !== null) || null
    return firstEventTimeRange || transformed.totalTimeRange || null
  }

  return {
    appointmentSlots,
    majorTimeSlots,
    minorTimeSlots,
    getMajorTimeSlot,
    getMinorTimeSlot
  }
}

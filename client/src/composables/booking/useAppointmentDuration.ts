/**
 * useAppointmentDuration Composable
 * 
 * LEARNING: Calculates on-site appointment duration from block instances
 * WHY: Extracts duration calculation logic from AvailabilityStep component
 * PATTERN: Composable that provides computed property for appointment duration
 */

import { computed, type ComputedRef } from 'vue'
import { useDurationRounding } from '@/composables/booking/useDurationRounding'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import { toBoolean } from '@/utils/ternary/ternaryUtils'

/**
 * useAppointmentDuration composable parameters
 */
export interface UseAppointmentDurationParams {
  /**
   * Accumulated block instances (services, property type blocks, availability options)
   */
  accumulatedBlockInstances: ComputedRef<BookingBlockInstance[]>
}

/**
 * useAppointmentDuration composable return type
 */
export interface UseAppointmentDurationReturn {
  /**
   * Appointment duration in minutes (on-site only, with configurable rounding)
   * LEARNING: Calculates only on-site duration, not total duration
   * WHY: Report writing can happen off-site, so we only need to ensure on-site work fits in business hours
   * NOTE: Rounding is configurable via Business Controls tab (defaults to disabled)
   */
  appointmentDuration: ComputedRef<number | null>
}

/**
 * useAppointmentDuration composable
 * 
 * LEARNING: Calculates on-site duration from block instances
 * WHY: Extracts duration calculation logic from component to composable
 * PATTERN: Composable that returns reactive computed property
 */
export function useAppointmentDuration(
  params: UseAppointmentDurationParams
): UseAppointmentDurationReturn {
  const { accumulatedBlockInstances } = params

  // LEARNING: Get rounding function from composable
  // WHY: Provides reactive rounding that respects availability settings
  // PATTERN: Use composable for rounding logic
  const { roundDuration } = useDurationRounding()
  
  // LEARNING: Get globalData to access events and relationships
  // WHY: Events are stored in globalData, need to pass to buildAppointmentShape
  // PATTERN: Use useGlobal composable to access globalData
  const { getGlobalData, getGlobalEntities } = useGlobal()

  /**
   * LEARNING: Calculate on-site duration from AppointmentShape
   * WHY: Events are now stored on AppointmentShape, not on PartFinal
   * PATTERN: Build AppointmentShape and read OnSite duration from slotShape.eventDurations
   */
  const appointmentDuration = computed<number | null>(() => {
    const instances = accumulatedBlockInstances.value
    if (instances.length === 0) {
      return null
    }
    
    try {
      // Get events data from globalData
      const globalData = getGlobalData()
      const eventInstances = (globalData?.events?.eventInstance || []) as EventInstance[]
      const eventShapes = (globalData?.events?.eventShape || []) as EventShape[]
      const eventAssignmentsRelationships = (globalData?.relationships?.eventAssignments || []) as GlobalRelationship[]
      const validPartsRelationships = (globalData?.relationships?.validParts || []) as GlobalRelationship[]
      
      // Build partShapeById map
      const partShapes = getGlobalEntities('partShape')
      const partShapeById = new Map(
        partShapes.map(ps => [ps.id, ps as GlobalEntity<'partShape'>])
      )
      
      // Build AppointmentShape to get event durations
      const shape = buildAppointmentShape(
        instances,
        null,
        eventInstances,
        eventShapes,
        eventAssignmentsRelationships,
        partShapeById,
        validPartsRelationships
      )
      
      // LEARNING: Read OnSite duration from slotShape.eventDurations
      // WHY: Events are stored on AppointmentShape, durations computed in SlotShape
      // PATTERN: Read from eventDurations Record
      const onSiteDuration = shape.slotShape.eventDurations['OnSite'] || 0
      
      // LEARNING: Apply configurable rounding based on availability settings
      // WHY: Allows admin to control rounding behavior via Business Controls tab
      // PATTERN: Use composable rounding function that respects settings
      const roundedDuration = roundDuration(onSiteDuration)
      
      return roundedDuration > 0 ? roundedDuration : null
    } catch (error) {
      // LEARNING: Return null on error to prevent breaking UI
      // WHY: Graceful degradation if events data is unavailable
      return null
    }
  })

  return {
    appointmentDuration
  }
}

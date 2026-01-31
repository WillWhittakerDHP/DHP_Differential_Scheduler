/**
 * useAppointmentDuration Composable
 * 
 * LEARNING: Calculates major event appointment duration from block instances (legacy: on-site)
 * WHY: Extracts duration calculation logic from AvailabilityStep component
 * PATTERN: Composable that provides computed property for appointment duration
 */

import { computed, type ComputedRef } from 'vue'
import { useDurationRounding } from '@/composables/booking/useDurationRounding'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import { useGlobal } from '@/composables/useGlobal'
import { buildAppointmentShape } from '@/utils/booking/appointmentSlotBuilder'
import { findEventFinalByName } from '@/utils/booking/appointmentSlotBuilder'
import type { EventInstance, EventShape } from '@/types/events'
import type { GlobalRelationship } from '@/types/relationships'
import type { GlobalEntity } from '@/types/entities'

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
 * LEARNING: Calculates major event duration from block instances (legacy: on-site)
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
   * LEARNING: Calculate major event duration from AppointmentShape (legacy: on-site)
   * WHY: Events are now stored on AppointmentShape, not on PartFinal
   * PATTERN: Build AppointmentShape and read major event duration from slotShape.eventFinals using helper function
   */
  const appointmentDuration = computed<number | null>(() => {
    const instances = accumulatedBlockInstances.value
    if (instances.length === 0) {
      return null
    }
    
    try {
      // Get events data from globalData
      const globalData = getGlobalData()
      const eventInstances = getGlobalEntities('eventInstance') as EventInstance[]
      const eventShapes = getGlobalEntities('eventShape') as EventShape[]
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
        validPartsRelationships,
        globalData || undefined
      )
      
      // LEARNING: Read major event duration from slotShape.eventFinals using helper function
      // WHY: Events are stored on AppointmentShape, durations computed in SlotShape as EventFinal[]
      // PATTERN: Use helper function to find event by name, eliminates hardcoded access
      // NOTE: Uses 'OnSite' as fallback for backward compatibility, but should use major event from availabilitySettings
      const majorEventFinal = findEventFinalByName(shape.slotShape, 'OnSite')
      const majorDuration = majorEventFinal?.duration || 0
      
      // LEARNING: Apply configurable rounding based on availability settings
      // WHY: Allows admin to control rounding behavior via Business Controls tab
      // PATTERN: Use composable rounding function that respects settings
      const roundedDuration = roundDuration(majorDuration)
      
      // LEARNING: If major event duration is 0, fall back to total duration for slot generation
      // WHY: Slot generation needs a duration > 0, and if major event is 0, we should use total duration
      // PATTERN: Return total duration if major event duration is not available
      if (roundedDuration <= 0) {
        const totalDuration = shape.slotShape.totalDuration
        return totalDuration > 0 ? totalDuration : null
      }
      
      return roundedDuration
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

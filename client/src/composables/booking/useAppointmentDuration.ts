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

export interface UseAppointmentDurationParams {
  accumulatedBlockInstances: ComputedRef<BookingBlockInstance[]>
}

export interface UseAppointmentDurationReturn {
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
  // PATTERN: Use composable for rounding logic
  const { roundDuration } = useDurationRounding()
  
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
      const globalData = getGlobalData()
      const eventInstances = getGlobalEntities('eventInstance') as EventInstance[]
      const eventShapes = getGlobalEntities('eventShape') as EventShape[]
      const eventAssignmentsRelationships = (globalData?.relationships?.eventAssignments || []) as GlobalRelationship[]
      const validPartsRelationships = (globalData?.relationships?.validParts || []) as GlobalRelationship[]
      
      const partShapes = getGlobalEntities('partShape')
      const partShapeById = new Map(
        partShapes.map(ps => [ps.id, ps as GlobalEntity<'partShape'>])
      )
      
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
      
      // WHY: Events are stored on AppointmentShape, durations computed in SlotShape as EventFinal[]
      // PATTERN: Use helper function to find event by name, eliminates hardcoded access
      // NOTE: Uses 'Major' as fallback for backward compatibility, but should use major event from availabilitySettings
      const majorEventFinal = findEventFinalByName(shape.slotShape, 'Major')
      const majorDuration = majorEventFinal?.duration || 0
      
      // PATTERN: Use composable rounding function that respects settings
      const roundedDuration = roundDuration(majorDuration)
      
      // PATTERN: Return total duration if major event duration is not available
      if (roundedDuration <= 0) {
        const totalDuration = shape.slotShape.totalDuration
        return totalDuration > 0 ? totalDuration : null
      }
      
      return roundedDuration
    } catch (error) {
      return null
    }
  })

  return {
    appointmentDuration
  }
}

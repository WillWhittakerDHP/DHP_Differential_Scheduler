/**
 * WHY: useAppointmentShape Composable

LEARNING: Single-responsibility composab...
 */
import { computed, type ComputedRef } from 'vue'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { AppointmentShape } from '@/types/appointment'
import { buildAppointmentShape } from '@/utils/booking/appointmentSlotBuilder'
import { useAvailabilitySettings } from '@/composables/booking/useAvailabilitySettings'
import { useGlobal } from '@/composables/useGlobal'
import type { EventInstance, EventShape } from '@/types/events'
import type { GlobalRelationship } from '@/types/relationships'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'
import { createLogger } from '@/utils/logger'

const logger = createLogger('useAppointmentShape')

export interface UseAppointmentShapeParams {
  blockInstances: ComputedRef<BookingBlockInstance[]>
}

export interface UseAppointmentShapeReturn {
  appointmentShape: ComputedRef<AppointmentShape | null>
}

/**
 * WHY: useAppointmentShape composable

LEARNING: Builds AppointmentShape from b...
 */
export function useAppointmentShape(
  params: UseAppointmentShapeParams
): UseAppointmentShapeReturn {
  const { blockInstances } = params
  
  // PATTERN: Use composable to get reactive settings
  const { settings } = useAvailabilitySettings()
  
  // PATTERN: Use useGlobal composable to access globalData
  const { getGlobalData, getGlobalEntities } = useGlobal()

  const appointmentShape = computed<AppointmentShape | null>(() => {
    const instances = blockInstances.value
    
    if (instances.length === 0) {
      return null
    }
    
    try {
      const globalData = getGlobalData()
      
      // PATTERN: Use getGlobalEntities helper to get event data
      const eventInstances = getGlobalEntities('eventInstance') as EventInstance[]
      let eventShapes = getGlobalEntities('eventShape') as EventShape[]
      const rawEventAssignments = globalData?.relationships?.eventAssignments
      const rawAttendeeAssignments = globalData?.relationships?.attendeeAssignments
      if (rawEventAssignments === undefined || rawEventAssignments === null) {
        logger.debug('useAppointmentShape: eventAssignments missing, using []')
      }
      if (rawAttendeeAssignments === undefined || rawAttendeeAssignments === null) {
        logger.debug('useAppointmentShape: attendeeAssignments missing, using []')
      }
      const eventAssignmentsRelationships = (rawEventAssignments !== undefined && rawEventAssignments !== null ? rawEventAssignments : []) as GlobalRelationship[]
      const attendeeAssignmentsRelationships = (rawAttendeeAssignments !== undefined && rawAttendeeAssignments !== null ? rawAttendeeAssignments : []) as GlobalRelationship[]
      
      // PATTERN: Map over event shapes, attach attendees array from attendeeAssignments relationships
      // LEARNING: GlobalRelationship format uses parent/children objects, not parent_id/child_id
      // WHY: Relationships are transformed to nested format with parent and children arrays
      // PATTERN: Use rel.parent.id and rel.children.map(child => child.id) for GlobalRelationship format
      if (attendeeAssignmentsRelationships.length > 0) {
        eventShapes = eventShapes.map(eventShape => {
          const matchingRel = attendeeAssignmentsRelationships.find(rel => rel.parent?.id === eventShape.id)
          const rawChildren = matchingRel?.children
          let attendees: GlobalEntityId[]
          if (rawChildren !== undefined && rawChildren !== null) {
            attendees = rawChildren.map((child: GlobalEntity<GlobalEntityKey>) => child.id)
          } else {
            logger.debug('useAppointmentShape: matching rel children missing', { eventShapeId: eventShape.id })
            attendees = []
          }
          // WHY: Eliminates hardcoded perspective strings, enables config-driven approach
          // PATTERN: Use EVENT_PERSPECTIVE_KEYS constants for perspective determination
          return { ...eventShape, attendees }
        })
      } else {
        eventShapes = eventShapes.map(eventShape => ({ ...eventShape, attendees: [] }))
      }
      
      const partShapes = getGlobalEntities('partShape')
      const partShapeById = new Map(
        partShapes.map(ps => [ps.id, ps as GlobalEntity<'partShape'>])
      )
      
      // PATTERN: Extract events data from globalData and pass to builder
      const shape = buildAppointmentShape(
        instances, 
        settings.value,
        eventInstances,
        eventShapes,
        eventAssignmentsRelationships,
        partShapeById,
      )
      
      return shape
    } catch (error) {
      logger.error('Error building appointment shape:', error)
      return null
    }
  })

  return {
    appointmentShape
  }
}

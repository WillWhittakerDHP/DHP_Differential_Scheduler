/**
 * useAppointmentSlots Composable
 * 
 * LEARNING: Thin orchestrator for AppointmentShape and AppointmentSlot
 * WHY: Separates shape calculation (once) from slot application (per available time)
 * PATTERN: Composable that builds shape once, applies to each available time
 */

import { computed, type ComputedRef, type Ref } from 'vue'
import type { 
  AppointmentShape, 
  AppointmentSlot, 
  AppointmentSlots, 
  TimeRange,
  PerspectiveKey 
} from '@/types/appointment'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import { 
  buildAppointmentShape, 
  applyShapeToTime, 
  derivePerspective 
} from '@/utils/booking/appointmentSlotBuilder'
import { useAvailabilitySettings } from '@/composables/booking/useAvailabilitySettings'
import { useGlobal } from '@/composables/useGlobal'
import { createLogger } from '@/utils/logger'
import { 
  getMajorEventShape, 
  getMinorEventShape 
} from '@/utils/eventAttendeeUtils'
import type { EventShapeEntity, GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'
import type { EventShape, EventInstance } from '@/types/events'
import type { GlobalRelationship } from '@/types/relationships'
import { EVENT_PERSPECTIVE_KEYS } from '@/configs/eventPerspectiveLabels'

const logger = createLogger('useAppointmentSlots')

export interface UseAppointmentSlotsParams {
  blockInstances: ComputedRef<BookingBlockInstance[]>
  availableStartTimes: ComputedRef<string[]>
  slotAvailability?: ComputedRef<Map<string, boolean>> // Optional: map of startTime -> isAvailable
  slotViolations?: ComputedRef<Map<string, string[] | undefined>> // Optional: map of startTime -> flexibleViolations
  timeSlotDurations?: ComputedRef<Map<string, number>> // Optional: durations from time slots for fallback
  selectedButtonIndex: Ref<number | null>
  perspective: ComputedRef<PerspectiveKey>
  isDifferentialService: ComputedRef<boolean>
}

export interface UseAppointmentSlotsReturn {
  appointmentShape: ComputedRef<AppointmentShape | null>
  
  appointmentSlots: ComputedRef<AppointmentSlots>
  
  selectedSlot: ComputedRef<AppointmentSlot | null>
  
  getDisplayTime: (buttonIndex: number) => TimeRange | null
  
  graphBars: ComputedRef<{
    major: TimeRange | null
    minor: TimeRange | null
  }>
}

/**
 * useAppointmentSlots composable
 * 
 * LEARNING: Builds shape once, applies to each available time
 * WHY: Efficient - durations calculated once, times applied N times
 * PATTERN: Composable that orchestrates pure utility functions
 */
export function useAppointmentSlots(params: UseAppointmentSlotsParams): UseAppointmentSlotsReturn {
  const {
    blockInstances,
    availableStartTimes,
    slotAvailability,
    slotViolations,
    timeSlotDurations,
    selectedButtonIndex,
    perspective,
    isDifferentialService
  } = params

  // PATTERN: Use composable to get reactive settings
  const { settings } = useAvailabilitySettings()
  
  // PATTERN: Use useGlobal composable to access globalData
  const { getGlobalData, getGlobalEntities } = useGlobal()

  const appointmentShape = computed(() => {
    const instances = blockInstances.value
    
    if (instances.length === 0) {
      return null
    }
    
    try {
      const globalData = getGlobalData()
      
      // PATTERN: Use getGlobalEntities helper (already destructured from useGlobal() on line 94)
      const eventInstances = getGlobalEntities('eventInstance') as EventInstance[]
      let eventShapes = getGlobalEntities('eventShape') as EventShape[]
      const eventAssignmentsRelationships = (globalData?.relationships?.eventAssignments || []) as GlobalRelationship[]
      const attendeeAssignmentsRelationships = (globalData?.relationships?.attendeeAssignments || []) as GlobalRelationship[]
      
      // PATTERN: Map over event shapes, attach attendees array from attendeeAssignments relationships
      // LEARNING: GlobalRelationship format uses parent/children objects, not parent_id/child_id
      // WHY: Relationships are transformed to nested format with parent and children arrays
      // PATTERN: Use rel.parent.id and rel.children.map(child => child.id) for GlobalRelationship format
      if (attendeeAssignmentsRelationships.length > 0) {
        // PATTERN: Find major/minor event shapes once, then use for all event shapes
        const majorEventShape = settings.value?.differentialPerspectives?.majorAttendees && globalData
          ? getMajorEventShape(eventShapes as EventShapeEntity[], settings.value.differentialPerspectives.majorAttendees)
          : null
        const eventShapesExcludingMajor = majorEventShape
          ? (eventShapes as EventShapeEntity[]).filter(es => es.id !== majorEventShape.id)
          : (eventShapes as EventShapeEntity[])
        const minorEventShape = settings.value?.differentialPerspectives?.minorAttendees && globalData
          ? getMinorEventShape(eventShapesExcludingMajor, settings.value.differentialPerspectives.minorAttendees)
          : null
        
        eventShapes = eventShapes.map(eventShape => {
          const matchingRel = attendeeAssignmentsRelationships.find(rel => rel.parent?.id === eventShape.id)
          const attendees = matchingRel?.children?.map((child: GlobalEntity<GlobalEntityKey>) => child.id) || []
          // WHY: Eliminates hardcoded perspective strings, enables config-driven approach
          // PATTERN: Use EVENT_PERSPECTIVE_KEYS constants for perspective determination
          const eventPerspective = majorEventShape?.id === eventShape.id ? EVENT_PERSPECTIVE_KEYS.MAJOR : (minorEventShape?.id === eventShape.id ? EVENT_PERSPECTIVE_KEYS.MINOR : EVENT_PERSPECTIVE_KEYS.OTHER)
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
        globalData || undefined
      )
      
      return shape
    } catch (error) {
      logger.error('Error building appointment shape:', error)
      return null
    }
  })

  // LEARNING: Use time slot duration as fallback if shape duration is 0
  const appointmentSlots = computed(() => {
    const shape = appointmentShape.value
    if (!shape) {
      return []
    }
    
    const times = availableStartTimes.value
    if (times.length === 0) {
      return []
    }
    
    const durations = timeSlotDurations?.value
    
    // PATTERN: Get globalData in this computed scope
    const globalData = getGlobalData()
    
    try {
      const availabilityMap = slotAvailability?.value
      const violationsMap = slotViolations?.value
      
      const slots = times.map((time, index) => {
        const fallbackDuration = durations?.get(time)
        
        // WHY: Marks slots as available/busy based on calendar busy periods
        // PATTERN: Check availability map, default to true if not found (backward compatibility)
        const isAvailable = availabilityMap?.get(time) ?? true
        
        // WHY: Get constraint violations for this slot for debugging overlay
        // PATTERN: Read pre-computed violations, don't recalculate
        const flexibleViolations = violationsMap?.get(time)
        
        try {
          // PATTERN: Pass map index directly to builder, which uses it as buttonIndex
          const slot = applyShapeToTime(shape, time, index, fallbackDuration, isAvailable, globalData || undefined, settings.value || null)
          // PATTERN: Add flexibleViolations to slot for debugging overlay
          return { ...slot, flexibleViolations }
        } catch (error) {
          throw error
        }
      })
      
      return slots
    } catch (error) {
      logger.error('Error applying shape to times:', error)
      return []
    }
  })

  const selectedSlot = computed(() => {
    const index = selectedButtonIndex.value
    if (index === null) return null
    
    return appointmentSlots.value.find(s => s.buttonIndex === index) ?? null
  })

  const getDisplayTime = (buttonIndex: number): TimeRange | null => {
    const slot = appointmentSlots.value.find(s => s.buttonIndex === buttonIndex)
    if (!slot) return null
    
    const globalData = getGlobalData()
    return derivePerspective(slot, perspective.value, globalData || undefined, settings.value || null)
  }

  // PATTERN: Find event shapes by attendees from availabilitySettings, then use their names to look up time ranges
  const graphBars = computed(() => {
    const slot = selectedSlot.value
    if (!slot) {
      return { major: null, minor: null }
    }
    
    const globalData = getGlobalData()
    const availabilitySettingsValue = settings.value
    
    // PATTERN: Return null if required data is not available
    if (!globalData || !availabilitySettingsValue?.differentialPerspectives) {
      return { major: null, minor: null }
    }
    
    const majorAttendeeIds = availabilitySettingsValue.differentialPerspectives.majorAttendees || []
    const minorAttendeeIds = availabilitySettingsValue.differentialPerspectives.minorAttendees || []
    
    const shape = appointmentShape.value
    if (!shape || !shape.slotShape.eventFinals) {
      return { major: null, minor: null }
    }
    
    const eventShapeEntities = shape.slotShape.eventFinals.map(ef => ef.eventShape) as EventShapeEntity[]
    
    const majorEventShape = majorAttendeeIds.length > 0 
      ? getMajorEventShape(eventShapeEntities, majorAttendeeIds)
      : null
    const eventShapesExcludingMajor = majorEventShape
      ? eventShapeEntities.filter(es => es.id !== majorEventShape.id)
      : eventShapeEntities
    const minorEventShape = minorAttendeeIds.length > 0 && isDifferentialService.value
      ? getMinorEventShape(eventShapesExcludingMajor, minorAttendeeIds)
      : null
    
    // PATTERN: Return null if event shapes are not found
    if (!majorEventShape) {
      return { major: null, minor: null }
    }
    
    const majorEventName = majorEventShape.name
    const minorEventName = minorEventShape?.name ?? null
    
    const result = {
      major: slot.eventTimeRanges?.[majorEventName] ?? null,
      minor: isDifferentialService.value && minorEventName
        ? (slot.eventTimeRanges?.[minorEventName] ?? null)
        : null
    }
    
    return result
  })

  return {
    appointmentShape,
    appointmentSlots,
    selectedSlot,
    getDisplayTime,
    graphBars
  }
}

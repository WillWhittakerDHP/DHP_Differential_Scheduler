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
import type { EventShapeEntity } from '@/types/entities'
import type { EventShape, EventInstance } from '@/types/events'
import type { GlobalRelationship } from '@/types/entities'

// LEARNING: Use scoped logger for controllable debug output
// WHY: Prevents debug logs in production, allows scope-based filtering
// PATTERN: createLogger(scope) provides debug/info/warn/error methods
const logger = createLogger('useAppointmentSlots')

/**
 * useAppointmentSlots composable parameters
 */
export interface UseAppointmentSlotsParams {
  blockInstances: ComputedRef<BookingBlockInstance[]>
  availableStartTimes: ComputedRef<string[]>
  slotAvailability?: ComputedRef<Map<string, boolean>> // Optional: map of startTime -> isAvailable
  timeSlotDurations?: ComputedRef<Map<string, number>> // Optional: durations from time slots for fallback
  selectedButtonIndex: Ref<number | null>
  perspective: ComputedRef<PerspectiveKey>
  isDifferentialService: ComputedRef<boolean>
}

/**
 * useAppointmentSlots composable return type
 */
export interface UseAppointmentSlotsReturn {
  // Shape (memoized, calculated once when blockInstances change)
  appointmentShape: ComputedRef<AppointmentShape | null>
  
  // Slots (shape applied to each available time)
  appointmentSlots: ComputedRef<AppointmentSlots>
  
  // Selected slot (or null)
  selectedSlot: ComputedRef<AppointmentSlot | null>
  
  // Helper to get display time for a slot (perspective-derived)
  getDisplayTime: (buttonIndex: number) => TimeRange | null
  
  // Graph bar data (convenience wrapper around selectedSlot totals)
  // When selectedSlot is null, returns { major: null, minor: null }
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
    timeSlotDurations,
    selectedButtonIndex,
    perspective,
    isDifferentialService
  } = params

  // LEARNING: Get availability settings for rounding configuration
  // WHY: Need settings to pass to buildAppointmentShape for configurable rounding
  // PATTERN: Use composable to get reactive settings
  const { settings } = useAvailabilitySettings()
  
  // LEARNING: Get globalData to access events and relationships
  // WHY: Events are stored in globalData, need to pass to buildAppointmentShape
  // PATTERN: Use useGlobal composable to access globalData
  const { getGlobalData, getGlobalEntities } = useGlobal()

  // Build shape when blockInstances change (memoized)
  const appointmentShape = computed(() => {
    const instances = blockInstances.value
    
    if (instances.length === 0) {
      return null
    }
    
    try {
      // Get events data from globalData
      const globalData = getGlobalData()
      
      // LEARNING: Access events from entities, not events (events don't exist in GlobalData structure)
      // WHY: Events are stored in globalData.entities.eventInstance and globalData.entities.eventShape
      // PATTERN: Use getGlobalEntities helper (already destructured from useGlobal() on line 94)
      const eventInstances = getGlobalEntities('eventInstance') as EventInstance[]
      let eventShapes = getGlobalEntities('eventShape') as EventShape[]
      const eventAssignmentsRelationships = (globalData?.relationships?.eventAssignments || []) as GlobalRelationship[]
      const validPartsRelationships = (globalData?.relationships?.validParts || []) as GlobalRelationship[]
      const attendeeAssignmentsRelationships = (globalData?.relationships?.attendeeAssignments || []) as GlobalRelationship[]
      
      // LEARNING: Attach attendeeAssignments relationships to event shapes
      // WHY: Event shapes need attendees property populated for attendee-based differential logic
      // PATTERN: Map over event shapes, attach attendees array from attendeeAssignments relationships
      if (attendeeAssignmentsRelationships.length > 0) {
        eventShapes = eventShapes.map(eventShape => {
          const attendees = attendeeAssignmentsRelationships
            .filter(rel => rel.parent_id === eventShape.id)
            .map(rel => rel.child_id)
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useAppointmentSlots.ts:123',message:'Attaching attendees to event shape',data:{eventShapeId:eventShape.id,eventShapeName:eventShape.name,attendeesCount:attendees.length,attendees},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'F'})}).catch(()=>{});
          // #endregion
          return { ...eventShape, attendees }
        })
      } else {
        // Initialize empty attendees array if no relationships exist
        eventShapes = eventShapes.map(eventShape => ({ ...eventShape, attendees: [] }))
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useAppointmentSlots.ts:131',message:'No attendeeAssignments relationships found',data:{attendeeAssignmentsRelationshipsCount:attendeeAssignmentsRelationships.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'F'})}).catch(()=>{});
        // #endregion
      }
      
      // Build partShapeById map
      const partShapes = getGlobalEntities('partShape')
      const partShapeById = new Map(
        partShapes.map(ps => [ps.id, ps as GlobalEntity<'partShape'>])
      )
      
      // LEARNING: Pass events data to buildAppointmentShape for event lookup
      // WHY: Events are appointment-level features, stored on AppointmentShape
      // PATTERN: Extract events data from globalData and pass to builder
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useAppointmentSlots.ts:133',message:'buildAppointmentShape: before call',data:{hasSettings:!!settings.value,settings:settings.value?{hasDifferentialPerspectives:!!settings.value.differentialPerspectives,differentialPerspectives:settings.value.differentialPerspectives?{majorAttendees:settings.value.differentialPerspectives.majorAttendees||[],minorAttendees:settings.value.differentialPerspectives.minorAttendees||[]}:null}:null,hasGlobalData:!!globalData,instancesCount:instances.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      const shape = buildAppointmentShape(
        instances, 
        settings.value,
        eventInstances,
        eventShapes,
        eventAssignmentsRelationships,
        partShapeById,
        validPartsRelationships,
        globalData || undefined
      )
      
      return shape
    } catch (error) {
      logger.error('Error building appointment shape:', error)
      return null
    }
  })

  // Apply shape to each available time
  // LEARNING: Use time slot duration as fallback if shape duration is 0
  // WHY: If services have 0 baseTime, use time slot duration to ensure valid time ranges
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
    
    try {
      const availabilityMap = slotAvailability?.value
      
      // LEARNING: Log availability map and times for comparison
      // WHY: Helps verify that Map keys match the time values being looked up
      // PATTERN: Log sample values from both sources to compare formats
      if (times.length > 0 && availabilityMap) {
        const sampleTimes = times.slice(0, 5)
        const sampleMapKeys = Array.from(availabilityMap.keys()).slice(0, 5)
        logger.debug('Comparing times vs Map keys:', {
          timesCount: times.length,
          mapSize: availabilityMap.size,
          sampleTimes,
          sampleMapKeys,
          firstTimeMatches: times[0] === sampleMapKeys[0],
          firstTimeInMap: availabilityMap.has(times[0]),
          sampleMatches: sampleTimes.map(time => ({
            time,
            inMap: availabilityMap.has(time),
            matchingKey: sampleMapKeys.find(key => key === time)
          }))
        })
      }
      
      const slots = times.map((time, index) => {
        // Get fallback duration from time slot if shape duration is 0
        const fallbackDuration = durations?.get(time)
        
        // LEARNING: Set availability status from availability map
        // WHY: Marks slots as available/busy based on calendar busy periods
        // PATTERN: Check availability map, default to true if not found (backward compatibility)
        const isAvailable = availabilityMap?.get(time) ?? true
        
        // LEARNING: Log first few slots to verify lookup
        // WHY: Helps debug why busy slots aren't being marked correctly
        // PATTERN: Log sample lookups to verify Map keys match time values
        // NOTE: Debug logging disabled by default - enable via VITE_DEBUG_SCOPES=useAppointmentSlots if needed
        if (index < 10) {
          // Unused in commented-out debug logging - kept for potential future debugging
          // const busyEntries = availabilityMap ? Array.from(availabilityMap.entries()).filter(([_, isAvail]) => !isAvail) : []
          // const busyTimes = busyEntries.map(([time, _]) => time)
          // Debug logging disabled by default - enable via VITE_DEBUG_SCOPES=useAppointmentSlots if needed
          // logger.debug('Slot lookup:', {
          //   index,
          //   time,
          //   mapHasKey: availabilityMap?.has(time),
          //   isAvailable,
          //   mapSize: availabilityMap?.size,
          //   busyTimesCount: busyTimes.length,
          //   isTimeInBusyList: busyTimes.includes(time),
          //   sampleBusyTimes: busyTimes.slice(0, 5),
          //   sampleKeys: availabilityMap ? Array.from(availabilityMap.keys()).slice(0, 5) : []
          // })
        }
        
        // LEARNING: Derive buttonIndex from array position (index parameter from map)
        // WHY: Ensures buttonIndex always matches UI grid position - single source of truth
        // PATTERN: Pass map index directly to builder, which uses it as buttonIndex
        // NOTE: index is the array position, which becomes slot.buttonIndex in applyShapeToTime
        const slot = applyShapeToTime(shape, time, index, fallbackDuration, isAvailable, globalData || undefined, settings.value || null)
        
        return slot
      })
      
      return slots
    } catch (error) {
      logger.error('Error applying shape to times:', error)
      return []
    }
  })

  // Derive selected slot
  const selectedSlot = computed(() => {
    const index = selectedButtonIndex.value
    if (index === null) return null
    
    return appointmentSlots.value.find(s => s.buttonIndex === index) ?? null
  })

  // Helper to get display time for a slot (perspective-derived)
  // LEARNING: Return a function that reads perspective.value each time it's called
  // WHY: Ensures the function always uses current perspective value
  // NOTE: The function itself is stable, but reads reactive perspective.value on each call
  const getDisplayTime = (buttonIndex: number): TimeRange | null => {
    const slot = appointmentSlots.value.find(s => s.buttonIndex === buttonIndex)
    if (!slot) return null
    
    // LEARNING: Read perspective.value each time function is called
    // WHY: Ensures we always use the current perspective value
    // LEARNING: Pass globalData and availabilitySettings for attendee-based logic
    // WHY: Enables dynamic event identification based on attendees
    const globalData = getGlobalData()
    return derivePerspective(slot, perspective.value, globalData.value || undefined, settings.value || null)
  }

  // Graph bar data
  // LEARNING: Use attendee-based logic to find major and minor event shapes dynamically
  // WHY: Enables configurable event identification based on attendees instead of hardcoded names
  // PATTERN: Find event shapes by attendees from availabilitySettings, then use their names to look up time ranges
  const graphBars = computed(() => {
    const slot = selectedSlot.value
    if (!slot) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useAppointmentSlots.ts:265',message:'graphBars: no selected slot',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      return { major: null, minor: null }
    }
    
    const globalData = getGlobalData()
    const availabilitySettingsValue = settings.value
    
    // LEARNING: Require globalData and availabilitySettings for attendee-based logic
    // WHY: No fallbacks to hardcoded names - fail gracefully if configuration is missing
    // PATTERN: Return null if required data is not available
    if (!globalData || !availabilitySettingsValue?.differentialPerspectives) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useAppointmentSlots.ts:303',message:'graphBars: missing required data (no fallback)',data:{hasGlobalData:!!globalData,hasSettings:!!availabilitySettingsValue,isDifferentialService:isDifferentialService.value},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      return { major: null, minor: null }
    }
    
    // Get major and minor attendee IDs from availabilitySettings
    const majorAttendeeIds = availabilitySettingsValue.differentialPerspectives.majorAttendees || []
    const minorAttendeeIds = availabilitySettingsValue.differentialPerspectives.minorAttendees || []
    
    // Get event shapes from appointment shape
    const shape = appointmentShape.value
    if (!shape || !shape.slotShape.eventFinals) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useAppointmentSlots.ts:316',message:'graphBars: missing shape/eventFinals (no fallback)',data:{hasShape:!!shape,hasEventFinals:!!shape?.slotShape.eventFinals,eventFinalsCount:shape?.slotShape.eventFinals?.length||0,isDifferentialService:isDifferentialService.value},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      return { major: null, minor: null }
    }
    
    // Convert eventFinals to EventShapeEntity[] for attendee helper functions
    const eventShapeEntities = shape.slotShape.eventFinals.map(ef => ef.eventShape) as EventShapeEntity[]
    
    // Find major and minor event shapes by attendees
    const majorEventShape = majorAttendeeIds.length > 0 
      ? getMajorEventShape(eventShapeEntities, majorAttendeeIds)
      : null
    const minorEventShape = minorAttendeeIds.length > 0 && isDifferentialService.value
      ? getMinorEventShape(eventShapeEntities, minorAttendeeIds)
      : null
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useAppointmentSlots.ts:335',message:'graphBars: event shape lookup results',data:{isDifferentialService:isDifferentialService.value,majorAttendeeIds,minorAttendeeIds,eventShapeEntitiesCount:eventShapeEntities.length,eventShapeEntities:eventShapeEntities.map(es=>({id:es.id,name:es.name,attendees:es.attendees})),majorEventShape:majorEventShape?{id:majorEventShape.id,name:majorEventShape.name,attendees:majorEventShape.attendees}:null,minorEventShape:minorEventShape?{id:minorEventShape.id,name:minorEventShape.name,attendees:minorEventShape.attendees}:null,differentialOffset:shape.slotShape.differentialOffset},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    
    // LEARNING: Require major event shape to be found - no fallbacks to hardcoded names
    // WHY: If attendee-based logic can't find event shapes, fail gracefully
    // PATTERN: Return null if event shapes are not found
    if (!majorEventShape) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useAppointmentSlots.ts:345',message:'graphBars: major event shape not found (no fallback)',data:{majorAttendeeIds,eventShapeEntities:eventShapeEntities.map(es=>({id:es.id,name:es.name,attendees:es.attendees}))},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      return { major: null, minor: null }
    }
    
    // Use event shape names to look up time ranges (no fallbacks)
    const majorEventName = majorEventShape.name
    const minorEventName = minorEventShape?.name ?? null
    
    const result = {
      major: slot.eventTimeRanges?.[majorEventName] ?? null,
      minor: isDifferentialService.value && minorEventName
        ? (slot.eventTimeRanges?.[minorEventName] ?? null)
        : null
    }
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useAppointmentSlots.ts:360',message:'graphBars: final result',data:{majorEventName,minorEventName,hasMajorTimeRange:!!result.major,hasMinorTimeRange:!!result.minor,majorTimeRange:result.major?{startTime:result.major.startTime,endTime:result.major.endTime,duration:result.major.duration}:null,minorTimeRange:result.minor?{startTime:result.minor.startTime,endTime:result.minor.endTime,duration:result.minor.duration}:null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    
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

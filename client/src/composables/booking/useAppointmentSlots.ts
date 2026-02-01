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
      const validPartsRelationships = (globalData?.relationships?.validParts || []) as GlobalRelationship[]
      const attendeeAssignmentsRelationships = (globalData?.relationships?.attendeeAssignments || []) as GlobalRelationship[]
      
      fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useAppointmentSlots.ts:121',message:'Checking attendeeAssignments relationships',data:{attendeeAssignmentsRelationshipsCount:attendeeAssignmentsRelationships.length,hasGlobalData:!!globalData,hasRelationships:!!globalData?.relationships,relationshipKeys:globalData?.relationships?Object.keys(globalData.relationships):[],attendeeAssignmentsRelationships:attendeeAssignmentsRelationships.slice(0,5)},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'F'})}).catch(()=>{});
      
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
          fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useAppointmentSlots.ts:133',message:'Attaching attendees to event shape',data:{eventShapeId:eventShape.id,eventPerspective,attendeesCount:attendees.length,attendees,hasMatchingRel:!!matchingRel,matchingRelParentId:matchingRel?.parent?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'F'})}).catch(()=>{});
          return { ...eventShape, attendees }
        })
      } else {
        eventShapes = eventShapes.map(eventShape => ({ ...eventShape, attendees: [] }))
        fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useAppointmentSlots.ts:142',message:'No attendeeAssignments relationships found',data:{attendeeAssignmentsRelationshipsCount:attendeeAssignmentsRelationships.length,hasGlobalData:!!globalData,hasRelationships:!!globalData?.relationships},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'F'})}).catch(()=>{});
      }
      
      const partShapes = getGlobalEntities('partShape')
      const partShapeById = new Map(
        partShapes.map(ps => [ps.id, ps as GlobalEntity<'partShape'>])
      )
      
      // PATTERN: Extract events data from globalData and pass to builder
      fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useAppointmentSlots.ts:133',message:'buildAppointmentShape: before call',data:{hasSettings:!!settings.value,settings:settings.value?{hasDifferentialPerspectives:!!settings.value.differentialPerspectives,differentialPerspectives:settings.value.differentialPerspectives?{majorAttendees:settings.value.differentialPerspectives.majorAttendees||[],minorAttendees:settings.value.differentialPerspectives.minorAttendees||[]}:null}:null,hasGlobalData:!!globalData,instancesCount:instances.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'E'})}).catch(()=>{});
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

  // LEARNING: Use time slot duration as fallback if shape duration is 0
  const appointmentSlots = computed(() => {
    const shape = appointmentShape.value
    if (!shape) {
      return []
    }
    
    const times = availableStartTimes.value
    if (times.length === 0) {
      fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useAppointmentSlots.ts:195',message:'appointmentSlots: no times available',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'G'})}).catch(()=>{});
      return []
    }
    
    fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useAppointmentSlots.ts:192',message:'appointmentSlots: checking times',data:{timesCount:times.length,hasShape:!!shape,timesSample:times.slice(0,3)},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'G'})}).catch(()=>{});
    
    const durations = timeSlotDurations?.value
    
    // PATTERN: Get globalData in this computed scope
    const globalData = getGlobalData()
    
    try {
      const availabilityMap = slotAvailability?.value
      
      const slots = times.map((time, index) => {
        const fallbackDuration = durations?.get(time)
        
        // WHY: Marks slots as available/busy based on calendar busy periods
        // PATTERN: Check availability map, default to true if not found (backward compatibility)
        const isAvailable = availabilityMap?.get(time) ?? true
        
        try {
          // PATTERN: Pass map index directly to builder, which uses it as buttonIndex
          const slot = applyShapeToTime(shape, time, index, fallbackDuration, isAvailable, globalData || undefined, settings.value || null)
          return slot
        } catch (error) {
          fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useAppointmentSlots.ts:267',message:'appointmentSlots: error creating slot',data:{index,time,error:error instanceof Error?error.message:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'G'})}).catch(()=>{});
          throw error
        }
      })
      
      return slots
    } catch (error) {
      fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useAppointmentSlots.ts:279',message:'appointmentSlots: error in computed',data:{error:error instanceof Error?error.message:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'G'})}).catch(()=>{});
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
      fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useAppointmentSlots.ts:265',message:'graphBars: no selected slot',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      return { major: null, minor: null }
    }
    
    const globalData = getGlobalData()
    const availabilitySettingsValue = settings.value
    
    // PATTERN: Return null if required data is not available
    if (!globalData || !availabilitySettingsValue?.differentialPerspectives) {
      fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useAppointmentSlots.ts:303',message:'graphBars: missing required data (no fallback)',data:{hasGlobalData:!!globalData,hasSettings:!!availabilitySettingsValue,isDifferentialService:isDifferentialService.value},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      return { major: null, minor: null }
    }
    
    const majorAttendeeIds = availabilitySettingsValue.differentialPerspectives.majorAttendees || []
    const minorAttendeeIds = availabilitySettingsValue.differentialPerspectives.minorAttendees || []
    
    const shape = appointmentShape.value
    if (!shape || !shape.slotShape.eventFinals) {
      fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useAppointmentSlots.ts:316',message:'graphBars: missing shape/eventFinals (no fallback)',data:{hasShape:!!shape,hasEventFinals:!!shape?.slotShape.eventFinals,eventFinalsCount:shape?.slotShape.eventFinals?.length||0,isDifferentialService:isDifferentialService.value},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
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
    
    fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useAppointmentSlots.ts:335',message:'graphBars: event shape lookup results',data:{isDifferentialService:isDifferentialService.value,majorAttendeeIds,minorAttendeeIds,eventShapeEntitiesCount:eventShapeEntities.length,eventShapeEntities:eventShapeEntities.map(es=>({id:es.id,name:es.name,attendees:es.attendees})),majorEventShape:majorEventShape?{id:majorEventShape.id,name:majorEventShape.name,attendees:majorEventShape.attendees}:null,minorEventShape:minorEventShape?{id:minorEventShape.id,name:minorEventShape.name,attendees:minorEventShape.attendees}:null,rawDifferentialOffset:shape.slotShape.rawDifferentialOffset,roundedDifferentialOffset:shape.slotShape.roundedDifferentialOffset},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    
    // PATTERN: Return null if event shapes are not found
    if (!majorEventShape) {
      fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useAppointmentSlots.ts:345',message:'graphBars: major event shape not found (no fallback)',data:{majorAttendeeIds,eventShapeEntities:eventShapeEntities.map(es=>({id:es.id,name:es.name,attendees:es.attendees}))},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
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
    
    fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useAppointmentSlots.ts:360',message:'graphBars: final result',data:{majorEventName,minorEventName,hasMajorTimeRange:!!result.major,hasMinorTimeRange:!!result.minor,majorTimeRange:result.major?{startTime:result.major.startTime,endTime:result.major.endTime,duration:result.major.duration}:null,minorTimeRange:result.minor?{startTime:result.minor.startTime,endTime:result.minor.endTime,duration:result.minor.duration}:null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    
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

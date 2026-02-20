import type { AppointmentSlot } from '@/types/appointment'
import type { MoveableSchedulingOptions } from '@/types/moveableScheduling'
import type { RFC3339DateTime } from '@shared/types/primitiveBrands'
import type { AvailabilitySettings } from '@/configs/availabilitySettings'
import type { EventShapeEntity } from '@/types/entities'
import { getMajorEventShape, getMinorEventShape } from '@/utils/eventAttendeeUtils'

export interface SelectedTimeSlot {
  startTime: RFC3339DateTime  // Explicit RFC3339 start
  endTime: RFC3339DateTime    // Explicit RFC3339 end
  duration?: number            // Optional (can calculate: (endTime - startTime) / 60000)
}

export interface AvailabilityStepData {
  candidateDate: { start: string | null; end: string | null }  // Candidate date selection (not yet saved)
  candidateTimeSlots: SelectedTimeSlot[] | null  // Candidate time slot selections (not yet saved)
  moveableScheduling?: MoveableSchedulingOptions | null
}

type BuildSelectedTimeSlotsParams = {
  selectedDateStart: string | null
  selectedSlot: AppointmentSlot | null
  availabilitySettings?: AvailabilitySettings | null
}

/**
 * Build selected time slots from appointment slot using dynamic event name lookup
 * 
 * LEARNING: Uses availabilitySettings.differentialPerspectives to find event shapes by attendee
 * WHY: Event shapes have dynamic names (e.g., 'OnSite', 'ClientPresent'), not hardcoded 'Major'/'Minor'
 * PATTERN: Same attendee-based lookup used in appointmentSlotBuilder and other booking utilities
 * 
 * SESSION: 2.1.3b - Fixed hardcoded event names causing calendar time mismatch
 */
export function buildSelectedTimeSlots(params: BuildSelectedTimeSlotsParams): SelectedTimeSlot[] | null {
  if (!params.selectedSlot || !params.selectedDateStart) {
    return null
  }

  const slots: SelectedTimeSlot[] = []
  const eventTimeRanges = params.selectedSlot.eventTimeRanges

  // LEARNING: Get event shapes from the slot's shape (already computed by appointmentSlotBuilder)
  // WHY: EventFinals contain the event shapes with their names and attendees
  const eventFinals = params.selectedSlot.shape?.slotShape?.eventFinals || []
  const eventShapeEntities = eventFinals.map(ef => ef.eventShape) as EventShapeEntity[]

  // LEARNING: Use attendee-based lookup to find major/minor event shapes
  // WHY: Event names are configurable (e.g., 'OnSite', 'ClientPresent'), not hardcoded
  const majorAttendeeIds = params.availabilitySettings?.differentialPerspectives?.majorAttendees || []
  const minorAttendeeIds = params.availabilitySettings?.differentialPerspectives?.minorAttendees || []

  // Find major event shape and its time range
  const majorEventShape = getMajorEventShape(eventShapeEntities, majorAttendeeIds)
  const majorEventName = majorEventShape?.name
  const majorTimeRange = majorEventName ? eventTimeRanges?.[majorEventName] : null

  if (majorTimeRange) {
    slots.push({
      startTime: majorTimeRange.startTime,
      endTime: majorTimeRange.endTime,
      duration: majorTimeRange.duration,
    })
  }

  // Find minor event shape and its time range (only if different from major)
  const eventShapesExcludingMajor = majorEventShape
    ? eventShapeEntities.filter(es => es.id !== majorEventShape.id)
    : eventShapeEntities
  const minorEventShape = getMinorEventShape(eventShapesExcludingMajor, minorAttendeeIds)
  const minorEventName = minorEventShape?.name
  const minorTimeRange = minorEventName ? eventTimeRanges?.[minorEventName] : null

  if (minorTimeRange && minorTimeRange.startTime !== majorTimeRange?.startTime) {
    slots.push({
      startTime: minorTimeRange.startTime,
      endTime: minorTimeRange.endTime,
      duration: minorTimeRange.duration,
    })
  }

  // FALLBACK: If no attendee-based match, use totalTimeRange (for non-differential or missing config)
  if (slots.length === 0 && params.selectedSlot.totalTimeRange) {
    slots.push({
      startTime: params.selectedSlot.totalTimeRange.startTime,
      endTime: params.selectedSlot.totalTimeRange.endTime,
      duration: params.selectedSlot.totalTimeRange.duration,
    })
  }

  return slots.length > 0 ? slots : null
}

export function buildAvailabilityStepData(params: {
  candidateDate: { start: string | null; end: string | null }
  candidateTimeSlots: SelectedTimeSlot[] | null
  moveableScheduling?: MoveableSchedulingOptions | null
}): AvailabilityStepData {
  return {
    candidateDate: {
      start: params.candidateDate.start,
      end: params.candidateDate.end,
    },
    candidateTimeSlots: params.candidateTimeSlots,
    moveableScheduling: params.moveableScheduling ?? null,
  }
}



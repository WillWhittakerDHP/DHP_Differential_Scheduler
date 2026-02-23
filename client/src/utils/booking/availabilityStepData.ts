import type { AppointmentSlot } from '@/types/appointment'
import type { MoveableSchedulingOptions } from '@/types/moveableScheduling'
import type { SlotTimeBounds } from '@shared/types/availabilityTypes'
import type { EventShapeEntity } from '@/types/entities'
import { getEventShapeByRole } from '@/utils/eventAttendeeUtils'
import { asEmptyArray } from '@/utils/safeDefaults'
import { createLogger } from '@/utils/logger'

const logger = createLogger('availabilityStepData')

/** TYPE_SIMILARITY: Extend shared SlotTimeBounds; duration optional for selection step. */
export type SelectedTimeSlot = Omit<SlotTimeBounds, 'duration'> & { duration?: number }

export interface AvailabilityStepData {
  candidateDate: { start: string | null; end: string | null }
  candidateTimeSlots: SelectedTimeSlot[] | null
  moveableScheduling?: MoveableSchedulingOptions | null
}

type BuildSelectedTimeSlotsParams = {
  selectedDateStart: string | null
  selectedSlot: AppointmentSlot | null
}

/**
 * Build selected time slots from appointment slot using differentialRole lookup.
 */
export function buildSelectedTimeSlots(params: BuildSelectedTimeSlotsParams): SelectedTimeSlot[] | null {
  if (!params.selectedSlot || !params.selectedDateStart) {
    return null
  }

  const slots: SelectedTimeSlot[] = []
  const eventTimeRanges = params.selectedSlot.eventTimeRanges

  const eventFinals = asEmptyArray(params.selectedSlot.shape?.slotShape?.eventFinals)
  const eventShapeEntities = eventFinals.map(ef => ef.eventShape) as EventShapeEntity[]

  const majorEventShape = getEventShapeByRole(eventShapeEntities, 'major')
  if (!majorEventShape) {
    logger.error('buildSelectedTimeSlots: no event shape with differentialRole=major', {
      availableRoles: eventShapeEntities.map(es => ({ name: es.name, differentialRole: es.differentialRole }))
    })
  }
  const majorEventName = majorEventShape?.name
  const majorTimeRange = majorEventName ? eventTimeRanges?.[majorEventName] : null

  if (majorTimeRange) {
    slots.push({
      startTime: majorTimeRange.startTime,
      endTime: majorTimeRange.endTime,
      duration: majorTimeRange.duration,
    })
  }

  const minorEventShape = getEventShapeByRole(eventShapeEntities, 'minor')
  const minorEventName = minorEventShape?.name
  const minorTimeRange = minorEventName ? eventTimeRanges?.[minorEventName] : null

  if (minorTimeRange && minorTimeRange.startTime !== majorTimeRange?.startTime) {
    slots.push({
      startTime: minorTimeRange.startTime,
      endTime: minorTimeRange.endTime,
      duration: minorTimeRange.duration,
    })
  }

  if (slots.length === 0 && params.selectedSlot.totalTimeRange) {
    logger.error('buildSelectedTimeSlots: no role-based time ranges found, using totalTimeRange')
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

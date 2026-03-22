import type { AppointmentSlot } from '@/types/appointment'
import type { MoveableSchedulingOptions } from '@/types/moveableScheduling'
import type { AvailabilityStepData, SelectedTimeSlot } from '@/types/booking/availabilityStepData'
import type { EventShapeEntity } from '@/types/entities'
import { getEventShapeByRoleWithOverrides } from '@/utils/eventAttendeeUtils'
import { asEmptyArray } from '@/utils/safeDefaults'
import { createLogger } from '@/utils/logger'

export type { AvailabilityStepData, SelectedTimeSlot } from '@/types/booking/availabilityStepData'

const logger = createLogger('availabilityStepData')

/**
 * Sum drive legs from a selected appointment slot (server → client). Null when no slot.
 */
export function totalDriveMinutesFromAppointmentSlot(
  slot: { driveToCandidate?: number; driveFromCandidate?: number } | null
): number | null {
  if (!slot) {
    return null
  }
  const to = slot.driveToCandidate ?? 0
  const from = slot.driveFromCandidate ?? 0
  const sum = to + from
  if (!Number.isFinite(sum)) {
    return null
  }
  return Math.max(0, sum)
}

type BuildSelectedTimeSlotsParams = {
  selectedDateStart: string | null
  selectedSlot: AppointmentSlot | null
}

export function buildSelectedTimeSlots(params: BuildSelectedTimeSlotsParams): SelectedTimeSlot[] | null {
  if (!params.selectedSlot || !params.selectedDateStart) {
    return null
  }

  const slots: SelectedTimeSlot[] = []
  const eventTimeRanges = params.selectedSlot.eventTimeRanges

  const eventFinals = asEmptyArray(params.selectedSlot.shape?.slotShape?.eventFinals)
  const eventShapeEntities = eventFinals.map(ef => ef.eventShape) as EventShapeEntity[]

  const overrides = params.selectedSlot.shape.differentialEventRoleOverrides ?? null
  const majorEventShape = getEventShapeByRoleWithOverrides(eventShapeEntities, 'major', overrides)
  if (!majorEventShape) {
    logger.error('buildSelectedTimeSlots: no event shape with effective differentialRole=major', {
      availableRoles: eventShapeEntities.map((es) => ({ name: es.name, differentialRole: es.differentialRole })),
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

  const minorEventShape = getEventShapeByRoleWithOverrides(eventShapeEntities, 'minor', overrides)
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
  totalDriveMinutes: number | null
}): AvailabilityStepData {
  return {
    candidateDate: {
      start: params.candidateDate.start,
      end: params.candidateDate.end,
    },
    candidateTimeSlots: params.candidateTimeSlots,
    moveableScheduling: params.moveableScheduling ?? null,
    totalDriveMinutes: params.totalDriveMinutes,
  }
}

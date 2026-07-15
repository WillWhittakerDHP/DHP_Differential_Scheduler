import type { SlotTimeBounds } from '@shared/types/availabilityTypes'
import type { AppointmentSlot } from '@/types/appointment'
import type { MinimizerSchedulingOptions } from '@/types/minimizerScheduling'
import type { AvailabilityStepData } from '@/types/booking/availabilityStepData'
import type { AppointmentSelectedTimeSlotPayload } from '@shared/types/appointmentTypes'
import { asEmptyArray } from '@/utils/safeDefaults'
import { createLogger } from '@/utils/logger'

export type { AvailabilityStepData } from '@/types/booking/availabilityStepData'

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

function timeSlotPayloadFromRange(
  range: SlotTimeBounds,
  metadata: Omit<AppointmentSelectedTimeSlotPayload, keyof SlotTimeBounds> = {}
): AppointmentSelectedTimeSlotPayload {
  return {
    startTime: range.startTime,
    endTime: range.endTime,
    duration: range.duration,
    ...metadata,
  }
}

export function buildSelectedTimeSlots(params: BuildSelectedTimeSlotsParams): AppointmentSelectedTimeSlotPayload[] | null {
  if (!params.selectedSlot || !params.selectedDateStart) {
    return null
  }

  const slots: AppointmentSelectedTimeSlotPayload[] = []
  const eventTimeRanges = params.selectedSlot.eventTimeRanges

  const eventFinals = asEmptyArray(params.selectedSlot.shape?.slotShape?.eventFinals)
  if (eventFinals.length === 0) {
    const total = params.selectedSlot.totalTimeRange
    if (total) {
      logger.debug('buildSelectedTimeSlots: no event finals, using totalTimeRange')
      return [timeSlotPayloadFromRange(total)]
    }
    return null
  }

  for (const eventFinal of eventFinals) {
    const eventShape = eventFinal.eventShape
    const eventShapeName = eventShape.name
    const range = eventTimeRanges?.[eventShapeName] ?? null
    if (!range) {
      continue
    }
    slots.push(timeSlotPayloadFromRange(range, {
      eventShapeId: String(eventShape.id),
      eventShapeName,
      placementKind: String(eventShape.placementKind ?? ''),
      anchorEdge: eventShape.anchorEdge ?? null,
    }))
  }

  if (slots.length === 0 && params.selectedSlot.totalTimeRange) {
    logger.debug('buildSelectedTimeSlots: no event time ranges found, using totalTimeRange')
    slots.push(timeSlotPayloadFromRange(params.selectedSlot.totalTimeRange))
  }

  return slots.length > 0 ? slots : null
}

export function buildAvailabilityStepData(params: {
  candidateDate: { start: string | null; end: string | null }
  candidateTimeSlots: AppointmentSelectedTimeSlotPayload[] | null
  minimizerScheduling?: MinimizerSchedulingOptions | null
  totalDriveMinutes: number | null
}): AvailabilityStepData {
  return {
    candidateDate: {
      start: params.candidateDate.start,
      end: params.candidateDate.end,
    },
    candidateTimeSlots: params.candidateTimeSlots,
    minimizerScheduling: params.minimizerScheduling ?? null,
    totalDriveMinutes: params.totalDriveMinutes,
  }
}

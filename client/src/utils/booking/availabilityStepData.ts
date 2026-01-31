import type { AppointmentSlot } from '@/types/appointment'
import type { MoveableSchedulingOptions } from '@/types/moveableScheduling'
import type { RFC3339DateTime } from '@/types/datetime'

export interface SelectedTimeSlot {
  startTime: RFC3339DateTime  // Explicit RFC3339 start
  endTime: RFC3339DateTime    // Explicit RFC3339 end
  duration?: number            // Optional (can calculate: (endTime - startTime) / 60000)
}

export interface AvailabilityStepData {
  selectedDate: { start: string | null; end: string | null }
  selectedTimeSlots: SelectedTimeSlot[] | null
  moveableScheduling?: MoveableSchedulingOptions | null
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

  // Add major slot
  // NOTE: Uses eventTimeRanges lookup by event name (configured via availabilitySettings)
  const majorEventName = 'OnSite' // TODO: Get from availabilitySettings
  const majorTimeRange = params.selectedSlot.eventTimeRanges?.[majorEventName]
  if (majorTimeRange) {
    slots.push({
      startTime: majorTimeRange.startTime,
      endTime: majorTimeRange.endTime,
      duration: majorTimeRange.duration,
    })
  }

  // Add minor slot if different from major
  // NOTE: Uses eventTimeRanges lookup by event name (configured via availabilitySettings)
  const minorEventName = 'ClientPresent' // TODO: Get from availabilitySettings
  const minorTimeRange = params.selectedSlot.eventTimeRanges?.[minorEventName]
  if (minorTimeRange && 
      minorTimeRange.startTime !== majorTimeRange?.startTime) {
    slots.push({
      startTime: minorTimeRange.startTime,
      endTime: minorTimeRange.endTime,
      duration: minorTimeRange.duration,
    })
  }

  return slots.length > 0 ? slots : null
}

export function buildAvailabilityStepData(params: {
  selectedDate: { start: string | null; end: string | null }
  selectedTimeSlots: SelectedTimeSlot[] | null
  moveableScheduling?: MoveableSchedulingOptions | null
}): AvailabilityStepData {
  return {
    selectedDate: {
      start: params.selectedDate.start,
      end: params.selectedDate.end,
    },
    selectedTimeSlots: params.selectedTimeSlots,
    moveableScheduling: params.moveableScheduling ?? null,
  }
}



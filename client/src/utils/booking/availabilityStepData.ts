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

  // Add onSite slot (inspector)
  if (params.selectedSlot.onSiteTimeRange) {
    slots.push({
      startTime: params.selectedSlot.onSiteTimeRange.startTime,
      endTime: params.selectedSlot.onSiteTimeRange.endTime,
      duration: params.selectedSlot.onSiteTimeRange.duration,
    })
  }

  // Add clientPresent slot if different from onSite
  if (params.selectedSlot.clientPresentTimeRange && 
      params.selectedSlot.clientPresentTimeRange.startTime !== params.selectedSlot.onSiteTimeRange?.startTime) {
    slots.push({
      startTime: params.selectedSlot.clientPresentTimeRange.startTime,
      endTime: params.selectedSlot.clientPresentTimeRange.endTime,
      duration: params.selectedSlot.clientPresentTimeRange.duration,
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



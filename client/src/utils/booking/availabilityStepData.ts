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
  if (params.selectedSlot.totalOnSite) {
    slots.push({
      startTime: params.selectedSlot.totalOnSite.startTime,
      endTime: params.selectedSlot.totalOnSite.endTime,
      duration: params.selectedSlot.totalOnSite.duration,
    })
  }

  // Add clientPresent slot if different from onSite
  if (params.selectedSlot.totalClientPresent && 
      params.selectedSlot.totalClientPresent.startTime !== params.selectedSlot.totalOnSite?.startTime) {
    slots.push({
      startTime: params.selectedSlot.totalClientPresent.startTime,
      endTime: params.selectedSlot.totalClientPresent.endTime,
      duration: params.selectedSlot.totalClientPresent.duration,
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



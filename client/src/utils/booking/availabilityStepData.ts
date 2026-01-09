import type { TimeSlot } from '@/types/appointment'

export interface SelectedTimeSlot {
  time: string
  duration: number
}

export interface AvailabilityStepData {
  selectedDate: { start: string | null; end: string | null }
  selectedTimeSlots: SelectedTimeSlot[] | null
}

type BuildSelectedTimeSlotsParams = {
  selectedDateStart: string | null
  inspectorTimeSlot: TimeSlot | null
  clientTimeSlot: TimeSlot | null
  onSiteTotal: number
  presentationDuration: number
}

export function buildSelectedTimeSlots(params: BuildSelectedTimeSlotsParams): SelectedTimeSlot[] | null {
  if (!params.inspectorTimeSlot || !params.selectedDateStart) {
    return null
  }

  const baseSlots: SelectedTimeSlot[] = [
    {
      time: params.inspectorTimeSlot.slotStart,
      duration: params.onSiteTotal,
    },
  ]

  const shouldAddClientSlot =
    !!params.clientTimeSlot && params.clientTimeSlot.slotStart !== params.inspectorTimeSlot.slotStart

  return shouldAddClientSlot
    ? [
        ...baseSlots,
        {
          time: params.clientTimeSlot!.slotStart,
          duration: params.presentationDuration,
        },
      ]
    : baseSlots
}

export function buildAvailabilityStepData(params: {
  selectedDate: { start: string | null; end: string | null }
  selectedTimeSlots: SelectedTimeSlot[] | null
}): AvailabilityStepData {
  return {
    selectedDate: {
      start: params.selectedDate.start,
      end: params.selectedDate.end,
    },
    selectedTimeSlots: params.selectedTimeSlots,
  }
}



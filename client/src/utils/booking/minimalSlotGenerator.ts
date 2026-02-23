/**
PATTERN: Pure slot ...
 */
import type { TimeSlot } from '@/types/appointment'
import type { RFC3339DateTime } from '@shared/types/primitiveBrands'
import { validateSlotGenerationParams, type SlotGenerationParamsBase } from './slotGenerationValidation'

/** Extends shared base (P2 type-similarity). */
export interface MinimalSlotParams extends SlotGenerationParamsBase {
  includeFlags: { major: boolean; minor: boolean; moveable: boolean }
}

function generateDaysInRange(start: Date, end: Date): Date[] {
  const days: Date[] = []
  const current = new Date(start)
  while (current < end) {
    days.push(new Date(current))
    current.setUTCDate(current.getUTCDate() + 1)
  }
  return days
}

function calculateInitialSlotStart(
  dayStart: Date,
  slotStartBoundary: Date,
  minuteIncrement: number
): Date {
  if (slotStartBoundary <= dayStart) return dayStart
  const minutesSinceMidnight =
    slotStartBoundary.getUTCHours() * 60 + slotStartBoundary.getUTCMinutes()
  const roundedMinutes = Math.ceil(minutesSinceMidnight / minuteIncrement) * minuteIncrement
  return new Date(
    Date.UTC(
      dayStart.getUTCFullYear(),
      dayStart.getUTCMonth(),
      dayStart.getUTCDate(),
      Math.floor(roundedMinutes / 60),
      roundedMinutes % 60
    )
  )
}

function generateSlotsForDay(
  slotStart: Date,
  slotEndBoundary: Date,
  endBoundaryDate: Date,
  duration: number,
  minuteIncrement: number,
  includeFlags: { major: boolean; minor: boolean; moveable: boolean },
  accumulatedSlots: TimeSlot[]
): TimeSlot[] {
  if (slotStart >= slotEndBoundary) return accumulatedSlots

  const slotStartMinutes = slotStart.getUTCMinutes() + duration
  const slotEnd = new Date(
    Date.UTC(
      slotStart.getUTCFullYear(),
      slotStart.getUTCMonth(),
      slotStart.getUTCDate(),
      slotStart.getUTCHours() + Math.floor(slotStartMinutes / 60),
      slotStartMinutes % 60
    )
  )

  const newSlots =
    slotEnd <= endBoundaryDate
      ? [
          ...accumulatedSlots,
          {
            startTime: slotStart.toISOString() as RFC3339DateTime,
            endTime: slotEnd.toISOString() as RFC3339DateTime,
            duration,
            major: includeFlags.major,
            minor: includeFlags.minor,
            moveable: includeFlags.moveable,
            isAvailable: true,
          },
        ]
      : accumulatedSlots

  const nextSlotStartMinutes = slotStart.getUTCMinutes() + minuteIncrement
  const nextSlotStart = new Date(
    Date.UTC(
      slotStart.getUTCFullYear(),
      slotStart.getUTCMonth(),
      slotStart.getUTCDate(),
      slotStart.getUTCHours() + Math.floor(nextSlotStartMinutes / 60),
      nextSlotStartMinutes % 60
    )
  )

  return generateSlotsForDay(
    nextSlotStart,
    slotEndBoundary,
    endBoundaryDate,
    duration,
    minuteIncrement,
    includeFlags,
    newSlots
  )
}

export function generateSlotsInRange(params: MinimalSlotParams): TimeSlot[] {
  validateSlotGenerationParams({
    duration: params.duration,
    minuteIncrement: params.minuteIncrement,
    startBoundary: params.startBoundary,
    endBoundary: params.endBoundary,
  })

  const startBoundaryDate = new Date(params.startBoundary)
  const endBoundaryDate = new Date(params.endBoundary)
  if (startBoundaryDate >= endBoundaryDate) return []

  const startDateOnly = new Date(
    Date.UTC(
      startBoundaryDate.getUTCFullYear(),
      startBoundaryDate.getUTCMonth(),
      startBoundaryDate.getUTCDate(),
      0,
      0,
      0,
      0
    )
  )
  const endDateOnly = new Date(
    Date.UTC(
      endBoundaryDate.getUTCFullYear(),
      endBoundaryDate.getUTCMonth(),
      endBoundaryDate.getUTCDate() + 1,
      0,
      0,
      0,
      0
    )
  )

  const days = generateDaysInRange(startDateOnly, endDateOnly)
  const slots = days.flatMap((currentDate) => {
    const dayStart = new Date(
      Date.UTC(
        currentDate.getUTCFullYear(),
        currentDate.getUTCMonth(),
        currentDate.getUTCDate(),
        0,
        0,
        0,
        0
      )
    )
    const dayEnd = new Date(
      Date.UTC(
        currentDate.getUTCFullYear(),
        currentDate.getUTCMonth(),
        currentDate.getUTCDate(),
        23,
        59,
        59,
        999
      )
    )
    const slotStartBoundary = dayStart < startBoundaryDate ? startBoundaryDate : dayStart
    const slotEndBoundary = dayEnd > endBoundaryDate ? endBoundaryDate : dayEnd
    const initialSlotStart = calculateInitialSlotStart(
      dayStart,
      slotStartBoundary,
      params.minuteIncrement
    )
    return generateSlotsForDay(
      initialSlotStart,
      slotEndBoundary,
      endBoundaryDate,
      params.duration,
      params.minuteIncrement,
      params.includeFlags,
      []
    )
  })

  return slots
}

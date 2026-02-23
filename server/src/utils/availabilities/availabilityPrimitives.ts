
import type { CalendarEvent } from '../../../../shared/types/availabilityTypes.js'

const MS_PER_MINUTE = 60 * 1000

export function getUniqueDatesInRange(
  startDate: string | Date,
  endDate: string | Date
): string[] {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate
  const current = new Date(start)
  current.setUTCHours(0, 0, 0, 0)
  const endDateOnly = new Date(end)
  endDateOnly.setUTCHours(23, 59, 59, 999)

  const dates: string[] = []
  const cursor = new Date(current)
  while (cursor <= endDateOnly) {
    dates.push(cursor.toISOString().split('T')[0])
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }
  return dates
}

export function formatDayKey(date: Date): string {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  const d = String(date.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function generateSlotTimes(
  dayStartUtc: Date,
  dayEndUtc: Date,
  durationMinutes: number,
  minuteIncrement: number,
  requestEndBoundary: Date
): Array<{ startTime: Date; endTime: Date }> {
  const dayMs = dayEndUtc.getTime() - dayStartUtc.getTime()
  const incrementMs = minuteIncrement * MS_PER_MINUTE
  const numSteps = Math.floor(dayMs / incrementMs)
  if (numSteps <= 0) return []

  const slotStarts = Array.from({ length: numSteps }, (_, i) => {
    const t = dayStartUtc.getTime() + i * incrementMs
    return new Date(t)
  })

  const durationMs = durationMinutes * MS_PER_MINUTE
  return slotStarts
    .map((startTime) => ({
      startTime,
      endTime: new Date(startTime.getTime() + durationMs),
    }))
    .filter(
      (slot) =>
        slot.endTime <= dayEndUtc && slot.endTime <= requestEndBoundary
    )
}

export function partitionByEventType(events: CalendarEvent[]): {
  regularEvents: CalendarEvent[]
  outOfOfficeEvents: CalendarEvent[]
} {
  const outOfOfficeEvents = events.filter(
    (e) => e.eventType === 'outOfOffice'
  )
  const regularEvents = events.filter((e) => e.eventType !== 'outOfOffice')
  return { regularEvents, outOfOfficeEvents }
}

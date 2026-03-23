import type {
  ComputedSlotAvailabilityData,
  ComputedAvailabilityRequest,
  ComputedSlot,
  CalendarEvent,
  Constraint,
} from '../../../shared/types/availabilityTypes.js'
import type { AvailabilitySettingsData } from '../../../shared/types/availabilitySettingsDocument.js'
import { getCalendarEvents } from './google/calendar/eventsService.js'

const CACHE_STATUS_HIT = 'hit' as const
const CACHE_STATUS_MISS = 'miss' as const
export async function fetchAndDedupeCalendarEvents(
  calendarEmails: string[],
  dateRange: { start: string; end: string },
  calendarEnabled: boolean
): Promise<{ events: CalendarEvent[]; responses: Awaited<ReturnType<typeof getCalendarEvents>>[] }> {
  const eventsResponses = await Promise.all(
    calendarEmails.map((email) =>
      calendarEnabled
        ? getCalendarEvents(email, dateRange.start, dateRange.end)
        : Promise.resolve({ events: [], _meta: { source: 'empty' as const } })
    )
  )
  const seenEventIds = new Set<string>()
  const events: CalendarEvent[] = eventsResponses.flatMap((response) =>
    response.events
      .filter((event) => {
        if (seenEventIds.has(event.id)) return false
        seenEventIds.add(event.id)
        return true
      })
      .map((event) => ({
        id: event.id,
        start: event.start,
        end: event.end,
        placeId: event.placeId,
        summary: event.summary,
        eventType: event.eventType || 'default',
        transparency: event.transparency,
      }))
  )
  return { events, responses: eventsResponses }
}
export function enrichCapacityConstraintsWithHours(
  constraints: Constraint[],
  scheduledHoursByKey: Record<string, number>,
  scheduledIncomeByKey?: Record<string, number>
): Constraint[] {
  return constraints.map((constraint) => {
    if (constraint.category !== 'capacity') return constraint
    const prefix = constraint.type + ':'
    const relevantHours = Object.fromEntries(
      Object.entries(scheduledHoursByKey).filter(([key]) => key.startsWith(prefix))
    )
    const relevantIncome =
      scheduledIncomeByKey != null
        ? Object.fromEntries(
            Object.entries(scheduledIncomeByKey).filter(([key]) => key.startsWith(prefix))
          )
        : undefined
    return {
      ...constraint,
      scheduledHours: relevantHours,
      ...(relevantIncome != null && Object.keys(relevantIncome).length > 0 ? { scheduledIncome: relevantIncome } : {}),
    }
  })
}
export function buildComputedAvailabilityResponse(
  slotsByDay: Record<string, ComputedSlot[]>,
  enrichedConstraints: Constraint[],
  settings: AvailabilitySettingsData,
  regularEvents: CalendarEvent[],
  outOfOfficeEvents: CalendarEvent[],
  eventsResponses: Awaited<ReturnType<typeof getCalendarEvents>>[],
  request: ComputedAvailabilityRequest,
  allowedExceptionsApplied?: boolean
): ComputedSlotAvailabilityData {
  return {
    slotsByDay,
    constraints: enrichedConstraints,
    minuteIncrement: settings.minuteIncrement,
    timezone: settings.timezone,
    durationRounding: settings.durationRounding,
    calendarEvents: regularEvents,
    outOfOfficeEvents,
    _meta: {
      dateRange: request.dateRange,
      candidatePlaceId: request.candidatePlaceId,
      defaultLocation: settings.defaultLocation,
      generatedAt: new Date().toISOString(),
      cacheStatus: {
        events: eventsResponses.every((r) => r._meta?.source === 'cache')
          ? CACHE_STATUS_HIT
          : CACHE_STATUS_MISS,
      },
      ...(allowedExceptionsApplied !== undefined ? { allowedExceptionsApplied } : {}),
    },
  }
}

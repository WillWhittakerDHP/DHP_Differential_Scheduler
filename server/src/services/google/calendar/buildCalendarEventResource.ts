/**
 * WHY: Google Calendar `events.insert` request body built in one place (complexity / readability).
 */

import type { CreateEventParams } from './calendarTypes.js'

function mergeCalendarEventAttendees(
  resource: Record<string, unknown>,
  attendees: CreateEventParams['attendees']
): void {
  if (!attendees || attendees.length === 0) {
    return
  }
  resource.attendees = attendees.map((attendee) => ({
    email: attendee.email,
    displayName: attendee.displayName,
    optional: attendee.optional,
  }))
}

function mergeCalendarEventVisibilityAndTransparency(
  resource: Record<string, unknown>,
  params: Pick<CreateEventParams, 'visibility' | 'transparency'>
): void {
  const { visibility, transparency } = params
  if (visibility && visibility !== 'default') {
    resource.visibility = visibility
  }
  if (transparency) {
    resource.transparency = transparency
  }
}

function mergeCalendarEventGuestPermissions(
  resource: Record<string, unknown>,
  params: Pick<
    CreateEventParams,
    'guestsCanModify' | 'guestsCanInviteOthers' | 'guestsCanSeeOtherGuests'
  >
): void {
  const { guestsCanModify, guestsCanInviteOthers, guestsCanSeeOtherGuests } = params
  if (guestsCanModify !== undefined) {
    resource.guestsCanModify = guestsCanModify
  }
  if (guestsCanInviteOthers !== undefined) {
    resource.guestsCanInviteOthers = guestsCanInviteOthers
  }
  if (guestsCanSeeOtherGuests !== undefined) {
    resource.guestsCanSeeOtherGuests = guestsCanSeeOtherGuests
  }
}

function mergeCalendarEventReminders(
  resource: Record<string, unknown>,
  reminderOverrides: CreateEventParams['reminderOverrides']
): void {
  if (!reminderOverrides || reminderOverrides.length === 0) {
    return
  }
  resource.reminders = {
    useDefault: false,
    overrides: reminderOverrides.map((r) => ({
      method: r.method,
      minutes: r.minutes,
    })),
  }
}

function mergeCalendarEventConference(resource: Record<string, unknown>, calendarId: string): void {
  resource.conferenceData = {
    createRequest: {
      requestId: `${calendarId}-${Date.now()}`,
      conferenceSolutionKey: { type: 'hangoutsMeet' },
    },
  }
}

export function buildCalendarEventResource(
  params: CreateEventParams,
  startDate: Date,
  endDate: Date
): Record<string, unknown> {
  const {
    summary,
    description,
    location,
    attendees,
    visibility,
    transparency,
    guestsCanModify,
    guestsCanInviteOthers,
    guestsCanSeeOtherGuests,
    addConferenceLink,
    colorId,
    status,
    reminderOverrides,
    calendarId,
  } = params

  const eventResource: Record<string, unknown> = {
    summary,
    // @audit-allow:hardcoding:fieldMapping - Google Calendar API event payload
    start: { dateTime: startDate.toISOString() },
    // @audit-allow:hardcoding:fieldMapping - Google Calendar API event payload
    end: { dateTime: endDate.toISOString() },
  }

  if (description) {
    eventResource.description = description
  }

  if (location) {
    eventResource.location = location
  }

  mergeCalendarEventAttendees(eventResource, attendees)
  mergeCalendarEventVisibilityAndTransparency(eventResource, { visibility, transparency })
  mergeCalendarEventGuestPermissions(eventResource, {
    guestsCanModify,
    guestsCanInviteOthers,
    guestsCanSeeOtherGuests,
  })

  if (colorId) {
    eventResource.colorId = colorId
  }

  if (status && status !== 'confirmed') {
    eventResource.status = status
  }

  mergeCalendarEventReminders(eventResource, reminderOverrides)

  if (addConferenceLink) {
    mergeCalendarEventConference(eventResource, calendarId)
  }

  return eventResource
}

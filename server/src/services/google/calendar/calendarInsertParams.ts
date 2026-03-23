/**
 * WHY: calendar.events.insert parameters beside request body (complexity / clarity).
 */

import type { calendar_v3 } from 'googleapis'

export function buildCalendarEventsInsertParams(input: {
  calendarId: string
  eventResource: Record<string, unknown>
  sendUpdates: 'all' | 'externalOnly' | 'none'
  addConferenceLink: boolean | undefined
}): calendar_v3.Params$Resource$Events$Insert {
  const insertParams: calendar_v3.Params$Resource$Events$Insert = {
    calendarId: input.calendarId,
    requestBody: input.eventResource as calendar_v3.Schema$Event,
    sendUpdates: input.sendUpdates,
  }
  if (input.addConferenceLink) {
    insertParams.conferenceDataVersion = 1
  }
  return insertParams
}

# Error Handling Audit Summary (Generated)

Generated from `.audit-reports/error-handling-audit.json`.

- Requiring review: **18**
- Allowed exceptions: 45

## Top 12 files (ranked by score)

| File | Priority | Score | P0 | P1 | P2 |
| --- | --- | ---: | ---: | ---: | ---: |
| `server/src/utils/availabilities/availabiltiesDbUtils.ts` | P1 | 6 | 0 | 0 | 6 |
| `server/src/services/google/maps/placesApiService.ts` | P2 | 2 | 0 | 0 | 2 |
| `client/src/composables/admin/useAttendeeQuickSelect.ts` | P2 | 1 | 0 | 0 | 1 |
| `client/src/composables/booking/useComputedAvailability.ts` | P2 | 1 | 0 | 0 | 1 |
| `client/src/types/datetime.ts` | P2 | 1 | 0 | 0 | 1 |
| `server/src/services/appointmentCalendarService.ts` | P2 | 1 | 0 | 0 | 1 |
| `server/src/services/brightMls/brightMlsApiClient.ts` | P2 | 1 | 0 | 0 | 1 |
| `server/src/services/calendarErrorHandler.ts` | P2 | 1 | 0 | 0 | 1 |
| `server/src/services/google/calendar/eventCreationService.ts` | P2 | 1 | 0 | 0 | 1 |
| `server/src/services/google/maps/mapsHelpers.ts` | P2 | 1 | 0 | 0 | 1 |
| `server/src/services/google/maps/routesApiService.ts` | P2 | 1 | 0 | 0 | 1 |
| `server/src/test/setup/testDb.ts` | P2 | 1 | 0 | 0 | 1 |

## Notes

- P0: Silent error swallowing (empty catch, silent .catch())
- P1: Console in catch blocks, type suppressions (@ts-ignore, as any)
- P2: General console usage

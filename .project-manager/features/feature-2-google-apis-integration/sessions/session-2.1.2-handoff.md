# Session 2.1.2 Handoff: Calendar Availability Integration

**Feature:** Feature 2 - Google APIs Integration  
**Phase:** 2.1 - Google Calendar API Integration  
**Session:** 2.1.2 - Calendar Availability Integration  
**Status:** Not Started  
**Started:** TBD  
**Last Updated:** 2026-01-31

---

## Session Overview

**Session Number:** 2.1.2  
**Session Name:** Calendar Availability Integration  
**Description:** Connect the Google Calendar free-busy API to the existing availability system. Create client-side service layer, add data source toggle in dev panel, and implement explicit error handling.

**Prerequisite:** Phase 2.0 complete (calendar configuration in AvailabilitySettings)

---

## Objectives

- Create client-side calendar API service for server communication
- Add data source toggle to booking dev panel (Real API / Mock / Both / None)
- Modify `getCalendarAvailability()` to support multiple data sources
- Read calendar emails from settings
- Implement explicit error handling (no silent fallbacks)
- Update `useBusyTimes` composable with loading/error states

---

## Implementation Tasks

### Task 1: Create Client-Side Calendar API Service
**Status:** ⏳ Not Started

Create `client/src/services/calendarApiService.ts`:

```typescript
/**
 * Client-side service for Google Calendar API calls
 * WHY: Centralized API calls, authentication checks, response transformation
 * PATTERN: Service layer between composables and server endpoints
 */

import axios from 'axios'
import type { BusyTimeRange } from '@/utils/booking/timeSlotFitter'
import type { RFC3339DateTime } from '@/types/datetime'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

export interface OAuthStatus {
  authenticated: boolean
  hasRefreshToken?: boolean
  expiryDate?: number
  authUrl?: string
}

export interface CalendarApiOptions {
  skipCache?: boolean
}

/**
 * Check OAuth authentication status
 */
export async function checkOAuthStatus(): Promise<OAuthStatus>

/**
 * Fetch free-busy data from server
 * Transforms server response to BusyTimeRange[] format
 */
export async function fetchFreeBusy(
  calendarEmails: string[],
  timeMin: RFC3339DateTime,
  timeMax: RFC3339DateTime,
  options?: CalendarApiOptions
): Promise<BusyTimeRange[]>
```

Key implementation details:
- [ ] Import axios for HTTP calls
- [ ] Define `OAuthStatus` interface
- [ ] Define `CalendarApiOptions` interface (for `skipCache`)
- [ ] Implement `checkOAuthStatus()` - calls `GET /api/v1/external/oauth/status`
- [ ] Implement `fetchFreeBusy()`:
  - Call `POST /api/v1/external/calendar/freebusy`
  - Transform response: flatten calendars object to `BusyTimeRange[]`
  - Handle errors explicitly (throw, don't swallow)
- [ ] Add `skipCache` query param support for force refresh

### Task 2: Add Data Source Toggle to Dev Panel
**Status:** ⏳ Not Started

Modify `client/src/components/booking/dev/DevPanelsContainer.vue`:

- [ ] Rename "Mocks" tab/section to "Free/Busy"
- [ ] Add data source radio group:
  ```typescript
  type FreeBusyDataSource = 'real' | 'mock' | 'both' | 'none'
  ```
- [ ] Add "Force Refresh" button that sets `skipCache: true`
- [ ] Store selection in shared ref for other composables to access
- [ ] Display current data source mode in panel

Create or update `client/src/composables/booking/useFreeBusyDataSource.ts`:
- [ ] Export shared ref for data source mode
- [ ] Export function to get calendar emails from settings
- [ ] Export force refresh trigger

### Task 3: Modify getCalendarAvailability()
**Status:** ⏳ Not Started

Update `client/src/utils/timeSlotCalculations.ts`:

```typescript
export type FreeBusyDataSource = 'real' | 'mock' | 'both' | 'none'

export interface GetCalendarAvailabilityOptions {
  dataSource: FreeBusyDataSource
  calendarEmails: string[]
  skipCache?: boolean
}

export async function getCalendarAvailability(
  dateRange: { start: RFC3339DateTime; end: RFC3339DateTime },
  options: GetCalendarAvailabilityOptions
): Promise<BusyTimeRange[]>
```

Implementation:
- [ ] Make function async
- [ ] Accept options parameter with `dataSource`, `calendarEmails`, `skipCache`
- [ ] Handle `'none'` mode → return empty array
- [ ] Handle `'mock'` mode → use existing mock generation
- [ ] Handle `'real'` mode → call `fetchFreeBusy()` from service
- [ ] Handle `'both'` mode → merge mock + real data
- [ ] Use `preprocessBusyPeriods()` to merge overlapping periods
- [ ] Throw errors explicitly (don't catch and return empty)

### Task 4: Update useBusyTimes Composable
**Status:** ⏳ Not Started

Update `client/src/composables/booking/useBusyTimes.ts`:

```typescript
export interface UseBusyTimesParams {
  dateRangeForApi: ComputedRef<{ start: RFC3339DateTime; end: RFC3339DateTime } | null>
  dataSource: Ref<FreeBusyDataSource>
  calendarEmails: Ref<string[]>
  skipCache?: Ref<boolean>
}

export interface UseBusyTimesReturn {
  busyTimes: Ref<BusyTimeRange[]>
  error: Ref<Error | null>
  isLoading: Ref<boolean>
  refresh: () => Promise<void>
}
```

Implementation:
- [ ] Add `error` ref for error state
- [ ] Add `isLoading` ref for loading state
- [ ] Accept `dataSource` and `calendarEmails` params
- [ ] Accept optional `skipCache` param
- [ ] Watch dependencies and call async `getCalendarAvailability()`
- [ ] Set error state on failures (don't swallow)
- [ ] Expose `refresh()` function for manual refresh

### Task 5: Implement Error Handling
**Status:** ⏳ Not Started

Create explicit error handling throughout:

| Scenario | Detection | User Message |
|----------|-----------|--------------|
| OAuth not authenticated | `checkOAuthStatus().authenticated === false` | Show "Connect Google Calendar" prompt with auth link |
| API rate limit | Error response with 429 status | "Too many requests. Please try again in a moment." |
| Network error | Axios network error | "Could not reach calendar service. Check your connection." |
| Invalid response | Response validation fails | "Calendar data unavailable. Using default availability." |
| Calendar not found | 404 or permission error | "Calendar [email] is not accessible." |

Implementation:
- [ ] Add error type detection in `fetchFreeBusy()`
- [ ] Create error message mapping utility
- [ ] Surface errors in UI (notification or inline message)
- [ ] Log errors to console with full details
- [ ] Never silently fall back to empty data

### Task 6: Integration with AvailabilityStep
**Status:** ⏳ Not Started

Update `client/src/components/booking/steps/AvailabilityStep.vue`:

- [ ] Import data source composable
- [ ] Pass data source mode to `useBusyTimes`
- [ ] Get calendar emails from availability settings
- [ ] Display loading state while fetching
- [ ] Display error state with retry option
- [ ] Handle "not authenticated" state with connect prompt

---

## Key Files

### New Files to Create
- `client/src/services/calendarApiService.ts` - Calendar API service layer
- `client/src/composables/booking/useFreeBusyDataSource.ts` - Data source state management

### Files to Modify
- `client/src/utils/timeSlotCalculations.ts` - Update `getCalendarAvailability()`
- `client/src/composables/booking/useBusyTimes.ts` - Add error/loading states
- `client/src/components/booking/dev/DevPanelsContainer.vue` - Add data source toggle
- `client/src/components/booking/steps/AvailabilityStep.vue` - Integration

---

## Architecture Notes

### Data Source Modes

| Mode | Behavior | Use Case |
|------|----------|----------|
| `real` | Only fetch from Google Calendar API | Production, real testing |
| `mock` | Only use generated mock data | Offline development, predictable testing |
| `both` | Merge real API + mock data | Test edge cases with real calendar |
| `none` | Return empty array (all times available) | Test "no conflicts" scenario |

### Caching Strategy

**Server handles all caching:**
- TTL-based: 5 min near-term, 15 min future dates
- Cache key: `calendarEmails:timeMin:timeMax`
- Client always calls server; server returns cached or fresh data

**No client-side cache needed:**
- Simpler implementation
- Single source of truth
- Rate limiting handled server-side

**Force refresh:**
- Dev panel "Force Refresh" button sends `?skipCache=true`
- Server fetches fresh data, updates cache

### Error Handling Philosophy

**Explicit errors, never silent:**
- Every error is surfaced to the user
- Errors are logged with full details
- No fallback that hides problems
- User always knows when something is wrong

---

## Success Criteria

- ✅ `calendarApiService.ts` created with `checkOAuthStatus()` and `fetchFreeBusy()`
- ✅ Data source toggle in dev panel works (Real/Mock/Both/None)
- ✅ "Force Refresh" button bypasses server cache
- ✅ `getCalendarAvailability()` supports all four data source modes
- ✅ `useBusyTimes` exposes `error` and `isLoading` states
- ✅ Calendar emails read from `AvailabilitySettings.calendarConfig`
- ✅ OAuth authentication checked before API calls
- ✅ Errors displayed to user (not silently swallowed)
- ✅ Server response correctly transformed to `BusyTimeRange[]`
- ✅ Both mode correctly merges real + mock data

---

## Reference Documents

- **Phase 2.0 Plan**: Calendar configuration UI (provides `calendarConfig`)
- **Session 2.1.1 Handoff**: Infrastructure setup (OAuth, rate limiting, caching)
- **Existing Mock Implementation**: `client/src/utils/booking/mockGoogleCalendar.ts`
- **Existing Busy Times Composable**: `client/src/composables/booking/useBusyTimes.ts`
- **Server Free-Busy Endpoint**: `server/src/routes/external/calendarRoutes.ts`

---

**Session Status:** Not Started  
**Last Updated:** 2026-01-31

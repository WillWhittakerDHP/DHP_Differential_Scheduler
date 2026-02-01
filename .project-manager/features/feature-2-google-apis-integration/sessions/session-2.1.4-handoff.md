# Session 2.1.4 Handoff: Full Event Fetching & Location Cache

**Feature:** Feature 2 - Google APIs Integration  
**Phase:** 2.1 - Google Calendar API Integration  
**Session:** 2.1.4 - Full Event Fetching & Location Cache  
**Status:** Not Started  
**Started:** TBD  
**Last Updated:** 2026-01-31

---

## Session Overview

**Session Number:** 2.1.4  
**Session Name:** Full Event Fetching & Location Cache  
**Description:** Fetch full Google Calendar events (not just free-busy) to extract event locations. Create server-side cache for events with locations, enabling drive time calculations in Phase 2.2.

**Prerequisite:** Session 2.1.1 complete (OAuth and free-busy API working)

**CRITICAL DEPENDENCY:** This session must complete before Phase 2.2 (Google Maps API) can begin, as drive time calculations require event locations.

---

## Objectives

- Fetch full calendar events using `calendar.events.list()` API
- Extract event locations for drive time calculations
- Create `calendarEventsCache.ts` service following `freeBusyCache.ts` pattern
- Add `getCalendarEvents()` function to `googleCalendarService.ts`
- Add `GET /api/v1/external/calendar/events` endpoint
- Integrate rate limiting and caching
- Cache events with TTL (5 min near-term, 15 min future)

---

## Implementation Tasks

### Task 1: Create Calendar Events Cache Service
**Status:** ⏳ Not Started

- [ ] Create `server/src/services/calendarEventsCache.ts`
- [ ] Define `CachedCalendarEvent` interface:
  - `id: string`
  - `start: string`
  - `end: string`
  - `location: string | null` (for drive time calculation)
  - `summary: string | null` (for context/debugging)
- [ ] Implement cache functions following `freeBusyCache.ts` pattern:
  - `getCachedEvents(calendarEmail, timeMin, timeMax)`
  - `cacheEvents(calendarEmail, timeMin, timeMax, events)`
  - `invalidateEventsCache(calendarEmail?, timeRange?)`
  - `clearEventsCache()`
  - `getEventsCacheStats()`
  - `getAllCachedEntries()` (for dev panel)
- [ ] Use same TTL logic as free-busy cache (5 min near-term, 15 min future)

### Task 2: Add getCalendarEvents Function
**Status:** ⏳ Not Started

- [ ] Add `getCalendarEvents()` function to `googleCalendarService.ts`
- [ ] Use `calendar.events.list()` API (not `freebusy.query()`)
- [ ] Check cache first (similar to `getFreeBusy()`)
- [ ] Check rate limit before API call
- [ ] Extract from Google API response:
  - Event ID
  - Start time (handle both `dateTime` and `date` formats)
  - End time (handle both `dateTime` and `date` formats)
  - Location (address string)
  - Summary (event title)
- [ ] Filter out events without start/end times
- [ ] Cache the transformed events
- [ ] Handle errors (rate limit, authentication, network)

### Task 3: Add Events Endpoint
**Status:** ⏳ Not Started

- [ ] Add `GET /api/v1/external/calendar/events` endpoint to `calendarRoutes.ts`
- [ ] Accept query parameters:
  - `calendarEmail` (required)
  - `timeMin` (required, ISO date string)
  - `timeMax` (required, ISO date string)
- [ ] Validate query parameters
- [ ] Check OAuth authentication
- [ ] Call `getCalendarEvents()` from service
- [ ] Return array of `CachedCalendarEvent[]`
- [ ] Handle errors appropriately

### Task 4: Verify OAuth Scope
**Status:** ⏳ Not Started

- [ ] Verify `calendar.readonly` scope covers `events.list()` API
- [ ] Test that authenticated requests can fetch full events
- [ ] Update scopes if needed (should already be covered)

---

## Key Files

### New Files to Create
- `server/src/services/calendarEventsCache.ts` - Events cache service

### Files to Modify
- `server/src/services/googleCalendarService.ts` - Add `getCalendarEvents()` function
- `server/src/routes/external/calendarRoutes.ts` - Add events endpoint

---

## Architecture Notes

### Cache Pattern
- Follows same pattern as `freeBusyCache.ts`
- TTL-based caching: 5 min for near-term dates, 15 min for future dates
- Cache key: `events:{calendarEmail}:{timeMin}:{timeMax}` (normalized)
- Automatic cache invalidation on TTL expiry

### Event Data Structure
- Minimal event data cached (only what's needed for drive time)
- Location is critical field (for drive time calculations)
- Summary included for debugging/context

### API Differences
- **Free-Busy API** (`freebusy.query()`): Returns only `{start, end}` time ranges
- **Events API** (`events.list()`): Returns full event details including location, summary, etc.

---

## Success Criteria

- ✅ `calendarEventsCache.ts` service created and working
- ✅ `getCalendarEvents()` function fetches full events
- ✅ Location extracted from each event
- ✅ Events cached with TTL (similar to free-busy)
- ✅ API endpoint returns events with locations
- ✅ Rate limiting applied
- ✅ Error handling working correctly
- ✅ Cache reduces API calls (second request faster)

---

## Reference Documents

- **Free-Busy Cache**: `server/src/services/freeBusyCache.ts` - Pattern to follow
- **Calendar Service**: `server/src/services/googleCalendarService.ts` - Integration point
- **Drive Time Buffer Plan**: `/Users/districthomepro/.cursor/plans/drive_time_buffer_implementation_d7bfd3a0.plan.md` (for context)
- **Google Calendar API**: [Events API](https://developers.google.com/calendar/api/v3/reference/events/list)

---

**Session Status:** Not Started  
**Last Updated:** 2026-01-31

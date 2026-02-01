# Session 2.1.6 Handoff: Admin API Dev Panel

**Feature:** Feature 2 - Google APIs Integration  
**Phase:** 2.1 - Google Calendar API Integration  
**Session:** 2.1.6 - Admin API Dev Panel  
**Status:** Not Started  
**Started:** TBD  
**Last Updated:** 2026-01-31

---

## Session Overview

**Session Number:** 2.1.6  
**Session Name:** Admin API Dev Panel  
**Description:** Create admin dev panel for viewing cached API responses, OAuth status, and rate limiter statistics. Provides visibility into API state for debugging and validation during development.

**Prerequisite:** Sessions 2.1.1, 2.1.4 complete (OAuth, free-busy cache, events cache working)

---

## Objectives

- Create admin dev panel component (`ApiDevPanel.vue`)
- Display OAuth status (authenticated, token expiry, scopes)
- Display free-busy cache contents and statistics
- Display events cache contents with locations
- Display rate limiter statistics
- Add debug endpoints for cache inspection (dev mode only)
- Integrate into admin panel (visible when `isDevModeEnabled()`)

---

## Implementation Tasks

### Task 1: Create Admin Dev Panel Component
**Status:** ⏳ Not Started

- [ ] Create `client/src/components/admin/dev/ApiDevPanel.vue`
- [ ] Follow pattern from `DevPanelsContainer.vue` (booking wizard)
- [ ] Create tabbed interface with tabs:
  - OAuth Status
  - Free-Busy Cache
  - Events Cache
  - Rate Limiter
- [ ] Add refresh buttons for each tab
- [ ] Add "Refresh All" button
- [ ] Style similar to booking wizard dev panel
- [ ] Only visible when `isDevModeEnabled()` returns true

### Task 2: Implement OAuth Status Tab
**Status:** ⏳ Not Started

- [ ] Fetch OAuth status from `/api/v1/external/oauth/status`
- [ ] Display authentication status (authenticated: yes/no)
- [ ] Display refresh token status
- [ ] Display token expiry date (formatted)
- [ ] Show "Authenticate" button if not authenticated
- [ ] Handle loading and error states

### Task 3: Implement Free-Busy Cache Tab
**Status:** ⏳ Not Started

- [ ] Fetch cache data from `/api/v1/external/calendar/debug/freebusy-cache`
- [ ] Display cache statistics (total entries, memory usage)
- [ ] Display cached entries in expandable panels
- [ ] Show cache key, age, TTL, expired status for each entry
- [ ] Display cached data (formatted JSON)
- [ ] Handle empty cache state

### Task 4: Implement Events Cache Tab
**Status:** ⏳ Not Started

- [ ] Fetch cache data from `/api/v1/external/calendar/debug/events-cache`
- [ ] Display cache statistics (total entries, memory usage)
- [ ] Display cached entries in expandable panels
- [ ] Show cache key, event count, age, TTL, expired status
- [ ] Display sample events (first 3) with locations
- [ ] Handle empty cache state

### Task 5: Implement Rate Limiter Tab
**Status:** ⏳ Not Started

- [ ] Fetch stats from `/api/v1/external/calendar/debug/rate-limit`
- [ ] Display API name
- [ ] Display requests per minute limit
- [ ] Display current request count
- [ ] Display remaining requests
- [ ] Display utilization percentage with progress bar
- [ ] Color-code progress bar (green/yellow/red based on utilization)

### Task 6: Add Debug Endpoints
**Status:** ⏳ Not Started

- [ ] Add `GET /api/v1/external/calendar/debug/freebusy-cache` endpoint
  - Return cache stats and all entries
  - Only accessible in development (check `NODE_ENV`)
- [ ] Add `GET /api/v1/external/calendar/debug/events-cache` endpoint
  - Return cache stats and all entries
  - Only accessible in development
- [ ] Add `GET /api/v1/external/calendar/debug/rate-limit` endpoint
  - Return rate limiter stats
  - Only accessible in development
- [ ] Return 403 error in production

### Task 7: Integrate into Admin Panel
**Status:** ⏳ Not Started

- [ ] Add dev panel toggle button to `AdminPanel.vue`
- [ ] Import `ApiDevPanel` component
- [ ] Add toggle button (bug icon) in admin header
- [ ] Show/hide panel based on toggle state
- [ ] Only visible when `isDevModeEnabled()` returns true

---

## Key Files

### New Files to Create
- `client/src/components/admin/dev/ApiDevPanel.vue` - Admin dev panel component

### Files to Modify
- `server/src/routes/external/calendarRoutes.ts` - Add debug endpoints
- `server/src/services/freeBusyCache.ts` - Add `getAllCachedEntries()` function
- `client/src/views/admin/AdminPanel.vue` - Add dev panel toggle

---

## Architecture Notes

### Dev Panel Pattern
- Follows pattern from booking wizard `DevPanelsContainer.vue`
- Tabbed interface using VTabs and VWindow
- Floating panel with fixed positioning
- Teleport to body for proper z-index layering

### Debug Endpoints
- Only accessible in development (`NODE_ENV !== 'production'`)
- Return 403 error in production for security
- Provide visibility into internal state for debugging

### Cache Display
- Show cache keys for identification
- Display entry age and TTL
- Indicate expired entries
- Format JSON data for readability

---

## Success Criteria

- ✅ Admin dev panel component created
- ✅ OAuth status tab shows authentication state
- ✅ Free-busy cache tab shows cache contents
- ✅ Events cache tab shows events with locations
- ✅ Rate limiter tab shows statistics
- ✅ Debug endpoints return cache/rate limit data
- ✅ Panel only visible in dev mode
- ✅ Toggle button integrated into admin panel
- ✅ All tabs refresh correctly
- ✅ Error handling works (API failures, empty cache, etc.)

---

## Reference Documents

- **Booking Wizard Dev Panel**: `client/src/components/booking/dev/DevPanelsContainer.vue` - Pattern to follow
- **Dev Mode Utility**: `client/src/utils/env/devMode.ts` - Dev mode detection
- **Free-Busy Cache**: `server/src/services/freeBusyCache.ts` - Cache service
- **Events Cache**: `server/src/services/calendarEventsCache.ts` - Events cache service
- **Rate Limiter**: `server/src/services/rateLimiter.ts` - Rate limiter service

---

**Session Status:** Not Started  
**Last Updated:** 2026-01-31

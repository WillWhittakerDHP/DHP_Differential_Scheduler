# Phase 2.1 Handoff: Google Calendar API Integration

**Feature:** Feature 2 - Google APIs Integration  
**Phase:** 2.1 - Google Calendar API Integration  
**Status:** In Progress  
**Started:** 2026-01-31  
**Last Updated:** 2026-01-31

---

## Phase Overview

**Phase Number:** 2.1  
**Phase Name:** Google Calendar API Integration  
**Description:** Integrate Google Calendar API for fetching availability and creating events. This phase incorporates the detailed Google Calendar Free-Busy API Setup plan.

**Current Status:** In Progress (Phase Started)  
**Dependencies:** Phase 2.0 (Calendar Configuration UI) - Can be done in parallel or before

---

## Objectives

- Set up Google Calendar API client
- Implement calendar availability fetching (free-busy API)
- Implement event creation with invitations
- Handle error cases and fallbacks
- **CRITICAL**: Implement rate limiting and caching infrastructure

---

## Detailed Implementation Plan

This phase follows the detailed Google Calendar Free-Busy API Setup plan with 6 implementation phases:

### Phase 1: Google Cloud Console Setup (Verify/Complete)
**Status:** ⏳ Not Started

- Verify Google Cloud Project exists and is active (Project ID: `stone-passage-382818`)
- Enable Google Calendar API
- Verify OAuth Consent Screen configured with required scopes:
  - `https://www.googleapis.com/auth/calendar.readonly`
  - `https://www.googleapis.com/auth/calendar.freebusy`
- Verify OAuth 2.0 Credentials match `.env.development`
- Check authorized redirect URIs include: `http://localhost:3001/auth/callback` or `/api/v1/external/oauth/callback`

### Phase 2: Environment Configuration
**Status:** ⏳ Not Started

- Add `GOOGLE_SCOPES` environment variable to `server/.env.development`
- Add rate limiting configuration variables
- Update `server/src/config/app.ts` to validate Google Calendar env vars (optional)

### Phase 3: OAuth Client Setup
**Status:** ⏳ Not Started

- Create `server/src/config/googleOAuth.ts`
- Initialize OAuth2Client from `googleapis`
- Export functions: `getAuthUrl()`, `getTokens(code)`, `refreshAccessToken()`, `getAuthenticatedClient()`
- Token storage strategy: Start with session storage

### Phase 4: Rate Limiting and Caching Infrastructure ⚠️ **CRITICAL**
**Status:** ⏳ Not Started

**Why Critical**: Google Calendar API enforces per-minute quotas (sliding window). Exceeding quotas returns 403/429 errors. Must be implemented BEFORE making API calls.

- Create `server/src/services/rateLimiter.ts`:
  - Per-API rate limit tracking
  - Sliding window rate limiting (matches Google's quota system)
  - Request queuing for when rate limit is reached
  - Configurable limits per API endpoint
- Create `server/src/services/freeBusyCache.ts`:
  - TTL-based caching (5 min for near-term dates, 15 min for future dates)
  - Cache key: `calendarEmails:timeMin:timeMax` (normalized)
  - Automatic cache invalidation on TTL expiry
  - Memory-efficient (LRU cache or similar)
- Integrate rate limiter and cache into calendar service

### Phase 5: Basic Free-Busy API Endpoint
**Status:** ⏳ Not Started

- Create `server/src/services/googleCalendarService.ts`:
  - Function: `getFreeBusy(calendarEmails: string[], timeMin: Date, timeMax: Date)`
  - Uses `calendar.freebusy.query()` from googleapis
  - Integrates rate limiter and cache
- Update `server/src/routes/external/calendarRoutes.ts`:
  - Uncomment and update existing route structure
  - Add route: `POST /api/v1/external/calendar/freebusy`
- Update `server/src/routes/external/googleOauthRoutes.ts`:
  - Uncomment and update OAuth routes
  - Routes: `GET /api/v1/external/oauth` and `/api/v1/external/oauth/callback`
- Update `server/src/routes/external/index.ts`:
  - Enable calendar and OAuth routes

### Phase 6: Integration Points
**Status:** ⏳ Not Started

- Connect to existing availability system
- Read calendar emails from Business Settings (when Phase 2.0 complete)
- Integration point: `client/src/utils/booking/timeAvailabilityManager.ts`

---

## Sessions Overview

| Session | Name | Status |
|---------|------|--------|
| 2.1.1 | Infrastructure Setup & Free-Busy API | 🔄 In Progress |
| 2.1.2 | Calendar Availability Integration | ⏳ Not Started |
| 2.1.3 | Event Creation & Invitations | ⏳ Not Started |
| 2.1.4 | Error Handling & Fallbacks | ⏳ Not Started |

---

## Key Files

### New Files to Create
- `server/src/config/googleOAuth.ts` - OAuth client configuration
- `server/src/services/rateLimiter.ts` - Rate limiting service (**CRITICAL**)
- `server/src/services/freeBusyCache.ts` - Caching service (**CRITICAL**)
- `server/src/services/googleCalendarService.ts` - Calendar API service

### Files to Modify
- `server/.env.development` - Add `GOOGLE_SCOPES` and rate limit config
- `server/src/config/app.ts` - Optional: Add env var validation
- `server/src/routes/external/calendarRoutes.ts` - Uncomment and implement
- `server/src/routes/external/googleOauthRoutes.ts` - Uncomment and implement
- `server/src/routes/external/index.ts` - Enable calendar and OAuth routes

---

## Current State

### Prerequisites Status
- ✅ `googleapis` package installed (v144.0.0)
- ✅ OAuth credentials configured in `.env.development`
- ✅ Commented-out OAuth routes exist
- ✅ External routes structure exists
- ✅ Availability settings infrastructure exists (Feature 1)
- ✅ Business Controls tab exists (Feature 1)

### Next Steps
1. Verify Google Cloud Console setup (Phase 1)
2. Add environment variables (Phase 2)
3. Create OAuth configuration module (Phase 3)
4. **CRITICAL**: Implement rate limiting and caching (Phase 4) - Must be done before API calls
5. Create calendar service and routes (Phase 5)
6. Integrate with availability system (Phase 6)

---

## Architecture Notes

### Rate Limiting Strategy
- **CRITICAL**: Google Calendar API has per-minute quotas (sliding window)
- Implement rate limiting service BEFORE making API calls
- Default: 60 requests/minute (conservative, adjust based on quotas)
- Use sliding window calculation to match Google's quota system

### Caching Strategy
- **CRITICAL**: Cache free-busy responses to reduce API calls
- TTL-based caching: 5 min for near-term dates, 15 min for future dates
- Cache key: `calendarEmails:timeMin:timeMax` (normalized)
- Invalidate cache when new appointments created

### OAuth Token Storage
- **Initial**: Session storage (simpler, less persistent)
- **Future**: Database storage (User model or OAuthTokens table) for production

---

## Success Criteria

- ✅ Google Cloud Console setup verified
- ✅ Environment variables configured
- ✅ OAuth client configured and functional
- ✅ Rate limiting service implemented (prevents quota exhaustion)
- ✅ Free-busy cache service implemented (reduces API calls)
- ✅ Calendar service created with getFreeBusy function
- ✅ Calendar and OAuth routes implemented and enabled
- ✅ OAuth flow functional (auth and callback)
- ✅ Free-busy endpoint returns correct data
- ✅ Calendar availability fetched correctly
- ✅ Error handling working with fallbacks
- ✅ Rate limit errors handled gracefully
- ✅ Performance: API response times <2s

---

## Reference Documents

- **Feature Plan**: `../feature-plan.md`
- **Google Calendar Free-Busy Setup Plan**: `/Users/districthomepro/.cursor/plans/google_calendar_free-busy_api_setup_cbbaba01.plan.md` ⭐ **DETAILED IMPLEMENTATION GUIDE**
- **React Calendar Calls Reference**: `client/src/scheduler/externalAPI/calendarCalls.ts`
- **Google Calendar API Documentation**: [Free-Busy API](https://developers.google.com/calendar/api/v3/reference/freebusy/query)
- **Google OAuth 2.0 Setup Guide**: [OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)

---

**Phase Status:** In Progress  
**Current Session:** Session 2.1.1 - Infrastructure Setup & Free-Busy API (In Progress)  
**Last Updated:** 2026-01-31

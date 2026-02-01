# Session 2.1.1 Testing Guide

**Session:** 2.1.1 - Infrastructure Setup & Free-Busy API  
**Date:** 2026-01-31  
**Status:** Ready for Testing

---

## Testing Checklist

### Prerequisites
- [x] Google Cloud Console setup verified (98% confident)
- [x] Server compiles without errors
- [x] Environment variables configured
- [x] All code implemented

---

## Test 1: OAuth Flow

### Step 1.1: Check Authentication Status
**Endpoint:** `GET http://localhost:3001/api/v1/external/oauth/status`

**Expected Response (Not Authenticated):**
```json
{
  "authenticated": false,
  "authUrl": "/api/v1/external/oauth"
}
```

**Command:**
```bash
curl http://localhost:3001/api/v1/external/oauth/status
```

### Step 1.2: Initiate OAuth Flow
**Endpoint:** `GET http://localhost:3001/api/v1/external/oauth`

**Expected:** Redirects to Google OAuth consent screen

**Command:**
```bash
# Open in browser or use curl with -L to follow redirects
curl -L http://localhost:3001/api/v1/external/oauth
```

**Manual Steps:**
1. Open browser and navigate to: `http://localhost:3001/api/v1/external/oauth`
2. Complete Google OAuth consent
3. Should redirect to callback URL with authorization code

### Step 1.3: OAuth Callback
**Endpoint:** `GET http://localhost:3001/api/v1/external/oauth/callback?code=[AUTHORIZATION_CODE]`

**Expected Response:**
```json
{
  "success": true,
  "message": "Authentication successful",
  "hasAccessToken": true,
  "hasRefreshToken": true
}
```

**Note:** This happens automatically after Google redirects. Check browser or server logs.

### Step 1.4: Verify Authentication Status (After OAuth)
**Endpoint:** `GET http://localhost:3001/api/v1/external/oauth/status`

**Expected Response (Authenticated):**
```json
{
  "authenticated": true,
  "hasRefreshToken": true,
  "expiryDate": 1234567890
}
```

---

## Test 2: Free-Busy API Endpoint

### Step 2.1: Test Free-Busy Endpoint (Without Auth)
**Endpoint:** `POST http://localhost:3001/api/v1/external/calendar/freebusy`

**Request Body:**
```json
{
  "calendarEmails": ["test@example.com"],
  "timeMin": "2026-02-01T00:00:00Z",
  "timeMax": "2026-02-07T23:59:59Z"
}
```

**Expected Response (Not Authenticated):**
```json
{
  "error": "Not authenticated: OAuth credentials not found. Please authenticate first.",
  "authUrl": "/api/v1/external/oauth"
}
```

**Command:**
```bash
curl -X POST http://localhost:3001/api/v1/external/calendar/freebusy \
  -H "Content-Type: application/json" \
  -d '{
    "calendarEmails": ["test@example.com"],
    "timeMin": "2026-02-01T00:00:00Z",
    "timeMax": "2026-02-07T23:59:59Z"
  }'
```

### Step 2.2: Test Free-Busy Endpoint (After OAuth)
**Prerequisite:** Complete OAuth flow first (Test 1)

**Request Body:**
```json
{
  "calendarEmails": ["your-calendar@example.com"],
  "timeMin": "2026-02-01T00:00:00Z",
  "timeMax": "2026-02-07T23:59:59Z"
}
```

**Expected Response:**
```json
{
  "calendars": {
    "your-calendar@example.com": {
      "busy": [
        {
          "start": "2026-02-01T10:00:00Z",
          "end": "2026-02-01T11:00:00Z"
        }
      ]
    }
  }
}
```

**Command:**
```bash
curl -X POST http://localhost:3001/api/v1/external/calendar/freebusy \
  -H "Content-Type: application/json" \
  -d '{
    "calendarEmails": ["your-calendar@example.com"],
    "timeMin": "2026-02-01T00:00:00Z",
    "timeMax": "2026-02-07T23:59:59Z"
  }'
```

---

## Test 3: Request Validation

### Test 3.1: Missing calendarEmails
**Request:**
```json
{
  "timeMin": "2026-02-01T00:00:00Z",
  "timeMax": "2026-02-07T23:59:59Z"
}
```

**Expected:** 400 error with validation message

### Test 3.2: Invalid Date Range
**Request:**
```json
{
  "calendarEmails": ["test@example.com"],
  "timeMin": "2026-02-07T00:00:00Z",
  "timeMax": "2026-02-01T00:00:00Z"
}
```

**Expected:** 400 error - "timeMin must be before timeMax"

### Test 3.3: Invalid Date Format
**Request:**
```json
{
  "calendarEmails": ["test@example.com"],
  "timeMin": "invalid-date",
  "timeMax": "2026-02-07T00:00:00Z"
}
```

**Expected:** 400 error - "must be valid ISO date strings"

---

## Test 4: Cache Verification

### Step 4.1: First Request (Cache Miss)
1. Make free-busy request
2. Check server logs for: `[GoogleCalendarService] Fetching free-busy`
3. Note response time

### Step 4.2: Second Request (Cache Hit)
1. Make same free-busy request immediately
2. Check server logs for: `[GoogleCalendarService] Cache hit`
3. Response should be faster (no API call)

**Command (run twice):**
```bash
curl -X POST http://localhost:3001/api/v1/external/calendar/freebusy \
  -H "Content-Type: application/json" \
  -d '{
    "calendarEmails": ["your-calendar@example.com"],
    "timeMin": "2026-02-01T00:00:00Z",
    "timeMax": "2026-02-07T23:59:59Z"
  }'
```

---

## Test 5: Rate Limiting Verification

### Step 5.1: Check Rate Limit Stats
**Note:** Rate limiting is internal - check server logs for rate limit messages

### Step 5.2: Rapid Requests Test
Make 70+ requests rapidly (exceeding 60/minute limit):

```bash
for i in {1..70}; do
  curl -X POST http://localhost:3001/api/v1/external/calendar/freebusy \
    -H "Content-Type: application/json" \
    -d '{
      "calendarEmails": ["test@example.com"],
      "timeMin": "2026-02-01T00:00:00Z",
      "timeMax": "2026-02-07T23:59:59Z"
    }' &
done
wait
```

**Expected:** Some requests should be queued/wait for rate limit

---

## Test 6: Error Handling

### Test 6.1: Network Error Simulation
**Note:** Hard to simulate, but verify error handling code paths

### Test 6.2: Invalid Calendar Email
**Request:**
```json
{
  "calendarEmails": ["invalid-email"],
  "timeMin": "2026-02-01T00:00:00Z",
  "timeMax": "2026-02-07T23:59:59Z"
}
```

**Expected:** Google API error handled gracefully

---

## Testing Notes

### Server Logs to Watch
- `[GoogleOAuthRoutes]` - OAuth flow logs
- `[CalendarRoutes]` - Calendar route logs
- `[GoogleCalendarService]` - Service logs (cache hits, API calls)
- Rate limit warnings
- Error messages

### Common Issues

1. **OAuth Redirect URI Mismatch**
   - Check `.env.development` `GOOGLE_REDIRECT_URI`
   - Should match Google Cloud Console authorized redirect URIs
   - Current: `http://localhost:3001/auth/callback`
   - Route: `/api/v1/external/oauth/callback`
   - **Fix:** Update redirect URI in Google Cloud Console or `.env.development`

2. **Missing Scopes**
   - Verify OAuth consent screen has required scopes
   - Check `GOOGLE_SCOPES` in `.env.development`

3. **Token Storage**
   - Currently in-memory (oauth2Client)
   - Tokens lost on server restart
   - For production: migrate to database storage

---

## Success Criteria

- ✅ OAuth flow completes successfully
- ✅ Free-busy endpoint returns correct data
- ✅ Cache reduces API calls (second request faster)
- ✅ Rate limiting prevents quota exhaustion
- ✅ Error handling works correctly
- ✅ Request validation works correctly

---

**Last Updated:** 2026-01-31

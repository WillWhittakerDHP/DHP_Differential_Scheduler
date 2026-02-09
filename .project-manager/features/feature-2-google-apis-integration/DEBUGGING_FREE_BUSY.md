# Debugging Missing Free-Busy Periods

## Problem
Free-busy query missed Monday 4-9pm busy period.

## Changes Made

### 1. Comprehensive Logging Added

#### Server-Side Logging (`server/src/services/googleCalendarService.ts`)
- **Raw API Response**: Logs all busy periods returned from Google Calendar API
- **Filtering Results**: Logs when busy periods are filtered out (null/undefined periods)
- **Cache Contents**: When cache hit occurs, logs all cached busy periods with details
- **Final Response**: Logs total busy periods after transformation

#### Client-Side Logging (`client/src/services/calendarApiService.ts`)
- **Request Details**: Logs date range, calendar emails, and skipCache flag
- **Raw Server Response**: Logs busy periods received from server
- **Transformed Response**: Logs final busy periods after transformation

#### Composable Logging
- **useBusyTimes**: Logs date range, calendar emails, and received busy periods
- **useApiOrchestrator**: Logs date range being queried and received busy periods
- **preprocessBusyPeriods**: Logs when periods are filtered or merged

### 2. SkipCache Functionality Fixed

#### Server Route (`server/src/routes/external/calendarRoutes.ts`)
- Now reads `skipCache` query parameter from request
- Passes `skipCache` flag to `getFreeBusy()` function

#### Server Service (`server/src/services/googleCalendarService.ts`)
- `getFreeBusy()` now accepts `skipCache` parameter
- Bypasses cache check when `skipCache=true`
- Logs when cache is bypassed

### 3. Force Refresh Available

The API Dev Panel already has a "Force Refresh" button that:
- Sets `skipCache=true` flag
- Increments refresh key to trigger re-fetch
- Bypasses server cache

## How to Debug

### Step 1: Check Browser Console Logs

Open browser DevTools console and look for logs with these prefixes:
- `[GoogleCalendarService]` - Server-side logs
- `[fetchFreeBusy]` - Client-side API service logs
- `[useBusyTimes]` - Composable logs
- `[useApiOrchestrator]` - Orchestrator logs
- `[preprocessBusyPeriods]` - Preprocessing logs

### Step 2: Verify Date Range

Check logs for `[useApiOrchestrator]` or `[useBusyTimes]` to see:
- What date range is being queried
- Verify Monday 4-9pm falls within the queried range

Example log:
```
[useApiOrchestrator] Fetching busy times: {
  dateRange: { start: '2026-02-01T00:00:00.000Z', end: '2026-02-28T23:59:59.999Z' },
  ...
}
```

### Step 3: Check Cache State

#### Option A: Use Debug Endpoint
```
GET /api/v1/external/calendar/debug/freebusy-cache
```

This returns:
- All cached entries
- Cache keys (includes calendar emails and date range)
- Timestamps and TTL
- Whether entries are expired

#### Option B: Check Server Logs
Look for `[GoogleCalendarService] Cache hit` logs to see:
- What busy periods are in cache
- Whether Monday 4-9pm is missing from cache

### Step 4: Force Cache Refresh

#### Using API Dev Panel
1. Open API Dev Panel (dev mode must be enabled)
2. Go to "Free/Busy" tab
3. Click "Force Refresh" button
4. Check console logs for fresh API call

#### Using Code
```typescript
const { forceRefresh } = useFreeBusyDataSource()
forceRefresh() // Triggers refresh with skipCache=true
```

### Step 5: Compare Cache vs Fresh API

1. **Before Force Refresh**: Note what busy periods are in cache (from logs)
2. **After Force Refresh**: Note what busy periods come from fresh API call
3. **Compare**: 
   - If fresh API returns Monday 4-9pm → Cache issue
   - If fresh API also missing Monday 4-9pm → Date range or API issue

## What to Look For

### If Cache Issue (Most Likely)
**Symptoms:**
- Cache hit logs show missing Monday 4-9pm
- Fresh API call (after force refresh) returns Monday 4-9pm
- Cache contains stale/incomplete data

**Fix:**
- Use `forceRefresh()` to bypass cache
- Or clear cache using debug endpoint
- Or wait for cache TTL to expire (5-15 minutes)

### If Date Range Issue
**Symptoms:**
- Date range logs show Monday 4-9pm is outside queried range
- Date range calculation excludes the Monday

**Fix:**
- Review `useDateRangeDecider` - ensure it calculates full month boundaries
- Check timezone conversion - Monday 4-9pm local time should convert correctly to UTC

### If API Response Issue
**Symptoms:**
- Raw API response logs show Google API doesn't return Monday 4-9pm
- Server logs show period is filtered out incorrectly

**Fix:**
- Check Google Calendar API directly
- Review filtering logic in `googleCalendarService.ts` (lines 123-128)
- Verify calendar permissions and event visibility

### If Preprocessing Issue
**Symptoms:**
- API returns Monday 4-9pm but preprocessing logs show it's filtered out
- Validation logs show period marked as invalid

**Fix:**
- Review `validateBusyPeriod()` function
- Check if period has valid start/end times
- Verify period isn't incorrectly merged with another period

## Log Examples

### Cache Hit Log
```
[GoogleCalendarService] Cache hit for 1 calendars: {
  calendarCount: 1,
  totalBusyPeriods: 3,
  calendars: [{
    email: 'example@gmail.com',
    busyCount: 3,
    busyPeriods: [
      '2026-02-03T10:00:00Z to 2026-02-03T12:00:00Z',
      '2026-02-03T14:00:00Z to 2026-02-03T16:00:00Z',
      '2026-02-03T18:00:00Z to 2026-02-03T20:00:00Z'
    ]
  }]
}
```

### Fresh API Call Log
```
[GoogleCalendarService] Raw API response received: {
  calendarCount: 1,
  calendars: [{
    email: 'example@gmail.com',
    busyCount: 4,
    busyPeriods: [
      { start: '2026-02-03T10:00:00Z', end: '2026-02-03T12:00:00Z' },
      { start: '2026-02-03T14:00:00Z', end: '2026-02-03T16:00:00Z' },
      { start: '2026-02-03T16:00:00Z', end: '2026-02-03T21:00:00Z' }, // Monday 4-9pm UTC
      { start: '2026-02-03T18:00:00Z', end: '2026-02-03T20:00:00Z' }
    ]
  }]
}
```

## Next Steps

1. **Run the app** and check browser console logs
2. **Identify where** Monday 4-9pm busy period is being lost:
   - In cache? → Use force refresh
   - In date range? → Fix date range calculation
   - In API response? → Check Google Calendar API
   - In preprocessing? → Fix validation/merging logic
3. **Apply appropriate fix** based on root cause
4. **Verify fix** by checking logs and UI

## Files Modified

- `server/src/services/googleCalendarService.ts` - Added logging, skipCache support
- `server/src/routes/external/calendarRoutes.ts` - Added skipCache query param handling
- `client/src/services/calendarApiService.ts` - Added request/response logging
- `client/src/composables/booking/useBusyTimes.ts` - Added date range and busy periods logging
- `client/src/composables/booking/useApiOrchestrator.ts` - Added date range logging
- `client/src/utils/booking/timeAvailabilityManager.ts` - Added preprocessing logging

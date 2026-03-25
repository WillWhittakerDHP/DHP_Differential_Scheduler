# google-apis-integration — feature guide (integrated)

_Session docs from `sessions/` merged during doc rollup._

## Session docs (integrated)

### session-2.1.1-testing-guide

# Session 2.1.1 Testing Guide

**Session:** 2.1.1 - Infrastructure Setup & Free-Busy API  
**Date:** 2026-01-31  
**Status:** Ready for Testing

---

### session-2.2.5-guide

# Session 2.2.5 Guide: API Prefetching & Data Source Semantics

**Purpose:** Session-level guide with task breakdown

**Tier:** Session (Tier 2 - Medium-Level)

---

### session-2.2.6-guide

# Session 2.2.6 Guide: Constraint Attribution & Admin Performance

**Purpose:** Session-level guide with task breakdown

**Tier:** Session (Tier 2 - Medium-Level)

---

## Quick Start

### Session Overview

**Session ID:** 2.2.6  
**Session Name:** Constraint Attribution & Admin Performance  
**Description:** Fix how violations are attributed and displayed in the constraint overlay, ensuring direct conflicts are always attributed to "appointment" (blue) and drive time constraints are always "buffer" violations. Also optimize admin panel performance by loading settings only when the Business Controls tab is active.

**Duration:** ~2-3 hours  
**Status:** Completed (documentation alignment; Tasks 2.2.6.2–2.2.6.5 already implemented)

### Tasks

- [x] #### Task 2.2.6.1: Fix Violation Attribution Logic ✅
**Goal:** Ensure direct conflicts are always appointment, drive times are always buffer
**Files:** 
- `client/src/utils/booking/timeAvailabilityManager.ts`
**Approach:** 
- Refactor checkSlotAvailability to check direct overlap first
- Direct overlap always attributed to appointment.direct
- Collect ALL violations (not just first hard failure)
- For appointment: record buffer if extends beyond direct
- For drive times: only record buffer-only overlaps
- Include buffer minutes in violation string format
**Checkpoint:** Violation attribution correct, all violations collected, buffer minutes included

- [x] #### Task 2.2.6.2: Update Constraint Overlay Display ✅
**Goal:** Handle buffer:minutes format and display buffer value in tooltips
**Files:** 
- `client/src/utils/booking/constraintColors.ts` (used by AppointmentSlotGrid.vue)
**Approach:** 
- getColorForViolation strips minutes suffix (e.g., buffer:20 → buffer)
- formatViolationTooltip parses buffer minutes
- Display buffer value in tooltip: "Drive To Appointment buffer (20 min)"
- Handles both old format (no minutes) and new format (with minutes)
**Checkpoint:** Overlay handles buffer:minutes format, tooltips show buffer values correctly

- [x] #### Task 2.2.6.3: Add Conditional Loading to useAvailabilitySettings ✅
**Goal:** Load settings only when enabled option is true
**Files:** 
- `client/src/composables/admin/useAvailabilitySettings.ts`
**Approach:** 
- Add optional enabled parameter to UseAvailabilitySettingsOptions
- Watch enabled ref and only load when enabled === true
- Fallback: Load immediately if no enabled option (backward compatibility)
- Update onMounted logic to conditional loading
**Checkpoint:** Conditional loading works, backward compatibility maintained

- [x] #### Task 2.2.6.4: Provide CurrentTab in AdminPanel ✅
**Goal:** Provide currentTab state to child tabs via inject
**Files:** 
- `client/src/views/admin/AdminPanel.vue`
**Approach:** 
- Provide currentTab ref via inject
- Allows child tabs to know if they're active
**Checkpoint:** currentTab provided correctly, available to children

- [x] #### Task 2.2.6.5: Update BusinessControlsTab for Conditional Loading ✅
**Goal:** Load settings only when tab is active
**Files:** 
- `client/src/views/admin/tabs/BusinessControlsTab.vue`
**Approach:** 
- Inject adminCurrentTab from parent
- Compute isTabActive based on currentTab value
- Pass enabled: isTabActive to useAvailabilitySettings
- Settings only load when tab becomes active
**Checkpoint:** Settings load only when tab active, no API call on initial load

---

## Session Workflow

### Before Starting a Session

**Recommended:** Use `/session-start 2.2.6 "Constraint Attribution & Admin Performance"` to automatically:
- Load key sections from session handoff document
- Load relevant sections from session guide
- Generate formatted session label with date/status
- Display compact prompt format for reference
- Trigger task planning (fill out task embeds in session guide)
- Identify files to work with based on handoff "Next Action"

**Manual Alternative:**
1. **Label the session** with format below
2. **Review previous session notes** (Session 2.2.5)
3. **Identify files to work with**

### Session Labeling Format

Each session should start with:
```
## Session: 2.2.6 - Constraint Attribution & Admin Performance
**Date:** [Date]
**Duration:** [Estimated/Actual]
**Status:** [In Progress / Completed / Blocked]
**Agent:** [Current/New]
```

### During Session

1. **Work on one task at a time**
2. **Document decisions** inline in code
3. **Ask questions** as they arise

### After Each Task - Unified Checkpoint

**CRITICAL: Automatically pause and present checkpoint summary after each task.**

**Checkpoint Type:** Choose based on task complexity:
- **Simple tasks** (Task 2.2.6.4): Quick checkpoint (quality only)
- **Complex tasks** (Tasks 2.2.6.1-2.2.6.3, 2.2.6.5): Full checkpoint (quality + optional feedback)

#### Quick Checkpoint Format (Simple Tasks)

```
## Checkpoint: Task 2.2.6.4

**Completed:** Provided currentTab via inject in AdminPanel
**Quality:** [Status from /checkpoint command]
**Next:** Task 2.2.6.5: Update BusinessControlsTab for Conditional Loading

[Wait for user review before continuing]
```

#### Full Checkpoint Format (Complex Tasks)

```
## Checkpoint: Task 2.2.6.1

**Completed:** Fixed violation attribution logic

**Architecture Notes:**
- **Violation Attribution:** Direct conflicts are fundamental (can't double-book)
- **Drive Time Constraints:** Always buffer-only (represent travel time, not conflicts)
- **Violation Collection:** Collect ALL violations for debugging overlay

**Quality:** [Status from /checkpoint command]

**Questions Answered:**
- **Q: Why are drive times always buffer?** A: They represent travel time, not actual appointment conflicts

**Next:** Task 2.2.6.2: Update Constraint Overlay Display

[Wait for user review before continuing]
```

### End of Session

**CRITICAL: Follow end-of-session checklist before marking complete.**

1. **Verify app starts** - Run `npm run start:dev` to confirm application launches
2. **Run linting** - Execute `cd client && npm run lint` and fix any errors
3. **Update session log** - Add task entries for all completed tasks
4. **Update handoff document** - Add transition context for next session
5. **Update session guide** - Mark tasks complete, add any notes
6. **PROMPT USER FOR COMMIT AND PUSH** - After all checks pass

---

## Session Structure

### Session Labeling Format

Each session should start with:
```
## Session: 2.2.6 - Constraint Attribution & Admin Performance
**Date:** [Date]
**Duration:** [Estimated/Actual]
**Status:** [In Progress / Completed / Blocked]
**Agent:** [Current/New]
```

### Task Structure

Break each session into focused tasks. Each task should have:

- **Goal:** Clear objective for the task
- **Files:** Source and target files (if porting/migrating)
- **Approach:** How to accomplish the goal
- **Checkpoint:** What needs to be verified upon completion

**Task Format:**
```
#### Task 2.2.6.N: [Task Name]
**Goal:** [Task goal]
**Files:** 
- [Files to work with]
**Approach:** [Approach to take]
**Checkpoint:** [What needs to be verified]
```

### Session Organization

- **Quick Start:** Session overview, tasks
- **Session Workflow:** Before/during/after session process
- **Reference:** Templates, examples, related documents
- **Notes:** Session-specific notes and decisions

---

## Task Template

### Task Planning Template

When planning a new task, use this structure:

```markdown
- [ ] #### Task 2.2.6.N: [Task Name]

**Goal:** [Clear, specific objective]

**Files:** 
- Source: `[source-path]` (if porting/migrating)
- Target: `[target-path]` (if creating new)

**Approach:** 
- [Step 1]
- [Step 2]
- [Step 3]

**Checkpoint:** 
- [What needs to be verified]
- [Quality criteria]
**Dependencies:**
- [Prerequisite tasks or files]
```

### Task Entry Template (For Session Log)

When logging a completed task:

```markdown
### Task 2.2.6.N: [Name] ✅
**Completed:** [Date]
**Goal:** [What was accomplished]

**Files Created:**
- `[path]` - [Description]

**Files Modified:**
- `[path]` - [Description]

**Key Methods/Functions:**
- `methodName()` - [Description]

**Architecture Notes:**
- **[Pattern]**: [Explanation]

**Questions Answered:**
- **[Question]** - [Answer]

**Next Task:**
- [2.2.6.N+1]: [Next task]
```

---

## Reference

### Document Responsibilities

- **Session Guide** (this file): Instructions for how to work (workflow, checkpoints, end-of-session)
- **Session Log**: Historical record of what happened (task entries, progress)
- **Session Handoff**: Transition context for next session (where we left off, what's next)

### Documentation Templates

**See `.cursor/commands/tiers/session/templates/session-log.md` for complete documentation templates.**

Templates include:
- Task entry format for session log
- Handoff document format

### Related Documents

- **Session Handoff:** `.project-manager/features/google-apis-integration/sessions/session-2.2.6-handoff.md` (transition context and planning)
- **Session Log:** `.project-manager/features/google-apis-integration/sessions/session-2.2.6-log.md` (historical record)
- **Phase Handoff:** `.project-manager/features/google-apis-integration/phases/phase-2.2-handoff.md` (phase-level context)

---

## Notes

- Violation attribution fix ensures constraint overlay displays correct information for debugging
- Direct conflicts are fundamental (can't double-book), so they're always appointment type
- Drive times are always buffer-only because they represent travel time, not actual conflicts
- Admin performance optimization prevents unnecessary API calls on initial page load
- Conditional loading pattern can be reused for other admin tabs if needed

## Quick Start

### Session Overview

**Session ID:** 2.2.5  
**Session Name:** API Prefetching & Data Source Semantics  
**Description:** Optimize API call timing by prefetching calendar events and busy times when placeId becomes available (Step 2), and clarify that data source modes control which values are *used* rather than when APIs are *called*.

**Duration:** ~1.5 hours  
**Status:** ✅ Complete

### Tasks

- [x] #### Task 2.2.5.1: Create useDateRangeDecider Composable (Already exists)
**Goal:** Create composable that calculates date range for displayed calendar month
**Files:** 
- NEW: `client/src/composables/booking/useDateRangeDecider.ts`
**Approach:** 
- Accept optional `displayedMonth` ref (year, month)
- Return computed date range (start/end of month in UTC)
- Default to current month if no month provided
**Checkpoint:** Composable created, types correct, returns proper date range format

- [x] #### Task 2.2.5.2: Create useApiOrchestrator Composable (Superseded by server-side useComputedAvailability)
**Goal:** Create orchestrator that watches placeId and dateRange, triggers sequential API chain
**Files:** 
- NEW: `client/src/composables/booking/useApiOrchestrator.ts`
**Approach:** 
- Watch placeId from propertyDetailsStepData
- Watch dateRange from dateRangeDecider
- Execute sequential chain: events API → busy times API
- Return prefetched data refs (calendarEvents, busyTimes)
- Return loading and error states
**Checkpoint:** Orchestrator created, watches trigger correctly, API chain executes sequentially

- [x] #### Task 2.2.5.3: Integrate Orchestrator in BookingWizard (Already implemented)
**Goal:** Set up orchestrator in parent component and provide data via inject
**Files:** 
- `client/src/components/booking/BookingWizard.vue`
**Approach:** 
- Initialize displayedMonth ref
- Create dateRange using useDateRangeDecider
- Create apiOrchestrator using useApiOrchestrator
- Provide displayedMonth, updateDisplayedMonth, and orchestrator data via inject
**Checkpoint:** Orchestrator integrated, provide/inject setup correctly, data available to children

- [x] #### Task 2.2.5.4: Update AvailabilityStep for Month Tracking (Already implemented)
**Goal:** Track displayed month and consume prefetched data from orchestrator
**Files:** 
- `client/src/components/booking/steps/AvailabilityStep.vue`
**Approach:** 
- Inject displayedMonth and updateDisplayedMonth from parent
- Track vDatePickerDisplayDate for VDatePicker
- Watch displayedMonth and update VDatePicker display-date
- Watch VDatePicker display-date and update parent's displayedMonth
- Watch selectedDate and update displayedMonth
- Inject apiOrchestrator and create computed refs for prefetched data
**Checkpoint:** Month tracking works, VDatePicker updates trigger orchestrator, prefetched data available

- [x] #### Task 2.2.5.5: Update useBusyTimes for Prefetched Data (N/A — composable removed, server handles)
**Goal:** Accept optional prefetched busy times, consume instead of fetching
**Files:** 
- `client/src/composables/booking/useBusyTimes.ts`
**Approach:** 
- Add optional prefetchedBusyTimes parameter
- Watch prefetched data if provided, update local busyTimes ref
- Only set up fetch watch if prefetched data NOT provided
- Add logging for prefetched vs fetched data
**Checkpoint:** Composable accepts prefetched data, watches update correctly, no duplicate API calls

- [x] #### Task 2.2.5.6: Update useAvailableStartTimes for Prefetched Events (N/A — composable removed, server handles)
**Goal:** Consume prefetched calendar events instead of fetching independently
**Files:** 
- `client/src/composables/booking/useAvailableStartTimes.ts`
**Approach:** 
- Remove direct calendar event fetching logic
- Accept optional prefetchedCalendarEvents parameter
- Use prefetched events if available, otherwise empty array
- Add logging for prefetched vs empty array
**Checkpoint:** Composable consumes prefetched events, no duplicate API calls, fallback works

- [x] #### Task 2.2.5.7: Clarify Drive Time Calculator Mode Semantics (Adapted: server dataSource handling)
**Goal:** Ensure mode controls usage, not fetching - API always called to populate cache
**Files:** 
- `client/src/utils/booking/driveTimeCalculator.ts`
**Approach:** 
- Add guard: only calculate if placeId exists
- Refactor: Always call API (populate cache), then use mode to determine return value
- Update mode-based return logic:
  - 'default': Return static (API still called)
  - 'api': Return calculated, fail if unavailable
  - 'both': Return calculated if available, fallback to static
- Update logging to show mode and cache population
**Checkpoint:** Mode semantics clarified, API always called, mode controls return value, logging accurate

- [x] #### Task 2.2.5.8: Update Data Source Documentation and Defaults (Adapted: shared types + client docs)
**Goal:** Update documentation and defaults to match clarified mode semantics
**Files:** 
- `client/src/composables/booking/useDriveTimeDataSource.ts`
- `client/src/composables/booking/useFreeBusyDataSource.ts`
**Approach:** 
- Update documentation: Mode controls usage, not fetching
- Change driveTimeDataSource default from 'both' to 'default'
- Ensure consistency between both composables
**Checkpoint:** Documentation updated, default changed, both composables consistent

- [x] #### Task 2.2.5.9: Fix Constraint Extractors Validation (Already correct — verified)
**Goal:** Update validApplyTo array to use correct values (skipDayStart/skipDayEnd)
**Files:** 
- `client/src/utils/booking/constraintExtractors.ts`
**Approach:** 
- Update validApplyTo array from ['all', 'first_only', 'last_only', 'none']
- Change to: ['all', 'skipDayStart', 'skipDayEnd', 'none']
**Checkpoint:** Validation uses correct values, matches DriveTimeApplyTo type

---

## Session Workflow

### Before Starting a Session

**Recommended:** Use `/session-start 2.2.5 "API Prefetching & Data Source Semantics"` to automatically:
- Load key sections from session handoff document
- Load relevant sections from session guide
- Generate formatted session label with date/status
- Display compact prompt format for reference
- Trigger task planning (fill out task embeds in session guide)
- Identify files to work with based on handoff "Next Action"

**Manual Alternative:**
1. **Label the session** with format below
2. **Review previous session notes** (Session 2.2.4)
3. **Identify files to work with**

### Session Labeling Format

Each session should start with:
```
## Session: 2.2.5 - API Prefetching & Data Source Semantics
**Date:** [Date]
**Duration:** [Estimated/Actual]
**Status:** [In Progress / Completed / Blocked]
**Agent:** [Current/New]
```

### During Session

1. **Work on one task at a time**
2. **Document decisions** inline in code
3. **Ask questions** as they arise

### After Each Task - Unified Checkpoint

**CRITICAL: Automatically pause and present checkpoint summary after each task.**

**Checkpoint Type:** Choose based on task complexity:
- **Simple tasks** (Task 2.2.5.9): Quick checkpoint (quality only)
- **Complex tasks** (Tasks 2.2.5.1-2.2.5.7): Full checkpoint (quality + optional feedback)

#### Quick Checkpoint Format (Simple Tasks)

```
## Checkpoint: Task 2.2.5.9

**Completed:** Updated validApplyTo array to use correct values
**Quality:** [Status from /checkpoint command]
**Next:** Session complete

[Wait for user review before continuing]
```

#### Full Checkpoint Format (Complex Tasks)

```
## Checkpoint: Task 2.2.5.2

**Completed:** Created useApiOrchestrator composable

**Architecture Notes:**
- **API Orchestration:** Sequential API chains coordinate multiple calls
- **Reactive Watchers:** Watch placeId and dateRange, trigger on changes
- **Prefetching Pattern:** Fetch data before it's needed for instant loading

**Quality:** [Status from /checkpoint command]

**Questions Answered:**
- **Q: When should orchestrator trigger?** A: When placeId becomes available OR month changes

**Next:** Task 2.2.5.3: Integrate Orchestrator in BookingWizard

[Wait for user review before continuing]
```

### End of Session

**CRITICAL: Follow end-of-session checklist before marking complete.**

1. **Verify app starts** - Run `npm run start:dev` to confirm application launches
2. **Run linting** - Execute `cd client && npm run lint` and fix any errors
3. **Update session log** - Add task entries for all completed tasks
4. **Update handoff document** - Add transition context for next session
5. **Update session guide** - Mark tasks complete, add any notes
6. **PROMPT USER FOR COMMIT AND PUSH** - After all checks pass

---

## Session Structure

### Session Labeling Format

Each session should start with:
```
## Session: 2.2.5 - API Prefetching & Data Source Semantics
**Date:** [Date]
**Duration:** [Estimated/Actual]
**Status:** [In Progress / Completed / Blocked]
**Agent:** [Current/New]
```

### Task Structure

Break each session into focused tasks. Each task should have:

- **Goal:** Clear objective for the task
- **Files:** Source and target files (if porting/migrating)
- **Approach:** How to accomplish the goal
- **Checkpoint:** What needs to be verified upon completion

**Task Format:**
```
#### Task 2.2.5.N: [Task Name]
**Goal:** [Task goal]
**Files:** 
- [Files to work with]
**Approach:** [Approach to take]
**Checkpoint:** [What needs to be verified]
```

### Session Organization

- **Quick Start:** Session overview, tasks
- **Session Workflow:** Before/during/after session process
- **Reference:** Templates, examples, related documents
- **Notes:** Session-specific notes and decisions

---

## Task Template

### Task Planning Template

When planning a new task, use this structure:

```markdown
- [ ] #### Task 2.2.5.N: [Task Name]

**Goal:** [Clear, specific objective]

**Files:** 
- Source: `[source-path]` (if porting/migrating)
- Target: `[target-path]` (if creating new)

**Approach:** 
- [Step 1]
- [Step 2]
- [Step 3]

**Checkpoint:** 
- [What needs to be verified]
- [Quality criteria]
**Dependencies:**
- [Prerequisite tasks or files]
```

### Task Entry Template (For Session Log)

When logging a completed task:

```markdown
### Task 2.2.5.N: [Name] ✅
**Completed:** [Date]
**Goal:** [What was accomplished]

**Files Created:**
- `[path]` - [Description]

**Files Modified:**
- `[path]` - [Description]

**Key Methods/Functions:**
- `methodName()` - [Description]

**Architecture Notes:**
- **[Pattern]**: [Explanation]

**Questions Answered:**
- **[Question]** - [Answer]

**Next Task:**
- [2.2.5.N+1]: [Next task]
```

---

## Reference

### Document Responsibilities

- **Session Guide** (this file): Instructions for how to work (workflow, checkpoints, end-of-session)
- **Session Log**: Historical record of what happened (task entries, progress)
- **Session Handoff**: Transition context for next session (where we left off, what's next)

### Documentation Templates

**See `.cursor/commands/tiers/session/templates/session-log.md` for complete documentation templates.**

Templates include:
- Task entry format for session log
- Handoff document format

### Related Documents

- **Session Handoff:** `.project-manager/features/google-apis-integration/sessions/session-2.2.5-handoff.md` (transition context and planning)
- **Session Log:** `.project-manager/features/google-apis-integration/sessions/session-2.2.5-log.md` (historical record)
- **Phase Handoff:** `.project-manager/features/google-apis-integration/phases/phase-2.2-handoff.md` (phase-level context)

---

## Notes

- Orchestrator pattern allows prefetching data before it's needed, improving perceived performance
- Mode semantics clarification prevents confusion about when APIs are called vs when values are used
- Prefetched data pattern matches free-busy data source pattern (fetch always happens, mode controls usage)
- Month tracking ensures orchestrator re-runs when user navigates calendar, keeping data fresh
- Routes API calculations happen later in driveTimeCalculator using prefetched calendar events (not in orchestrator chain)

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

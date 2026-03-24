# Phase 2.0 Handoff: Calendar Configuration UI

**Feature:** Feature 2 - Google APIs Integration  
**Phase:** 2.0 - Calendar Configuration UI  
**Status:** ✅ Complete  
**Started:** 2026-01-31  
**Completed:** 2026-01-31  
**Last Updated:** 2026-01-31

---

## Phase Overview

**Phase Number:** 2.0  
**Phase Name:** Calendar Configuration UI  
**Description:** Build admin interface for configuring which calendars to check for free-busy calculations. This phase establishes the configuration foundation before API integration.

**Current Status:** ✅ Complete - All sessions done  
**Dependencies:** Feature 1 (Data Flow Alignment) ✅ Complete - Availability settings infrastructure exists

---

## Objectives

- ✅ Extend AvailabilitySettings interface with `CalendarConfig`
- ✅ Create calendar management UI in Business Controls tab with labeled fields
- ✅ Match calendar structure to existing mock data (`primary`, `work`, `personal`)
- ✅ Add email validation for calendar addresses
- ✅ Prepare for OAuth integration in Phase 2.1

---

## Sessions Overview

| Session | Name | Status |
|---------|------|--------|
| 2.0.1 | Calendar Configuration Data Structure | ✅ Complete |
| 2.0.2 | Calendar Management UI | ✅ Complete |
| 2.0.3 | Integration Preparation | ✅ Complete |

---

## Session Details

### Session 2.0.1: Calendar Configuration Data Structure
- Define `CalendarConfig` interface with labeled calendar fields
- Add `calendarConfig` property to `AvailabilitySettings` interface
- Add default values for calendar configuration
- Update `RawAvailabilitySettings` type
- Add email validation helper function
- Create helper to extract non-empty calendar emails as array

### Session 2.0.2: Calendar Management UI
- Add calendar configuration section to BusinessControlsTab
- Implement three labeled email input fields:
  - **Primary Calendar:** (auto-filled from OAuth user email when connected)
  - **Work Calendar:** (optional)
  - **Personal Calendar:** (optional)
- Add provider selection dropdown (Google, Outlook, None)
- Add enable/disable toggle for calendar integration
- Email validation on blur

### Session 2.0.3: Integration Preparation
- Update `getCalendarAvailability` to read calendar emails from settings
- Connect mock data generator to use configured calendars
- Add logging for calendar configuration usage
- Document integration points for Session 2.1.2

---

## Key Files

### Files to Modify
- `client/src/configs/availabilitySettings.ts` - Add CalendarConfig interface and property
- `client/src/views/admin/tabs/BusinessControlsTab.vue` - Add calendar configuration UI
- `client/src/utils/timeSlotCalculations.ts` - Update to read from settings

---

## Architecture Notes

### CalendarConfig Structure (Final Implementation)

The final implementation surpassed the original labeled-fields design with a dynamic CalendarEntry[] array supporting readFrom/writeTo permissions:

```typescript
// shared/types/calendarTypes.ts
type CalendarProvider = 'google' | 'outlook' | 'none'

interface CalendarEntry {
  email: string
  label?: string
  readFrom: boolean
  writeTo: boolean
}

interface CalendarConfig {
  enabled: boolean
  provider: CalendarProvider
  calendars: CalendarEntry[]
}
```

### Default Values

```typescript
const DEFAULT_CALENDAR_CONFIG: CalendarConfig = {
  enabled: false,
  provider: 'none',
  calendars: []
}
```

### Email Validation

- Validate on blur (not on every keystroke)
- Basic format check: `email@domain.tld`
- Allow empty strings (calendars are optional)

---

## Success Criteria

- [x] CalendarConfig interface defined (shared/types/calendarTypes.ts — dynamic CalendarEntry[] array)
- [x] AvailabilitySettings extended with calendarConfig
- [x] Default settings include empty calendar configuration
- [x] Admin can configure calendar emails via dynamic entry list with readFrom/writeTo permissions
- [x] Settings persist to database
- [x] Settings load correctly on page load
- [x] Email validation working
- [x] Provider dropdown functional
- [x] Enable/disable toggle functional
- [x] CalendarIntegrationPanel.vue extracted as reusable component
- [x] useCalendarEntries.ts composable for entry management

---

## Reference Documents

- **Feature Guide**: `../feature-google-apis-integration-guide.md`
- **Availability Settings**: `client/src/configs/availabilitySettings.ts`
- **Business Controls Tab**: `client/src/views/admin/tabs/BusinessControlsTab.vue`

---

**Phase Status:** ✅ Complete  
**All Sessions:** Complete (2.0.1, 2.0.2, 2.0.3)  
**Note:** Final implementation surpassed original plan — dynamic CalendarEntry[] array with readFrom/writeTo permissions replaced the static primary/work/personal labeled fields design.  
**Last Updated:** 2026-02-20

---

## Session records (integrated)

### Session 2.0.1

# Session 2.0.1 Handoff: Calendar Configuration Data Structure

**Feature:** Feature 2 - Google APIs Integration  
**Phase:** 2.0 - Calendar Configuration UI  
**Session:** 2.0.1 - Calendar Configuration Data Structure  
**Status:** In Progress  
**Started:** 2026-01-31  
**Last Updated:** 2026-01-31

---

### Session 2.0.2

# Session 2.0.2 Handoff: Calendar Management UI

**Feature:** Feature 2 - Google APIs Integration  
**Phase:** 2.0 - Calendar Configuration UI  
**Session:** 2.0.2 - Calendar Management UI  
**Status:** In Progress  
**Started:** 2026-01-31  
**Last Updated:** 2026-01-31

---

### Session 2.0.3

# Session 2.0.3 Handoff: Integration Preparation

**Feature:** Feature 2 - Google APIs Integration  
**Phase:** 2.0 - Calendar Configuration UI  
**Session:** 2.0.3 - Integration Preparation  
**Status:** In Progress  
**Started:** 2026-01-31  
**Last Updated:** 2026-01-31

---

## Session Overview

**Session Number:** 2.0.3  
**Session Name:** Integration Preparation  
**Description:** Prepare the existing availability code to read calendar emails from the new configuration, and document integration points for Session 2.1.2.

**Prerequisite:** Session 2.0.2 complete (Calendar Management UI)

---

## Objectives

- Update `getCalendarAvailability` to read calendar emails from settings
- Connect mock data generator to use configured calendars (instead of hardcoded)
- Add logging for calendar configuration usage
- Document integration points for Session 2.1.2

---

## Implementation Tasks

### Task 1: Find getCalendarAvailability Location
**Status:** ✅ Complete

- Located in `client/src/utils/timeSlotCalculations.ts`
- Uses `generateMockFreeBusyResponse` from `mockGoogleCalendar.ts`
- Currently synchronous, returns mock data

### Task 2: Update to Read Calendar Emails from Settings
**Status:** ✅ Complete

- Added import of `getCalendarEmailsArray` from availabilitySettings
- Function now reads `calendarConfig` from settings
- Falls back to `['primary', 'work', 'personal']` if no calendars configured

### Task 3: Update Mock Data Generator
**Status:** ✅ Complete (via Task 2)

- Mock generator now receives configured calendar emails via `calendarIds` parameter
- No changes needed to `mockGoogleCalendar.ts` - it already accepts `calendarIds`

### Task 4: Add Logging
**Status:** ✅ Complete

- Added `logger.debug` call showing:
  - Whether calendars are configured
  - Calendar IDs being used
  - Whether integration is enabled
  - Provider type

### Task 5: Document Integration Points
**Status:** ✅ Complete

See "Integration Points for Session 2.1.2" section below

---

## Key Files

### Files to Modify
- `client/src/utils/timeSlotCalculations.ts` - Update getCalendarAvailability
- Mock data generator file (TBD)

### Reference Files
- `client/src/configs/availabilitySettings.ts` - CalendarConfig and helpers

---

## Success Criteria

- [x] `getCalendarAvailability` reads from settings instead of hardcoded values
- [x] Mock data uses configured calendar emails
- [x] Console logs show calendar config being used
- [x] Integration points documented for Session 2.1.2

---

## Integration Points for Session 2.1.2

This section documents what Session 2.1.2 needs to change to connect real API data.

### Function Signature Changes

**`getCalendarAvailability`** in `client/src/utils/timeSlotCalculations.ts`
- **Current:** `function getCalendarAvailability(dateRange): Array<{start, end}>`
- **Session 2.1.2:** `async function getCalendarAvailability(dateRange, options): Promise<Array<{start, end}>>`
- **New parameter `options`:**
  ```typescript
  interface GetCalendarAvailabilityOptions {
    dataSource: 'real' | 'mock' | 'both' | 'none'
    forceRefresh?: boolean
  }
  ```

### New Files to Create

| File | Purpose |
|------|---------|
| `client/src/services/calendarApiService.ts` | Client-side service to call server API |

### Files to Modify

| File | Changes |
|------|---------|
| `client/src/utils/timeSlotCalculations.ts` | Make `getCalendarAvailability` async, add data source logic |
| `client/src/composables/booking/useBusyTimes.ts` | Add error/loading states, call async function |
| `client/src/components/booking/dev/DevPanelsContainer.vue` | Add data source toggle UI |

### Data Flow (Session 2.1.2)

```
User selects date in booking wizard
    ↓
useBusyTimes composable calls getCalendarAvailability()
    ↓
getCalendarAvailability checks dataSource option:
    - 'real': Call calendarApiService.fetchFreeBusy()
    - 'mock': Call generateMockFreeBusyResponse()
    - 'both': Merge both results
    - 'none': Return empty array
    ↓
calendarApiService.fetchFreeBusy():
    1. Check OAuth status (calendarApiService.checkOAuthStatus())
    2. If not authenticated: return error with authUrl
    3. POST to /api/v1/external/calendar/freebusy
    4. Transform response to BusyTimeRange[] format
    ↓
Return busy times to useBusyTimes
    ↓
Time slots filtered based on busy times
```

### Server Endpoints Available

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/external/oauth/status` | GET | Check if authenticated |
| `/api/v1/external/oauth` | GET | Start OAuth flow |
| `/api/v1/external/calendar/freebusy` | POST | Get free/busy data |

### Settings Integration

Session 2.0.3 prepared the following:
- `getCalendarEmailsArray(calendarConfig)` - Extracts non-empty calendar emails
- `calendarConfig.enabled` - Whether calendar integration is on
- `calendarConfig.provider` - Which provider (google/outlook/none)

Session 2.1.2 should:
1. Check `calendarConfig.enabled` before calling API
2. Use `getCalendarEmailsArray()` to get calendar emails for API request
3. Show "Calendar integration disabled" if `enabled === false`

---

**Session Status:** Complete  
**Last Updated:** 2026-01-31

## Session Overview

**Session Number:** 2.0.2  
**Session Name:** Calendar Management UI  
**Description:** Add calendar configuration UI to Business Controls tab with provider selection, enable/disable toggle, and email input fields for Primary/Work/Personal calendars.

**Prerequisite:** Session 2.0.1 complete (CalendarConfig interface defined)

---

## Objectives

- Add Calendar Integration section to BusinessControlsTab
- Implement provider dropdown (Google, Outlook, None)
- Implement enable/disable toggle
- Implement Primary/Work/Personal email input fields
- Add email validation on blur
- Ensure settings persist via existing save mechanism

---

## Implementation Tasks

### Task 1: Update useAvailabilitySettings Composable
**Status:** ✅ Complete

- Added `calendarConfig` to formData in loadSettings with DEFAULT_CALENDAR_CONFIG fallback
- Added `calendarConfig` to settingsToSave in saveSettings
- Imported DEFAULT_CALENDAR_CONFIG and CalendarConfig type

### Task 2: Add Calendar Integration Tab
**Status:** ✅ Complete

- Added "Integration" subtab to existing Calendar tab
- Changed default Calendar subtab to "integration"
- Added full Calendar Integration section UI

### Task 3: Implement Provider Dropdown
**Status:** ✅ Complete

- VSelect with calendarProviderOptions: None, Google Calendar, Microsoft Outlook
- Bound to calendarProvider computed property
- Disabled when integration is disabled

### Task 4: Implement Enable/Disable Toggle
**Status:** ✅ Complete

- VSwitch for enabled/disabled state
- Bound to calendarEnabled computed property
- Provider dropdown and email fields disabled when off

### Task 5: Implement Email Input Fields
**Status:** ✅ Complete

- Primary Calendar with mdi-calendar-account icon
- Work Calendar (Optional) with mdi-briefcase-clock icon
- Personal Calendar (Optional) with mdi-calendar-heart icon
- All bound to computed properties with DEFAULT_CALENDAR_CONFIG initialization

### Task 6: Add Email Validation
**Status:** ✅ Complete

- emailValidationRule using isValidCalendarEmail()
- validate-on="blur" for each email field
- Empty strings allowed (optional fields)

---

## Key Files

### Files to Modify
- `client/src/composables/admin/useAvailabilitySettings.ts` - Handle calendarConfig
- `client/src/views/admin/tabs/BusinessControlsTab.vue` - Add UI

---

## Success Criteria

- [x] Calendar Integration section visible in Business Controls
- [x] Provider dropdown works (Google/Outlook/None)
- [x] Enable/disable toggle works
- [x] Email inputs save to calendarConfig.calendars
- [x] Email validation shows errors for invalid emails
- [ ] Settings persist on save (needs testing)
- [ ] Settings load correctly on page refresh (needs testing)

---

**Session Status:** Implementation Complete - Ready for Testing  
**Last Updated:** 2026-01-31

## Session Overview

**Session Number:** 2.0.1  
**Session Name:** Calendar Configuration Data Structure  
**Description:** Define the CalendarConfig interface and add it to AvailabilitySettings. Create helper functions for email validation and extracting calendar emails.

**Prerequisite:** Feature 1 (Data Flow Alignment) complete

---

## Objectives

- Define `CalendarConfig` interface with labeled calendar fields
- Add `calendarConfig` property to `AvailabilitySettings` interface
- Add default values for calendar configuration
- Update `RawAvailabilitySettings` type
- Add email validation helper function
- Create helper to extract non-empty calendar emails as array

---

## Implementation Tasks

### Task 1: Define CalendarConfig Interface
**Status:** ✅ Complete

Add to `client/src/configs/availabilitySettings.ts`:

```typescript
/**
 * Calendar provider type
 * LEARNING: Identifies the calendar service provider
 * WHY: Supports multiple calendar providers (Google, Outlook)
 * PATTERN: Enum-like string literal union type
 */
export type CalendarProvider = 'google' | 'outlook' | 'none'

/**
 * Calendar configuration
 * LEARNING: Configuration for which calendars to check for free-busy data
 * WHY: Allows admin to configure multiple calendar sources
 * PATTERN: Labeled fields matching mock data IDs for consistency
 * 
 * Calendar labels match mock data IDs:
 * - primary: Main calendar (user's primary Google/Outlook calendar)
 * - work: Work calendar (optional)
 * - personal: Personal calendar (optional)
 */
export interface CalendarConfig {
  enabled: boolean
  provider: CalendarProvider
  calendars: {
    primary: string    // e.g., "will@districthomepro.com"
    work: string       // Optional, empty if not used
    personal: string   // Optional, empty if not used
  }
}
```

### Task 2: Add calendarConfig to AvailabilitySettings
**Status:** ⏳ Not Started

Update `AvailabilitySettings` interface:

```typescript
export interface AvailabilitySettings {
  // ... existing properties ...
  
  /**
   * Calendar configuration (optional)
   * LEARNING: Configuration for which calendars to check for free-busy data
   * WHY: Allows admin to configure calendar integration for availability checking
   * PATTERN: Optional nested object with enabled flag, provider, and calendar emails
   */
  calendarConfig?: CalendarConfig
}
```

### Task 3: Add Default CalendarConfig Values
**Status:** ✅ Complete

Add default values:

```typescript
/**
 * Default calendar configuration
 * LEARNING: Default values when no calendar config is set
 * WHY: Provides sensible defaults (disabled, no provider, empty emails)
 */
export const DEFAULT_CALENDAR_CONFIG: CalendarConfig = {
  enabled: false,
  provider: 'none',
  calendars: {
    primary: '',
    work: '',
    personal: ''
  }
}
```

### Task 4: Update RawAvailabilitySettings
**Status:** ✅ Complete

Add `calendarConfig` to `RawAvailabilitySettings` type:

```typescript
export interface RawAvailabilitySettings {
  // ... existing properties ...
  calendarConfig?: CalendarConfig
}
```

### Task 5: Add Email Validation Helper
**Status:** ⏳ Not Started

Create validation helper:

```typescript
/**
 * Validate email format
 * LEARNING: Basic email format validation
 * WHY: Ensures calendar emails are valid before saving
 * PATTERN: Returns true if valid or empty (optional fields)
 */
export function isValidCalendarEmail(email: string): boolean {
  if (!email || email.trim() === '') {
    return true  // Empty is valid (optional field)
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}
```

### Task 6: Create Calendar Emails Extraction Helper
**Status:** ✅ Complete

Create helper to get non-empty emails as array:

```typescript
/**
 * Extract non-empty calendar emails as array
 * LEARNING: Converts CalendarConfig.calendars object to string array
 * WHY: API calls need array of email strings, not labeled object
 * PATTERN: Filter out empty strings, return array
 */
export function getCalendarEmailsArray(config: CalendarConfig | undefined): string[] {
  if (!config || !config.enabled) {
    return []
  }
  
  const emails = [
    config.calendars.primary,
    config.calendars.work,
    config.calendars.personal
  ]
  
  return emails.filter(email => email && email.trim() !== '')
}
```

---

## Key Files

### Files to Modify
- `client/src/configs/availabilitySettings.ts` - Add all new types and helpers

---

## Success Criteria

- ✅ `CalendarProvider` type defined
- ✅ `CalendarConfig` interface defined with `enabled`, `provider`, `calendars`
- ✅ `AvailabilitySettings` interface extended with optional `calendarConfig`
- ✅ `RawAvailabilitySettings` updated with `calendarConfig`
- ✅ `DEFAULT_CALENDAR_CONFIG` constant exported
- ✅ `isValidCalendarEmail()` helper function working
- ✅ `getCalendarEmailsArray()` helper function working
- ✅ TypeScript compiles without errors (for this file)

---

## Reference Documents

- **Phase Handoff**: `../phases/phase-2.0-handoff.md`
- **Availability Settings**: `client/src/configs/availabilitySettings.ts`
- **Mock Calendar Data**: `client/src/utils/booking/mockGoogleCalendar.ts` (uses `primary`, `work`, `personal`)

---

**Session Status:** ✅ Complete  
**Last Updated:** 2026-01-31


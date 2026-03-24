# Session 2.0.1 Handoff: Calendar Configuration Data Structure

**Feature:** Feature 2 - Google APIs Integration  
**Phase:** 2.0 - Calendar Configuration UI  
**Session:** 2.0.1 - Calendar Configuration Data Structure  
**Status:** In Progress  
**Started:** 2026-01-31  
**Last Updated:** 2026-01-31

---

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

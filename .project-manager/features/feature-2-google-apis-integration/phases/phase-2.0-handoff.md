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

### CalendarConfig Structure

Matches mock data calendar IDs for consistency:

```typescript
interface CalendarConfig {
  enabled: boolean
  provider: 'google' | 'outlook' | 'none'
  calendars: {
    primary: string    // e.g., "will@districthomepro.com"
    work: string       // Optional, empty if not used
    personal: string   // Optional, empty if not used
  }
}
```

### Default Values

```typescript
const DEFAULT_CALENDAR_CONFIG: CalendarConfig = {
  enabled: false,
  provider: 'none',
  calendars: {
    primary: '',
    work: '',
    personal: ''
  }
}
```

### Email Validation

- Validate on blur (not on every keystroke)
- Basic format check: `email@domain.tld`
- Allow empty strings (calendars are optional)

---

## Success Criteria

- [ ] CalendarConfig interface defined
- [ ] AvailabilitySettings extended with calendarConfig
- [ ] Default settings include empty calendar configuration
- [ ] Admin can configure calendar emails via labeled fields
- [ ] Settings persist to database
- [ ] Settings load correctly on page load
- [ ] Email validation working
- [ ] Provider dropdown functional
- [ ] Enable/disable toggle functional

---

## Reference Documents

- **Feature Plan**: `../feature-plan.md`
- **Availability Settings**: `client/src/configs/availabilitySettings.ts`
- **Business Controls Tab**: `client/src/views/admin/tabs/BusinessControlsTab.vue`

---

**Phase Status:** In Progress  
**Current Session:** Session 2.0.1 Complete - Next: Session 2.0.2 (Calendar Management UI)  
**Last Updated:** 2026-01-31

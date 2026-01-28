# Feature 5: Google APIs Integration

**Feature:** Google APIs Integration  
**Status:** Planning  
**Created:** 2025-02-01  
**Last Updated:** 2025-01-07  
**Branch:** `feature/google-apis-integration`

---

## Overview

Integrate Google Calendar API (availability fetching, event creation), Google Maps API (address autocomplete, drive time), and MLS API (property data - deferrable). This feature provides the external API integration layer for the scheduling application.

**Target:** Functional API clients for Google Calendar, Google Maps, and MLS APIs with proper error handling and fallback strategies.

---

## Phase 5.0: Calendar Configuration UI (Prerequisite)

**Status:** Planning  
**Description:** Build admin interface for configuring which calendars to check for free-busy calculations. This phase establishes the configuration foundation before API integration.

### Objectives

- Extend AvailabilitySettings interface with calendar configuration
- Create calendar management UI in Business Controls tab
- Implement email list input and validation
- Prepare plugin architecture for multiple calendar providers
- Document integration points for OAuth flow (future)

### Key Files

- `client-vue/src/configs/availabilitySettings.ts` (extend interface)
- `client-vue/src/views/admin/tabs/BusinessControlsTab.vue` (add calendar section)
- `client-vue/src/utils/timeSlotCalculations.ts` (update to read from settings)
- `server/src/routes/internal/businessSettings/` (settings storage)

### Sessions

**Session 5.0.1: Calendar Configuration Data Structure**
- Extend AvailabilitySettings interface with CalendarConfig
- Define CalendarConfig type (provider, enabled, calendarEmails)
- Add calendarConfig to default settings
- Update API types for settings persistence
- Add validation for calendar email format

**Session 5.0.2: Calendar Management UI**
- Add calendar configuration section to BusinessControlsTab
- Implement email list input (textarea with validation)
- Add provider selection dropdown (Google, Outlook, None)
- Add enable/disable toggle for calendar integration
- Display connected calendars as removable chips
- Add informational alert for upcoming OAuth feature

**Session 5.0.3: Integration Preparation**
- Update getCalendarAvailability to read calendar emails from settings
- Create calendar provider plugin interface structure
- Add placeholder for calendar service factory pattern
- Document plugin interface for future provider implementations
- Add logging for calendar configuration usage

### Success Criteria

- [ ] CalendarConfig type defined with provider, enabled, calendarEmails fields
- [ ] AvailabilitySettings interface extended with calendarConfig
- [ ] Default settings include empty calendar configuration
- [ ] Admin can add/remove calendar emails via Business Controls tab
- [ ] Settings persist to database via business-settings API
- [ ] Settings load correctly on page load
- [ ] Email validation working (format check)
- [ ] Provider dropdown functional (Google, Outlook, None)
- [ ] Enable/disable toggle functional
- [ ] Structure ready for OAuth integration in Phase 5.1

### Architecture Notes

**Plugin Architecture:**
```
CalendarConfig
├── provider: 'google' | 'outlook' | 'none'
├── enabled: boolean
└── calendarEmails: string[]

Future Plugin Interface:
├── CalendarProvider (abstract)
│   ├── authenticate()
│   ├── getFreeBusy(emails, dateRange)
│   └── createEvent(eventData)
├── GoogleCalendarProvider (implements CalendarProvider)
└── OutlookCalendarProvider (implements CalendarProvider)
```

**Data Flow:**
```
BusinessControlsTab → API (PUT /business-settings) → Database
                                    ↓
getAvailabilitySettings() → CalendarConfig → getCalendarAvailability()
                                    ↓
            (Future) CalendarProvider.getFreeBusy() → busyTimes
```

### Dependencies

- Availability settings infrastructure exists (Phase complete in Data Flow Alignment)
- Business Controls tab exists (implemented)

### Questions to Resolve

1. Should calendar emails be validated against actual calendar accounts? (Defer to OAuth phase)
2. How should we handle calendar access permissions? (Defer to OAuth phase)
3. Should we support calendar groups/teams? (Future enhancement)
4. What's the fallback behavior when calendar API fails? (Document in Phase 5.1)

---

## Phase 5.1: Google Calendar API Integration

**Status:** Not Started  
**Description:** Integrate Google Calendar API for fetching availability and creating events.

### Objectives

- Set up Google Calendar API client
- Implement calendar availability fetching
- Implement event creation with invitations
- Handle error cases and fallbacks

### Key Files

- `client/src/scheduler/externalAPI/calendarCalls.ts` (React - reference)
- `client-vue/src/api/external/googleCalendar.ts` (new)
- `client-vue/src/composables/useGoogleCalendar.ts` (new)

### Sessions

**Session 5.1.1: Calendar Availability Fetching**
- **Prerequisite:** Phase 5.0 complete (calendar configuration available)
- Set up Google Calendar API client using plugin architecture from 5.0.3
- Read calendar emails from AvailabilitySettings.calendarConfig
- Implement OAuth flow for Google Calendar authentication
- Implement date range logic (1st-21st vs 22nd-end of month)
- Fetch busy times from configured calendars
- Extract unavailable time slots
- Extract event addresses for drive time calculations
- Extract home address from events
- Handle on-demand month fetching

**Session 5.1.2: Event Creation & Invitations**
- Create event creation function
- Map appointment data to calendar event format
- Add participant emails
- Set event titles based on service type
- Configure event permissions
- Send calendar invitations
- Handle multiple user types (Buyer, Agent, Owner, Inspector)

**Session 5.1.3: Error Handling & Fallbacks**
- Handle API authentication errors
- Handle rate limiting
- Handle network errors
- Implement fallback to manual availability entry
- Log errors for debugging
- Display user-friendly error messages

### Success Criteria

- Calendar availability fetched correctly
- Date ranges handled correctly (1st-21st vs 22nd-end)
- Events created correctly with invitations
- Error handling working with fallbacks
- Performance: API response times <2s

---

## Phase 5.2: Google Maps API Integration

**Status:** Not Started  
**Description:** Integrate Google Maps API for address autocomplete and drive time calculations.

### Objectives

- Set up Google Maps API client
- Implement address autocomplete
- Implement drive time calculations
- Handle error cases and fallbacks

### Key Files

- `client-vue/src/api/external/googleMaps.ts` (new)
- `client-vue/src/composables/useGoogleMaps.ts` (new)

### Sessions

**Session 5.2.1: Address Autocomplete**
- Set up Google Maps Places API client
- Implement address autocomplete input
- Handle autocomplete suggestions
- Extract address components
- Handle address selection
- Validate address completeness

**Session 5.2.2: Drive Time Calculations**
- Set up Google Maps Distance Matrix API client
- Calculate drive time FROM appointment address to busy event locations
- Calculate drive time TO appointment address FROM home
- Calculate drive time TO appointment address FROM previous appointment
- Calculate drive time TO next appointment FROM appointment address
- Calculate total drive time for day
- Integrate drive times into availability calculations

**Session 5.2.3: Error Handling & Fallbacks**
- Handle API errors gracefully
- Implement base drive time fallback
- Handle address autocomplete failures (manual entry)
- Log errors for debugging
- Display user-friendly error messages

### Drive-Time Buffer Plan Reference

- `/.cursor/plans/drive_time_buffer_implementation_d7bfd3a0.plan.md` (detailed implementation plan)

### Success Criteria

- Address autocomplete working correctly
- Drive times calculated correctly
- Drive times integrated into availability calculations
- Error handling working with fallbacks
- Performance: API response times <2s

---

## Phase 5.3: MLS API Integration

**Status:** Not Started (Deferrable)  
**Description:** Integrate MLS API to retrieve property data and auto-populate property details form.

**Prerequisites:**
- ✅ Property and Address table separation migration (Session 1.3.8) - Database structure must support versioned property details before MLS API integration. See: `../data-flow-alignment/sessions/session-1.3.8-guide.md`

### Objectives

- Research MLS API provider and documentation
- Set up MLS API client
- Implement property data retrieval
- Map MLS data to application data model (using PropertyDetails table)
- Implement versioning logic for property details
- Auto-populate property details form
- Handle error cases and fallbacks

### Key Files

- `client-vue/src/api/external/mls.ts` (new)
- `client-vue/src/composables/useMLS.ts` (new)
- `server/src/services/propertyVersionService.ts` (new - version selection logic)
- `server/src/services/propertyDetailsService.ts` (new - version management)

### Sessions

**Session 5.3.0: Database Migration (Prerequisite)**
- Complete Property and Address table separation migration
- See: `../data-flow-alignment/sessions/session-1.3.8-guide.md`
- Migrate existing Property data to Address + PropertyVersion + PropertyDetails structure
- Update API endpoints and frontend components
- Verify all relationships working correctly

**Session 5.3.1: MLS API Client Setup**
- Research MLS API provider and documentation
- Set up API client
- Implement authentication
- Create API request/response types
- Test API connection

**Session 5.3.2: Property Data Retrieval & Versioning**
- Create property lookup function (by address)
- Map MLS dwelling type to application property type
- Extract total square footage (above + below grade)
- Extract foundation type
- Extract ADU information (presence and number)
- Implement versioning logic (create new PropertyDetails version when API data changes)
- Implement version selection logic (select active PropertyDetails)
- Auto-populate property details form
- Handle partial data scenarios

**Session 5.3.3: Error Handling & Fallbacks**
- Handle API errors gracefully
- Handle property not found scenarios
- Prompt user to input required information manually
- Handle version conflicts (API vs manual data)
- Log errors for debugging
- Display user-friendly error messages

### Success Criteria

- Database migration completed successfully (Session 5.3.0)
- MLS API client functional
- Property data retrieved and mapped correctly
- Versioning logic implemented and working
- Version selection logic working correctly
- Property details form auto-populated
- Error handling working with fallbacks
- User prompted for manual input on failure
- Version conflicts handled gracefully

### Note

This phase is **deferrable** - MLS API integration can be deferred with manual entry fallback. It's not critical for MVP.

---

## Reference Documents

- **Old Project Plan**: `project-manager/archive/project-plan.md.old` (Feature 4: API Integration Layer)
- **React Calendar Calls**: `client/src/scheduler/externalAPI/calendarCalls.ts` (reference)
- **USER_STORY.md**: Address autocomplete and MLS auto-population requirements

---

## Dependencies

- Feature 0: Vue.js Migration (Core Complete)
- Feature 1: Data Flow Alignment (recommended, provides availability settings infrastructure)

### Internal Phase Dependencies

- Phase 5.0 → Phase 5.1 (Calendar config required before API integration)
- Phase 5.0 → Phase 5.2 (Calendar config may inform Maps integration)
- Phase 5.1 → Phase 5.3 (Calendar integration before MLS, though MLS is independent)

---

## Success Metrics

- Google Calendar API integrated and working
- Google Maps API integrated and working
- MLS API integrated (if implemented)
- Error handling working with fallbacks
- API response times <2s
- Fallback mechanisms working correctly

---

## Fallback Plans

- **Google Calendar API fails** → Manual availability entry mode
- **Google Maps API fails** → Manual address entry (no autocomplete)
- **MLS API fails** → Manual property details entry
- All fallbacks documented and implemented

---

**Last Updated:** 2025-01-07  
**Status:** Planning - Phase 5.0 Ready for Implementation


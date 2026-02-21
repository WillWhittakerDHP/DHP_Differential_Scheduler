# Feature 3: Calendar & Appointment Availability

**Feature:** Calendar & Appointment Availability  
**Status:** Complete ✅  
**Created:** 2025-02-01  
**Last Updated:** 2026-02-21  
**Branch:** `feature/calendar-appointment-availability` (Phase 3.5); earlier work on `feature/google-apis-integration` (Phases 3.1–3.4)

---

## Overview

Server-side slot computation, client-side calendar UI, time slot selection, and differential scheduling — all functional for the booking workflow. Users can view available appointment times, select time slots, and the system supports differential scheduling where inspector and client arrive at different times.

**Scope:** Full availability pipeline from server constraint computation through client calendar UI to slot selection in the booking wizard. Includes capacity management, drive time integration, constraint-based filtering, and differential scheduling visualization.

**Target:** Complete calendar and availability system for the booking workflow, including event creation/editing UI.

---

## Objectives

- Compute available appointment slots server-side using calendar events, drive times, and business constraints
- Display available dates and time slots in a responsive calendar UI
- Support differential scheduling (major/minor service perspectives with offset arrival times)
- Integrate availability into the booking wizard as a complete step with validation
- Provide admin-configurable availability settings (capacity limits, lead times, overlap rules)
- Support calendar event creation and editing from the availability UI

---

## Phase 3.1: Server-Side Slot Computation

**Status:** ✅ Complete  
**Description:** Build the server-side availability pipeline that computes appointment slots using calendar events, drive times, and business constraints.

### Key Files

**Services:**
- `server/src/services/computedAvailabilityService.ts` — Main orchestrator (419 lines)
- `server/src/services/slotComputationService.ts` — Slot generation with constraint checking
- `server/src/services/capacityComputer.ts` — Pre-computes scheduled hours (daily, calendar week, rolling week)
- `server/src/services/constraintExtractor.ts` — Extracts range, overlap, and capacity constraints from DB settings

**Routes:**
- `server/src/routes/internal/availabilityRouter.ts` — `POST /api/v1/internal/availability/computed-data`
- `server/src/routes/internal/availabilityValidators.ts` — Request validation
- `server/src/routes/internal/availabilityConstants.ts` — Route constants

**Utilities:**
- `server/src/utils/availabilities/availabilityPrimitives.ts` — Core availability primitives
- `server/src/utils/availabilities/availabiltiesDbUtils.ts` — Database utilities

**Shared:**
- `shared/types/availabilityTypes.ts` — Shared type definitions
- `shared/utils/constraintUtils.ts` — Constraint utility functions
- `shared/utils/capacityKeyUtils.ts` — Capacity key generation
- `shared/constants/constraintConstants.ts` — Constraint constants

### What Was Built
- Orchestrator fetches settings, extracts constraints, fetches calendar events, calculates drive times
- Pre-computes capacity (daily, calendar week, rolling week)
- Generates slots with range/overlap/capacity constraint checking
- Violation keys for each constraint type (range.leadTime, overlap.event.direct, capacity.daily, etc.)
- Integration with Google Calendar API and Google Maps drive time

### Success Criteria — All Met
- Server computes available slots from business constraints
- Calendar events and drive times factored into availability
- Capacity limits enforced (daily, weekly, rolling)
- Lead time and date range constraints applied
- Overlap prevention with existing events

---

## Phase 3.2: Client-Side Calendar UI

**Status:** ✅ Complete  
**Description:** Build the client-side calendar component displaying available dates and time slots with Vuetify date picker integration.

### Key Files

**Components:**
- `client/src/components/booking/steps/AvailabilityCalendarSection.vue` — Vuetify date picker with differential graph display
- `client/src/components/booking/steps/AvailabilityStep.vue` — Full availability step for booking wizard
- `client/src/components/booking/steps/AvailabilityOptionsSection.vue` — Options section

**Composables:**
- `client/src/composables/booking/useComputedAvailability.ts` — Server slot fetching with 14-day prefetch
- `client/src/composables/booking/useAvailabilityOrchestrator.ts` — Coordinates all availability step composables
- `client/src/composables/booking/useAvailabilityLogic.ts` — Date range calculations, differential detection, slot grouping
- `client/src/composables/booking/useAvailabilityUI.ts` — UI state management
- `client/src/composables/booking/useAvailabilitySlotColor.ts` — Slot color coding
- `client/src/composables/booking/useAvailabilityEmptyState.ts` — Empty state handling
- `client/src/composables/booking/useAvailabilityDefaults.ts` — Default values
- `client/src/composables/booking/useAvailabilityValidation.ts` — Step validation
- `client/src/composables/booking/useAvailabilityStepData.ts` — Step data management
- `client/src/composables/booking/useAvailabilityStepHandlers.ts` — Step event handlers
- `client/src/composables/booking/useAvailabilityDevPanel.ts` — Dev panel debugging
- `client/src/composables/booking/useAvailabilitySettings.ts` — Settings integration
- `client/src/composables/useAvailability.ts` — Legacy availability composable

**Utilities:**
- `client/src/utils/booking/availabilityStepData.ts` — Step data utilities
- `client/src/utils/booking/timeSlotMatching.ts` — Slot matching logic
- `client/src/utils/booking/minimalSlotGenerator.ts` — Minimal slot generation
- `client/src/utils/booking/timeSlotTypes.ts` — Time slot type definitions
- `client/src/utils/booking/slotTimeUtils.ts` — Slot time helpers
- `client/src/utils/booking/slotShapeLookups.ts` — Shape lookup utilities
- `client/src/utils/booking/slotGenerationValidation.ts` — Generation validation
- `client/src/utils/booking/constraintColors.ts` — Constraint color mapping
- `client/src/utils/api/availabilityApi.ts` — API client

**Types & Config:**
- `client/src/types/availability.ts` — Client availability types
- `client/src/types/availabilityStepParams.ts` — Step parameter types
- `client/src/types/availabilitySettingsParams.ts` — Settings parameter types
- `client/src/configs/availabilitySettings.ts` — Settings configuration
- `client/src/constants/availabilitySettings.ts` — Settings constants
- `client/src/constants/constraintTypes.ts` — Constraint type constants

**Admin:**
- `client/src/composables/admin/useAvailabilitySettings.ts` — Admin availability settings
- `client/src/composables/admin/useCapacitySettings.ts` — Admin capacity settings
- `client/src/composables/admin/useBufferSettings.ts` — Admin buffer settings

### What Was Built
- Vuetify date picker with differential graph bars
- 14-day prefetch for smooth UX (watches placeId/duration changes)
- Per-day fallback when server returns partial data
- Orchestrator pattern coordinating 10+ composables
- Slot color coding and constraint visualization
- Empty state handling and validation
- Admin settings integration for capacity, buffers, and availability rules

### Success Criteria — All Met
- Calendar displays available dates and time slots
- Date navigation and selection working
- Time slots displayed in user-friendly format with color coding
- Responsive design for mobile and desktop
- 14-day prefetch for smooth interaction

---

## Phase 3.3: Differential Scheduling & Slot Selection

**Status:** ✅ Complete  
**Description:** Implement differential scheduling calculations and time slot selection with appointment shape integration.

### Key Files

- `client/src/composables/booking/useAppointmentSlots.ts` — Applies appointment shape to slots, handles major/minor perspectives
- `client/src/utils/booking/appointmentSlotBuilder.ts` — Builds appointment slot structures

### What Was Built
- Appointment shape applied to available slots
- Major/minor perspective differential scheduling (inspector vs. client arrival times)
- Graph bars visualization for differential time display
- Slot selection state management integrated with wizard state
- Validation before proceeding to next step

### Success Criteria — All Met
- Inspector and client arrival times calculated correctly
- Differential time offsets displayed clearly
- Graph bar visualization working
- Slot selection stored in wizard state
- Edge cases handled (same time, invalid times)

---

## Phase 3.4: Wizard Integration & End-to-End Flow

**Status:** ✅ Complete  
**Description:** Integrate the availability system into the booking wizard as a complete step.

### End-to-End Flow (Working)
1. User selects property → `candidatePlaceId` extracted
2. User selects services → `duration` calculated from block instances
3. `useComputedAvailability` watches placeId/duration → triggers 14-day prefetch
4. Server computes slots (constraints, calendar events, drive times, capacity)
5. Client displays calendar with available dates and time slots
6. User selects date → orchestrator gets slots for that day
7. `useAppointmentSlots` applies appointment shape → displays slots with differential info
8. User selects slot → stored in wizard state

### Success Criteria — All Met
- Calendar integrated into AvailabilityStep
- Availability logic connected to wizard state
- Selected time slots available in confirmation step
- Navigation working correctly
- Validation enforced before proceeding

---

## Phase 3.5: Calendar Invite Configuration & Wiring

**Status:** ✅ Complete (2026-02-21, 4 sessions)  
**Description:** Configurable calendar invite creation from EventInstance entities. Admin configures Google Calendar event properties (visibility, guest permissions, Meet links, free/busy, etc.) and content templates with `{variable}` placeholders. The invite pipeline resolves templates, determines per-shape attendees, and creates Google Calendar events when appointments reach submitted/confirmed status.

### Key Files

**Invite Pipeline (new):**
- `server/src/services/invites/inviteOrchestrationService.ts` — Central pipeline: appointment → EventInstances → templates → attendees → Google Calendar
- `server/src/services/invites/templateResolver.ts` — `{variable}` placeholder resolution
- `server/src/services/invites/inviteContextBuilder.ts` — Builds context from appointment/property/service data

**Model & Migration:**
- `server/src/db/models/booking/event_instance.ts` — 10 new calendar property fields
- `server/src/db/migrations/20260221_000001_add_event_instance_calendar_properties.mjs`
- `server/src/db/migrations/20260221_000002_seed_event_instance_calendar_metadata.mjs`

**Admin UI:**
- `client/src/views/admin/tabs/InstancesTab.vue` — EventInstance creation form with all configurable fields, template variable help panel, and validation

**Integration:**
- `server/src/routes/internal/appointments/appointmentCrudRouter.ts` — afterCreate + afterUpdate hooks trigger invite creation
- `server/src/services/google/calendar/eventCreationService.ts` — Passes all EventInstance properties to Google Calendar API

### What Was Built
- 10 Google Calendar event properties added to EventInstance model (visibility, transparency, guest permissions, conference link, send updates, color, status, reminders)
- Admin UI with VSelect/VSwitch/VTextField controls organized into 4 sections
- Template variable system: `{streetAddress}`, `{service}`, `{appointmentDate}`, etc. (10 variables)
- Expandable template variable reference panel in admin form
- Real-time validation warnings for unrecognized template variables
- Invite orchestration pipeline traversing appointment → block instances → part assignments → event assignments → event instances
- Per-shape attendee determination via EventShapeAttendee
- Failed attendee tracking (invitationStatus: 'failed')
- Status transition trigger (afterUpdate hook for submitted/confirmed, with duplicate prevention)
- Fallback behavior when no EventInstances configured

### Success Criteria — All Met
- EventInstance calendar properties configurable from admin UI
- Template variables resolved at invite time with appointment context
- Calendar invites created automatically on appointment creation/status change
- Per-shape attendee filtering working via EventShapeAttendee
- Failure tracking and graceful degradation working

---

## Existing Tests

- `server/src/utils/availabilities/__tests__/availabilityPrimitives.test.ts`
- `server/src/services/__tests__/slotComputationService.test.ts`
- `server/src/services/__tests__/constraintExtractor.test.ts`
- `client/src/composables/booking/__tests__/useAvailabilityStepData.test.ts`
- `client/src/composables/booking/__tests__/useAvailabilityLogic.test.ts`
- `client/src/composables/booking/__tests__/useAvailabilitySettings.test.ts`
- `client/src/composables/booking/__tests__/useAvailabilityValidation.test.ts`
- `client/src/composables/booking/__tests__/useAvailabilityUI.test.ts`
- `client/src/composables/booking/__tests__/useAvailabilityDefaults.test.ts`
- `client/src/composables/__tests__/useAvailability.test.ts`
- `client/src/utils/booking/__tests__/availabilityStepData.test.ts`
- `client/src/utils/booking/__tests__/appointmentSlotBuilder.test.ts`
- `client/src/utils/booking/__tests__/timeSlotMatching.test.ts`

---

## Dependencies

- Feature 0: Vue.js Migration (✅ Complete)
- Feature 1: Data Flow Alignment (✅ Complete)
- Feature 2: Google APIs Integration (✅ Complete — Calendar and Maps APIs)

---

## Success Metrics

- ✅ Server computes available slots from business constraints, calendar events, and drive times
- ✅ Calendar UI displays available dates and time slots with differential visualization
- ✅ Time slot selection working correctly with wizard state integration
- ✅ Differential scheduling calculations working (major/minor perspectives)
- ✅ Availability step integrated into booking wizard with validation
- ✅ Calendar invite creation pipeline — configurable EventInstance properties, template resolution, per-shape attendees, automatic triggers on appointment status

---

**Last Updated:** 2026-02-21  
**Status:** Complete — All Phases (3.1–3.5) Finished

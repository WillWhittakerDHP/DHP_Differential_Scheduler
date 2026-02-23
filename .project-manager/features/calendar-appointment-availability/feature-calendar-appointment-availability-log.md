# Feature calendar-appointment-availability Log

**Purpose:** Track feature-level progress, decisions, and blockers

**Tier:** Feature (Tier 0 - Highest Level)

---

## Feature Status

**Feature:** calendar-appointment-availability
**Status:** Reopened (Phases 3.1–3.5)
**Started:** 2025-02-01
**Completed:** 2026-02-21

---

## Research Phase

### Research (conducted during Feature 2 integration)
**Status:** Complete
**Key Findings:**
- Server-side computation preferred over client-side for security and consistency
- 14-day prefetch strategy provides smooth UX without excessive API calls
- Orchestrator pattern needed to coordinate 10+ composables
- Vuetify date picker provides built-in responsive design

**Decisions Made:**
- Use server-side slot computation with constraint-based filtering
- Implement violation key system for extensibility (reused by Feature 6.7)
- Use orchestrator pattern for composable coordination

---

## Completed Phases

### Phase 3.1: Server-Side Slot Computation ✅
**Completed:** ~2026-01 (built alongside Feature 2)
**Key Accomplishments:**
- `computedAvailabilityService.ts` — Main orchestrator (419 lines)
- `slotComputationService.ts` — Slot generation with constraint checking
- `capacityComputer.ts` — Pre-computes scheduled hours
- `constraintExtractor.ts` — Extracts constraints from DB settings
- `availabilityRouter.ts` — API endpoint
- Shared types in `shared/types/availabilityTypes.ts`

**Decisions Made:**
- Violation key system: `range.leadTime`, `overlap.event.direct`, `capacity.daily`, etc.
- Three capacity types: daily, calendar week, rolling week

### Phase 3.2: Client-Side Calendar UI ✅
**Completed:** ~2026-01 (built alongside Feature 2)
**Key Accomplishments:**
- Vuetify date picker with differential graph bars
- 14-day prefetch with per-day fallback
- Orchestrator pattern coordinating 10+ composables
- Slot color coding and constraint visualization
- Admin-configurable settings (capacity, buffers, availability rules)

**Decisions Made:**
- Orchestrator composable pattern over monolithic composable
- 14-day prefetch balances UX with API efficiency

### Phase 3.3: Differential Scheduling & Slot Selection ✅
**Completed:** ~2026-01 (built alongside Feature 2)
**Key Accomplishments:**
- Appointment shape applied to available slots
- Major/minor perspective differential scheduling
- Graph bar visualization
- Slot selection integrated with wizard state

### Phase 3.4: Wizard Integration & End-to-End Flow ✅
**Completed:** ~2026-01 (built alongside Feature 2)
**Key Accomplishments:**
- Complete end-to-end flow from property selection to slot selection
- Validation and navigation working
- Selected time slots available in confirmation step

---

## Completed Phases (continued)

### Phase 3.5: Calendar Invite Configuration & Wiring ✅
**Started:** 2026-02-21
**Completed:** 2026-02-21
**Dependencies:** Feature 7 (Authentication) for attendee user lookup

#### Session 3.5.1: EventInstance Model Extension & Migration ✅
**Completed:** 2026-02-21
**Accomplishments:**
- Wrote migration adding 10 Google Calendar property columns to `event_instances` (visibility, transparency, guestsCanModify, guestsCanInviteOthers, guestsCanSeeOtherGuests, addConferenceLink, sendUpdates, colorId, status, reminderOverrides)
- Updated `EventInstance` Sequelize model with all new fields
- Updated client-side `EventInstanceEntity` type definition
- Added field configs (`eventInstanceFields.ts`) and display configs (`eventInstanceDisplays.ts`)
- Extended `CreateEventParams` type with new optional fields + `ReminderOverride` interface
- Updated `eventCreationService.createEvent()` to pass all new fields to Google Calendar API (including `conferenceData` for Meet links, `reminders.overrides`, guest permissions)
- Migration ran cleanly; all 10 existing event instances received correct defaults
- Server TypeScript compiles clean, client lints clean, app starts successfully

#### Session 3.5.2: Admin UI — EventInstance Configuration Form ✅
**Completed:** 2026-02-21
**Accomplishments:**
- Updated `InstancesTab.vue` inline EventInstance creation form with all 10 new fields
- Added Vuetify form controls: `VSelect` for visibility/transparency/sendUpdates/status, `VSwitch` for guestsCanModify/guestsCanInviteOthers/guestsCanSeeOtherGuests/addConferenceLink, `VTextField` for colorId
- Organized form into logical sections: Content Templates, Display & Status, Guest Permissions, Notifications & Conferencing
- Updated `newEventInstanceData` reactive ref and `handleEventInstanceCreate` to include all new fields
- Seeded 10 `admin_metadata` records via migration (`20260221_000002_seed_event_instance_calendar_metadata.mjs`) so EntityCards display new properties
- Fixed migration data_type enum issue (database uses `string`/`boolean`, not `primitive`)
- Client lints clean, server compiles clean, app starts successfully

#### Session 3.5.3: Template Variable Resolution & Invite Pipeline Wiring ✅
**Completed:** 2026-02-21
**Accomplishments:**
- Created `templateResolver.ts` — pure utility for `{variable}` placeholder substitution with `resolveTemplate()`, `resolveEventTemplates()`, and `extractTemplateVariables()` functions
- Created `inviteContextBuilder.ts` — builds flat `Record<string, string>` context from appointment data (10 variables: streetAddress, city, state, zipCode, fullAddress, appointmentDate, appointmentTime, appointmentId, status, service) with documented `AVAILABLE_TEMPLATE_VARIABLES` export
- Created `inviteOrchestrationService.ts` — central pipeline that: fetches appointment → collects block instance IDs → resolves EventInstances via `part_assignments` → `event_assignments` → for each active EventInstance resolves templates + determines per-shape attendees via `EventShapeAttendee` → calls `createEvent()` with all calendar properties → updates `AppointmentAttendee` records with `googleEventId` and `invitationStatus: 'sent'`
- Fallback behavior preserved: when no EventInstances are found, creates a single legacy event matching old `appointmentCalendarService` behavior
- Wired `createInvitesForAppointment()` into `appointmentCrudRouter.ts` afterCreate hook, replacing the old `createCalendarEventForAppointment()` import
- Server TypeScript compiles clean, server lints clean, app starts successfully

#### Session 3.5.4: Polish, Edge Cases & Validation ✅
**Completed:** 2026-02-21
**Accomplishments:**
- Added expandable template variable help panel to `InstancesTab.vue` with a VTable showing all 10 available `{variables}`, descriptions, and examples
- Fixed template field hint text to use real variable names (was `{clientName}`/`{propertyAddress}`, now `{service}`/`{streetAddress}`)
- Added computed template validation warnings — highlights unrecognized `{variables}` in real-time as the admin types
- Updated `inviteOrchestrationService.ts` to mark `AppointmentAttendee.invitationStatus` as `'failed'` when event creation fails (was only logged)
- Added calendar invite trigger to `afterUpdate` hook in `appointmentCrudRouter.ts` — PATCHing status to `submitted`/`confirmed` now creates invites (with duplicate prevention: skips if any attendee already has `invitationStatus: 'sent'`)
- Server + client lint clean, TypeScript compiles, app starts successfully

---

## Key Decisions

### Decision: Server-Side Computation
**Context:** Whether to compute availability slots on server or client
**Decision:** Server-side computation
**Rationale:** Security (constraints not exposed to client), consistency (single source of truth), reduced client bundle size
**Impact:** All slot computation happens in `computedAvailabilityService.ts`; client receives pre-computed slots

### Decision: Violation Key System
**Context:** How to represent why a slot is blocked
**Decision:** String-based violation keys (e.g. `range.leadTime`, `capacity.daily`)
**Rationale:** Extensible, human-readable, can be stored in DB for override tracking
**Impact:** Reused by Feature 6.7 (Force-Create) for constraint override records

### Decision: 14-Day Prefetch
**Context:** How much availability data to fetch upfront
**Decision:** 14-day sliding window with per-day fallback
**Rationale:** Balances smooth UX (no loading on date change) with API efficiency
**Impact:** `useComputedAvailability.ts` watches placeId/duration changes and auto-fetches

---

## Feature Checkpoints

### Checkpoint 2026-02-21 (Feature Start)
**Phases Completed:** 3.1, 3.2, 3.3, 3.4
**Status:** On track — 4 of 5 phases complete
**Notes:** Feature formally started with workflow management. Core availability system fully functional.
**Git Branch:** `feature/calendar-appointment-availability`
**Baseline Audit:** comments 50/100, security 0/100, planning 80/100, docs 85/100, vue-architecture 0/100

---

## Next Steps

- Phase 3.5 complete — all 4 sessions finished
- Feature 3 (Calendar & Appointment Availability) is now functionally complete (Phases 3.1–3.5)
- Next: configure EventInstance templates with real content (e.g., `{service} at {streetAddress}`)
- Future enhancement: status transition calendar event updates (reschedule, cancel existing events)

---

## Related Documents

- Feature Guide: `.project-manager/features/calendar-appointment-availability/feature-calendar-appointment-availability-guide.md`
- Feature Handoff: `.project-manager/features/calendar-appointment-availability/feature-calendar-appointment-availability-handoff.md`
- Feature Guide: `.project-manager/features/calendar-appointment-availability/feature-calendar-appointment-availability-guide.md`
- PROJECT_PLAN.md: Feature 3 section


## Reopen - 2026-02-22
**Reason:** Additional work needed
**Status:** Reopened

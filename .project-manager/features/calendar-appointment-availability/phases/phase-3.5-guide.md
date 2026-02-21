# Phase 3.5 Guide: Calendar Invite Configuration & Wiring

**Purpose:** Make EventInstance entities fully configurable with all Google Calendar event properties, and wire the invite creation pipeline from admin configuration → template resolution → Google Calendar API.

**Tier:** Phase (Tier 1 - High-Level)

---

## Phase Overview

**Phase Number:** 3.5
**Phase Name:** Calendar Invite Configuration & Wiring
**Description:** The EventInstance/EventShape/EventAssignment data model already exists and the Google Calendar event creation API works. But EventInstances currently only store title/description/location templates (all empty), and none of the Google Calendar behavior settings (free/busy, guest permissions, Meet links, send updates, visibility, etc.) are configurable. This phase adds those configurable properties to the EventInstance model, exposes them in the admin Instances tab UI, and wires the full pipeline so that when an appointment reaches the right status, the system resolves templates, determines attendees, and fires calendar invites through the existing `eventCreationService.createEvent()`.

**Duration:** Estimated 3–4 sessions
**Status:** Not Started

---

## Phase Objectives

1. Extend `EventInstance` with all Google Calendar configurable properties (guest permissions, visibility, transparency, conferencing, color, sendUpdates, reminders)
2. Update the admin Instances tab Events UI to expose these new properties when creating/editing EventInstances
3. Build template variable resolution (turning `{service}`, `{propertyAddress}`, etc. into real values from appointment/booking data)
4. Wire the full invite pipeline: appointment status change → resolve EventInstance templates → determine attendees via EventShapeAttendee → call `createEvent()` → track status on AppointmentAttendee

---

## Context: What Already Exists

### Data Model (all tables exist with data)

| Entity | Table | Purpose | Status |
|---|---|---|---|
| **EventShape** | `event_shapes` | Event type categories (Total Time, Moveable Part, Client Presentation) | ✅ 3 shapes configured, has `isTernary` / `ternaryDefault` |
| **EventInstance** | `event_instances` | Concrete event templates with title/description/location | ⚠️ 10 instances exist but templates are all empty strings; **missing all Google Calendar behavior fields** |
| **EventAssignment** | `event_assignments` | Many-to-many linking partInstances/blockInstances to EventInstances | ✅ 5 assignments configured |
| **EventShapeAttendee** | `event_shape_attendees` | Template config: which user type BlockInstances attend which event shapes | ✅ 6 attendee configs across 3 shapes |
| **AppointmentAttendee** | `appointment_attendees` | Actual users for actual appointments with `shouldReceiveInvitation`, `invitationStatus`, `googleEventId` | ✅ Model exists, ready for invite tracking |

### Server-Side Services

- `server/src/services/google/calendar/eventCreationService.ts` — `createEvent()` with rate limiting, retry, cache invalidation
- `server/src/services/google/calendar/calendarTypes.ts` — `CreateEventParams` and `CreatedEventResponse` types
- `server/src/services/google/calendar/calendarConstants.ts` — `DEFAULT_SEND_UPDATES` hardcoded to `'all'`

### Admin UI

- `client/src/views/admin/tabs/InstancesTab.vue` — Events tab with EventInstance CRUD (create form has name, eventShapeRef, titleTemplate, descriptionTemplate, locationTemplate)
- EventInstance EntityCards render existing instances with drag-and-drop ordering

---

## Gap Analysis: EventInstance Fields vs Google Calendar API

### Currently on EventInstance model
- `name` ✅
- `titleTemplate` ✅ (empty)
- `descriptionTemplate` ✅ (empty)
- `locationTemplate` ✅ (empty)
- `eventShapeRef`, `orderIndex`, `active` ✅

### Missing — Google Calendar Event Properties to Add

| Property | Google API Field | Type | Default | What It Controls |
|---|---|---|---|---|
| `visibility` | `visibility` | `'default' \| 'public' \| 'private' \| 'confidential'` | `'default'` | Who can see the event |
| `transparency` | `transparency` | `'opaque' \| 'transparent'` | `'opaque'` | Whether event blocks time (busy) or not (free) |
| `guestsCanModify` | `guestsCanModify` | `boolean` | `false` | Can attendees edit the event |
| `guestsCanInviteOthers` | `guestsCanInviteOthers` | `boolean` | `true` | Can attendees add other people |
| `guestsCanSeeOtherGuests` | `guestsCanSeeOtherGuests` | `boolean` | `true` | Can attendees see the guest list |
| `addConferenceLink` | `conferenceData` | `boolean` | `false` | Auto-attach a Google Meet link |
| `sendUpdates` | `sendUpdates` | `'all' \| 'externalOnly' \| 'none'` | `'all'` | Whether to send email invitations |
| `colorId` | `colorId` | `string \| null` | `null` | Google Calendar event color (1–11) |
| `status` | `status` | `'confirmed' \| 'tentative'` | `'confirmed'` | Event confirmation status |
| `reminderOverrides` | `reminders.overrides` | `JSON \| null` | `null` | Custom reminder settings (minutes before, method) |

---

## Sessions Breakdown

### Session 3.5.1: EventInstance Model Extension & Migration ✅
**Status:** Complete (2026-02-21)
**Description:** Add all missing Google Calendar properties to the EventInstance model (DB migration, Sequelize model, shared types, entity config).

**Tasks:**
- [x] Write Sequelize migration to add new nullable columns to `event_instances` with sensible defaults
- [x] Update `EventInstance` Sequelize model (`server/src/db/models/booking/event_instance.ts`)
- [x] Update shared/client EventInstance type definitions
- [x] Update entity registry / field configs for the new properties
- [x] Extend `CreateEventParams` in `calendarTypes.ts` to include the new fields
- [x] Update `eventCreationService.createEvent()` to pass new fields to the Google API
- [x] Verify migration runs cleanly and existing 10 event instances get correct defaults

**Learning Goals:**
- Understand how Sequelize migrations add columns to existing tables with data
- Learn how the Google Calendar API `events.insert` resource fields map to your model
- See how entity registry and field configs work together

---

### Session 3.5.2: Admin UI — EventInstance Configuration Form ✅
**Status:** Complete (2026-02-21)
**Description:** Update the Events section of the Instances tab so all new properties are configurable when creating and editing EventInstances.

**Tasks:**
- [x] Update the EventInstance inline creation form (the `VExpansionPanel` in `InstancesTab.vue`) with new fields
- [x] Add appropriate Vuetify form controls: `VSelect` for enums (visibility, transparency, sendUpdates, status), `VSwitch` for booleans (guestsCanModify, guestsCanInviteOthers, guestsCanSeeOtherGuests, addConferenceLink), color picker for `colorId`
- [x] Update `eventInstanceFields.ts` field configs for the new properties so they appear on EntityCard expanded view
- [x] Ensure existing EventInstance EntityCards display the new properties correctly (seeded 10 admin_metadata records)
- [x] Group related fields logically in the form (Content Templates, Display & Status, Guest Permissions, Notifications & Conferencing)

**Learning Goals:**
- Practice building multi-section admin forms with Vuetify components
- Understand how field configs and admin_metadata drive EntityCard rendering

---

### Session 3.5.3: Template Variable Resolution & Invite Pipeline Wiring
**Description:** Build the template resolution system and wire the full pipeline: appointment workflow → template resolution → attendee determination → `createEvent()` call → status tracking.

**Tasks:**
- [ ] Create template resolver utility that takes a template string (e.g., `"{service} at {propertyAddress}"`) and a context object, and returns the resolved string
- [ ] Define the set of available template variables (from appointment, property, user, booking data) and document them
- [ ] Create invite orchestration service that: looks up EventInstances for the appointment's active events, resolves templates, looks up attendees via EventShapeAttendee → actual Users, calls `createEvent()`, creates/updates `AppointmentAttendee` records
- [ ] Wire the orchestration to the appointment status workflow (determine which status transition triggers invite creation)
- [ ] Update `AppointmentAttendee.invitationStatus` and `googleEventId` after successful creation

**Learning Goals:**
- Understand template/interpolation patterns
- Learn how appointment status workflows trigger side effects
- See the full data flow from admin configuration to runtime execution

---

### Session 3.5.4: Polish, Edge Cases & Validation
**Description:** Handle edge cases, add validation, and ensure the end-to-end flow is robust.

**Tasks:**
- [ ] Add template variable preview/help in the admin UI (show available variables)
- [ ] Validate template syntax in the admin form
- [ ] Handle invite failures gracefully (retry, status tracking, admin notification)
- [ ] Handle edge cases: missing attendee emails, inactive event instances, disabled shapes
- [ ] Manual end-to-end testing of the full flow
- [ ] Update feature documentation

**Learning Goals:**
- Practice defensive programming and error boundary patterns
- Understand graceful degradation for external API integrations

---

## Dependencies

**Prerequisites:**
- Feature 2 (Google APIs) — ✅ Complete (Calendar event creation API exists)
- Feature 3 Phases 3.1–3.4 — ✅ Complete (Calendar UI and availability system working)
- Feature 7 (Authentication) — Partial dependency: attendee user lookup requires Users table to be populated, but model extension and admin config can proceed independently

**Downstream Impact:**
- Feature 5 (Appointment Workflow) — invite creation wiring directly integrates with appointment status transitions
- Feature 16/17 (Admin UI Overhaul) — the EventInstance configuration pattern established here will carry forward

---

## Success Criteria

- [ ] EventInstance model includes all Google Calendar configurable properties
- [ ] Migration runs cleanly; existing 10 event instances get correct defaults
- [ ] Admin Instances tab Events section exposes all new properties with appropriate form controls
- [ ] EventInstance creation/editing saves all new fields correctly
- [ ] `eventCreationService.createEvent()` passes all configured properties to the Google API
- [ ] Template resolution works for title, description, and location templates
- [ ] Invite pipeline fires on the correct appointment status transition
- [ ] AppointmentAttendee records are created with correct invitation status tracking
- [ ] Invite failures are logged and tracked (not silently swallowed)
- [ ] All sessions completed
- [ ] Documentation updated

---

## End of Phase Workflow

**CRITICAL: Prompt before completing phase**

After completing all sessions, prompt before running `/phase-end`.

---

## Notes

- **Not in scope:** Building a UI to edit existing Google Calendar events. Will manages those directly in Google Calendar. This phase is about controlling how **new invites go out** when appointments are booked.
- The EventShapeAttendee configuration (which user types attend which event types) already has data — 6 attendee configs across 3 shapes. This is the template for determining actual attendees at invite time.
- The `sendUpdates` constant is currently hardcoded to `'all'` in `calendarConstants.ts`. After this phase, it becomes configurable per EventInstance.
- Google Calendar `conferenceData` requires a `conferenceDataVersion: 1` parameter on the insert request and a `createRequest` in the body to auto-generate Meet links.

---

## Related Documents

- Feature Plan: `.project-manager/features/calendar-appointment-availability/feature-plan.md`
- Feature Guide: `.project-manager/features/calendar-appointment-availability/feature-calendar-appointment-availability-guide.md`
- Feature Log: `.project-manager/features/calendar-appointment-availability/feature-calendar-appointment-availability-log.md`
- Feature Handoff: `.project-manager/features/calendar-appointment-availability/feature-calendar-appointment-availability-handoff.md`

# Feature calendar-appointment-availability Handoff

**Purpose:** Transition context for Calendar & Appointment Availability feature

**Tier:** Feature (Tier 0 - Highest Level)

**Last Updated:** 2026-02-21
**Feature Status:** Partial (Phases 3.1–3.4 Complete, Phase 3.5 In Progress)
**Current Session:** 3.5.3 Complete → Next: 3.5.4

---

## Current Status

**Feature calendar-appointment-availability:** Partial — Phase 3.5 In Progress
**Last Completed Session:** Session 3.5.3 (Template Variable Resolution & Invite Pipeline Wiring)
**Next Session:** Session 3.5.4 (Polish, Edge Cases & Validation)

---

## Transition Context

**Where we left off:**
Session 3.5.3 built the full invite pipeline. Three new files in `server/src/services/invites/`:
- `templateResolver.ts` — pure `{variable}` substitution utility
- `inviteContextBuilder.ts` — collects appointment/property/service data into a flat context
- `inviteOrchestrationService.ts` — the central pipeline: looks up EventInstances via block instances → part assignments → event assignments, resolves templates, determines per-shape attendees, calls `createEvent()` with all calendar properties, updates `AppointmentAttendee` records

The `appointmentCrudRouter.ts` now imports `createInvitesForAppointment` from the orchestration service instead of the old `createCalendarEventForAppointment`. Fallback behavior is preserved when no EventInstances are found.

**What you need for Session 3.5.4:**
- Add template variable preview/help in the admin UI (show available `{variables}`)
- Validate template syntax in the admin form
- Handle invite failures gracefully (retry, status tracking, admin notification)
- Handle edge cases: missing attendee emails, inactive event instances, disabled shapes
- Manual end-to-end testing of the full flow
- Key files: `server/src/services/invites/`, `client/src/views/admin/tabs/InstancesTab.vue`

**What changed in Session 3.5.3:**
- New: `server/src/services/invites/templateResolver.ts` — resolveTemplate(), resolveEventTemplates(), extractTemplateVariables()
- New: `server/src/services/invites/inviteContextBuilder.ts` — buildInviteContext(), AVAILABLE_TEMPLATE_VARIABLES
- New: `server/src/services/invites/inviteOrchestrationService.ts` — createInvitesForAppointment()
- Modified: `server/src/routes/internal/appointments/appointmentCrudRouter.ts` — swapped old service import for new orchestration service

**What changed in Session 3.5.2:**
- UI: `client/src/views/admin/tabs/InstancesTab.vue` — inline creation form expanded with 10 new fields in 4 sections
- Migration: `20260221_000002_seed_event_instance_calendar_metadata.mjs` — seeds admin_metadata for new fields

**What changed in Session 3.5.1:**
- Migration: `20260221_000001_add_event_instance_calendar_properties.mjs`
- Model: `server/src/db/models/booking/event_instance.ts` — 10 new fields
- Types: `client/src/types/entities.ts` — `EventInstanceEntity` extended
- Service: `server/src/services/google/calendar/eventCreationService.ts` — passes all new fields to Google API

---

## Feature Summary

**Phases Completed:** 3.1, 3.2, 3.3, 3.4
**Remaining:** 3.5 (Calendar Invite Configuration & Wiring) — Session 3.5.4

**Key Accomplishments:**
- Server-side slot computation with constraint-based filtering (range, overlap, capacity)
- Client calendar UI with 14-day prefetch and differential scheduling graph bars
- Orchestrator pattern coordinating 10+ composables
- Full wizard integration with end-to-end slot selection flow
- Admin-configurable availability settings
- 60+ source files, 13 test files

**Decisions Made:**
- Server-side computation over client-side for security and consistency
- Violation key system (e.g. `range.leadTime`, `overlap.event.direct`, `capacity.daily`) — reusable by Feature 6.7
- 14-day prefetch strategy balances UX smoothness with API efficiency
- Orchestrator pattern for complex composable coordination

**Architecture:**
Pipeline pattern: Server fetches calendar events + drive times → extracts constraints from DB settings → computes capacity → generates filtered slots → client receives pre-computed slots → applies appointment shape → presents in calendar UI. Orchestrator composable coordinates specialized composables for validation, UI state, slot colors, empty state, defaults, and step data.

**Technology Stack:**
- Vuetify Date Picker (calendar UI)
- Vue 3 Composition API (composables)
- Express routes (server API)
- Google Calendar API + Google Maps Routes API (data sources)
- Shared types in `shared/` directory

---

## Git Branch Status

**Branch:** `feature/calendar-appointment-availability`
**Status:** Active
**Created From:** `develop`
**Original Work On:** `feature/google-apis-integration`

---

## Notes

Phase 3.5 scope was refined: not building a calendar event editor UI (that's done through Google Calendar directly). Instead, Phase 3.5 makes EventInstance calendar properties fully configurable from the admin Instances tab, builds template variable resolution, and wires the invite creation pipeline so calendar invites go out automatically when appointments reach the right status.

---

## Related Documents

- Feature Guide: `.project-manager/features/calendar-appointment-availability/feature-calendar-appointment-availability-guide.md`
- Feature Log: `.project-manager/features/calendar-appointment-availability/feature-calendar-appointment-availability-log.md`
- Feature Plan: `.project-manager/features/calendar-appointment-availability/feature-plan.md`
- PROJECT_PLAN.md: Feature 3 section

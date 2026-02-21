# Feature calendar-appointment-availability Handoff

**Purpose:** Transition context for Calendar & Appointment Availability feature

**Tier:** Feature (Tier 0 - Highest Level)

**Last Updated:** 2026-02-21
**Feature Status:** Complete (Phases 3.1–3.5)
**Current Session:** 3.5.4 Complete — Phase 3.5 Complete — Feature Complete

---

## Current Status

**Feature calendar-appointment-availability:** Complete
**Last Completed Session:** Session 3.5.4 (Polish, Edge Cases & Validation)
**Phase 3.5:** Complete (all 4 sessions)

---

## Transition Context

**Where we left off:**
Phase 3.5 is complete. All EventInstance calendar properties are configurable from the admin UI, templates support `{variable}` substitution, and the full invite pipeline is wired from appointment creation/status change through to Google Calendar event creation with per-shape attendee determination.

**What was built across Phase 3.5:**
- **Session 3.5.1:** 10 new Google Calendar property columns on `event_instances`, Sequelize model + client types updated, `eventCreationService` passes all properties to Google API
- **Session 3.5.2:** Admin UI creation form with VSelect/VSwitch/VTextField controls in 4 sections, `admin_metadata` seeded for EntityCard rendering
- **Session 3.5.3:** Template resolver, invite context builder, invite orchestration service, wired to `afterCreate` hook
- **Session 3.5.4:** Template variable help panel, template validation warnings, failed attendee tracking, status transition trigger (afterUpdate hook)

**Key files:**
- `server/src/services/invites/` — templateResolver.ts, inviteContextBuilder.ts, inviteOrchestrationService.ts
- `server/src/routes/internal/appointments/appointmentCrudRouter.ts` — afterCreate + afterUpdate hooks
- `client/src/views/admin/tabs/InstancesTab.vue` — EventInstance creation form with all fields
- `server/src/db/models/booking/event_instance.ts` — 10 new calendar property fields
- `server/src/services/google/calendar/eventCreationService.ts` — passes all properties to Google API

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

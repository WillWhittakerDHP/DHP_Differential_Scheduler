# Session 6.5.2 Guide: Availability Bypass

**Purpose:** Session-level guide for reschedulingAppointmentId in computed-availability; server excludes that appointment's calendar event from overlap.

**Tier:** Session (Tier 2 - Medium-Level)

---

## Quick Start

### Session Overview

**Session ID:** 6.5.2
**Session Name:** Availability Bypass
**Description:** `reschedulingAppointmentId` in computed-availability request; server excludes that appointment's calendar event from overlap while keeping it in calendarEvents so its time and drive buffers do not block slots.

**Duration:** 1 session (2–3 tasks)
**Status:** In Progress

### Tasks

- [x] #### Task 6.5.2.1: Wire reschedulingAppointmentId into availability request (client)
**Goal:** Add reschedulingAppointmentId to the computed-availability (or slot) request when the wizard is in reschedule mode so the server knows which appointment to exclude from overlap.
**Files:**
- Client: availability composable or wizard step that builds the request (e.g. client/src/composables or client/src/components/booking)
- Types/API: request shape for availability/slots
**Approach:** When wizard mode is reschedule and loadedAppointmentId is set, include that id in the availability request payload. Server will consume it in the next task.
**Checkpoint:** Request payload includes reschedulingAppointmentId when in reschedule mode; type/interface updated.

- [x] #### Task 6.5.2.2: Server — exclude rescheduling appointment from overlap, keep in calendarEvents
**Goal:** Server slot/computed-availability logic excludes the rescheduling appointment's calendar event (and its drive buffers) from the overlap list used for slot computation, while still including it in calendarEvents so it remains visible on the calendar.
**Files:**
- Server: availability/slot route or service that computes overlap (e.g. server/src/routes, server/src/services, server/src/utils/availabilities)
- Server: calendarEventsCache or eventsService if calendarEvents are built there
**Approach:** Read reschedulingAppointmentId from request; when building overlap list for slot computation, omit that appointment's event (and its drive buffers); when building calendarEvents, include it. Ensure one code path produces overlap (excluded) and calendarEvents (included).
**Checkpoint:** Reschedule flow can pick a new slot without the current appointment blocking it; calendar still shows the current appointment.

- [x] #### Task 6.5.2.3: Availability bypass — server excludes rescheduling appointment from overlap
**Goal:** Verify end-to-end: add reschedulingAppointmentId to computed-availability request; server excludes that appointment's calendar event from overlap while keeping it in calendarEvents so its time and drive buffers do not block slots.
**Files:**
- Same as 6.5.2.1 and 6.5.2.2; plus any integration tests or manual test steps
**Approach:** Run reschedule flow from admin or Reschedule action; confirm slot grid does not treat current appointment as blocking; confirm calendar still shows it. Fix any remaining wiring or edge cases.
**Checkpoint:** Reschedule flow works: user can select a different slot; current appointment does not block; calendar display unchanged.

---

## Session Workflow

Follow the same workflow as other sessions: use `/session-start 6.5.2` to begin; work one task at a time with checkpoints; use `/session-end 6.5.2` when done. See session template or `session-6.5.1-guide.md` for full workflow (before/during/after session, checkpoints, end-of-session steps).

---

## Notes

- Session 6.5.2 depends on Session 6.5.1 (wizard mode reschedule, load-at-step-3) being done so that loadedAppointmentId and reschedule mode are available.
- Phase 6.5 success criteria: "reschedulingAppointmentId in computed-availability request; server excludes that appointment's calendar event from overlap while keeping it in calendarEvents."

<!-- end excerpt session -->

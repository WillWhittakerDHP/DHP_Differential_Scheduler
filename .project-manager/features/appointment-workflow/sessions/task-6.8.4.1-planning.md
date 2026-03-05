# Plan: task 6.8.4.1 — Reschedule availability and distinct slot indicator

## Contract
- **Tier:** task | **ID:** 6.8.4.1
- **Scope:** Pass allowedExceptions and appointmentId in reschedule availability; distinct slot indicator in UI (new override on reschedule is Task 6.8.4.2)
- **Governance:** Clean — no violations detected

## Where we left off
No prior handoff for this task.

## Goal
When loading slots for reschedule, if the appointment has a `constraint_override`, pass its `overriddenViolations` as `allowedExceptions` and the appointment id as `appointmentId` (or `reschedulingAppointmentId`) in the computed-availability request so the server relaxes those constraints. In the reschedule slot list or calendar UI, show a distinct indicator for slots that are available only because of allowedExceptions (e.g. using `_meta.allowedExceptionsApplied` from the response when present). New override record on reschedule confirm is Task 6.8.4.2.

## Files
- **Client:** Reschedule flow — call site that fetches computed availability (pass `allowedExceptions` and `appointmentId` when appointment has an override); source of override data (appointment detail or override API); slot list or calendar component that displays slots and can show a distinct style/badge for override-allowed slots. Composables or views that build the availability request and consume the response.
- **Docs:** Phase 6.8 guide, session 6.8.4 guide

## Approach
1. **Override data:** When opening reschedule for an appointment, determine if it has a constraint override (e.g. from appointment payload or GET override by appointmentId); obtain `overriddenViolations` (string[]). 2. **Availability request:** When calling the computed-availability API for reschedule, if the appointment has an override, set `allowedExceptions` to that array and `appointmentId` (or `reschedulingAppointmentId`) to the appointment id. 3. **Response:** Optionally read `_meta.allowedExceptionsApplied` from the availability response to know when slots were relaxed. 4. **UI indicator:** In the component that renders available slots for reschedule, show a distinct indicator (e.g. badge, tooltip, or style) for slots when `allowedExceptionsApplied` was true or when the slot is in the set that depended on relaxation. Keep components thin; put request-building logic in a composable or existing reschedule flow.

## Checkpoint
- Rescheduling an overridden appointment sends `allowedExceptions` and `appointmentId` to the availability request; returned slots reflect relaxed constraints.
- Reschedule slot UI shows a distinct indicator for override-allowed slots where applicable.
---
## How we build the tierDown to achieve them
- **Session 6.8.4:** Reschedule flow and override records — pass allowedExceptions, distinct slot indicator, new override on reschedule
- **Task 6.8.4.1:** Reschedule availability — pass allowedExceptions and appointmentId; distinct slot indicator in UI
- **Task 6.8.4.2:** New override on reschedule — server creates ConstraintOverride for new slot; client wires reschedule submit
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.8.4-guide.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

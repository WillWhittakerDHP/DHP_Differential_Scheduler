# Plan: session 6.8.4 — ** ** Reschedule flow and override records — pass allowedExceptions, distinct slot indicator, new override on reschedule

## Contract
- **Tier:** session | **ID:** 6.8.4
- **Scope:** ** ** Reschedule flow and override records — pass allowedExceptions, distinct slot indicator, new override on reschedule
- **Governance:** 4 governance highlights — read reports before filling slots

## Where we left off
Completed Task - Begin Session 6.8.4

## Goal
Wire the reschedule flow to be override-aware: when rescheduling an appointment that has a `constraint_override`, pass `allowedExceptions` (and `appointmentId`) to the computed-availability request so the server relaxes those constraints; show a distinct slot indicator for override-allowed slots in the reschedule UI; and create a new override record for the rescheduled appointment when the move is confirmed. Server already accepts `allowedExceptions` and verifies against stored override (Session 6.8.2).

## Files
- **Client:** Reschedule flow / availability call site (pass `allowedExceptions` and `appointmentId` when the appointment has an override); slot list or calendar UI to show distinct indicator for override-allowed slots; reschedule submit/API wiring so server can create new override on reschedule. Composables or views that fetch computed availability and perform reschedule.
- **Server:** Reschedule endpoint or update flow so that when an overridden appointment is moved to a new slot, a new `ConstraintOverride` record is created for the new slot (overriddenViolations from the original override or from request). May touch `server/src/routes/internal/appointments/` or PATCH/put reschedule handler.
- **Docs:** Phase 6.8 guide, session 6.8.4 guide

## Approach
1. **Client — availability:** When loading slots for reschedule, if the appointment has an override, load its `overriddenViolations` (from appointment detail or override API) and pass them as `allowedExceptions` plus `appointmentId` (or `reschedulingAppointmentId`) in the computed-availability request. 2. **Client — UI:** In the reschedule slot list or calendar, show a distinct indicator (e.g. style or badge) for slots that are available only because of allowedExceptions (optional: use `_meta.allowedExceptionsApplied` from response if present). 3. **Server — new override on reschedule:** When reschedule moves an appointment that has an override to a new slot, create a new `ConstraintOverride` record for the new appointment slot (same overriddenViolations or from request). 4. **Client — submit:** Ensure reschedule API is called with any data needed for the server to create the new override (if not derived server-side from existing override). Follow governance: thin components, composables for logic.

## Checkpoint
- Rescheduling an overridden appointment sends `allowedExceptions` and `appointmentId` to availability; slots reflect relaxed constraints.
- Reschedule UI shows a distinct indicator for override-allowed slots where applicable.
- On reschedule confirm, a new override record is created for the new slot; audit trail preserved.

## How we build the tierDown to achieve them
- **Session 6.8.1:** Database & server infrastructure — migration, model, computeViolationsForSlot, force-create route
- **Session 6.8.2:** Constraint relaxation & availability pipeline — relaxConstraintsForExceptions, allowedExceptions, override verification
- **Session 6.8.3:** Force-create composable and admin UI — useForceCreateAppointment, dialog, Force Schedule button
- **Session 6.8.4:** Reschedule flow and override records — pass allowedExceptions, distinct slot indicator, new override on reschedule
- **Task 6.8.4.1:** Reschedule availability — pass allowedExceptions and appointmentId; distinct slot indicator in UI
- **Task 6.8.4.2:** New override on reschedule — server creates ConstraintOverride for new slot; client wires reschedule submit
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/phases/phase-6.8-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/sessions/session-6.8.3-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

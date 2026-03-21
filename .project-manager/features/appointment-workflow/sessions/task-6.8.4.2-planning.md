# Plan: task 6.8.4.2 — New override on reschedule

## Contract
- **Tier:** task | **ID:** 6.8.4.2
- **Scope:** Server creates ConstraintOverride for new slot on reschedule; client wires reschedule submit (availability + UI indicator done in 6.8.4.1)
- **Governance:** Clean — no violations detected

## Where we left off
No prior handoff for this task.

## Goal
When reschedule moves an appointment that has an override to a new slot, create a new `ConstraintOverride` record for the new slot (overriddenViolations from the original override or from request). Client ensures the reschedule API is called with any data the server needs to create the new override. Audit trail preserved (new record per reschedule, not mutating the original).

## Files
- **Server:** Reschedule endpoint or update flow (e.g. PATCH/PUT appointment with new slot times). When the appointment being rescheduled has an existing ConstraintOverride, after updating the appointment create a new ConstraintOverride for the new slot (appointmentId, overriddenViolations from original override, slot_start/slot_end for new slot). May touch `server/src/routes/internal/appointments/` or appointment update handler.
- **Client:** Reschedule submit — call the reschedule/update API with the new slot; if the server derives override data from the existing override, no extra client payload; otherwise pass overriddenViolations or a flag so the server can create the new record.
- **Docs:** Phase 6.8 guide, session 6.8.4 guide

## Approach
1. **Server:** Identify the reschedule path (e.g. PATCH appointment with start/end or dedicated reschedule handler). After updating the appointment's slot, check if the appointment had an existing ConstraintOverride (e.g. find by old appointment id or by appointment id before update). If yes, create a new ConstraintOverride with the same appointmentId (or the updated appointment id if it changes), same overriddenViolations, new slot_start/slot_end from the new slot; set authorizedById/reason as per force-create or leave null. 2. **Client:** Ensure the reschedule request includes the new slot times; if the server looks up the existing override by appointment id, no extra fields; otherwise add overriddenViolations or a flag in the payload if the server API requires it. 3. Use a transaction where appropriate so appointment update and new override creation succeed or roll back together.

## Checkpoint
- On reschedule confirm of an overridden appointment, a new ConstraintOverride record exists for the new slot; original override unchanged.
- Client reschedule submit works with the server contract (new override created when applicable).

## Design Before Execute (pseudocode)
- **Server reschedule handler:** (1) Load appointment by id; (2) Load existing ConstraintOverride by appointmentId if any; (3) Update appointment start/end to new slot (within transaction); (4) If existing override found, insert new ConstraintOverride row: appointmentId, overriddenViolations = existing.overriddenViolations, slot_start/slot_end = new slot, authorizedById/reason as needed; (5) Commit. Key: reuse ConstraintOverride model/service from force-create flow.
- **Client:** Reschedule submit sends PATCH (or reschedule endpoint) with new start/end; no extra override payload if server derives from existing override by appointment id.
---
## How we build the tierDown to achieve them
- **Session 6.8.4:** Reschedule flow and override records — pass allowedExceptions, distinct slot indicator, new override on reschedule
- **Task 6.8.4.1:** Reschedule availability — pass allowedExceptions and appointmentId; distinct slot indicator in UI
- **Task 6.8.4.2:** New override on reschedule — server creates ConstraintOverride for new slot; client wires reschedule submit
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.8.4-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/sessions/task-6.8.4.1-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

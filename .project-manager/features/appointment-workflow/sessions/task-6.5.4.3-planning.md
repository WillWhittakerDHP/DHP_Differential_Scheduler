# Plan: task 6.5.4.3 — 6.5.4.3

## Contract
- **Tier:** task | **ID:** 6.5.4.3
- **Scope:** 6.5.4.3
- **Governance:** 1 governance highlights — read reports before filling slots

## Where we left off
No prior handoff for this task.

## Goal
Implement the full cancel flow: `/cancel?appointmentId=<id>` → confirm page → PATCH to `cancelled` → success/error and navigation. Only appointments with status that can transition to `cancelled` (per VALID_STATUS_TRANSITIONS) are cancellable.

## Files
- `client/src/views/booking/CancelConfirmView.vue` — Replace stub with confirm UI, load appointment, validate status, PATCH on confirm, success/error states, navigate to `/` on success
- `client/src/composables/booking/useCancelAppointment.ts` — New composable: fetch appointment by id (direct API), check if cancellable, patch to cancelled, return loading/error/success state

## Approach
1. **useCancelAppointment:** `fetchAppointment(id)` via `apiClient.get(getAppointmentByIdEndpoint(id))`; `isCancellable(status)` using `VALID_STATUS_TRANSITIONS`; `cancelAppointment(id)` via `apiClient.patch(endpoint, { status: 'cancelled' })`; invalidate `BUSINESS_DATA_QUERY_KEY` on success so admin sees update.
2. **CancelConfirmView:** On mount, read `route.query.appointmentId`; if missing, show "Invalid link"; else fetch appointment; if not cancellable (cancelled/deleted), show "Appointment cannot be cancelled"; else show confirm UI with appointment summary; on confirm, call cancel; on success navigate to `/`; on error show message.
3. **UI:** Simple card with appointment info (id/date if available), "Cancel appointment" and "Go back" buttons.

## Checkpoint
- `/cancel?appointmentId=<valid-id>` with cancellable status shows confirm page; confirming PATCHes to cancelled and navigates to home.
- `/cancel?appointmentId=<id>` with already cancelled/deleted shows "Appointment cannot be cancelled".
- `/cancel` without appointmentId shows "Invalid link".

## How we build the tierDown
- **Task 6.5.4.1:** URL scheme and router
- **Task 6.5.4.2:** Wizard entry from query
- **Task 6.5.4.3:** Cancel flow
- **Task 6.5.4.4:** Copy quote link button
- **Task 6.5.4.5:** Invite template variables (optional)
- **Task 6.5.4.6:** Verification and docs

---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.5.4-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/sessions/task-6.5.4.2-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

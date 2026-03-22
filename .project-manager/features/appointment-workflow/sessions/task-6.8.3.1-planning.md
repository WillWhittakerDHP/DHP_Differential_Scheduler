# Plan: task 6.8.3.1 — useForceCreateAppointment composable and force-create dialog

## Contract
- **Tier:** task | **ID:** 6.8.3.1
- **Scope:** useForceCreateAppointment composable and force-create dialog (violation preview, reason, confirm)
- **Governance:** Clean — no violations detected

## Where we left off
No prior handoff for this task.

## Goal
Add the composable `useForceCreateAppointment` and the force-create confirmation dialog so that callers can open a dialog, see violations for a candidate slot, enter a reason, and confirm to create the appointment and override. The Force Schedule button and admin entry point are Task 6.8.3.2.

## Files
- **Client:** New composable (e.g. `client/src/admin/composables/` or appointments domain) `useForceCreateAppointment`; force-create confirmation dialog component (violations list, reason field, confirm/cancel). API: existing `POST /api/v1/internal/appointments/force-create` and violation/preview endpoint if present.
- **Docs:** Phase 6.8 guide, session 6.8.3 guide

## Approach
1. **Composable:** Implement `useForceCreateAppointment` with: (a) state for dialog open/close, selected slot, violations, reason, loading, error; (b) action to fetch violations for a slot (call server endpoint that returns `ForceCreateViolationReport` or equivalent); (c) action to submit force-create (POST with slot, reason, overriddenViolations); (d) explicit return type and mutation via setX/updateX per composable governance. 2. **Dialog component:** Thin Vue component that receives slot + violations from composable (or uses inject), displays violation list and reason text field, Confirm/Cancel buttons; on Confirm call composable submit; show loading and error state. 3. Follow governance: composable holds logic; dialog is presentational; reuse existing admin API client and types where possible.

## Checkpoint
- `useForceCreateAppointment` exists with fetch-violations and submit actions; dialog exists and shows violations + reason; confirm calls API and success/error are surfaced.
---
## How we build the tierDown to achieve them
- **Session 6.8.3:** Force-create composable and admin UI — useForceCreateAppointment, dialog, Force Schedule button
- **Task 6.8.3.1:** useForceCreateAppointment composable and force-create dialog
- **Task 6.8.3.2:** Admin UI Force Schedule button and blocked-slot entry point
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.8.3-guide.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

# Plan: session 6.8.3 — ** ** Force-create composable and admin UI — useForceCreateAppointment, dialog, Force Schedule button

## Contract
- **Tier:** session | **ID:** 6.8.3
- **Scope:** ** ** Force-create composable and admin UI — useForceCreateAppointment, dialog, Force Schedule button
- **Governance:** 4 governance highlights — read reports before filling slots

## Where we left off
Completed Task - Begin Session 6.8.3

## Goal
Build the Vue admin force-create UI: composable `useForceCreateAppointment`, confirmation dialog (violation preview, reason, confirm), and admin-only "Force Schedule" entry point so admins can force-create an appointment from a blocked slot. Server and availability pipeline are done (Sessions 6.8.1–6.8.2).

## Files
- **Client:** New composable (e.g. `client/src/admin/composables/` or appointments domain) `useForceCreateAppointment`; force-create confirmation dialog component; admin appointments/slot UI for Force Schedule button and blocked-slot entry point. API: existing `POST /api/v1/internal/appointments/force-create`.
- **Docs:** Phase 6.8 guide, session 6.8.3 guide

## Approach
1. Add composable `useForceCreateAppointment` that fetches violations for a candidate slot, calls force-create API with slot + reason + overridden violations, and manages dialog state (open/close, submit, loading, error). 2. Add force-create confirmation dialog component: display violation list and reason field; on confirm, call composable submit; handle success/error. 3. Add "Force Schedule" button in admin appointments UI (slot or calendar context), visible only for admin; click opens dialog and triggers violation fetch for selected slot. 4. Follow governance: thin components, composable for logic, reuse existing admin/role patterns.

## Checkpoint
- Admin can open Force Schedule from a blocked slot; dialog shows violations and collects reason; confirm creates appointment and override; success and errors surfaced in UI.

## How we build the tierDown to achieve them
- **Session 6.8.1:** Database & server infrastructure — migration, model, computeViolationsForSlot, force-create route
- **Session 6.8.2:** Constraint relaxation & availability pipeline — relaxConstraintsForExceptions, allowedExceptions, override verification
- **Session 6.8.3:** Force-create composable and admin UI — useForceCreateAppointment, dialog, Force Schedule button
- **Task 6.8.3.1:** useForceCreateAppointment composable and force-create dialog
- **Task 6.8.3.2:** Admin UI Force Schedule button and blocked-slot entry point
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/phases/phase-6.8-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/sessions/session-6.8.2-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

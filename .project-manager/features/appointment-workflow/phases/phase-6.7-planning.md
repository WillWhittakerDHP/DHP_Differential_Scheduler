# Plan: phase 6.7 — 6.7

## Contract
- **Tier:** phase | **ID:** 6.7
- **Scope:** 6.7
- **Governance:** 2 governance highlights — read reports before filling slots

## Where we left off
- **4 deferred admin panel components addressed (2026-03-02):** BlockInstanceList, ShapesTab, EventInstancesSection, OverlapConstraintsPanel — logic extracted to useBlockInstanceList, useShapesTab, useEventInstancesSection, useOverlapConstraintsPanel; component-logic Tier1 no longer flags these admin SFCs. See `sessions/admin-panel-four-components.md`. Phase 6.3 (Confirmation Routine) complete. Phase 6.4 (Moveable Modal & preClosing Property) is the next phase — Session 6.4.1 not started: - **Phase 6.3 complete:** Sessions 6.3.1–6.3.3 — confirmation data model, admin confirm action, auto-confi (See full handoff linked below)

## Goal
Populate `scheduled_by_id` from the authenticated user when creating appointments and display it in admin appointment details. Depends on Feature 7 (Authentication) providing `req.user`.

## Files
- Server: appointment create endpoint (set `scheduled_by_id` from `req.user`)
- Client: types/transformers if needed for scheduled_by display
- Admin: appointment details view (show scheduled_by / scheduler name)

## Approach
- Use `req.user` (from Feature 7) on appointment create to set `scheduled_by_id`; no client-supplied value for this field on create.
- Admin appointment details: show scheduled_by (user id and/or display name) from existing or new API shape; follow existing admin detail patterns.

## Checkpoint
- Create path sets `scheduled_by_id` from authenticated user; admin details show who scheduled the appointment.

## How we build the tierDown to achieve them
- **Session 6.7.1:** Backend — set scheduled_by_id on create from req.user
- **Session 6.7.2:** Admin UI — display scheduled_by in appointment details
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/feature-appointment-workflow-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/phases/phase-6.6-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

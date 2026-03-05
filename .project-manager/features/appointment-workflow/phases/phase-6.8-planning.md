# Plan: phase 6.8 — 6.8

## Contract
- **Tier:** phase | **ID:** 6.8
- **Scope:** 6.8
- **Governance:** 2 governance highlights — read reports before filling slots

## Where we left off
- **4 deferred admin panel components addressed (2026-03-02):** BlockInstanceList, ShapesTab, EventInstancesSection, OverlapConstraintsPanel — logic extracted to useBlockInstanceList, useShapesTab, useEventInstancesSection, useOverlapConstraintsPanel; component-logic Tier1 no longer flags these admin SFCs. See `sessions/admin-panel-four-components.md`. Phase 6.3 (Confirmation Routine) complete. Phase 6.4 (Moveable Modal & preClosing Property) is the next phase — Session 6.4.1 not started: - **Phase 6.3 complete:** Sessions 6.3.1–6.3.3 — confirmation data model, admin confirm action, auto-confi (See full handoff linked below)

## Goal
Deliver Admin Force-Create & Constraint Overrides: allow admins to force-create an appointment on any date/time (bypassing availability blockers), persist which constraints were overridden in `constraint_overrides`, and honor those exceptions during reschedule via `allowedExceptions` in the availability pipeline.

## Files
- **Server:** `server/src/services/slotComputationService.ts`, `server/src/services/computedAvailabilityService.ts`, `server/src/routes/internal/appointments/` (force-create route, availability router), migrations for `constraint_overrides`, Sequelize model `ConstraintOverride`
- **Client:** New composable `useForceCreateAppointment`, force-create confirmation dialog, admin appointments UI (Force Schedule button, blocked-slot styling)
- **Docs:** Phase 6.8 guide, feature handoff

## Approach
1. Add `constraint_overrides` table and model; implement `computeViolationsForSlot()` and force-create route with auth/role checks. 2. Add `relaxConstraintsForExceptions()` and extend availability pipeline with `allowedExceptions` and server-side override verification. 3. Build client composable and dialog (violation preview, reason, confirm); add admin-only Force Schedule entry point. 4. Wire reschedule flow to pass override violations to availability and create new override records on reschedule.

## Checkpoint
- Migration and model in place; force-create route creates appointment + override in a transaction
- Availability accepts `allowedExceptions` and verifies against stored override
- Admin can force-create from blocked slot with explicit confirmation
- Reschedule of overridden appointment uses allowedExceptions and creates new override record

## How we build the tierDown to achieve them
- **Session 6.8.1:** Database & Server Infrastructure — migration, model, computeViolationsForSlot, force-create route
- **Session 6.8.2:** Constraint relaxation & availability pipeline — relaxConstraintsForExceptions, allowedExceptions, override verification
- **Session 6.8.3:** Force-create composable and admin UI — useForceCreateAppointment, dialog, Force Schedule button
- **Session 6.8.4:** Reschedule flow and override records — pass allowedExceptions, distinct slot indicator, new override on reschedule
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/feature-appointment-workflow-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/phases/phase-6.7-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

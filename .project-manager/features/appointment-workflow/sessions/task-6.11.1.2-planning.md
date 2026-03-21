# Plan: task 6.11.1.2 — 6.11.1.2

## Contract
- **Tier:** task | **ID:** 6.11.1.2
- **Scope:** 6.11.1.2
- **Governance:** 1 governance highlights — read reports before filling slots

## Work Profile
- **Execution intent:** implement
- **Action type:** localized_change
- **Scope shape:** file_local
- **Governance domains:** function
- **Recommended context pack:** local_implementation_pack
- **Planning artifact action:** update
- **Decomposition mode:** moderate
- **Downstream advice:** Planning doc is advisory; guide owns current-tier decomposition. Inherit intent, constraints, and governance emphasis; avoid pre-specifying child execution detail unless decomposition mode is explicit.

## Where we left off
No prior handoff for this task.

## Goal
Implement the Drive Time Fee Line Item phase: admin-configurable settings (complimentary drive minutes, driving rate per hour, rounding), calculation from selected-slot drive minutes (driveTo + driveFrom), fee pipeline extension to append a "Drive time" line item, UI integration in Confirmation step (and availability-step fee popover when Phase 6.10 is in place), and persistence via a virtual system "Drive time" block instance so the existing fee-entry schema is preserved.

## Files
- `client/src/utils/booking/confirmationStepData.ts` — buildConfirmationPriceData, buildAppointmentFeeBreakdown; extend with optional drive context
- `client/src/configs/availabilitySettings/` (or equivalent) — add complimentaryDriveMinutes, drivingRatePerHour, driveTimeRoundingMinutes to types and API
- `shared/types/availabilityTypes.ts` — driveToCandidate, driveFromCandidate (or equivalent) for slot/candidate
- `shared/types/appointmentFeeTypes.ts` — AppointmentFeeEntryCreate for fee breakdown payload
- Admin Business Controls panel (Calendar → Confirmation & Holds or Driving/Fees subsection)
- ConfirmationStep.vue / useConfirmationStepData — pass drive context into fee builder
- block_instances, block_shapes — seed or ensure one "Drive time" system block instance per scope

## Approach
Single session (6.11.1) implements the full flow: (1) Admin settings (types, API, UI) in Business Controls; (2) calculation helper (billable = max(0, total − complimentary); round to N; fee = (rounded/60) × rate); (3) expose selected-slot drive minutes in wizard and pass into fee builder; (4) extend buildConfirmationPriceData with optional drive context and append "Drive time" line item; (5) persist drive time in fee breakdown via virtual block instance (one system block per calendar, excluded from wizard selection). Follow governance: session order, session/task audits, playbooks.

## Checkpoint
After Session 6.11.1: Admin settings configurable and persisted; selected-slot drive minutes available in wizard; fee pipeline accepts drive context and appends line item; Confirmation step (and availability popover) shows Drive time row; stored fee breakdown includes drive time entry referencing system block; lint and app start pass.
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.11.1-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/sessions/task-6.11.1.1-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

# Plan: task 6.10.4.1 — 6.10.4.1

## Contract
- **Tier:** task | **ID:** 6.10.4.1
- **Scope:** 6.10.4.1
- **Governance:** Clean — no violations detected

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
Session 6.10.4 started; fee preview bar and Confirmation step conditional coupon row exist (6.10.3). Coupon discount is still placeholder (0). This task adds the data shape (percentage column) so Task 6.10.4.2 can apply it in the pipeline.

## Goal
Add an optional percentage column (e.g. percentage off) to the part instance shape so coupon rules can express "10% off" or similar; wire the field into fee pipeline inputs so Part/Block Finals can read it in the next task. No pipeline logic changes in this task — types and data flow only.

## Files
- **Part-instance / block-shape types:** `client/src/types/` or entity instance form types (e.g. types used by `BookingPartInstance`, part instance form, or block instance payload) — add optional `percentageOff` (or `percentage_off`) number field; align with server/API if part instances are persisted.
- **Fee pipeline entry points:** Identify where Part/Block Finals read part data (e.g. `client/src/utils/booking/` — `partsTotals`, `partFinalizer`, or types consumed by `BlockFinal` / `confirmationStepData.ts`) and ensure the new field is present on the part-instance type so the next task can use it.

## Approach
1. Locate the part instance type(s) used in the booking fee pipeline (e.g. `BookingPartInstance`, part instance in block instance, or entity instance form types).
2. Add an optional numeric field for percentage off (e.g. `percentageOff?: number` or `percentage_off?: number`); keep naming consistent with existing conventions (camelCase in client types).
3. If part instances are loaded from API or admin, ensure the field is included in response types and (if editable) in form/payload types; no backend change required in this task unless the column already exists.
4. Verify types flow through to `partsTotals` / Part Final inputs so Task 6.10.4.2 can read the field when applying percentage off.

## Checkpoint
- Part instance type has optional percentage field; fee pipeline (partsTotals / Part Finals) receives part instances that may carry it; lint and app start pass. No change yet to calculated totals (that is 6.10.4.2).
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.10.4-guide.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

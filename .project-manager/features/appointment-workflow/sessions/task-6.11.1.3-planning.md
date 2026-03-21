# Plan: task 6.11.1.3 — 6.11.1.3

## Contract
- **Tier:** task | **ID:** 6.11.1.3
- **Scope:** 6.11.1.3
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
Handoff from 6.11.1.2: `computeDriveTimeFee` exists; admin `driveTimeFee` settings exist. This task wires **selected slot → total drive minutes → fee builder call sites** only (line item math is 6.11.1.4).

## Goal
When the user selects a time slot in the wizard, expose **total drive minutes** (`driveToCandidate` + `driveFromCandidate` or equivalent) in the data path that **Confirmation** (and later availability fee UI) uses. Pass **`driveContext`** (e.g. `{ totalDriveMinutes: number }`) into **`buildConfirmationPriceData`** at each call site. **Out of scope for this task:** changing `buildConfirmationPriceData` to compute or append the line item (6.11.1.4); virtual block instance (6.11.1.5).

## Files
- `shared/types/availabilityTypes.ts` or client slot types — confirm/extend `ComputedSlot` / selected-slot shape so drive minutes are typed and present when the server provides them.
- Wizard state / composables: e.g. `useConfirmationStepData`, `propertyDetailsStepData`, or slot-selection composable — store or derive `totalDriveMinutes` from the selected slot.
- `client/src/utils/booking/confirmationStepData.ts` — add optional **`driveContext?: { totalDriveMinutes: number }`** (or equivalent) to **`buildConfirmationPriceData`** signature only if not already present; **no fee math** in this task (forward-compatible stub or pass-through for 6.11.1.4).
- Call sites: `useConfirmationStepData` / `ConfirmationStep.vue` (and any other direct callers) — pass drive context from selected slot.

## Approach
1. Trace where the selected slot is stored after availability pick; read `driveToCandidate` / `driveFromCandidate` from slot payload (default 0 if missing).
2. Add a small derived value `totalDriveMinutes` (sum, finite, ≥ 0) on the confirmation data path.
3. Extend the fee builder function signature with optional `driveContext`; implementation may no-op until 6.11.1.4.
4. Wire call sites so the selected slot’s drive sum reaches the builder. Add/adjust unit tests where `buildConfirmationPriceData` is tested.

## Checkpoint
- [x] After selecting a slot with known drive fields, `buildConfirmationPriceData` receives the correct `totalDriveMinutes` (verified via test or dev logging).
- [x] Types reflect drive fields on slot/summary shapes; no regression to confirmation totals (drive context optional).
- [x] `vue-tsc` and lint pass.

## Task-end (2026-03-15)
Task **6.11.1.3** closed. Handoff: `task-6.11.1.3-handoff.md`. Cascade: **`/task-start 6.11.1.4`** (fee pipeline — compute drive fee, append line item).

## How we build the tierDown to achieve them
- **Task 6.11.1.4:** Fee pipeline — accept drive context, compute fee, append "Drive time" line item.

---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.11.1-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/sessions/task-6.11.1.2-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

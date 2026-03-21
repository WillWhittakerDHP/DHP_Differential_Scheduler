# Plan: task 6.9.4.4 — 6.9.4.4

## Contract
- **Tier:** task | **ID:** 6.9.4.4
- **Scope:** 6.9.4.4
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
Ensure slot selection is only considered complete (and step valid) when the moveable sub-step is either not applicable or confirmed — same behavior as the previous modal gate. Tasks 6.9.4.1–6.9.4.3 moved moveable content in-step and removed the modal; this task wires validation so `isFormValid` reflects moveable confirmation.

## Files
- `client/src/composables/booking/useAvailabilityOrchestrator.ts` — derive combined `isFormValid` that gates on moveable confirmation when `hasMoveablePartsGated`.

## Approach
- In `useAvailabilityOrchestrator`, keep `useAvailabilityValidation` for base validation (date + slot).
- Derive a combined `isFormValid` computed: base validation must pass; when `hasMoveablePartsGated` is true, also require `confirmedMoveableScheduling` to be truthy.
- Return the combined `isFormValid` instead of the raw validation result.
- No changes to `useAvailabilityValidation`; the gate is orchestration-level.

## Checkpoint
- Slot selection valid only when moveable not applicable or confirmed; lint passes; app starts.
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.9.4-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/sessions/task-6.9.4.3-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

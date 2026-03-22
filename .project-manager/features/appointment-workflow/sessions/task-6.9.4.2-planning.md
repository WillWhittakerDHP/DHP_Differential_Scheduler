# Plan: task 6.9.4.2 — 6.9.4.2

## Contract
- **Tier:** task | **ID:** 6.9.4.2
- **Scope:** 6.9.4.2
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
Task 6.9.4.1 complete: moveable content in step 5 (AvailabilitySubStepContent). Modal still imported and rendered in AvailabilityStep; handleAppointmentSlotClick still calls openMoveableModal.

## Goal
Remove MoveablePartsModal from AvailabilityStep.vue. Do not keep the modal as the default implementation. Moveable flow is fully in-step via the 5th sub-step (6.9.4.1). Deprecation of the modal component is task 6.9.4.3.

## Files
- `client/src/components/booking/steps/AvailabilityStep.vue` — remove MoveablePartsModal import and <MoveablePartsModal> template block.
- `client/src/utils/booking/availabilityStepHandlers.ts` — stop calling openMoveableModal() in handleAppointmentSlotClick (orchestrator passes it; use no-op or remove call).
- `client/src/composables/booking/useAvailabilityOrchestrator.ts` — may pass no-op for openMoveableModal to handlers; showMoveableModal can remain (unused) or be removed from return if no consumers.

## Approach
- Remove `import MoveablePartsModal from '@/components/booking/MoveablePartsModal.vue'` from AvailabilityStep.
- Remove the entire <MoveablePartsModal ... /> block from the template (lines ~328–345).
- In availabilityStepHandlers.handleAppointmentSlotClick: remove the `if (hasMoveableParts.value) { openMoveableModal() }` block so slot selection does not open the modal; user progresses to step 5 in-step.
- Orchestrator: openMoveableModal and showMoveableModal can remain (handlers still receive them; openMoveableModal becomes unused at call site). No need to change orchestrator return shape; other code may reference showMoveableModal.
- Verify: no references to MoveablePartsModal in AvailabilityStep; lint passes; app starts.

## Checkpoint
- MoveablePartsModal removed from AvailabilityStep; slot click no longer opens modal; moveable flow is in-step only. Lint passes; app starts.

## How we build the tierDown
- **Task 6.9.4.2:** Remove modal import and template block; remove openMoveableModal call from handleAppointmentSlotClick.
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.9.4-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/sessions/task-6.9.4.1-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

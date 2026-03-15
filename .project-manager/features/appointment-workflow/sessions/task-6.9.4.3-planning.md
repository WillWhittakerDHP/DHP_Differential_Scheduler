# Plan: task 6.9.4.3 — 6.9.4.3

## Contract
- **Tier:** task | **ID:** 6.9.4.3
- **Scope:** 6.9.4.3
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
Task 6.9.4.2 complete: MoveablePartsModal removed from AvailabilityStep; moveable flow is in-step. Modal component file remains but is no longer used.

## Goal
Mark MoveablePartsModal as deprecated. Add JSDoc @deprecated and inline comment so future developers know the component is superseded by the in-step flow (AvailabilitySubStepContent step 4). Leave the file in place for reference; no removal in this task.

## Files
- `client/src/components/booking/MoveablePartsModal.vue` — add JSDoc @deprecated to component; add inline deprecation comment in the HTML block.

## Approach
- Add `@deprecated` JSDoc block at top of script (or in HTML comment) explaining: superseded by in-step moveable flow (Session 6.9.4); use AvailabilitySubStepContent step 4 instead.
- Update the existing HTML comment block to include deprecation notice.
- No runtime deprecation warning (avoids console noise); JSDoc and comments suffice for IDE and code review.

## Checkpoint
- MoveablePartsModal clearly marked deprecated in JSDoc and comments. Lint passes; app starts.

## How we build the tierDown
- **Task 6.9.4.3:** Add @deprecated JSDoc and inline deprecation comment to MoveablePartsModal.vue.
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.9.4-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/sessions/task-6.9.4.2-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

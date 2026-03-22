# Plan: task 6.9.3.1 — 6.9.3.1

## Contract
- **Tier:** task | **ID:** 6.9.3.1
- **Scope:** 6.9.3.1
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
Session 6.9.3 started. Narrow layout uses VExpansionPanels; sub-step headers and content exist. This task adds keyboard navigation only (ARIA, focus, reduced motion in later tasks).

## Goal
Enable keyboard-only navigation of the expandable sub-step cards: Tab between headers; Enter/Space to expand/collapse; optionally arrow keys for step-to-step movement.

## Files
- `client/src/components/booking/steps/AvailabilityStep.vue` — VExpansionPanels; ensure Tab order follows sub-step sequence; wire keyboard handlers if Vuetify does not provide Enter/Space by default.
- `client/src/components/booking/steps/AvailabilitySubStepHeader.vue` — header must be focusable and respond to Enter/Space for expand/collapse.
- Vuetify VExpansionPanel/VExpansionPanelTitle — verify native keyboard behavior; augment if needed.

## Approach
1. Verify Vuetify VExpansionPanel/VExpansionPanelTitle keyboard support (Tab, Enter, Space) — check docs.
2. Ensure Tab order follows visible sub-step sequence (headers first, then content when expanded).
3. If Vuetify handles Enter/Space natively, confirm and document; if not, add @keydown handlers on headers.
4. Consider arrow keys (Up/Down) for step-to-step: optional enhancement if time permits; defer if complex.
5. Test: keyboard-only navigation through all visible sub-steps; expand/collapse via Enter/Space.

## Checkpoint
- Keyboard-only user can Tab between sub-step headers and expand/collapse with Enter/Space.
- Tab order follows sub-step sequence.
- Lint passes; app starts; no regression.

## How we build the tierDown
- **Task 6.9.3.1:** Keyboard navigation (this task; no further decomposition)
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.9.3-guide.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

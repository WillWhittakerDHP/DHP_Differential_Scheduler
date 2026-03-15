# Plan: task 6.9.3.2 — 6.9.3.2

## Contract
- **Tier:** task | **ID:** 6.9.3.2
- **Scope:** 6.9.3.2
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
Task 6.9.3.1 complete: keyboard navigation on expandable cards. Tab between headers, Enter/Space expand/collapse. VExpansionPanel/VExpansionPanelTitle provide native keyboard support. This task adds ARIA attributes so screen readers announce step position and state.

## Goal
Add ARIA attributes (aria-expanded, aria-controls, aria-label/aria-labelledby) to expandable sub-step cards and headers so screen readers announce step position and state. Ensure semantics support assistive tech.

## Files
- `client/src/components/booking/steps/AvailabilityStep.vue` — VExpansionPanels/VExpansionPanel/VExpansionPanelTitle; bind ARIA to narrowExpanded and step index; ensure content IDs for aria-controls.
- `client/src/components/booking/steps/AvailabilitySubStepHeader.vue` — optional aria-label/aria-labelledby if needed; header is inside VExpansionPanelTitle (Vuetify may provide some).
- Existing composables (useAvailabilityStepUI, useAvailabilitySubSteps) — unchanged; used as-is.

## Approach

### Design Before Execute (pseudocode)

1. **AvailabilityStep.vue — VExpansionPanel**
   - Generate stable `id` for each panel content: `availability-substep-content-${step.index}`.
   - Bind `:aria-expanded="narrowExpanded === step.index"` on VExpansionPanelTitle (or pass to header).
   - Bind `aria-controls="availability-substep-content-${step.index}"` on header so it points to VExpansionPanelText content.
   - Vuetify VExpansionPanelTitle renders as button; ensure we don't override role. Add `aria-label` or `aria-labelledby` for step position: e.g. `"Step ${step.index + 1} of ${visibleSubStepsFiltered.length}: ${step.label}"`.

2. **VExpansionPanelText**
   - Add `:id="'availability-substep-content-' + step.index"` so aria-controls targets it.
   - Optionally `role="region"` and `aria-labelledby` pointing to header id if we add one.

3. **AvailabilitySubStepHeader.vue**
   - If ARIA is better on the wrapper (VExpansionPanelTitle), keep header presentational. Otherwise add `aria-label` with step position when used in narrow layout (prop from parent).

4. **Verification**
   - Test with NVDA/VoiceOver: expanding a panel should announce "Step X of Y, expanded" and state changes.

### Key snippets
- `VExpansionPanelTitle` + `:aria-expanded="narrowExpanded === step.index"` + `:aria-controls="'availability-substep-content-' + step.index"` + `:aria-label="\`Step \${step.index + 1} of \${visibleSubStepsFiltered.length}: \${step.label}\`"`
- `VExpansionPanelText` + `:id="'availability-substep-content-' + step.index"`

## Checkpoint
- Screen reader announces step position (e.g. "Step 2 of 5") and state (expanded/collapsed).
- aria-expanded, aria-controls, aria-label present and correct on headers.
- Lint passes; app starts; no regression.
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.9.3-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/sessions/task-6.9.3.1-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

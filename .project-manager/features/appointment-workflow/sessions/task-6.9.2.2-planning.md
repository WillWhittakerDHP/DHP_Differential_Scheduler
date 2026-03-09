# Plan: task 6.9.2.2 — 6.9.2.2

## Contract
- **Tier:** task | **ID:** 6.9.2.2
- **Scope:** 6.9.2.2
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
Optional auto-expand next card and collapse previous on sub-step completion; add transitions/animations for expand/collapse; ensure sub-step state (current index, completed set) is explicit and usable by 6.9.3 (a11y) and 6.9.4 (5th content). No a11y implementation in this session.

## Files
- `client/src/components/booking/steps/AvailabilityStep.vue` — auto-expand/collapse behavior (verify or wire), VExpansionPanel transitions.
- `client/src/composables/booking/useAvailabilitySubSteps.ts` — no changes unless state exposure needs extension.
- `client/src/composables/booking/useAvailabilitySettings.ts` — optional flag for auto-expand (if configurable).

## Approach
- **Auto-expand/collapse:** 6.9.2.1 already syncs `narrowExpanded` from `currentStepIndex` via watcher; when user confirms a step, `currentStepIndex` advances and the next panel opens. Verify this flow; add optional admin toggle (e.g. `differentialPerspectives.autoExpandOnComplete`) if configurable; default on.
- **Transitions:** Add Vue/Vuetify-compatible transitions for VExpansionPanel expand/collapse (e.g. `transition` on VExpansionPanelText, or Vuetify's built-in expansion transition). Keep duration and easing consistent with wizard (e.g. 200–300ms).
- **State exposure:** `useAvailabilitySubSteps` already exposes `currentStepIndex` and `completedStepIndices`; confirm these are consumed correctly and stable for 6.9.3/6.9.4.
- **Design Before Execute (pseudocode):**
  1. In AvailabilityStep.vue: confirm watcher `currentStepIndexValue -> narrowExpanded` triggers auto-expand on confirm.
  2. Add `transition` / `VExpandTransition` or equivalent to VExpansionPanelText for smooth expand/collapse.
  3. If configurable: add `autoExpandOnComplete?: boolean` to availabilitySettings; gate watcher or sync logic.
  4. Run lint, type-check, manual narrow-screen test.

## Checkpoint
- Auto-expand next card and collapse previous on sub-step completion (default on; configurable if implemented).
- Expand/collapse transitions are smooth and consistent.
- Sub-step state (current index, completed set) remains explicit for 6.9.3 and 6.9.4.
- Wide layout unchanged. Lint passes; app starts; no regression.

## How we build the tierDown
- **Phase 6.9:** Availability step mini-wizard
- **Session 6.9.2:** Narrow layout — expandable cards and state
- **Task 6.9.2.1:** Expandable cards and state
- **Task 6.9.2.2:** Auto-expand/collapse and animations
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.9.2-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/sessions/task-6.9.2.1-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

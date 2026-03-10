# Plan: task 6.9.3.4 — 6.9.3.4

## Contract
- **Tier:** task | **ID:** 6.9.3.4
- **Scope:** 6.9.3.4
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
Task 6.9.3.3 complete: focus management on expand/collapse. This task adds `prefers-reduced-motion` support so users who prefer reduced motion get instant expand/collapse (no animation).

## Goal
Respect `prefers-reduced-motion`: when the user has set reduced motion in OS/browser, disable or shorten expand/collapse animations on the narrow-layout expansion panels.

## Files
- `client/src/components/booking/steps/AvailabilityStep.vue` — add `@media (prefers-reduced-motion: reduce)` overrides for transition duration.

## Approach

### Design Before Execute (pseudocode)

1. **Current state:** `.availability-step-panels` sets `--v-expand-transition-duration: 0.25s`; `.v-expansion-panel-text__wrapper` has `transition-duration: 0.25s`. Vuetify VExpansionPanel uses these for expand/collapse animation.

2. **Add reduced-motion override:**
   - `@media (prefers-reduced-motion: reduce)` block.
   - Inside: set `--v-expand-transition-duration: 0s` on `.availability-step-panels`.
   - Inside: set `transition-duration: 0s` on `.availability-step-panels :deep(.v-expansion-panel-text__wrapper)`.
   - RESOURCE: [MDN prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) — media query for user preference.

3. **Verification:** In DevTools, enable "Emulate CSS media feature prefers-reduced-motion: reduce" (or set in OS accessibility settings); expand/collapse should be instant.

### Key snippets
```scss
@media (prefers-reduced-motion: reduce) {
  .availability-step-panels {
    --v-expand-transition-duration: 0s;
  }
  .availability-step-panels :deep(.v-expansion-panel-text__wrapper) {
    transition-duration: 0s;
  }
}
```

## Checkpoint
- When `prefers-reduced-motion: reduce`, expand/collapse is instant (no animation).
- Lint passes; app starts; no regression.
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.9.3-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/sessions/task-6.9.3.3-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

# Plan: task 6.9.3.3 — 6.9.3.3

## Contract
- **Tier:** task | **ID:** 6.9.3.3
- **Scope:** 6.9.3.3
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
Task 6.9.3.2 complete: ARIA attributes (aria-expanded, aria-controls, aria-label, aria-labelledby) on headers and content. This task adds focus management so keyboard/screen-reader users get focus moved into content on expand and back to header on collapse.

## Goal
When expanding a card, move focus into the expanded content (first focusable element); when collapsing, return focus to the card header. Avoid focus trap — Tab and Escape must allow normal exit.

## Files
- `client/src/components/booking/steps/AvailabilityStep.vue` — narrow layout VExpansionPanels; add focus watcher/handler; no changes to AvailabilitySubStepContent.
- Existing composables — unchanged.

## Approach

### Design Before Execute (pseudocode)

1. **Watch narrowExpanded** — when it changes, run focus logic.
   - `watch(narrowExpanded, (newVal, oldVal) => { ... }, { flush: 'post' })` so DOM is updated after Vuetify expand/collapse.

2. **On expand (newVal >= 0):**
   - `nextTick`: wait for VExpansionPanelText content to be visible.
   - `contentEl = document.getElementById('availability-substep-content-' + newVal)`.
   - `focusable = contentEl?.querySelector('[tabindex="-1"], [tabindex="0"], button, input, select, textarea, a[href]')` — first focusable in DOM order.
   - If found: `focusable.focus()`. Else: optionally focus content container with `tabindex="-1"` so user can Tab into it; or leave as-is (user can Tab).
   - RESOURCE: [MDN :focusable](https://developer.mozilla.org/en-US/docs/Web/API/HTMLOrForeignElement/focus#focusable_elements) — focusable elements.

3. **On collapse (newVal === -1):**
   - `headerEl = document.getElementById('availability-substep-title-' + oldVal)`.
   - `headerEl?.focus()`.

4. **No focus trap:** VExpansionPanel does not use focus-trap; Tab/Escape naturally allow exit. Do not add focus-trap or inert.

5. **Edge:** When expanding from panel M to N (user clicks header N), we expand N; focus content of N. When collapsing (user clicks header M again or Enter/Space), narrowExpanded goes to -1; focus header M.

### Key snippets
- `watch(narrowExpanded, (newVal, oldVal) => { if (newVal >= 0) focusFirstFocusableInContent(newVal); else if (oldVal >= 0) focusHeader(oldVal); }, { flush: 'post' })`
- `function focusFirstFocusableInContent(stepIndex: number): void` — `nextTick` → `getElementById` → `querySelector` → `focus`.
- `function focusHeader(stepIndex: number): void` — `getElementById` → `focus`.

## Checkpoint
- Focus moves into content on expand and to header on collapse.
- Tab/Escape allow exit; no focus trap.
- Lint passes; app starts; no regression.
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.9.3-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/sessions/task-6.9.3.2-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

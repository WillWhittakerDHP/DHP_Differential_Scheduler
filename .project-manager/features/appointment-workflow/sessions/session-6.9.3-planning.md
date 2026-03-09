# Plan: session 6.9.3 — A11y and Focus for Expandable Cards

## Contract
- **Tier:** session | **ID:** 6.9.3
- **Scope:** A11y and Focus for Expandable Cards
- **Governance:** 5 governance highlights — read reports before filling slots

## Work Profile
- **Execution intent:** plan
- **Action type:** decomposition
- **Scope shape:** cross_cutting
- **Governance domains:** docs
- **Recommended context pack:** decomposition_pack
- **Planning artifact action:** create
- **Decomposition mode:** moderate
- **Downstream advice:** Planning doc is advisory; guide owns current-tier decomposition. Inherit intent, constraints, and governance emphasis; avoid pre-specifying child execution detail unless decomposition mode is explicit.

## Where we left off
Session 6.9.2 complete: narrow layout with expandable cards (VExpansionPanel), current/completed state, auto-expand/collapse, and explicit sub-step state. useAvailabilityStepUI composable extracted. This session adds accessibility only; no step 5 content (6.9.4).

## Goal
Add accessibility to the expandable sub-step cards: keyboard navigation, ARIA attributes, focus management, and reduced motion. Ensure the mini-wizard is usable without a mouse and with assistive tech.

## Files
- `client/src/components/booking/steps/AvailabilityStep.vue` — narrow layout VExpansionPanels; keyboard handlers, ARIA, focus, reduced motion.
- `client/src/components/booking/steps/AvailabilitySubStepHeader.vue` — header focus targets, ARIA (aria-expanded, aria-controls, aria-label).
- `client/src/components/booking/steps/AvailabilitySubStepContent.vue` — content focus targets on expand.
- Existing composables (useAvailabilityStepUI, useAvailabilitySubSteps) — unchanged; used as-is.

## Approach
- **6.9.3.1:** Keyboard: Tab between headers; Enter/Space expand/collapse; arrow keys for step-to-step if appropriate.
- **6.9.3.2:** ARIA: aria-expanded, aria-controls, aria-label/aria-labelledby; roles so screen readers announce step position and state.
- **6.9.3.3:** Focus: on expand, focus first focusable in content; on collapse, focus header; no focus trap.
- **6.9.3.4:** prefers-reduced-motion: reduce or disable expand/collapse animations when set.

## Checkpoint
- Keyboard-only user can navigate and expand/collapse cards.
- Screen reader announces step position and state.
- Focus moves correctly on expand/collapse; no focus trap.
- Reduced motion respected.
- Lint passes; app starts; no regression.

## How we build the tierDown to achieve them
- **Task 6.9.3.1:** Keyboard navigation
- **Task 6.9.3.2:** ARIA and semantics
- **Task 6.9.3.3:** Focus management
- **Task 6.9.3.4:** Reduced motion
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/phases/phase-6.9-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/sessions/session-6.9.2-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

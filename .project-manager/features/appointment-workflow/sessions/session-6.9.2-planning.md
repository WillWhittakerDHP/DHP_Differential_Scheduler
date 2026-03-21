# Plan: session 6.9.2 — Narrow Layout — Expandable Cards and State

## Contract
- **Tier:** session | **ID:** 6.9.2
- **Scope:** Narrow Layout — Expandable Cards and State
- **Governance:** 4 governance highlights — read reports before filling slots

## Where we left off
Session 6.9.1 complete: sub-step model, wide layout, steps 1–4 wired, step 5 reserved with placeholder and visibility gate. This session adds narrow-screen behavior only.

## Goal
Implement responsive narrow-screen behavior for the availability mini-wizard: each sub-step (including the optional 5th when visible) becomes an expandable card; track current step and completed state; show done indicator when collapsed; optional auto-expand next / collapse previous on completion. Animations and visual polish for the cards. Sub-step state (current index, completed set) must be explicit so 6.9.3 (a11y) and 6.9.4 (5th content) can rely on it. No a11y implementation in this session.

## Files
- `client/src/components/booking/steps/AvailabilityStep.vue` — add narrow-breakpoint layout: wrap sub-steps in expandable cards (e.g. VExpansionPanel or custom), current/completed state, done indicator.
- Sub-step model and orchestrator (existing from 6.9.1) — expose or extend for current index and completed set if needed.
- No changes to MoveablePartsModal or step 5 content in this session (6.9.4).

## Approach
- On narrow breakpoint, wrap each sub-step in an expandable card (VExpansionPanel or custom). All sub-steps in the model (1–5; 5 shown only when moveable gate is true) use the same card behavior.
- Current sub-step expanded by default; completed sub-steps show a done indicator when collapsed.
- Consider auto-expand next card and collapse previous when user completes a sub-step (configurable or default on).
- Transitions/animations for expand/collapse consistent with the rest of the wizard.
- Explicit sub-step state (current index, completed set) for 6.9.3 and 6.9.4. No a11y in this session.

## Checkpoint
- Narrow screens: each sub-step is an expandable card; current step expanded, completed steps show done indicator when collapsed.
- Sub-step state (current index, completed set) is explicit and usable by later sessions.
- Wide layout unchanged (still expanded panels with step labels from 6.9.1). Lint passes; app starts; no regression.

## How we build the tierDown to achieve them
- **Task 6.9.2.1:** Expandable cards and state — wrap sub-steps in cards on narrow breakpoint, current/completed state, done indicator.
- **Task 6.9.2.2:** Auto-expand/collapse and animations — optional auto-expand next on completion, transitions/animations; ensure sub-step state is explicit.
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/phases/phase-6.9-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/sessions/session-6.9.1-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

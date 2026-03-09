# Plan: task 6.9.2.1 — Expandable cards and state

## Contract
- **Tier:** task | **ID:** 6.9.2.1
- **Scope:** Expandable cards and state (narrow breakpoint only)
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
Session 6.9.1 complete: sub-step model, wide layout, steps 1–4 wired, step 5 slot with visibility gate. This task adds narrow layout only (cards + state); auto-expand/collapse and animations are Task 6.9.2.2.

## Goal
On narrow breakpoint, wrap each sub-step in an expandable card; track and display current step and completed state; show a done indicator when a completed step is collapsed. Sub-step state (current index, completed set) must be explicit for 6.9.3 and 6.9.4.

## Files
- `client/src/components/booking/steps/AvailabilityStep.vue` — narrow layout with expandable cards (e.g. VExpansionPanel or custom), current/completed state, done indicator.
- Sub-step model / orchestrator (existing from 6.9.1) — expose or extend for current index and completed set if needed.

## Approach
1. Detect narrow breakpoint (e.g. Vuetify `useDisplay()` or existing mobile breakpoint used in AvailabilityStep).
2. When narrow: render each visible sub-step (1–5; 5 only when moveable gate) inside an expandable card (VExpansionPanel or custom); single expanded panel = current step.
3. Add or reuse state for current sub-step index and completed indices (Set or array); derive from existing validation/selection (day selected, options selected, perspective selected, slot selected, etc.).
4. Current sub-step expanded by default; completed sub-steps show a done indicator (e.g. checkmark or label) in the card header when collapsed.
5. Wide layout: leave unchanged (all panels expanded with step labels per 6.9.1).

## Checkpoint
- Narrow screens: each sub-step is an expandable card; current step expanded; completed steps show done indicator when collapsed.
- Sub-step state (current index, completed set) is explicit and usable by 6.9.3 and 6.9.4.
- Wide layout unchanged. Lint passes; app starts; no regression.
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.9.2-guide.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

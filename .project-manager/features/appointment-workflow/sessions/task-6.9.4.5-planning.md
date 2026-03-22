# Plan: task 6.9.4.5 — Verify 5th panel in wide/narrow layout

## Contract
- **Tier:** task | **ID:** 6.9.4.5
- **Scope:** 6.9.4.5
- **Governance:** 1 governance highlights — read reports before filling slots

## Work Profile
- **Execution intent:** verify
- **Action type:** localized_change
- **Scope shape:** file_local
- **Governance domains:** component
- **Recommended context pack:** local_implementation_pack
- **Planning artifact action:** update
- **Decomposition mode:** moderate

## Where we left off
Task 6.9.4.4 complete: slot selection validation gates on moveable confirmation. The 5th sub-step (index 4) has moveable content from 6.9.4.1 and is included in visibleSubSteps when hasMoveablePartsGated.

## Goal
Wide/narrow layout: 5th sub-step already follows the same pattern as 1–4 (from 6.9.1/6.9.2); ensure any state or a11y from 6.9.2/6.9.3 applies to the 5th panel/card when it has content.

## Files
- `client/src/components/booking/steps/AvailabilityStep.vue` — 5th panel integration; verify expandable card, a11y, and layout.

## Approach
- Trace template: narrow uses `visibleSubStepsFiltered` in VExpansionPanels; wide uses `leftColumnSteps` (index ≤ 1) and `rightColumnSteps` (index ≥ 2). Step 4 is in rightColumnSteps when visible.
- Verify: same VExpansionPanel/VExpansionPanelTitle/VExpansionPanelText for all steps; same ARIA attributes, focus management, keyboard handlers.
- Fix: aria-label uses `step.index + 1` but step 2 is hidden, so visible steps can be [0,1,3,4] → "Step 5 of 4" is wrong. Use position in visible list (1-based) for step number.
- Run lint; verify app starts.

## Checkpoint
- 5th panel behaves like 1–4 in narrow (expandable) and wide (section) layouts; aria-label correct; lint passes; app starts.

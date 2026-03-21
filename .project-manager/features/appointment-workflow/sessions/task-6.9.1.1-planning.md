# Plan: task 6.9.1.1 — Sub-step model and visibility

## Contract
- **Tier:** task | **ID:** 6.9.1.1
- **Scope:** Session 6.9.1 (Sub-Step Model and Wide Layout) — this task only: model + visibility + labels
- **Governance:** Clean — no violations detected

## Where we left off
Session 6.9.1 just started; AvailabilityStep has no sub-step framing. This task delivers the sub-step model, visibility logic, and step labels only; Task 6.9.1.2 wires sections 1–4 and reserves step 5.

## Goal
Define the sub-step model (ordered list of 5 steps with id/label) and visibility conditions: step 2 (Options) visible when `availableOptionTypeBlocks.length > 0`; step 3 (Perspective) when a date is selected and `isEffectivelyDifferential`; step 5 (Confirm moveable details) when slot has moveable parts and service has preClosing (same gate as `hasMoveablePartsGated` / `showMoveableModal`). Add step labels ("1. Pick a day", "2. Options", "3. Perspective", "4. Pick a time", "5. Confirm moveable details") so the wide layout can show them. No wiring of section content or step 5 placeholder in this task — that is 6.9.1.2.

## Files
- `client/src/components/booking/steps/AvailabilityStep.vue` — add sub-step model (data or composable), visibility computeds, and step labels in template.
- useAvailabilityOrchestrator (existing) — use for `availableOptionTypeBlocks`, selected date, `isEffectivelyDifferential`, and moveable gate (hasMoveablePartsGated / showMoveableModal or equivalent).

## Approach
- Define sub-step model: e.g. array of `{ id: 1..5, label, key }`; or a composable `useAvailabilitySubSteps(orchestrator)` that returns `subSteps: ComputedRef<Array<{ id: number, label: string, visible: boolean }>>` with visibility derived from orchestrator state.
- Visibility: step 1 always; step 2 when `availableOptionTypeBlocks?.length > 0`; step 3 when date selected and `isEffectivelyDifferential`; step 4 always; step 5 when moveable gate (slot has moveable parts + service preClosing).
- In AvailabilityStep: expose the model (or use composable) and render step labels in the template; optionally wrap existing sections in a v-for over visible sub-steps or add labels above each section. Do not yet move/reorder DOM for sections 1–4 or add step 5 slot — that is 6.9.1.2.
- No changes to orchestrator validation or slot calculation.

## Checkpoint
- Sub-step model (5 steps) and visibility conditions implemented and correct.
- Step labels visible in Availability step (wide layout); options/perspective/moveable steps show or hide per conditions.
- Lint passes; app starts; no regression to existing availability behavior.

## How we build the tierDown to achieve them
- This task only; no child tiers. Implementation order: (1) define model/computed for sub-steps and visibility, (2) add labels to template, (3) verify visibility toggles.
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.9.1-guide.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

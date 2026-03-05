# Plan: session 6.9.1 — Sub-Step Model and Wide Layout

## Contract
- **Tier:** session | **ID:** 6.9.1
- **Scope:** Availability Step Mini-Wizard (Phase 6.9) — wide layout only
- **Governance:** 4 governance highlights — read reports before filling slots

## Where we left off
Phase 6.9 just started; no prior session handoff. AvailabilityStep has no sub-step framing; existing sections (calendar, options, differential, slot grid) are in place.

## Goal
Define the sub-step model (order and visibility conditions) including the optional 5th from the start, and implement the wide-screen experience only. Deliver: (1) sub-step model with five slots, visibility for options/perspective/moveable; (2) step labels on all sections; (3) steps 1–4 wired to existing components; (4) step 5 reserved with placeholder and visibility gate. No narrow/card behavior in this session.

## Files
- `client/src/components/booking/steps/AvailabilityStep.vue` — add sub-step model, step labels, wire sections 1–4, reserve step 5 slot.
- Existing child sections (no file changes to their internals): AvailabilityCalendarSection, AvailabilityOptionsSection, DifferentialGraph, AppointmentSlotGrid — used as content for sub-steps 1–4.
- Composables: useAvailabilityOrchestrator (existing; use for hasMoveablePartsGated / showMoveableModal or equivalent for step 5 visibility). No new composables required unless we extract sub-step model to a composable for reuse in 6.9.2.

## Approach
- Introduce a sub-step model: ordered list of 5 steps with ids/labels; visibility: step 2 when `availableOptionTypeBlocks.length > 0`, step 3 when date selected and `isEffectivelyDifferential`, step 5 when slot has moveable parts and service preClosing (same gate as current moveable modal).
- In AvailabilityStep template: wrap or group existing sections with step labels ("1. Pick a day", "2. Options", "3. Perspective", "4. Pick a time", "5. Confirm moveable details"); render step 5 only when visibility gate is true; step 5 content is a placeholder (header + stub or loading state).
- Ensure options sub-step is visible and ordered before perspective when options exist. No changes to orchestrator validation or slot calculation.
- Wide layout only: all panels expanded; narrow layout unchanged until Session 6.9.2.

## Checkpoint
- Sub-step model defined with five steps and correct visibility (options, perspective, moveable).
- Step labels visible on wide layout; steps 1–4 wired to calendar, options, differential, slot grid.
- Step 5 panel/slot present when moveable gate is true; placeholder content only.
- Lint passes; app starts; no regression to existing availability behavior.

## How we build the tierDown to achieve them
- **Task 6.9.1.1:** Sub-step model and visibility — define ordered sub-steps 1–5, visibility conditions (options, perspective, moveable gate), and step labels
- **Task 6.9.1.2:** Wire sections 1–4 and reserve step 5 — wire calendar/options/differential/slot grid into sub-step structure; add step 5 slot with placeholder and visibility gate
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/phases/phase-6.9-guide.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

# Plan: phase 6.9 — 6.9

## Contract
- **Tier:** phase | **ID:** 6.9
- **Scope:** 6.9
- **Governance:** 2 governance highlights — read reports before filling slots

## Where we left off
- **Phase 6.8 (Admin Force-Create & Constraint Overrides)** in progress: Session 6.8.6 (Admin entry step 0 / pre-wizard) with task 6.8.6.3. Availability step (step 3) already has AvailabilityStep.vue, AvailabilityCalendarSection, AvailabilityOptionsSection, DifferentialGraph, AppointmentSlotGrid; no sub-step framing yet. Phase 6.9 builds the mini-wizard structure on top of that.

## Goal
Reframe the Appointment Availability (wizard step 3) as a mini-wizard with four sub-steps: (1) Pick a day, (2) Pick block instance options when they exist (affect differential), (3) Pick perspective only when a date is selected and the booking is differential, (4) Pick a time. Wide screens: all sub-steps as expanded panels with step labels; narrow screens: each sub-step as an expandable card (current expanded, completed show done indicator when collapsed). Preserve existing validation, differential derivation, and slot selection behavior; presentation and layout only.

## Files
- `client/src/components/booking/steps/AvailabilityStep.vue` — main step; add sub-step structure and responsive layout.
- Existing sections: AvailabilityCalendarSection, AvailabilityOptionsSection, DifferentialGraph, AppointmentSlotGrid (wire into sub-steps; no behavior change).
- Composables: useAvailabilityOrchestrator, useTimeSlotCalculations, and related availability/slot logic (unchanged; used as-is).
- New or adjusted: sub-step model (order, visibility conditions); optional wrapper or VExpansionPanel for narrow-screen expandable cards.

## Approach
- Define sub-step model and order: Day → Options (conditional on `availableOptionTypeBlocks.length > 0`) → Perspective (conditional on date selected and `isEffectivelyDifferential`) → Time.
- Wide layout: add step labels/numbers to existing sections (e.g. "1. Pick a day", "2. Options", "3. Perspective", "4. Pick a time"); keep all panels expanded.
- Narrow layout: wrap each sub-step in an expandable card (e.g. VExpansionPanel or custom); current step expanded by default; completed steps show a done indicator when collapsed; optionally auto-expand next and collapse previous on completion.
- Ensure options sub-step is visible and ordered before perspective when options exist. No changes to orchestrator validation or slot calculation.

## Checkpoint
- Sub-steps defined and ordered: Day → Options (if any) → Perspective (if differential) → Time.
- Block instance options appear as a dedicated sub-step when `availableOptionTypeBlocks.length > 0`.
- Perspective sub-step only visible when date selected and booking is differential.
- Wide: all sub-steps visible as expanded panels with step labels; narrow: expandable cards with current expanded and completed done indicator.
- Existing validation and slot behavior unchanged; lint passes; app starts without errors.

## How we build the tierDown to achieve them
- **Session 6.9.1:** Availability Mini-Wizard Structure & Responsive Cards
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/feature-appointment-workflow-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/phases/phase-6.8-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

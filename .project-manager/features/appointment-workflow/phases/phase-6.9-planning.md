# Plan: phase 6.9 — 6.9

## Contract
- **Tier:** phase | **ID:** 6.9
- **Scope:** 6.9
- **Governance:** 2 governance highlights — read reports before filling slots

## Where we left off
- **Phase 6.8 (Admin Force-Create & Constraint Overrides)** in progress: Session 6.8.6 (Admin entry step 0 / pre-wizard) with task 6.8.6.3. Availability step (step 3) already has AvailabilityStep.vue, AvailabilityCalendarSection, AvailabilityOptionsSection, DifferentialGraph, AppointmentSlotGrid; no sub-step framing yet. Phase 6.9 builds the mini-wizard structure on top of that.

## Goal
Reframe the Appointment Availability (wizard step 3) as a mini-wizard with sub-steps: (1) Pick a day, (2) Pick block instance options when they exist (affect differential), (3) Pick perspective only when a date is selected and the booking is differential, (4) Pick a time, (5) Confirm moveable details — optional, when the selected slot has moveable parts and the service has preClosing. Replace MoveablePartsModal with this optional 5th sub-step; deprecate the modal (no longer the default). Wide screens: all sub-steps as expanded panels with step labels; narrow screens: each sub-step as an expandable card (current expanded, completed show done indicator when collapsed). Preserve existing validation, differential derivation, and slot selection behavior; presentation and layout only (moveable content moves from modal to in-step).

## Files
- `client/src/components/booking/steps/AvailabilityStep.vue` — main step; add sub-step structure, responsive layout, and inline moveable-details (5th sub-step).
- Existing sections: AvailabilityCalendarSection, AvailabilityOptionsSection, DifferentialGraph, AppointmentSlotGrid (wire into sub-steps; no behavior change).
- Composables: useAvailabilityOrchestrator, useTimeSlotCalculations, and related availability/slot logic (unchanged; used as-is). Session 6.9.2: reuse or extract moveable logic (contingency, completion times) for in-step use.
- New or adjusted: sub-step model (order, visibility conditions, optional 5th); optional wrapper or VExpansionPanel for narrow-screen expandable cards.
- `client/src/components/booking/MoveablePartsModal.vue` — deprecated in Session 6.9.2; removed from AvailabilityStep; mark deprecated, do not keep as default.

## Approach
- **6.9.1:** Define sub-step model (including optional 5th: Confirm moveable details, visibility when slot has moveable parts + service preClosing) and wide layout; wire steps 1–4 to existing sections; reserve step 5 slot with placeholder and visibility gate; no narrow behavior yet.
- **6.9.2:** Narrow layout: expandable cards for all sub-steps (including 5 when visible), current/completed state, done indicator, optional auto-expand/collapse; animations and polish.
- **6.9.3:** A11y and focus: keyboard nav, ARIA (aria-expanded, etc.), focus management, reduced motion.
- **6.9.4:** Implement moveable content in the existing 5th sub-step; remove MoveablePartsModal from AvailabilityStep; deprecate modal; wire slot-completion gate. No changes to orchestrator validation or slot calculation except moveable gate.

## Checkpoint
- Sub-steps defined and ordered: Day → Options (if any) → Perspective (if differential) → Time → Confirm moveable details (when applicable).
- Block instance options appear as a dedicated sub-step when `availableOptionTypeBlocks.length > 0`.
- Perspective sub-step only visible when date selected and booking is differential.
- MoveablePartsModal replaced by optional 5th sub-step; modal deprecated and not used in AvailabilityStep.
- Wide: all sub-steps visible as expanded panels with step labels; narrow: expandable cards with current expanded and completed done indicator.
- Existing validation and slot behavior unchanged (moveable flow in-step); lint passes; app starts without errors.

## How we build the tierDown to achieve them
- **Session 6.9.1:** Sub-Step Model and Wide Layout (includes optional 5th in model and layout; step 5 placeholder + visibility gate)
- **Session 6.9.2:** Narrow Layout — Expandable Cards and State
- **Session 6.9.3:** A11y and Focus for Expandable Cards
- **Session 6.9.4:** Moveable Content in 5th Sub-Step; Remove Modal and Deprecate
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/feature-appointment-workflow-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/phases/phase-6.8-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

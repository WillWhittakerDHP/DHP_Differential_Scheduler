# Phase 6.9 Guide: Availability Step Mini-Wizard

**Purpose:** Phase-level guide for the time-picking mini-wizard within the 3rd wizard step (Appointment Availability)

**Tier:** Phase (Tier 1 - High-Level)

---

## Phase Overview

**Phase Number:** 6.9
**Phase Name:** Availability Step Mini-Wizard
**Description:** Reframe "Find a day/time slot" (step 3) as a mini-wizard with explicit sub-steps: (1) Pick a day, (2) Pick block instance options when they exist (they affect differential calculation), (3) Pick perspective only when a date is selected and the booking is differential, (4) Pick a time, (5) Confirm moveable details — optional, only when the selected slot has moveable parts and the service has preClosing. On wide screens all sub-steps are expanded panels with step labels; on narrow screens each sub-step is an expandable card, with the current step expanded and completed steps showing a done indicator when collapsed. MoveablePartsModal is replaced by this optional 5th sub-step and deprecated.

**Duration:** 2 sessions
**Status:** Not Started

---

## Context: What Already Exists

**AvailabilityStep.vue:** Calendar (AvailabilityCalendarSection), options (AvailabilityOptionsSection), DifferentialGraph (when differential), AppointmentSlotGrid. Layout is a single column on small screens and calendar + time-selection side-by-side from ~600px up.

**Option-type blocks:** AvailabilityOptionsSection shows `availableOptionTypeBlocks`; selection is `selectedOptionTypeBlockId`. Options affect availability/differential calculation and are already below the calendar.

**Differential:** `isEffectivelyDifferential` (or canonical equivalent after Phase 6.4); perspective is `major` | `minor`; DifferentialGraph and overlay prompt user to choose time basis before slots. "Pick perspective" should only appear when **both** a date is selected **and** the booking is differential.

**No sub-step framing:** The step is one continuous flow with no explicit "step 1, 2, 3" labels or responsive collapse into cards.

---

## Phase Objectives

- Introduce a mini-wizard structure within the Availability step with sub-steps: Day → Options (if any) → Perspective (if differential) → Time → Confirm moveable details (optional, when slot has moveable parts and service has preClosing).
- Treat block instance options as a first-class sub-step when they exist, so users see that options affect the differential/availability result.
- Show the perspective sub-step only when a date is selected and the booking is differential.
- Replace MoveablePartsModal with an optional 5th sub-step (Confirm moveable details); deprecate the modal — no longer the default implementation.
- Wide screens: keep current expanded layout; add clear step labels/numbers (e.g. "1. Pick a day", "2. Options", "3. Perspective", "4. Pick a time", "5. Confirm moveable details" when applicable).
- Narrow screens: render each sub-step as an expandable card; expand the current sub-step by default; when a sub-step is completed, show a done indicator on the collapsed card; optionally auto-expand the next card and collapse the previous on completion.
- Preserve existing validation, differential derivation, and slot behavior; change presentation and layout only (moveable content moves from modal to in-step panel).

---

## Sessions Breakdown

- [ ] ### Session 6.9.1: Availability Mini-Wizard Structure & Responsive Cards
**Description:** Add sub-step model and labels; implement responsive behavior (expanded panels vs expandable cards); gate perspective sub-step on date + differential.
**Tasks:**
- Define sub-steps: (1) Pick a day, (2) Pick options (conditional on `availableOptionTypeBlocks.length > 0`), (3) Pick perspective (conditional on date selected and `isEffectivelyDifferential`), (4) Pick a time.
- Wide layout: add step labels/numbers to existing sections; keep all panels expanded.
- Narrow layout: wrap each sub-step in an expandable card (e.g. VExpansionPanel or custom); current step expanded by default; completed steps show done indicator when collapsed; consider auto-expand next / collapse previous on completion.
- Ensure options sub-step is visible and ordered before perspective when options exist.
- No changes to orchestrator validation or slot calculation; wire existing components into the new structure.
- Refine animations, focus management, and a11y for expandable cards if scope allows (keyboard, aria-expanded, focus trap, reduced motion); otherwise defer to follow-up.

- [ ] ### Session 6.9.2: Replace MoveablePartsModal with Optional 5th Sub-Step
**Description:** Replace the MoveablePartsModal (contingency deadline and completion times) with an optional 5th sub-step of the Availability mini-wizard. When the selected slot has moveable parts and the service has preClosing, show "5. Confirm moveable details" as a sub-step (same content as current modal: contingency questions, available completion times). Deprecate MoveablePartsModal — remove its use from AvailabilityStep; keep the component only as deprecated (or remove once in-step implementation is stable).
**Tasks:**
- Add optional 5th sub-step to the sub-step model: "Confirm moveable details", visible only when slot has moveable parts and service has preClosing (same gate as current `hasMoveablePartsGated` / `showMoveableModal` logic).
- Implement moveable-details content inline in the Availability step (e.g. same UI as MoveablePartsModal body: contingency deadline, completion time grid) as the 5th sub-step panel/card. Reuse or extract shared logic (e.g. contingency state, moveable options fetch) into a composable or shared component used by the in-step UI.
- Remove MoveablePartsModal from AvailabilityStep.vue; do not keep the modal as the default implementation.
- Mark MoveablePartsModal as deprecated (JSDoc/comment and optionally export a deprecation notice); remove the component in a later cleanup if desired, or leave as deprecated for reference.
- Ensure slot selection is only considered complete (and step valid) when moveable sub-step is either not applicable or confirmed — same behavior as current modal gate.
- Wide/narrow layout: 5th sub-step follows same pattern as others (expanded panel with label, or expandable card).

---

## Dependencies

**Prerequisites:**
- Phase 6.1–6.3 — Complete
- Phase 6.4 (Moveable Modal & preClosing) — Recommended so differential derivation is canonical; not strictly required if existing `isEffectivelyDifferential` is used consistently.
- AvailabilityStep, AvailabilityCalendarSection, AvailabilityOptionsSection, DifferentialGraph, AppointmentSlotGrid and related composables (useAvailabilityOrchestrator, etc.) in place.

**Downstream Impact:**
- Improves clarity and mobile UX for the Availability step; no API or data model changes.
- Future phases (e.g. rescheduling) reuse the same step; mini-wizard structure applies there as well if we reuse the same component.

---

## Success Criteria

- [ ] Sub-steps are defined and ordered: Day → Options (if any) → Perspective (if differential) → Time → Confirm moveable details (optional, when applicable).
- [ ] Block instance options appear as a dedicated sub-step when `availableOptionTypeBlocks.length > 0`.
- [ ] Perspective sub-step is only visible when a date is selected and the booking is differential.
- [ ] MoveablePartsModal replaced by optional 5th sub-step; modal deprecated and no longer used in AvailabilityStep.
- [ ] When slot has moveable parts and service has preClosing, "Confirm moveable details" appears as 5th sub-step with same behavior (contingency + completion times); slot selection complete only after confirmation or when not applicable.
- [ ] Wide screens: all sub-steps visible as expanded panels with step labels.
- [ ] Narrow screens: each sub-step is an expandable card; current step expanded; completed steps show a done indicator when collapsed.
- [ ] Existing validation, differential logic, and slot selection behavior unchanged (except moveable flow is in-step).
- [ ] Linting passes; app starts without errors.

---

## Related Documents

- Feature Guide: `.project-manager/features/appointment-workflow/feature-appointment-workflow-guide.md`
- Feature Handoff: `.project-manager/features/appointment-workflow/feature-appointment-workflow-handoff.md`
- Phase 6.4 Guide: `.project-manager/features/appointment-workflow/phases/phase-6.4-guide.md` (differential consolidation)
- PROJECT_PLAN: `.project-manager/PROJECT_PLAN.md` (Feature 6)

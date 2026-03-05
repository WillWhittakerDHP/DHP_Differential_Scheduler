# Phase 6.9 Guide: Availability Step Mini-Wizard

**Purpose:** Phase-level guide for the time-picking mini-wizard within the 3rd wizard step (Appointment Availability)

**Tier:** Phase (Tier 1 - High-Level)

---

## Phase Overview

**Phase Number:** 6.9
**Phase Name:** Availability Step Mini-Wizard
**Description:** Reframe "Find a day/time slot" (step 3) as a mini-wizard with explicit sub-steps: (1) Pick a day, (2) Pick block instance options when they exist (they affect differential calculation), (3) Pick perspective only when a date is selected and the booking is differential, (4) Pick a time, (5) Confirm moveable details — optional, only when the selected slot has moveable parts and the service has preClosing. On wide screens all sub-steps are expanded panels with step labels; on narrow screens each sub-step is an expandable card, with the current step expanded and completed steps showing a done indicator when collapsed. MoveablePartsModal is replaced by this optional 5th sub-step and deprecated.

**Duration:** 4 sessions
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

- [ ] ### Session 6.9.1: Sub-Step Model and Wide Layout
**Description:** Define the sub-step model (order, visibility conditions) including the optional 5th from the start, and implement the wide-screen experience. No narrow/card behavior yet — focus on a clean, shippable structure. The 5th sub-step is part of the model and layout now; its content is implemented in 6.9.4.
**Tasks:**
- Define sub-steps: (1) Pick a day, (2) Pick options (conditional on `availableOptionTypeBlocks.length > 0`), (3) Pick perspective (conditional on date selected and `isEffectivelyDifferential`), (4) Pick a time, (5) Confirm moveable details (optional; visible only when slot has moveable parts and service has preClosing — same gate as current `hasMoveablePartsGated` / `showMoveableModal`).
- Add step labels/numbers to existing sections and to the 5th slot: "1. Pick a day", "2. Options", "3. Perspective", "4. Pick a time", "5. Confirm moveable details" (when applicable); keep all panels expanded on wide screens.
- Wire AvailabilityCalendarSection, AvailabilityOptionsSection, DifferentialGraph, AppointmentSlotGrid into sub-steps 1–4; reserve a panel/slot for sub-step 5 (placeholder or empty state until 6.9.4 — e.g. "Confirm moveable details" header with a stub message or loading state so the structure and visibility gate are in place).
- Gate the 5th sub-step visibility on slot has moveable parts + service preClosing so the model and layout already know when to show step 5.
- Ensure options sub-step is visible and ordered before perspective when options exist.
- No changes to orchestrator validation or slot calculation.
- Deliverable: wide layout with all five sub-steps in the model; steps 1–4 wired to existing components; step 5 is a reserved slot with visibility gate, content added in 6.9.4. Narrow can remain single-column or unchanged until 6.9.2.

- [ ] ### Session 6.9.2: Narrow Layout — Expandable Cards and State
**Description:** Implement responsive narrow-screen behavior: each sub-step (including the optional 5th when visible) becomes an expandable card; track current step and completed state; show done indicator when collapsed; optional auto-expand next / collapse previous on completion. Animations and visual polish for the cards.
**Tasks:**
- On narrow breakpoint, wrap each sub-step in an expandable card (e.g. VExpansionPanel or custom component). All sub-steps in the model (1–5; 5 shown only when moveable gate is true) use the same card behavior.
- Current sub-step expanded by default; completed sub-steps show a done indicator when collapsed.
- Consider auto-expand next card and collapse previous when user completes a sub-step (configurable or default on).
- Transitions/animations for expand/collapse that feel consistent with the rest of the wizard.
- Sub-step state (current index, completed set) must be explicit so 6.9.3 (a11y) and 6.9.4 (5th content) can rely on it.
- No a11y implementation yet — that is Session 6.9.3.

- [ ] ### Session 6.9.3: A11y and Focus for Expandable Cards
**Description:** Dedicated session for accessibility of the expandable sub-step cards: keyboard navigation, ARIA attributes, focus management, and reduced motion. Ensures the mini-wizard is usable without a mouse and with assistive tech.
**Tasks:**
- Keyboard: navigate between sub-step headers (e.g. Tab); Enter/Space to expand/collapse; arrow keys if appropriate for step-to-step movement.
- ARIA: aria-expanded, aria-controls, aria-label/aria-labelledby on cards and headers; role and semantics so screen readers announce step position and state.
- Focus: when expanding a card, move focus into the expanded content or to the first focusable element; when collapsing, return focus to the card header; avoid focus trap that blocks escape (user can collapse or Tab out).
- Respect prefers-reduced-motion: reduce or disable expand/collapse animations when the user has set reduced motion.
- Verify with keyboard-only and with a screen reader (manual check or documented test).

- [ ] ### Session 6.9.4: Moveable Content in 5th Sub-Step; Remove Modal and Deprecate
**Description:** The optional 5th sub-step is already in the model and layout (from 6.9.1). This session implements its content (contingency deadline, available completion times — same as current MoveablePartsModal body), replaces MoveablePartsModal by removing its use from AvailabilityStep, and deprecates the modal.
**Tasks:**
- Implement moveable-details content in the existing 5th sub-step panel/slot: contingency questions, completion time grid. Reuse or extract shared logic (contingency state, moveable options fetch) into a composable or shared component used by the in-step UI; replace the placeholder from 6.9.1.
- Remove MoveablePartsModal from AvailabilityStep.vue; do not keep the modal as the default implementation.
- Mark MoveablePartsModal as deprecated (JSDoc/comment and optionally deprecation notice); remove or leave as deprecated for reference in a later cleanup.
- Ensure slot selection is only considered complete (and step valid) when moveable sub-step is either not applicable or confirmed — same behavior as current modal gate.
- Wide/narrow layout: 5th sub-step already follows the same pattern as 1–4 (from 6.9.1/6.9.2); ensure any state or a11y from 6.9.2/6.9.3 applies to the 5th panel/card when it has content.

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

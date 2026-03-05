# Session 6.9.1 Guide: Sub-Step Model and Wide Layout

**Purpose:** Session-level guide for defining the sub-step model and wide-screen experience within Phase 6.9 (Availability Step Mini-Wizard).

**Tier:** Session (Tier 2)

---

## Phase intent (goals and context)

# Phase 6.9 Guide: Availability Step Mini-Wizard

**Purpose:** Phase-level guide for the time-picking mini-wizard within the 3rd wizard step (Appointment Availability)

**Tier:** Phase (Tier 1 - High-Level)

---

## Phase Overview

**Phase Number:** 6.9
**Phase Name:** Availability Step Mini-Wizard
**Description:** Reframe "Find a day/time slot" (step 3) as a mini-wizard with explicit sub-steps: (1) Pick a day, (2) Pick block instance options when they exist (they affect differential calculation), (3) Pick perspective only when a date is selected and the booking is differential, (4) Pick a time, (5) Confirm moveable details — optional, only when the selected slot has moveable parts and the service has preClosing. On wide screens all sub-steps are expanded panels with step labels; on narrow screens each sub-step is an expandable card, with the current step expanded and completed steps showing a done indicator when collapsed. MoveablePartsModal is replaced by this optional 5th sub-step and deprecated.

**Duration:** 4 sessions
**Status:** In Progress (Session 6.9.1)

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

## Sessions in this phase

- **Session 6.9.1:** Sub-Step Model and Wide Layout (this session)
- **Session 6.9.2:** Narrow Layout — Expandable Cards and State
- **Session 6.9.3:** A11y and Focus for Expandable Cards
- **Session 6.9.4:** Moveable Content in 5th Sub-Step; Remove Modal and Deprecate

---

## Session 6.9.1 scope (from phase guide)

**Description:** Define the sub-step model (order, visibility conditions) including the optional 5th from the start, and implement the wide-screen experience. No narrow/card behavior yet — focus on a clean, shippable structure. The 5th sub-step is part of the model and layout now; its content is implemented in 6.9.4.

**Session-level tasks (from phase):**
- Define sub-steps: (1) Pick a day, (2) Pick options (conditional on `availableOptionTypeBlocks.length > 0`), (3) Pick perspective (conditional on date selected and `isEffectivelyDifferential`), (4) Pick a time, (5) Confirm moveable details (optional; visible only when slot has moveable parts and service has preClosing — same gate as current `hasMoveablePartsGated` / `showMoveableModal`).
- Add step labels/numbers to existing sections and to the 5th slot: "1. Pick a day", "2. Options", "3. Perspective", "4. Pick a time", "5. Confirm moveable details" (when applicable); keep all panels expanded on wide screens.
- Wire AvailabilityCalendarSection, AvailabilityOptionsSection, DifferentialGraph, AppointmentSlotGrid into sub-steps 1–4; reserve a panel/slot for sub-step 5 (placeholder or empty state until 6.9.4 — e.g. "Confirm moveable details" header with a stub message or loading state so the structure and visibility gate are in place).
- Gate the 5th sub-step visibility on slot has moveable parts + service preClosing so the model and layout already know when to show step 5.
- Ensure options sub-step is visible and ordered before perspective when options exist.
- No changes to orchestrator validation or slot calculation.
- **Deliverable:** wide layout with all five sub-steps in the model; steps 1–4 wired to existing components; step 5 is a reserved slot with visibility gate, content added in 6.9.4. Narrow can remain single-column or unchanged until 6.9.2.

---

## Session planning (from session planning doc)

**Where we left off:** Phase 6.9 just started; no prior session handoff. AvailabilityStep has no sub-step framing; existing sections (calendar, options, differential, slot grid) are in place.

**Session goal:** Define the sub-step model (order and visibility conditions) including the optional 5th from the start, and implement the wide-screen experience only. Deliver: (1) sub-step model with five slots, visibility for options/perspective/moveable; (2) step labels on all sections; (3) steps 1–4 wired to existing components; (4) step 5 reserved with placeholder and visibility gate. No narrow/card behavior in this session.

**Session files:** `client/src/components/booking/steps/AvailabilityStep.vue`; existing child sections (AvailabilityCalendarSection, AvailabilityOptionsSection, DifferentialGraph, AppointmentSlotGrid); useAvailabilityOrchestrator (hasMoveablePartsGated / showMoveableModal for step 5 visibility).

**Session checkpoint:** Sub-step model defined with five steps and correct visibility (options, perspective, moveable); step labels visible on wide layout; steps 1–4 wired to calendar, options, differential, slot grid; step 5 panel/slot present when moveable gate is true with placeholder only; lint passes; app starts; no regression to existing availability behavior.

---

## Task blocks (Goal, Files, Approach, Checkpoint)

- [x] - [x] - [x] #### Task 6.9.1.1: Sub-step model and visibility

**Goal:** Define the sub-step model (ordered list of 5 steps with id/label) and visibility conditions: step 2 (Options) visible when `availableOptionTypeBlocks.length > 0`; step 3 (Perspective) when a date is selected and `isEffectivelyDifferential`; step 5 (Confirm moveable details) when slot has moveable parts and service has preClosing (same gate as `hasMoveablePartsGated` / `showMoveableModal`). Add step labels ("1. Pick a day", "2. Options", "3. Perspective", "4. Pick a time", "5. Confirm moveable details") so the wide layout can show them. No wiring of section content or step 5 placeholder in this task — that is 6.9.1.2.

**Files:**
- `client/src/components/booking/steps/AvailabilityStep.vue` — add sub-step model (data or composable), visibility computeds, and step labels in template.
- useAvailabilityOrchestrator (existing) — use for `availableOptionTypeBlocks`, selected date, `isEffectivelyDifferential`, and moveable gate (hasMoveablePartsGated / showMoveableModal or equivalent).

**Approach:**
- Define sub-step model: e.g. array of `{ id: 1..5, label, key }`; or a composable `useAvailabilitySubSteps(orchestrator)` that returns `subSteps: ComputedRef<Array<{ id: number, label: string, visible: boolean }>>` with visibility derived from orchestrator state.
- Visibility: step 1 always; step 2 when `availableOptionTypeBlocks?.length > 0`; step 3 when date selected and `isEffectivelyDifferential`; step 4 always; step 5 when moveable gate (slot has moveable parts + service preClosing).
- In AvailabilityStep: expose the model (or use composable) and render step labels in the template; optionally wrap existing sections in a v-for over visible sub-steps or add labels above each section. Do not yet move/reorder DOM for sections 1–4 or add step 5 slot — that is 6.9.1.2.
- No changes to orchestrator validation or slot calculation.

**Checkpoint:**
- Sub-step model (5 steps) and visibility conditions implemented and correct.
- Step labels visible in Availability step (wide layout); options/perspective/moveable steps show or hide per conditions.
- Lint passes; app starts; no regression to existing availability behavior.

**Implementation order:** (1) define model/computed for sub-steps and visibility, (2) add labels to template, (3) verify visibility toggles.

---

- [ ] #### Task 6.9.1.2: Wire sections 1–4 and reserve step 5

**Goal:** Wire AvailabilityCalendarSection, AvailabilityOptionsSection, DifferentialGraph, AppointmentSlotGrid into sub-step structure (steps 1–4); add step 5 slot with placeholder and visibility gate so the layout and gate are in place for 6.9.4. Group or wrap existing sections under step labels; add reserved panel/slot for step 5 with placeholder (e.g. "Confirm moveable details" header with a stub message or loading state); gate step 5 visibility on hasMoveablePartsGated. No narrow/card behavior in this task.

**Files:**
- `client/src/components/booking/steps/AvailabilityStep.vue` — wire sections 1–4 into sub-step structure, add step 5 slot with placeholder.
- Existing child sections (no file changes to their internals): AvailabilityCalendarSection, AvailabilityOptionsSection, DifferentialGraph, AppointmentSlotGrid — used as content for sub-steps 1–4.
- useAvailabilityOrchestrator (existing) — step 5 visibility gate.

**Approach:**
- In AvailabilityStep template: wrap or group existing sections (calendar, options, differential, slot grid) with step labels so each lives under its sub-step (1–4).
- Add a reserved panel/slot for sub-step 5: placeholder or empty state (e.g. "Confirm moveable details" header with a stub message or loading state) so the structure and visibility gate are in place; render step 5 only when visibility gate is true.
- Ensure options sub-step is visible and ordered before perspective when options exist.
- Keep all panels expanded on wide screens; narrow layout unchanged until Session 6.9.2.
- No changes to orchestrator validation or slot calculation.

**Checkpoint:**
- Steps 1–4 wired to calendar, options, differential, slot grid; each section appears under the correct step label.
- Step 5 panel/slot present when moveable gate is true; placeholder content only (no real moveable content yet — that is 6.9.4).
- Lint passes; app starts; no regression to existing availability behavior.

**Implementation order:** (1) group existing sections under step labels in template, (2) add step 5 slot with placeholder and visibility gate, (3) verify layout and visibility.

---

## Phase success criteria (reference for this session)

- Sub-steps are defined and ordered: Day → Options (if any) → Perspective (if differential) → Time → Confirm moveable details (optional, when applicable).
- Block instance options appear as a dedicated sub-step when `availableOptionTypeBlocks.length > 0`.
- Perspective sub-step is only visible when a date is selected and the booking is differential.
- Step 5 (Confirm moveable details) visible only when slot has moveable parts and service has preClosing; placeholder in place until 6.9.4.
- Wide screens: all sub-steps visible as expanded panels with step labels.
- Existing validation, differential logic, and slot selection behavior unchanged (except moveable flow will move in-step in 6.9.4).
- Linting passes; app starts without errors.

---

## Quick Start

**Session ID:** 6.9.1
**Session Name:** Sub-Step Model and Wide Layout
**Description:** Define the sub-step model (order, visibility conditions) including the optional 5th from the start, and implement the wide-screen experience. Tasks: 6.9.1.1 (sub-step model and visibility — done), 6.9.1.2 (wire sections 1–4 and reserve step 5).
**Status:** In Progress

---

## Tasks list

- [x] **Task 6.9.1.1:** Sub-step model and visibility (done)
- [ ] **Task 6.9.1.2:** Wire sections 1–4 and reserve step 5

---

## Session Workflow

### Before Starting a Session

Use `/session-start [SESSION_ID] [description]` to load context and plan tasks.

### During Session

1. Work on one task at a time.
2. Document decisions inline in code.
3. Pause after each task for checkpoint before continuing.

### Reference

- TierUp guide: `.project-manager/features/appointment-workflow/phases/phase-6.9-guide.md`
- Session planning: `.project-manager/features/appointment-workflow/sessions/session-6.9.1-planning.md`
- Task 6.9.1.1 planning: `.project-manager/features/appointment-workflow/sessions/task-6.9.1.1-planning.md`
- Governance: `client/.audit-reports/`; playbooks under `.project-manager/`

## Phase intent (goals and context)

# Phase 6.9 Guide: Availability Step Mini-Wizard

**Purpose:** Phase-level guide for the time-picking mini-wizard within the 3rd wizard step (Appointment Availability)

**Tier:** Phase (Tier 1 - High-Level)

## Session intent from phase guide

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

- [x] #### Task 6.9.1.1: ** 6.9

**Goal:** ** 6.9

**Files:**
(See tierUp guide and context above.)

**Approach:** See tierUp scope above.

**Checkpoint:** Verify per tierUp success criteria. [Fill in]
**Files:**
- [Files to work with]
**Approach:** [Fill in]
**Checkpoint:** [What needs to be verified]
# Session 6.9.4 Guide: Moveable Content in 5th Sub-Step; Remove Modal and Deprecate

**Purpose:** Session-level guide for implementing moveable content in the 5th sub-step panel and deprecating MoveablePartsModal within Phase 6.9 (Availability Step Mini-Wizard).
**Tier:** Session (Tier 2)

---

## Where we left off

Session 6.9.3 complete: a11y and focus for expandable cards (keyboard, ARIA, focus management, reduced motion). The 5th sub-step panel exists as a placeholder from 6.9.1. This session implements its content, removes MoveablePartsModal from AvailabilityStep, and deprecates the modal.

---

## Quick Start

### Tasks

- [x] #### Task 6.9.4.1: Implement moveable content in 5th sub-step panel
**Goal:** Implement moveable-details content in the existing 5th sub-step panel/slot: contingency questions, completion time grid. Reuse or extract shared logic (contingency state, moveable options fetch) into a composable or shared component used by the in-step UI; replace the placeholder from 6.9.1.
**Files:**
- `client/src/components/booking/steps/AvailabilityStep.vue` — 5th sub-step content.
- MoveablePartsModal or related components — extract shared logic.
**Approach:** Reuse or extract shared logic into a composable or shared component; wire contingency state and completion time grid into the 5th panel.
**Checkpoint:** 5th sub-step shows moveable content when applicable. Lint passes; app starts.

- [x] #### Task 6.9.4.2: Remove MoveablePartsModal from AvailabilityStep
**Goal:** Remove MoveablePartsModal from AvailabilityStep.vue; do not keep the modal as the default implementation.
**Files:**
- `client/src/components/booking/steps/AvailabilityStep.vue` — remove modal usage.
**Approach:** Remove modal import, usage, and any triggers; ensure moveable flow is fully in-step.
**Checkpoint:** Modal no longer used in AvailabilityStep. Lint passes; app starts.

- [x] #### Task 6.9.4.3: Deprecate MoveablePartsModal
**Goal:** Mark MoveablePartsModal as deprecated (JSDoc/comment and optionally deprecation notice); remove or leave as deprecated for reference in a later cleanup.
**Files:**
- MoveablePartsModal component file.
**Approach:** Add JSDoc @deprecated and inline comment; optionally add runtime deprecation notice.
**Checkpoint:** Modal clearly marked deprecated. Lint passes.

- [x] #### Task 6.9.4.4: Ensure slot selection validation
**Goal:** Ensure slot selection is only considered complete (and step valid) when moveable sub-step is either not applicable or confirmed — same behavior as current modal gate.
**Files:**
- `client/src/components/booking/steps/AvailabilityStep.vue` — validation/orchestrator.
- Related composables (useAvailabilityOrchestrator, etc.).
**Approach:** Gate step completion on moveable confirmation when applicable; align with current modal gate behavior.
**Checkpoint:** Validation matches previous modal behavior. Lint passes; app starts.

- [x] - [x] - [x] #### Task 6.9.4.5: Verify 5th panel in wide/narrow layout
**Goal:** Wide/narrow layout: 5th sub-step already follows the same pattern as 1–4 (from 6.9.1/6.9.2); ensure any state or a11y from 6.9.2/6.9.3 applies to the 5th panel/card when it has content.
**Files:**
- `client/src/components/booking/steps/AvailabilityStep.vue` — 5th panel integration.
**Approach:** Verify expandable card behavior, a11y, and state apply to 5th panel when visible.
**Checkpoint:** 5th panel behaves like 1–4. Lint passes; app starts.

---

## Session Workflow

### Before Starting a Session

Use `/session-start [SESSION_ID] [description]` to load context and plan tasks.

### During Session

1. Work on one task at a time.
2. Document decisions inline in code.
3. Pause after each task for checkpoint before continuing.

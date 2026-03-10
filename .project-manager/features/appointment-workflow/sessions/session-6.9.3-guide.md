# Session 6.9.3 Guide: A11y and Focus for Expandable Cards

**Purpose:** Session-level guide for accessibility of the expandable sub-step cards within Phase 6.9 (Availability Step Mini-Wizard).
**Tier:** Session (Tier 2)

---

## Where we left off

Session 6.9.2 complete: narrow layout with expandable cards, current/completed state, auto-expand/collapse, and explicit sub-step state. This session adds accessibility: keyboard navigation, ARIA attributes, focus management, and reduced motion. No step 5 content (6.9.4).

---

## Quick Start

### Tasks

- [x] - [x] #### Task 6.9.3.1: Keyboard navigation
**Goal:** Keyboard: navigate between sub-step headers (e.g. Tab); Enter/Space to expand/collapse; arrow keys if appropriate for step-to-step movement.
**Files:**
- `client/src/components/booking/steps/AvailabilityStep.vue` — narrow layout cards.
- `client/src/components/booking/steps/AvailabilitySubStepHeader.vue` — header focus and keyboard handlers.
**Approach:** Ensure Tab order follows sub-step sequence; Enter/Space toggle expand/collapse on focused header; consider arrow keys for step-to-step movement.
**Checkpoint:** Keyboard-only user can navigate and expand/collapse cards. Lint passes; app starts.

- [x] #### Task 6.9.3.2: ARIA and semantics
**Goal:** ARIA: aria-expanded, aria-controls, aria-label/aria-labelledby on cards and headers; role and semantics so screen readers announce step position and state.
**Files:**
- `client/src/components/booking/steps/AvailabilityStep.vue` — VExpansionPanel / card wrapper.
- `client/src/components/booking/steps/AvailabilitySubStepHeader.vue` — header ARIA.
**Approach:** Add aria-expanded, aria-controls, aria-label/aria-labelledby; ensure roles and semantics for screen reader announcements.
**Checkpoint:** Screen reader announces step position and state. Lint passes; app starts.

- [x] #### Task 6.9.3.3: Focus management
**Goal:** Focus: when expanding a card, move focus into the expanded content or to the first focusable element; when collapsing, return focus to the card header; avoid focus trap that blocks escape.
**Files:**
- `client/src/components/booking/steps/AvailabilityStep.vue` — expand/collapse handlers.
- `client/src/components/booking/steps/AvailabilitySubStepContent.vue` — content focus targets.
**Approach:** On expand: focus first focusable in content or content container; on collapse: focus header; ensure Tab/Escape allow exit.
**Checkpoint:** Focus moves correctly on expand/collapse; no focus trap. Lint passes; app starts.

- [ ] #### Task 6.9.3.4: Reduced motion
**Goal:** Respect prefers-reduced-motion: reduce or disable expand/collapse animations when the user has set reduced motion.
**Files:**
- `client/src/components/booking/steps/AvailabilityStep.vue` — animation/transition logic.
**Approach:** Use `prefers-reduced-motion` media query; when true, disable or shorten transitions.
**Checkpoint:** Reduced motion respected. Lint passes; app starts.

---

## Session Workflow

### Before Starting a Session

Use `/session-start [SESSION_ID] [description]` to load context and plan tasks.

### During Session

1. Work on one task at a time.
2. Document decisions inline in code.
3. Pause after each task for checkpoint before continuing.

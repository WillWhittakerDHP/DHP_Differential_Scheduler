# Session 6.9.2 Guide: Narrow Layout — Expandable Cards and State

**Purpose:** Session-level guide for narrow-screen expandable cards and sub-step state within Phase 6.9 (Availability Step Mini-Wizard).
**Tier:** Session (Tier 2)

---

## Where we left off

Session 6.9.1 complete: sub-step model, wide layout, steps 1–4 wired, step 5 reserved with placeholder and visibility gate. This session adds narrow-screen behavior only (expandable cards, current/completed state, done indicator). No a11y in this session (6.9.3); no step 5 content (6.9.4).

---

## Quick Start

### Tasks

- [ ] #### Task 6.9.2.1: Expandable cards and state
**Goal:** On narrow breakpoint, wrap each sub-step in an expandable card; track and display current step and completed state; show a done indicator when a completed step is collapsed.
**Files:**
- `client/src/components/booking/steps/AvailabilityStep.vue` — narrow layout with expandable cards (e.g. VExpansionPanel or custom), current/completed state, done indicator.
- Sub-step model / orchestrator (existing) — expose or extend for current index and completed set if needed.
**Approach:** Use a narrow breakpoint (e.g. useDisplay or existing mobile breakpoint). Render sub-steps 1–5 (5 only when moveable gate) as cards; current sub-step expanded by default; completed sub-steps show done indicator when collapsed. Keep explicit sub-step state (current index, completed set) for 6.9.3 and 6.9.4.
**Checkpoint:** Narrow screens show each sub-step as an expandable card; current step expanded, completed steps show done indicator when collapsed. Wide layout unchanged. Lint passes; app starts.

- [ ] #### Task 6.9.2.2: Auto-expand/collapse and animations
**Goal:** Optional auto-expand next card and collapse previous on sub-step completion; add transitions/animations for expand/collapse; ensure sub-step state is explicit and usable by later sessions.
**Files:**
- `client/src/components/booking/steps/AvailabilityStep.vue` — auto-expand/collapse behavior, transitions.
- Sub-step state (from 6.9.2.1) — ensure current index and completed set are explicit.
**Approach:** When user completes a sub-step, optionally auto-expand the next card and collapse the previous (configurable or default on). Add consistent expand/collapse transitions. Verify sub-step state (current index, completed set) is explicit for 6.9.3 (a11y) and 6.9.4 (5th content).
**Checkpoint:** Auto-expand/collapse works when enabled; animations are consistent. Sub-step state is explicit. Wide layout unchanged. Lint passes; app starts; no regression.

---

## Session Workflow

### Before Starting a Session

Use `/session-start [SESSION_ID] [description]` to load context and plan tasks.

### During Session

1. Work on one task at a time.
2. Document decisions inline in code.
3. Pause after each task for checkpoint before continuing.

# Session 6.9.2 Guide: Narrow Layout — Expandable Cards and State

**Purpose:** Session-level guide for narrow-screen expandable cards and state within Phase 6.9 (Availability Step Mini-Wizard).

**Tier:** Session (Tier 2)

---

## Session Overview

**Session ID:** 6.9.2
**Session Name:** Narrow Layout — Expandable Cards and State
**Description:** Implement responsive narrow-screen behavior: each sub-step becomes an expandable card; track current step and completed state; show done indicator when collapsed.

**Status:** In Progress

---

## Tasks

- [x] #### Task 6.9.2.1: Prefilled vs Confirmed State, Collapsed Summaries, Shared Sub-Steps, First-Available Notice
**Goal:** Implement prefilled vs confirmed state model, admin-configurable sub-step titles, shared sub-step layout across breakpoints, and "Today is fully booked" notice in Pick a day sub-step.
**Files:**
- client/src/composables/booking/useAvailabilityConfirmationState.ts
- client/src/composables/booking/useAvailabilitySubSteps.ts
- client/src/components/booking/steps/AvailabilityStep.vue
- client/src/components/booking/steps/AvailabilitySubStepHeader.vue
- client/src/components/booking/steps/AvailabilitySubStepContent.vue
**Approach:** See task planning doc and handoff.
**Checkpoint:** App starts, lint passes, accordion opens first unconfirmed step when resuming loaded appointment.

---

## Related Documents

- Phase Guide: `.project-manager/features/appointment-workflow/phases/phase-6.9-guide.md`
- Session Log: `.project-manager/features/appointment-workflow/sessions/session-6.9.2-log.md`
- Session Handoff: `.project-manager/features/appointment-workflow/sessions/session-6.9.2-handoff.md`

# Session 6.5.3 Guide: Original-Inspection UI

**Purpose:** Session-level guide for original inspection slot visually distinct but still selectable.

**Tier:** Session (Tier 2 - Medium-Level)

---

## Quick Start

### Session Overview

**Session ID:** 6.5.3
**Session Name:** Original-Inspection UI
**Description:** Original inspection slot visually distinct (e.g. `appointment-slot-btn--original-inspection`) but still selectable.

**Duration:** [Estimated]
**Status:** Not Started

### Tasks

- [ ] #### Task 6.5.3.1: Compute original-inspection slot and pass to grid
**Goal:** Compute which slot is the original inspection (matches loaded appointment's time when rescheduling) and pass its buttonIndex to AppointmentSlotGrid.
**Files:**
- `client/src/composables/booking/useAvailabilityOrchestrator.ts`
- `client/src/components/booking/steps/AvailabilityStep.vue`
- `client/src/utils/booking/timeSlotMatching.ts` (reuse if needed)
**Approach:** When wizardMode === 'reschedule' and loadedWizardState has candidateDate + candidateTimeSlots, and selectedDate matches, find slot whose startTime matches loaded first slot; expose originalInspectionButtonIndex. Pass it to AppointmentSlotGrid.
**Checkpoint:** Orchestrator exposes originalInspectionButtonIndex; AvailabilityStep passes it to grid.

- [ ] #### Task 6.5.3.2: Add original-inspection class and styles
**Goal:** Apply `appointment-slot-btn--original-inspection` class and distinct styling to the original slot; keep it selectable.
**Files:**
- `client/src/components/booking/AppointmentSlotGrid.vue`
- `client/src/components/booking/AppointmentSlotGrid.scss`
**Approach:** Add prop originalInspectionButtonIndex; add class when slotData.buttonIndex matches. Add SCSS for distinct visual (border/background tint); do not change :disabled.
**Checkpoint:** Original slot shows distinct styling; slot remains clickable.

- [ ] #### Task 6.5.3.3: Verify end-to-end original-inspection UI
**Goal:** Verify reschedule flow shows original slot distinctly; no regression for new/quote flows.
**Files:**
- Same as 6.5.3.1 and 6.5.3.2; manual or integration verification
**Approach:** Load appointment for reschedule, go to Availability, select same date; confirm original slot is visually distinct and selectable. Confirm new-booking and quote flows unchanged.
**Checkpoint:** Reschedule: original slot distinct and selectable; new/quote: no original-inspection styling.

---

## Notes

[Session-specific notes and decisions]

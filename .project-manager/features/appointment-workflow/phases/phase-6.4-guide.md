# Phase 6.4 Guide: Moveable Modal & preClosing Property

**Purpose:** Phase-level guide for planning and tracking the MoveablePartsModal refinement and preClosing property

**Tier:** Phase (Tier 1 - High-Level)

---

## Phase Overview

**Phase Number:** 6.4
**Phase Name:** Moveable Modal & preClosing Property
**Description:** Refine the MoveablePartsModal so it only appears for pre-closing services, responds to closing-date context, allows passthrough without requiring a timeslot selection, and feels less intrusive. Introduces a `preClosing` boolean property on block instances (full-stack). Consolidates the scattered `differential` string-checking pattern so that differential state is derived in one canonical composable and propagated everywhere.

**Duration:** 1+ sessions
**Status:** Not Started

---

## Context: What Already Exists

**Phase 6.3 Complete:** Confirmation data model, transition guards, admin confirm action, auto-confirm, notifications.

**MoveablePartsModal:** Exists but is disabled (lines 9–16 of `MoveablePartsModal.vue`). The modal trigger in `useAvailabilityStepHandlers.ts` checks `hasMoveableParts` but not `isEffectivelyDifferential` or service pre-closing status.

**Differential Logic:** Three parallel derivations — `useAvailabilityLogic` (with override), `useAvailabilityOrchestrator` (without override — potential bug), and `useAppointmentShape` (structural). Need consolidation.

**Block Instance Infrastructure:** Sequelize models, client types, transformer pipeline exist. `differential` is `TernaryBoolean`; `preClosing` will be a new boolean.

---

## Phase Objectives

- Add `preClosing` boolean to block_instances (full stack: migration → model → types → transformer)
- Consolidate differential derivation into one canonical `isDifferentialBooking` (derive once, propagate everywhere)
- Gate modal trigger on `preClosing`; conditionally show time grid based on closing date; allow passthrough
- Soften modal UX: smaller, delayed, animated
- Re-enable MoveablePartsModal and verify full integration

---

## Sessions Breakdown

- [x] ### Session 6.4.1: Moveable Modal Refinement & preClosing Property
**Description:** Full implementation of the phase — preClosing migration, differential consolidation, modal gate logic, UX softening, re-enable.
**Tasks:**
- Add `preClosing` boolean to `block_instances` and `block_instance_versions` (migration, Sequelize models, client types, transformer)
- Consolidate differential derivation: one canonical `isDifferentialBooking` in `useAvailabilityLogic`, remove duplicate in orchestrator, propagate as param to all consumers
- Gate modal trigger on `preClosing`; conditionally show time grid based on closing date; allow confirm without slot selection
- Soften modal UX: reduce size (`max-width: 520`), add ~400ms delay before open, add enter/exit transitions
- Re-enable the currently-disabled MoveablePartsModal, remove temporary disable comments, verify full integration

**Learning Goals:**
- Full-stack property addition pattern (migration → model → type → transformer)
- Reactive aggregates and the "derive once, propagate everywhere" pattern for computed state
- Progressive disclosure UX and modal timing/transition patterns

---
- [ ] ### Session 6.4.2: Session 6.4.2
**Description:** Session 6.4.2
**Tasks:** [To be planned]
**Learning Goals:**
- [To be identified during planning]

---
- [ ] ### Session 6.4.3: Moveable Modal — Shared Time-Slot Grid (AppointmentSlotGrid)
**Description:** Replace the modal's VList/VListItem slot list with the same custom time-slot component used on the availability step. Slots remain constrained by the moveable window (start = end of major appointment, end = contingency deadline). Use the non-differential version of the slot button and the same reactivity to screen width (literally reuse AppointmentSlotGrid).
**Tasks:**
- Add an adapter that maps `MoveableSlot[]` → minimal `AppointmentSlot[]` (buttonIndex, isAvailable: true, startTime, totalTimeRange from slot start/end/duration, shape with empty eventFinals so derivePerspective returns totalTimeRange, eventTimeRanges: {})
- In MoveablePartsModal, replace the "Available Completion Times" VList with AppointmentSlotGrid; pass the adapted slots and `time-basis="nonDifferential"`; bind selectedButtonIndex to selectedSlotIndex and @slot-click to selectSlot(buttonIndex)
- Ensure the modal content area that wraps the grid has a ref so AppointmentSlotGrid's useResponsiveGrid gets the same width-driven column behavior (same component, same SCSS/layout)
- Remove the old VList/VListItem slot UI and any redundant dayLabel/timeLabel display for slots
**Learning Goals:**
- Adapter pattern for "simple slot list" → "full AppointmentSlot shape" when reusing a component that expects the full shape
- Single source of truth for slot button UI and responsive grid (one component, two contexts)

---
- [ ] ### Session 6.4.4: Unified required confirmation modal shell
**Description:** Extract the modal "window" (VDialog + VCard + title + close + body slot + actions) with transitions/sizing from the moveable modal into a single reusable shell. Both MoveablePartsModal and PropertyConfirmationModal become consumers: step-specific content in a shared shell. Enables a consistent "required confirmation before next step" pattern for property details, moveable scheduling, and future steps (e.g. submit "is this the service package you want?").
**Tasks:**
- Create `RequiredConfirmationModal.vue` (or `WizardStepConfirmationModal.vue`) as shell: v-model open, title prop/slot, default slot for body, optional actions slot or props (primary/secondary label, canConfirm), emit confirm/cancel; apply Phase 6.4 UX (max-width, delay, enter/exit transitions)
- Refactor MoveablePartsModal to use the shell: move moveable-specific content (contingency, slots) into the shell's default slot; keep existing props/emits for content logic
- Refactor PropertyConfirmationModal to use the shell: move property summary into the shell's default slot; keep existing props/emits
- Optionally document or introduce a step-level concept (e.g. `confirmModal: true`) for wizard steps that require completing this modal before advancing; leave wiring for submit-step confirmation as follow-up if out of scope
**Learning Goals:**
- Reusable modal shell pattern (slot-based content, single place for transitions and accessibility)
- Same UX contract for all "required confirmation" modals; step-unique content only in slots

---

## Dependencies

**Prerequisites:**
- Phase 6.1 (Status Workflow & UI) — Complete ✅
- Phase 6.2 (Held & Override Stubs) — Complete ✅
- Phase 6.3 (Confirmation Routine) — Complete ✅
- Block instance infrastructure exists
- MoveablePartsModal component exists (currently disabled)

**Downstream Impact:**
- `preClosing` property available for future features that need to distinguish pre-closing services
- Canonical `isDifferentialBooking` eliminates drift risk for all differential-aware features
- Phase 6.5 (Rescheduling Flow) will interact with moveable parts for differential appointments
- Admin entity management may want a toggle for `preClosing` on block instance editing UI (future work)

---

## Success Criteria

- [ ] `pre_closing` column exists on `block_instances` and `block_instance_versions` tables
- [ ] `preClosing` flows through server model → client type → transformer
- [ ] Differential derivation consolidated into one canonical `isDifferentialBooking`
- [ ] Modal only opens for services with `preClosing: true`
- [ ] Completion time grid only shows when user provides a closing date
- [ ] User can confirm without selecting a timeslot (passthrough)
- [ ] Modal is smaller, delayed, and animated
- [ ] Modal is re-enabled (temporary disable removed)
- [ ] Required confirmation modal shell exists; MoveablePartsModal and PropertyConfirmationModal use it; transitions/sizing live in the shell only
- [ ] Moveable modal "Available Completion Times" uses AppointmentSlotGrid (non-differential) with same responsiveness as the main availability step
- [ ] Linting passes, app starts without errors

---

## Related Documents

- Session 6.4.1 Guide: `.project-manager/features/appointment-workflow/sessions/session-6.4.1-guide.md`
- Session 6.4.3 Guide: `.project-manager/features/appointment-workflow/sessions/session-6.4.3-guide.md`
- Session 6.4.4 Guide: `.project-manager/features/appointment-workflow/sessions/session-6.4.4-guide.md`
- Feature Handoff: `.project-manager/features/appointment-workflow/feature-appointment-workflow-handoff.md`
- Phase 6.3 Guide: `.project-manager/features/appointment-workflow/phases/phase-6.3-guide.md`
- PROJECT_PLAN: `.project-manager/PROJECT_PLAN.md` (Feature 6, Phase 6.4)

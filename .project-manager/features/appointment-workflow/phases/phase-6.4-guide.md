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
- [ ] Linting passes, app starts without errors

---

## Related Documents

- Session 6.4.1 Guide: `.project-manager/features/appointment-workflow/sessions/session-6.4.1-guide.md`
- Feature Handoff: `.project-manager/features/appointment-workflow/feature-appointment-workflow-handoff.md`
- Phase 6.3 Guide: `.project-manager/features/appointment-workflow/phases/phase-6.3-guide.md`
- PROJECT_PLAN: `.project-manager/PROJECT_PLAN.md` (Feature 6, Phase 6.4)

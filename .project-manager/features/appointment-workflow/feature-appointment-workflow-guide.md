# Feature 6 Guide: Appointment Workflow & Booking Calculations

**Purpose:** Feature-level guide for planning and tracking the appointment status workflow and booking calculation logic

**Tier:** Feature (Tier 0 - Highest Level)

---

## Feature Overview

**Feature Name:** Appointment Workflow & Booking Calculations
**Feature Number:** 6
**Description:** Appointment status workflow with 8 statuses, user tracking, and UI enhancements; plus fee and time calculation logic for the booking wizard.
**Status:** In Progress

**Started:** January 2026 (Phase 6.1)
**Branch:** `feature/google-apis-integration`

---

## Feature Objectives

- Implement full appointment lifecycle: started → held → submitted → confirmed → rescheduling → cancelled → deleted
- Build status transition validation (state machine pattern) to prevent invalid transitions
- Create admin actions for confirmation, hold, force-create, and rescheduling
- Consolidate fee and time calculation logic into reusable composables
- Establish notification infrastructure (in-app now, email hooks for Feature 7)
- Prepare auth-dependent stubs for Feature 7 enactment

---

## Phases Breakdown

- [x] ### Phase 6.1: Status Workflow & UI Enhancements
**Description:** Updated status ENUM from 5 to 8 values, added `scheduled_by_id` column, interactive tooltips, cross-tab navigation, and color-coded status chips.
**Sessions:** Completed January 2026
**Success Criteria:**
- 8-value status ENUM in place
- Admin UI displays status chips with tooltips
- Cross-tab navigation working

- [x] ### Phase 6.2: Held & Override Stubs
**Description:** Prepare held appointment status and admin constraint-override as stub implementations for Feature 7 enactment.
**Sessions:** 2 (6.2.1: Held Status Stub, 6.2.2: Admin Override Stub)
**Success Criteria:**
- Hold via PATCH works with computed heldUntil
- Override via PATCH works with stub auth
- Client UI elements exist but are properly gated
- Enactment requirements documented for Feature 7

- [ ] ### Phase 6.3: Confirmation Routine
**Description:** Implement submitted → confirmed transition with status transition guards, admin confirmation action, optional auto-confirm, and notification stubs.
**Sessions:** 3 (6.3.1: Data Model & Transition Guards, 6.3.2: Admin Confirmation & Auto-Confirm, 6.3.3: Notifications & Docs)
**Status:** In Progress (Session 6.3.1 complete)
**Success Criteria:**
- Status transition validation prevents invalid transitions
- Confirmation timestamps auto-populated
- Admin Confirm button works for submitted appointments
- Auto-confirm business setting toggleable
- Notification stubs ready for Feature 7 email

- [ ] ### Phase 6.4: Moveable Modal & preClosing Property
**Description:** Refine MoveablePartsModal; add `preClosing` to block_instances; consolidate differential derivation; gate modal on preClosing services; soften UX; re-enable modal.
**Sessions:** 1+ (6.4.1+)
**Dependencies:** Phase 6.3 (Confirmation Routine)
**Success Criteria:**
- `preClosing` flows through full stack
- Differential derivation consolidated
- Modal gated on preClosing, time grid on closing date, passthrough enabled
- Modal re-enabled, smaller, delayed, animated

- [ ] ### Phase 6.5: Rescheduling Flow
**Description:** Reschedule confirmed appointments; reuse wizard; transition to rescheduling then back to submitted.
**Sessions:** To be planned
**Dependencies:** Phase 6.3 (transition guards)
**Success Criteria:**
- Reschedule action available for confirmed appointments
- Wizard reused for new slot selection
- Status transitions: confirmed → rescheduling → submitted

- [ ] ### Phase 6.6: Soft Delete vs Hard Delete
**Description:** Policy and UI for cancelled vs deleted; retention rules; audit trail.
**Sessions:** To be planned
**Success Criteria:**
- Clear policy for cancelled vs deleted appointments
- Admin UI for soft delete and hard delete actions
- Retention and audit behavior documented

- [ ] ### Phase 6.7: Scheduled By Auto-Population
**Description:** Set `scheduled_by_id` from logged-in user on appointment creation.
**Sessions:** To be planned
**Dependencies:** Feature 7 (Authentication) — requires `req.user`
**Success Criteria:**
- `scheduled_by_id` populated from authenticated user on create
- Displayed in admin appointment details

- [ ] ### Phase 6.8: Admin Force-Create & Constraint Overrides
**Description:** Force-create appointments bypassing blockers; `constraint_overrides` table; reschedule with exceptions.
**Sessions:** 4 (6.8.1–6.8.4)
**Dependencies:** Feature 7 (Authentication) — requires `req.user` for `authorized_by_id`
**Success Criteria:**
- Force-create route creates appointment + override record
- Admin UI shows blocked slots with force-create option
- Reschedule flow respects override exceptions
- Full architecture, data model, and implementation details in phase guide

---

## Booking Calculations (Core Complete)

**Fee calculations:** `calculateBlockInstanceFee()`, `buildConfirmationPriceData()`, `calculatePartsTotals()`, pricing cascade resolution via `pricingCascadeResolver.ts`.

**Time calculations:** `useTimeSlotCalculations()`, `calculateAppointmentSlots()`, `calculateTotalDurationFromAppointmentSlots()`, `createBlockFinal()` / `createPartFinals()`.

**Remaining:**
- **useFeeCalculations composable:** Consolidate fee logic parallel to `useTimeSlotCalculations()`
- **Admin-configurable fee settings:** Move hardcoded coupon discount, delivery charges, and delivery-free behavior to business settings

---

## Dependencies

**Prerequisites:**
- Feature 1 (Data Flow Alignment) — Complete
- Feature 3 (Calendar & Appointment Availability) — slot computation and calendar infrastructure

**Downstream Impact:**
- Feature 7 (Authentication) enactment activates auth-dependent phases (6.7, 6.8) and populates user fields (`confirmed_by`, `held_by`, `authorized_by_id`, `scheduled_by_id`)
- Phase 6.5 (Rescheduling) integrates with Phase 6.8 constraint relaxation

**External Dependencies:**
- Feature 7 (Authentication) — Phases 6.7 and 6.8 blocked until auth is in place

---

## Success Criteria

- [ ] All phases completed
- [ ] All research questions answered
- [ ] Architecture decisions documented
- [ ] Code quality checks passing
- [ ] Documentation updated
- [ ] Tests passing
- [ ] Performance targets met
- [ ] Ready for production

---

## Git Branch Strategy

**Branch Name:** `feature/google-apis-integration` (shared feature branch)
**Current Working Branch:** `appointment-workflow-phase-6.3-session-6.3.2`

---

## End of Feature Workflow

**CRITICAL: Prompt before ending feature**

After completing all phases in a feature, **prompt the user** before running `/feature-end`:

```
## Ready to End Feature?

All phases complete. Ready to merge feature branch?

**This will:**
- Generate feature summary
- Merge feature/[name] → develop
- Delete feature branch
- Finalize documentation

**Proceed with /feature-end?** (yes/no)
```

**If user says "yes":**
- Run `/feature-end` command automatically
- Complete all feature-end steps (verify completion, update docs, generate summary)
- **After all checks pass and docs are updated, prompt for commit/merge/push:**
  ```
  ## Ready to Commit, Merge, and Push?
  
  All feature-end checks completed successfully:
  - ✅ Feature summary generated
  - ✅ Feature documentation closed
  - ✅ All documentation updated
  
  **Ready to commit, merge, and push all changes?**
  
  This will:
  - Commit all changes with feature completion message
  - Merge feature/[name] → develop
  - Delete feature branch
  - Push to remote repository
  
  **Proceed with commit, merge, and push?** (yes/no)
  ```
- **If user says "yes" to commit/merge/push:** Execute git commit, merge, delete branch, and push, then end feature
- **If user says "no" to commit/merge/push:** End feature without committing (user can commit and merge manually later)

**If user says "no" to feature-end:**
- Address any requested changes
- Re-prompt when ready

After completing all phases in a feature:

1. **Verify feature completion** - All phases complete, success criteria met
2. **Update feature status** - Mark feature as Complete
3. **Update feature handoff** - Document feature completion and transition context
4. **Generate feature summary** - Create completion summary
5. **PROMPT USER FOR COMMIT/MERGE/PUSH** - After all checks pass and docs are updated, prompt user before git operations
6. **Merge feature branch** - Merge to develop (after user approval)
7. **Delete feature branch** - Clean up branch (after merge)
8. **Workflow Feedback** (Optional - only if issues encountered):
   - Were there any problems managing this feature workflow or issues with results?
   - Note any sticking points, inefficiencies, or workflow friction for future improvement
   - Consider if feature-level issues suggest improvements needed at phase, session, or task level

---

## Notes

- **Phase 6.1 was the only phase completed before the project management system was formalized.** Its session logs don't exist in the current structure.
- **Booking calculation logic is feature-complete but not consolidated.** The `useFeeCalculations` composable and admin-configurable fee settings are the remaining calculation work.
- **Phases 6.2–6.4 follow the full session guide structure.** Phase 6.8 has a detailed guide ready for when Feature 7 unblocks it.

---

## Related Documents

- Feature Log: `.project-manager/features/appointment-workflow/feature-appointment-workflow-log.md`
- Feature Handoff: `.project-manager/features/appointment-workflow/feature-appointment-workflow-handoff.md`
- Booking Calculations Guide: `.project-manager/features/appointment-workflow/feature-booking-calculations-guide.md`
- Booking Calculations Handoff: `.project-manager/features/appointment-workflow/feature-booking-calculations-handoff.md`
- Phase Guides: `.project-manager/features/appointment-workflow/phases/`
- PROJECT_PLAN: `.project-manager/PROJECT_PLAN.md` (Feature 6)


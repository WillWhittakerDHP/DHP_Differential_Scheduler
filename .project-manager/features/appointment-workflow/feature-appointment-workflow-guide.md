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

## Wizard mode and user context

**Wizard mode** — A single state (`initial` | `quote` | `reschedule`) that drives theme, submit button label, submit action (create vs update), and reschedule-specific behavior (e.g. `reschedulingAppointmentId`, original-slot UI). Replaces or extends the current single `isQuoteMode` boolean so that “Send quote,” “Update appointment,” and “Submit” (new booking) are driven from one place. Reschedule flow sets mode to `reschedule` when loading an appointment for reschedule; submit shows “Update appointment” and calls the update path.

**User role** — From Feature 7 (Authentication). Controls visibility of admin-only UI in the wizard and admin appointments: Hold Slot, Override constraints, Force schedule. Implementation of role checks lives in Feature 7; this feature describes *usage* of role in the wizard (e.g. show Override constraints only when user is admin; wizard may be in `reschedule` or other modes when those actions are shown).

**Block-level `agentPermissions`** — Add to block_instances a column `agent_permissions` (TernaryBoolean: `'true' | 'false' | 'override'`), same pattern as `differential`. `true` = feature/block is for agents; `false` = for clients; `override` = admins can use regardless. Full stack: migration → model → versioning (if used) → client types → transformer. **Effective permission** is derived from (user role, block.agentPermissions): e.g. admin always allowed; agent allowed when `agentPermissions === 'true' || 'override'`; client when `'false' || 'override'`. Tooltips and permissions (Override constraints, future agent-only features) are driven by this state so they remain variable and consistent.

**Admin entry: step 0 or pre-wizard** — For admins only, before or as step 0 of the wizard: choose **Start new inspection** | **Edit quote** | **Reschedule**. When “Edit quote” or “Reschedule” is selected, show a **dropdown of non-completed inspections** (exclude statuses `cancelled`, `deleted`; optionally filter by status for quote vs reschedule). List is also filtered by an admin-configurable **time-out** (e.g. only appointments where scheduling began within the last X days/weeks, or the quote has been in quote status for the last X; X set in admin panel). Appointment picker dropdown shows columns: **Address**, **Client name**, **Agent name**. Selection sets wizard mode and `loadedAppointmentId`; then the wizard proceeds (e.g. load appointment and go to step 3 for edit/reschedule). Requires an API that returns appointments filtered by status, by time-out window, and (by permission once Feature 7 is in place).

**State** — Tooltips and permissions are driven by state: **(wizard mode, user role, block.agentPermissions)**. Admins get override behavior for `agentPermissions`; wizard mode drives submit label and action; user role gates Hold Slot, Override constraints, Force schedule.

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
**Description:** Reschedule confirmed appointments using the same flow as quote and dev-mode load: appointment loads at step 3 (Availability); user adjusts and reschedules. The current appointment stays on the calendar but is temporarily excluded from availability constraints so its time and drive buffers do not block slots; the original inspection slot has a distinct UI indicator (e.g. different color or overlay).
**Sessions:** 2–3 (see phase guide: 6.5.1 entry/transitions, 6.5.2 availability bypass, 6.5.3 original-inspection UI)
**Dependencies:** Phase 6.3 (transition guards: confirmed → rescheduling → submitted)
**Success Criteria:**
- Reschedule action available for confirmed appointments; wizard reuses load-at-step-3 and update path (same as quote/dev load)
- `reschedulingAppointmentId` in computed-availability request; server excludes that appointment’s calendar event from overlap while keeping it in calendarEvents
- Original-inspection slot visually distinct (e.g. `appointment-slot-btn--original-inspection`) but still selectable
- Wizard mode set to `reschedule` when loading for reschedule; submit shows “Update appointment” and calls update path
- Admin entry: step 0 or pre-wizard (admin-only) — Start new | Edit quote | Reschedule; dropdown of non-completed inspections when Edit quote or Reschedule; selection sets wizard mode and loadedAppointmentId
- Status transitions: confirmed → rescheduling → submitted
**See:** `phases/phase-6.5-guide.md` for implementation details, session breakdown, and relation to Phase 6.8 (allowedExceptions)

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
- Override constraints and Force schedule visibility gated by **user role** (admin); wizard may be in `reschedule` or other modes when those actions are shown; block-level `agentPermissions` (when added) respected for tooltips and permissions
- Full architecture, data model, and implementation details in phase guide

- [ ] ### Phase 6.9: Availability Step Mini-Wizard
**Description:** Reframe the Appointment Availability (3rd) wizard step as a mini-wizard: (1) Pick a day, (2) Pick block instance options when they exist (they affect differential calculation), (3) Pick perspective only when a date is selected and the booking is differential, (4) Pick a time. Wide screens: expanded panels with step labels; narrow screens: each sub-step as an expandable card, current step expanded and completed steps showing a done indicator when collapsed.
**Sessions:** To be planned (1–2)
**Dependencies:** Phase 6.4 (differential consolidation and option blocks in place). No new backend; UX and layout only.
**Success Criteria:**
- Sub-steps ordered and labeled (day → options [if any] → perspective [if differential] → time)
- Block instance options appear as a dedicated sub-step when available
- Perspective sub-step only visible when date selected and booking is differential
- Wide: all panels expanded; narrow: expandable cards per sub-step with smart expand/collapse and done state
- Existing validation and differential/slot behavior unchanged

- [ ] ### Phase 6.10: Fee Preview & Coupon Visibility
**Description:** Add a fee preview bar at the top of the Availability step showing total fee; on hover, show fee details (same as Confirmation step) in a popover, with optional Coupon row/Apply Coupon when enabled. Make the apply-coupon line and button toggleable from admin: Business Controls → Calendar → Confirmation & Holds.
**Sessions:** 2 (6.10.1: Admin toggle and settings; 6.10.2: Availability-step fee bar and popover)
**Dependencies:** None (reuses `buildConfirmationPriceData`, existing Confirmation step fee UI, and availability settings payload).
**Success Criteria:**
- Admin: "Show apply coupon in wizard" switch in Confirmation & Holds; setting persisted and read by wizard
- Availability step: compact "Fee preview: $X.XX" bar at top; hover shows popover with Bag Total, optional Coupon row (+ Apply Coupon when enabled), Order Total, line items, Total (no submit)
- Confirmation step: Coupon Discount row and Apply Coupon button only visible when `showApplyCouponInWizard` is true
**See:** `phases/phase-6.10-guide.md`, `sessions/session-6.10.1-guide.md`, `sessions/session-6.10.2-guide.md`

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
- Feature 7 must expose **user role** (e.g. admin) to the client so the wizard and admin UI can gate Hold Slot, Override constraints, and Force schedule; state (wizard mode, user role, block.agentPermissions) drives tooltips and permissions
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
- Phase 6.5 Guide: `.project-manager/features/appointment-workflow/phases/phase-6.5-guide.md` (Rescheduling flow, availability bypass, original-inspection UI)
- PROJECT_PLAN: `.project-manager/PROJECT_PLAN.md` (Feature 6)


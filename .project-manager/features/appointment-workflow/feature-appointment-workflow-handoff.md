# Feature appointment-workflow Handoff

**Purpose:** Transition context between features (large-scale concerns only)

**Tier:** Feature (Tier 0 - Highest Level)

**Last Updated:** 2026-02-27
**Feature Status:** In Progress
**Next Phase:** Phase 6.4 (Rescheduling Flow)

---

## Current Status

**Feature appointment-workflow:** In Progress
**Last Completed Phase:** Phase 6.3 (Confirmation Routine)
**Next Phase:** Phase 6.4 (Rescheduling Flow)

---

## Transition Context

**Where we left off:**
Phase 6.3 (Confirmation Routine) complete across 3 sessions:
- **Session 6.3.1:** Added confirmation data model (`submitted_at`, `confirmed_at`, `confirmed_by` columns), `VALID_STATUS_TRANSITIONS` state machine, transition validation in `beforeUpdate`, timestamp auto-population in `sanitizeInput`, and transition-aware admin status dropdown.
- **Session 6.3.2:** Added admin "Confirm" action button with confirmation dialog, `autoConfirmEnabled` business setting with auto-confirm in `afterCreate`, and transition-aware status dropdown filtering via `getValidNextStatuses()`.
- **Session 6.3.3:** Wired confirm button to actually execute the PATCH (was disabled stub), added success/error snackbar notifications via `useNotification`, created `notificationService.ts` stub with `onStatusChange` hook, documented notification expansion points for Feature 7, and documented the end-to-end confirmation flow.

**What you need to start next phase:**
- Transition guards are established — `VALID_STATUS_TRANSITIONS` in `appointmentConstants.ts` is the single source of truth
- The notification service observer pattern (`notificationService.onStatusChange`) fires on all status transitions — extend for rescheduling notifications
- `confirmed_by` is `null` until Feature 7 provides `req.user`
- Auto-confirm is a runtime business setting, not a code flag

**Plan Changes Affecting Downstream Features:**
- Phase 6.4 (Rescheduling) depends on transition guards established in 6.3 (`confirmed` → `rescheduling` is a valid transition)
- Phase 6.7 (Admin Force-Create) will use the same transition validation system
- Feature 7 notification expansion points are documented in `server/docs/NOTIFICATION_ARCHITECTURE.md`

---

## Feature Summary

**Phases Completed:** 6.1 (Status Workflow & UI), 6.2 (Held & Override Stubs), 6.3 (Confirmation Routine)
**Key Accomplishments:**
- 8-value appointment status ENUM with state machine transition guards
- Confirmation data model with timestamps and actor tracking
- Admin "Confirm" action with confirmation dialog and in-app notifications
- Auto-confirm business setting for automatic confirmation on submission
- Notification service stub with observer pattern for status change events
- Calendar invite creation for submitted and confirmed appointments

**Decisions Made:**
- State machine pattern for status transitions (explicit allowed transitions map)
- Observer pattern for notifications (decoupled from CRUD operations)
- `confirmed_by` deferred to Feature 7 (null until authentication exists)

**Architecture:**
Appointments use a state machine (`VALID_STATUS_TRANSITIONS`) with server-side validation in `beforeUpdate` and automatic field population in `sanitizeInput`. The notification service uses an observer pattern — `onStatusChange` fires non-blockingly after any transition, currently logging. Calendar invites are created independently via `inviteOrchestrationService`.

**Technology Stack:**
- Vue 3 + Vuetify for admin UI (data tables, dialogs, snackbar notifications)
- Express + Sequelize for server CRUD with hook-based side effects
- Observer pattern for decoupled notification delivery

---

## Git Branch Status

**Branch:** `feature/[name]`
**Status:** [Merged / Deleted]
**Merged To:** `develop`
**Merge Date:** 2026-02-23

---

## Notes

**Keep minimal** - Detailed notes belong in feature log, not handoff.

---

## Enactment requirements for Feature 7 (Authentication)

The appointment-workflow feature leaves **security stubs** that Feature 7 (authentication) must enact for the held-status flow to be fully functional. Exact steps:

1. **requireAuth middleware** (`server/src/middlewares/security.ts`)
   - Replace the stub with real JWT/session verification.
   - Extract token from `Authorization` header or cookie; verify; attach `req.user` (e.g. `{ id: string, ... }`).
   - Return 401 for missing or invalid tokens.

2. **Protect appointment PATCH (hold)**  
   - Apply `requireAuth` to the appointment PATCH route (or the subset of routes that allow `status: 'held'`) so that only authenticated users can hold slots.

3. **Set `held_by` from authenticated user** (`server/src/routes/internal/appointments/appointmentCrudRouter.ts`)
   - In `sanitizeInput`, when `status === 'held'`, set `appointmentFields.heldBy = req.user.id` (or equivalent from request context populated by `requireAuth`) instead of `null`.
   - Ensure `req` is available in the sanitizeInput pipeline (it is set by `beforeUpdate`; sanitizeInput receives body—if needed, pass user id via a request-scoped value set by middleware).

4. **Client "Hold Slot" button**
   - Remove the `disabled` state and "Hold requires authentication (Feature 7)" tooltip from the Hold Slot button in the booking wizard.
   - Wire the button to call `holdSlot(id)` (or equivalent) when the user is authenticated.

5. **Documentation**
   - Update `server/docs/SECURITY_STUBS.md` when stubs are replaced (mark requireAuth and held-status as enacted).

**Reference:** `server/docs/SECURITY_STUBS.md` — stub behavior and mapping table.

### Override Constraints (Session 6.2.2)

6. **requireRole middleware** (`server/src/middlewares/security.ts`)
   - Replace the stub with real role verification against `req.user.role`.
   - Return 403 if user lacks the required role.

7. **Protect appointment PATCH (override)**
   - Apply `requireRole('admin')` to the appointment PATCH route (or the subset that handles `overrideConstraints`) so only admins can set constraint overrides.

8. **Client "Override Constraints" button**
   - Remove the `disabled` state and "Override requires admin authentication (Feature 7)" tooltip from the Override button in the admin appointments table.
   - Wire the button to call `applyOverrideConstraints(id, constraints)` when the user has admin role.

9. **Phase 6.7 integration**
   - Phase 6.7 (Admin Force-Create & Constraint Overrides) builds on this stub. The `override_constraints` JSONB column and `ALLOWED_OVERRIDE_CONSTRAINTS` constant provide the schema foundation. Phase 6.7 adds the constraint engine integration, per-constraint UI toggles, and reason tracking.

10. **Documentation**
    - Update `server/docs/SECURITY_STUBS.md` when stubs are replaced (mark requireRole and override-constraints as enacted).

---

## Related Documents

- Feature Guide: `.project-manager/features/appointment-workflow/feature-appointment-workflow-guide.md`
- Feature Log: `.project-manager/features/appointment-workflow/feature-appointment-workflow-log.md`
- Phase 6.3 Guide: `.project-manager/features/appointment-workflow/phases/phase-6.3-guide.md`
- Notification Architecture: `server/docs/NOTIFICATION_ARCHITECTURE.md`
- Security Stubs: `server/docs/SECURITY_STUBS.md`
- Appointment Constants: `server/src/routes/internal/appointments/appointmentConstants.ts`


# Phase 6.3 Guide: Confirmation Routine

**Purpose:** Phase-level guide for planning and tracking the appointment confirmation workflow

**Tier:** Phase (Tier 1 - High-Level)

---

## Phase Overview

**Phase Number:** 6.3
**Phase Name:** Confirmation Routine
**Description:** Implement the appointment confirmation workflow: transition from `submitted` to `confirmed` with status transition guards, admin confirmation action, optional auto-confirm, and notification stubs. Establishes the confirmation data model (timestamps, who confirmed) and a dedicated admin action rather than raw dropdown editing.

**Duration:** 3 sessions
**Status:** Complete

---

## Context: What Already Exists

**Appointment Status ENUM (Phase 6.1):** 8-value enum (`started`, `held`, `rescheduling`, `quoted`, `submitted`, `confirmed`, `cancelled`, `deleted`). Both `submitted` and `confirmed` count toward capacity limits and trigger calendar invite creation.

**No Transition Validation:** Currently any status can be set to any other status via PATCH. `sanitizeInput` in the CRUD router only has special handling for `held` (computing `heldUntil`); all other status changes pass through with no guards.

**Missing Confirmation Fields:** No `submitted_at`, `confirmed_at`, or `confirmed_by` columns. Only `createdAt` and `updatedAt` exist on the appointment model.

**Calendar Invites:** Already sent on `submitted` and `confirmed` via `inviteOrchestrationService.ts` and `afterCreate`/`afterUpdate` hooks in the CRUD router. The constant `STATUSES_REQUIRING_CALENDAR_EVENT = ['submitted', 'confirmed']` drives this.

**Admin Status Editing:** Admin appointments table has an inline dropdown for status. No dedicated "Confirm" action button.

**Client Submission:** `useWizardSubmission.ts` creates appointments with status `submitted` (or `quoted` in quote mode) via `appointmentDataBuilders.ts`.

**Business Settings:** Existing business settings infrastructure in `server/src/db/models/admin/business_settings.ts` with admin UI for configuration.

**No Email Infrastructure:** No email service exists. Notifications for Phase 6.3 are limited to in-app (toast/snackbar) and calendar invites (already working). Email notifications depend on Feature 7 (Authentication).

---

## Phase Objectives

- Add confirmation data model fields (`submitted_at`, `confirmed_at`, `confirmed_by`) to track when and who confirmed
- Implement status transition validation so only valid transitions are allowed (e.g., `submitted` → `confirmed`)
- Create a dedicated admin "Confirm Appointment" action with confirmation dialog
- Add optional auto-confirm business setting for appointments that don't need manual review
- Create notification stubs (in-app notifications now, email notification hooks for Feature 7)
- Document the confirmation flow end-to-end

---

## Sessions Breakdown

- [x] ### Session 6.3.1: Confirmation Data Model & Transition Guards
**Description:** Add confirmation timestamp and actor columns to the appointments table, update the Sequelize model and client types, and implement status transition validation in `sanitizeInput`. After this session, status changes are guarded (only valid transitions allowed) and confirmation metadata is automatically populated.
**Tasks:**
- Add migration: `submitted_at` (TIMESTAMPTZ, nullable), `confirmed_at` (TIMESTAMPTZ, nullable), `confirmed_by` (UUID FK → users, nullable) columns to appointments
- Update Appointment Sequelize model with new fields and associations (`confirmedBy` → User)
- Define `VALID_STATUS_TRANSITIONS` map in `appointmentConstants.ts` (which statuses can transition to which)
- Add transition validation in `sanitizeInput`: reject invalid transitions with descriptive error
- Auto-populate `submitted_at` when status transitions to `submitted`, `confirmed_at` when transitioning to `confirmed`
- Update client-side appointment types (`client/src/types/appointment.ts`) with new fields
- Update admin appointment table to display `confirmed_at` and `confirmed_by` columns

**Description:** Create a dedicated "Confirm" action button in the admin appointments table for `submitted` appointments, with a confirmation dialog showing appointment details. Add an optional auto-confirm business setting so appointments can be automatically confirmed on submission when enabled.
**Tasks:**
- Add "Confirm" action button to admin appointments table (visible only for `submitted` appointments)
- Create confirmation dialog component showing appointment summary before confirming
- Wire confirm action to PATCH appointment with `{ status: 'confirmed' }` (transition guards from 6.3.1 validate it)
- Add `autoConfirmEnabled` business setting (boolean, default: false) to business settings
- Server: when auto-confirm is enabled, automatically transition `submitted` → `confirmed` in `afterCreate` hook
- Client: show auto-confirm toggle in admin business settings UI
- Update admin status dropdown to respect transition guards (only show valid next-statuses)

**Description:** Add in-app notification toasts for confirmation events in the admin panel, create notification service stubs that Feature 7 can extend for email notifications, and document the complete confirmation flow.
**Tasks:**
- Add in-app notification (toast/snackbar) in admin panel when appointment is confirmed (success feedback)
- Create server-side `notificationService` stub with `onStatusChange(appointmentId, oldStatus, newStatus)` hook
- Document notification expansion points for Feature 7 (email to customer on confirmation)
- Add confirmation flow documentation to phase guide notes
- Update feature handoff with confirmation routine completion context

---

## Dependencies

**Prerequisites:**
- Phase 6.1 (Status Workflow & UI Enhancements) — Complete ✅
- Phase 6.2 (Held & Override Stubs) — Complete ✅
- Appointment status ENUM already includes `submitted` and `confirmed`
- Calendar invite infrastructure already handles both statuses

**Downstream Impact:**
- Feature 7 (Authentication) enactment will set `confirmed_by` from `req.user` (until then, field is `null`)
- Phase 6.4 (Moveable Modal & preClosing) is the next phase; Phase 6.5 (Rescheduling Flow) depends on transition guards established here
- Phase 6.8 (Admin Force-Create) will integrate with the transition validation system
- Notification stubs from Session 6.3.3 become the hook points for email notifications in Feature 7

---

## Success Criteria

- [x] All sessions completed
- [x] Status transition validation prevents invalid transitions (e.g., `cancelled` → `confirmed`)
- [x] `confirmed_at` and `submitted_at` timestamps are automatically populated on transitions
- [x] Admin "Confirm" button works for submitted appointments
- [x] Auto-confirm business setting toggles automatic confirmation behavior
- [x] Admin status dropdown only shows valid next-statuses
- [x] In-app notification shown on confirmation
- [x] Code quality checks passing
- [x] Documentation updated
- [x] Ready for next phase (Phase 6.4)

---

## End of Phase Workflow

**CRITICAL: Prompt before completing phase**

After completing all sessions in a phase, **prompt the user** before running `/phase-end`:

```
## Ready to Complete Phase?

All sessions complete. Ready to run phase-completion workflow?

**This will:**
- Mark phase complete (update checkboxes and status)
- Update phase log with completion summary
- Update main handoff document
- Git commit/push

**Proceed with /phase-end?** (yes/no)
```

---

## Notes

- **Transition guard design:** The `VALID_STATUS_TRANSITIONS` map is the single source of truth for allowed transitions. This is a state machine pattern — each status has a set of valid next-statuses. The `sanitizeInput` function checks the current status against this map before allowing the PATCH.
- **Auto-confirm is a business setting, not a code flag.** This means the admin can toggle it without a code change. When enabled, `afterCreate` checks the setting and auto-transitions `submitted` → `confirmed`. When disabled, appointments stay `submitted` until manually confirmed.
- **`confirmed_by` will be `null` until Feature 7 auth is in place.** The column exists and the FK constraint is ready, but the actual user ID population requires `req.user` from authenticated sessions. This follows the same stub pattern as Phase 6.2 (`held_by` is also `null` until auth).
- **No email notifications in this phase.** The `notificationService` stub establishes the hook pattern (observer on status change) but only produces in-app toasts for now. Feature 7 enactment adds email transport.
- **Calendar invites are already handled.** Both `submitted` and `confirmed` already trigger calendar invite creation in the CRUD router hooks. No changes needed to calendar invite logic in this phase.

---

## Confirmation Flow (End-to-End)

### Manual Confirmation (Admin)

```
1. Admin views AppointmentsTable → sees "Confirm" button on submitted appointments
2. Admin clicks "Confirm" → confirmation dialog shows appointment summary (date, status)
3. Admin clicks "Confirm" in dialog
4. Client: PATCH /appointments/:id { status: 'confirmed' }
5. Server beforeUpdate: fetches current status, validates transition (isValidTransition)
6. Server sanitizeInput: sets confirmedAt = new Date(), confirmedBy = null (until Feature 7)
7. Sequelize update: persists status + timestamps to database
8. Server afterUpdate:
   a. notificationService.onStatusChange() → logs transition (email in Feature 7)
   b. Calendar invite creation if no existing invites with 'sent' status
9. Server response: returns updated appointment with relations
10. Client: useNotification().success("Appointment confirmed successfully") → VSnackbar toast
```

### Auto-Confirm Flow

```
1. Client submits appointment via booking wizard → POST /appointments { status: 'submitted' }
2. Server afterCreate:
   a. Creates snapshots, attendees, fee records
   b. Checks autoConfirmEnabled business setting
   c. If enabled: updates record to { status: 'confirmed', confirmedAt: now }
   d. notificationService.onStatusChange('submitted' → 'confirmed') → logs transition
   e. Calendar invite creation (both submitted and confirmed trigger this)
3. Server response: returns confirmed appointment
```

### Key Files by Step

| Step | File |
|------|------|
| Confirm button + dialog | `client/src/views/admin/tabs/components/AppointmentActionsCell.vue`, `AppointmentTableDialogs.vue` |
| PATCH request | `client/src/composables/admin/tables/useAppointmentsTableModel.ts` (`confirmAppointment`) |
| Transition validation | `server/src/routes/internal/appointments/appointmentCrudRouter.ts` (`beforeUpdate`) |
| Timestamp population | `server/src/routes/internal/appointments/appointmentCrudRouter.ts` (`sanitizeInput`) |
| Notification hook | `server/src/services/notificationService.ts` (`onStatusChange`) |
| Auto-confirm setting | `server/src/db/models/admin/business_settings.ts` (`autoConfirmEnabled`) |
| In-app toast | `client/src/composables/useNotification.ts`, `client/src/components/AppNotification.vue` |
| Transition map | `server/src/routes/internal/appointments/appointmentConstants.ts` (`VALID_STATUS_TRANSITIONS`) |

---

## Valid Status Transitions (Reference)

| From Status | Valid Next Statuses |
|---|---|
| `started` | `quoted`, `submitted`, `cancelled`, `deleted` |
| `held` | `started`, `submitted`, `cancelled` |
| `rescheduling` | `submitted`, `cancelled` |
| `quoted` | `submitted`, `cancelled`, `deleted` |
| `submitted` | `confirmed`, `rescheduling`, `cancelled` |
| `confirmed` | `rescheduling`, `cancelled` |
| `cancelled` | `deleted` |
| `deleted` | _(terminal — no transitions)_ |

> This table is a design reference. The actual implementation in `VALID_STATUS_TRANSITIONS` should match. Adjustments may be made during implementation based on product needs.

---

## Related Documents

- Feature Guide: `.project-manager/features/appointment-workflow/feature-appointment-workflow-guide.md`
- Feature Log: `.project-manager/features/appointment-workflow/feature-appointment-workflow-log.md`
- PROJECT_PLAN: `.project-manager/PROJECT_PLAN.md` (Feature 6, Phase 6.3)
- Phase 6.2 Guide: `.project-manager/features/appointment-workflow/phases/phase-6.2-guide.md`
- Security Stubs: `server/docs/SECURITY_STUBS.md`
- Appointment CRUD Router: `server/src/routes/internal/appointments/appointmentCrudRouter.ts`
- Appointment Constants: `server/src/routes/internal/appointments/appointmentConstants.ts`
- Appointment Model: `server/src/db/models/booking/appointment.ts`

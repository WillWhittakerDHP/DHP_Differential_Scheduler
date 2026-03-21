# Session 6.3.2 Guide: Admin Confirmation Action & Auto-Confirm

**Phase:** 6.3 — Confirmation Routine
**Session:** 6.3.2 — Admin Confirmation Action & Auto-Confirm
**Status:** In Progress
**Branch:** `appointment-workflow-phase-6.3-session-6.3.2`

---

## Session Overview

Create a dedicated "Confirm" action button in the admin appointments table for `submitted` appointments, with a confirmation dialog showing appointment details. Add an optional auto-confirm business setting so appointments can be automatically confirmed on submission when enabled. Update the admin status dropdown to respect transition guards (only show valid next-statuses).

**Key Context:**
- Session 6.3.1 established transition guards (`VALID_STATUS_TRANSITIONS` map) and confirmation data model (`submitted_at`, `confirmed_at`, `confirmed_by`)
- `sanitizeInput` auto-populates `confirmedAt` when status transitions to `confirmed`
- `beforeUpdate` validates transitions and returns 400 for invalid ones
- Client-side `getValidNextStatuses()` helper already exists in `appointmentStatus.ts`
- Business settings infrastructure exists in `server/src/db/models/admin/business_settings.ts`
- `confirmed_by` remains `null` until Feature 7 auth provides `req.user`

---

## Tasks

### Task 6.3.2.1: Add "Confirm" action button to admin appointments table

**Status:** Not Started

**Description:** Add a "Confirm" action button in the admin appointments table that is visible only for appointments with `submitted` status. The button triggers a confirmation dialog.

**Files to modify:**
- `client/src/views/admin/tabs/components/AppointmentsTable.vue` (modify — add confirm button to actions column)

**Approach:**
- Add a "Confirm" button/icon in the actions column, conditionally rendered with `v-if="item.status === 'submitted'"`
- Use Vuetify's `VBtn` with an appropriate icon (e.g., `mdi-check-circle`) and color
- Wire click handler to open confirmation dialog (Task 6.3.2.2)
- Ensure touch-friendly sizing (minimum 44x44px)

**Checkpoint:**
- Confirm button appears only for `submitted` appointments
- Button does not appear for other statuses
- Button click opens dialog (wired in next task)

---

### Task 6.3.2.2: Create confirmation dialog component

**Status:** Not Started

**Description:** Create a confirmation dialog that shows appointment summary details and asks the admin to confirm. On confirmation, PATCH the appointment with `{ status: 'confirmed' }`.

**Files to modify/create:**
- `client/src/views/admin/tabs/components/AppointmentsTable.vue` (modify — add dialog and confirm action)

**Approach:**
- Use Vuetify `VDialog` with `VCard` for the confirmation dialog
- Display appointment summary: customer name, date, time, service type
- Include "Confirm" and "Cancel" action buttons
- On confirm: call existing PATCH endpoint with `{ status: 'confirmed' }`
- Show success/error feedback (snackbar)
- Refresh table data after successful confirmation
- Use reactive state (`ref`) to track dialog open/close and selected appointment

**Checkpoint:**
- Dialog opens with appointment details
- Confirm action sends PATCH request
- Success feedback shown
- Table refreshes after confirmation
- Cancel closes dialog without action

---

### Task 6.3.2.3: Add autoConfirmEnabled business setting

**Status:** Not Started

**Description:** Add an `autoConfirmEnabled` boolean business setting (default: false) to the business settings model and admin UI.

**Files to modify:**
- `server/src/db/models/admin/business_settings.ts` (modify — add field)
- Server migration (new — add column)
- Admin business settings UI component (modify — add toggle)

**Approach:**
- Add `auto_confirm_enabled` (BOOLEAN, default false) to business_settings table via migration
- Add `autoConfirmEnabled` field to Sequelize model
- Add toggle switch in admin business settings UI using `VSwitch`
- Label: "Auto-confirm appointments" with description text

**Checkpoint:**
- Business setting exists in database
- Toggle appears in admin settings
- Setting persists when toggled
- Default is `false`

---

### Task 6.3.2.4: Server auto-confirm logic

**Status:** Not Started

**Description:** When auto-confirm is enabled, automatically transition `submitted` → `confirmed` in the `afterCreate` hook when an appointment is created with `submitted` status.

**Files to modify:**
- `server/src/routes/internal/appointments/appointmentCrudRouter.ts` (modify — add auto-confirm in afterCreate)

**Approach:**
- In `afterCreate` hook, check if the created appointment has status `submitted`
- If so, read `autoConfirmEnabled` from business settings
- If enabled, update the appointment to `confirmed` status (this triggers `sanitizeInput` which populates `confirmedAt`)
- Log the auto-confirm action
- Ensure calendar invite logic still triggers correctly (both `submitted` and `confirmed` already trigger invites)

**Checkpoint:**
- With auto-confirm ON: new `submitted` appointment auto-transitions to `confirmed`
- With auto-confirm OFF: appointment stays `submitted`
- `confirmed_at` is populated on auto-confirm
- Calendar invite still works

---

### Task 6.3.2.5: Update admin status dropdown to respect transition guards

**Status:** Not Started

**Description:** Update the inline status dropdown in the admin appointments table to only show valid next-statuses based on the current appointment status.

**Files to modify:**
- `client/src/views/admin/tabs/components/AppointmentsTable.vue` (modify — dynamic dropdown items)

**Approach:**
- The status dropdown already uses `getValidNextStatuses()` from Session 6.3.1 (Task 6.3.1.6)
- Verify it's working correctly — dropdown should only show valid transitions
- Include the current status in the dropdown items so it shows as selected
- If already implemented in 6.3.1, verify and document

**Checkpoint:**
- Dropdown only shows valid next-statuses + current status
- Invalid transitions cannot be selected from dropdown
- Existing functionality preserved

---

---

## Dependencies

- Session 6.3.1 complete (confirmation data model, transition guards, client types)
- Business settings infrastructure exists
- `getValidNextStatuses()` client helper exists
- `isValidTransition()` server helper exists

---

## Success Criteria

- [ ] All 5 tasks completed
- [ ] "Confirm" button visible only for submitted appointments
- [ ] Confirmation dialog shows appointment summary
- [ ] Confirm action transitions status and populates timestamps
- [ ] Auto-confirm business setting toggles behavior
- [ ] Status dropdown only shows valid transitions
- [ ] Linting passes
- [ ] App starts without errors

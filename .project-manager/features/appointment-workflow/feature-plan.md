# Appointment Workflow Enhancement Feature Plan

## Overview

This feature implements a comprehensive appointment status workflow with 8 statuses, user tracking for who scheduled appointments, and interactive UI enhancements for the appointments table.

## Implementation Status: Phase 1 Complete

### Completed Items (January 2026)

1. **Database Migration** - `20260108_02_update_appointment_statuses_and_add_scheduled_by.mjs`
   - Updated status ENUM from 5 to 8 values
   - Added `scheduled_by_id` column with FK to users table
   - Data migration mapping: draft→started, quote→quoted, booked→submitted, completed→confirmed

2. **Server Model Updates** - `server/src/db/models/booking/appointment.ts`
   - Updated status type definition
   - Added `scheduledById` field

3. **Client Type Updates** - `client/src/types/appointment.ts`
   - Created `AppointmentStatus` type
   - Exported `APPOINTMENT_STATUSES` array
   - Added `scheduledById` to request/response interfaces

4. **UI Enhancements** - `client/src/views/admin/tabs/components/AppointmentsTable.vue`
   - Removed ID column (not needed for display)
   - Removed Quote Mode column from display (kept in DB for business logic)
   - Added Scheduled By column
   - Implemented interactive tooltips on Property, Client, Agent, Scheduled By cells
   - Click-to-navigate to Properties/Users tabs
   - Status displayed with color-coded chips

5. **Tab Navigation** - `client/src/views/admin/tabs/DataManagementTab.vue`
   - Added event handler for cross-tab navigation

---

## Status Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        APPOINTMENT STATUS WORKFLOW                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────┐                          ┌─────────┐                          │
│   │ started │ ──── submit ────────────>│submitted│                          │
│   └─────────┘                          └────┬────┘                          │
│        │                                    │                               │
│   (quote mode)                              │ confirm routine               │
│        ▼                                    ▼                               │
│   ┌─────────┐                          ┌─────────┐                          │
│   │ quoted  │ ──── submit ────────────>│confirmed│                          │
│   └─────────┘                          └────┬────┘                          │
│                                             │                               │
│   ┌─────────┐        ┌──────────┐          │ reschedule                     │
│   │  held   │──────>│ submitted │<─────────┤                                │
│   └─────────┘        └──────────┘          │                                │
│        │             (timeout)              ▼                               │
│        │                              ┌───────────┐                         │
│        └────────────────────────────>│rescheduling│                         │
│             (timeout/cancel)          └───────────┘                         │
│                      │                                                      │
│                      ▼                                                      │
│                 ┌─────────┐                                                 │
│                 │cancelled│<──── cancel ──── (any active status)            │
│                 └────┬────┘                                                 │
│                      │                                                      │
│                      │ hard delete                                          │
│                      ▼                                                      │
│                 ┌─────────┐                                                 │
│                 │ deleted │                                                 │
│                 └─────────┘                                                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Future Implementation Phases (TODO)

### Phase 2: Held Status & Booking Fee Logic

**Goal:** Implement payment processing for booking fees to reserve time slots

**Tasks:**
- [ ] Create booking fee payment API endpoint
- [ ] Integrate payment processor (Stripe/Square)
- [ ] Auto-transition `started` → `held` when payment confirmed
- [ ] Implement time slot reservation logic
- [ ] Add timeout logic: `held` → `cancelled` if not confirmed within X hours
- [ ] Release held time slots on cancellation/timeout
- [ ] Add payment status tracking to appointment

**Related Files:**
- `server/src/routes/internal/appointments/appointmentRouter.ts`
- `client/src/composables/booking/` (new payment composable)
- `server/src/utils/availabilities/` (slot reservation)

---

### Phase 3: Confirmation Routine

**Goal:** Implement workflow for transitioning `submitted` → `confirmed`

**Tasks:**
- [ ] Design confirmation workflow (manual vs automated)
- [ ] Create admin confirmation UI in appointments table
- [ ] Implement auto-confirmation rules (business logic)
- [ ] Add email/SMS notification on confirmation
- [ ] Create confirmation API endpoint
- [ ] Add audit logging for confirmations

**Options to Consider:**
- Manual confirmation: Admin clicks "Confirm" button
- Auto-confirm: Based on payment status, client history, etc.
- Scheduled confirmation: Batch confirm at specific times

**Related Files:**
- `client/src/views/admin/tabs/components/AppointmentsTable.vue`
- `server/src/routes/internal/appointments/appointmentRouter.ts`
- Notification system (to be created)

---

### Phase 4: Rescheduling Flow

**Goal:** Allow confirmed appointments to be rescheduled

**Tasks:**
- [ ] Add "Reschedule" action button for confirmed appointments
- [ ] Transition `confirmed` → `rescheduling` when initiated
- [ ] Reuse booking wizard for new time selection
- [ ] Preserve original appointment data for reference
- [ ] Transition `rescheduling` → `submitted` when new time selected
- [ ] Add reschedule history tracking
- [ ] Notify relevant parties of reschedule

**UI Flow:**
1. User clicks "Reschedule" on confirmed appointment
2. Status changes to `rescheduling`
3. Booking wizard opens with pre-filled data
4. User selects new time
5. Status changes to `submitted`
6. Goes through confirmation routine

**Related Files:**
- `client/src/views/admin/tabs/components/AppointmentsTable.vue`
- `client/src/composables/booking/useWizardAppointmentLoading.ts`
- Booking wizard components

---

### Phase 5: Soft Delete vs Hard Delete

**Goal:** Define and implement business rules for `cancelled` vs `deleted`

**Tasks:**
- [ ] Define retention policy for cancelled appointments
- [ ] Implement soft delete (`cancelled`) with archive view
- [ ] Implement hard delete (`deleted`) with audit log
- [ ] Add bulk operations for cleanup
- [ ] Consider GDPR compliance requirements
- [ ] Add filter for viewing cancelled appointments

**Business Rules to Define:**
- When should appointments be cancelled vs deleted?
- How long to retain cancelled appointments?
- Who can hard delete appointments?
- Should deleted appointments be permanently removed or just hidden?

**Related Files:**
- `server/src/routes/internal/appointments/appointmentRouter.ts`
- `client/src/views/admin/tabs/components/AppointmentsTable.vue`

---

### Phase 6: Scheduled By Auto-Population

**Goal:** Auto-populate scheduledById from current logged-in user

**Tasks:**
- [ ] Create auth context/composable for current user
- [ ] Auto-set scheduledById on appointment creation
- [ ] Track user changes on edit (updatedById?)
- [ ] Add audit trail for who modified appointments
- [ ] Display scheduler info in appointment details

**Related Files:**
- Auth system
- `client/src/composables/admin/tables/useAppointmentsTableModel.ts`
- `server/src/routes/internal/appointments/appointmentRouter.ts`

---

## Color Scheme Reference

| Status | Color | Meaning |
|--------|-------|---------|
| started | Blue | Creation in progress |
| held | Purple | Time reserved, awaiting confirmation |
| rescheduling | Orange | Being rescheduled |
| quoted | Cyan | Quote mode creation |
| submitted | Amber | Awaiting confirmation |
| confirmed | Green (success) | Fully confirmed |
| cancelled | Red (error) | Soft deleted |
| deleted | Grey | Hard deleted |

---

## Files Modified in Phase 1

- `server/src/db/migrations/20260108_02_update_appointment_statuses_and_add_scheduled_by.mjs` (new)
- `server/src/db/models/booking/appointment.ts`
- `client/src/types/appointment.ts`
- `client/src/views/admin/tabs/components/AppointmentsTable.vue`
- `client/src/views/admin/tabs/DataManagementTab.vue`
- `client/src/composables/admin/tables/useAppointmentsTableModel.ts`

---

## Notes

- The `isQuoteMode` column is kept in the database for business logic purposes
- Quote mode checkbox is still available in the create form (hidden from table display)
- Tooltips show detailed property/user info on hover
- Clicking linked data navigates to respective tabs


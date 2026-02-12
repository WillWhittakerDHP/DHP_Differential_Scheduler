# Appointment Status Workflow – Future Implementation Notes

This document captures planned work for the appointment status workflow. See `client/src/types/appointment.ts` for the `AppointmentStatus` type and `APPOINTMENT_STATUSES`.

## Status descriptions

- **started**: Non-quote mode appointment creation in progress
- **held**: Time slots held for clients who paid booking fee
- **rescheduling**: Non-quote mode rescheduling in progress
- **quoted**: Quote mode appointment creation in progress
- **submitted**: Submitted through app, awaiting confirmation
- **confirmed**: Submitted and confirmed
- **cancelled**: Soft-delete, still reschedulable
- **deleted**: Hard-delete

## 1. HELD STATUS LOGIC (Booking Fee Integration)

- Implement payment processing for booking fee
- When client pays booking fee, time slots should be reserved/held
- Auto-transition from 'started' -> 'held' when payment confirmed
- Implement timeout logic: if held too long without confirmation, auto-transition to 'cancelled' and release time slots
- Related files: payment API, scheduler availability logic

## 2. CONFIRMATION ROUTINE (Submitted -> Confirmed)

- Implement confirmation workflow (manual and/or automated)
- Manual: Admin reviews submitted appointments and confirms
- Automated: Define business rules for auto-confirmation
- Consider email/SMS notifications on confirmation
- Related files: appointment API, notification system

## 3. RESCHEDULING FLOW

- UI for initiating reschedule from 'confirmed' status
- Transition 'confirmed' -> 'rescheduling' when user starts reschedule
- When new time selected, transition 'rescheduling' -> 'submitted'
- Preserve original appointment data for reference
- Related files: AppointmentsTable.vue, booking wizard

## 4. SOFT DELETE VS HARD DELETE (Cancelled vs Deleted)

- 'cancelled': Appointment still visible in history, can be rescheduled
- 'deleted': Permanent removal from active views (may keep in audit log)
- Define business rules for when to use each
- Consider retention periods and GDPR compliance
- Related files: appointment API, admin panel

## 5. SCHEDULED BY TRACKING

- Auto-populate scheduledById from current logged-in user
- Track who engaged the scheduler (client, agent, admin)
- Useful for audit trail and analytics
- Related files: auth context, useAppointmentsTableModel

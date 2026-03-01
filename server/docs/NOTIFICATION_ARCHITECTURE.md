# Notification Architecture

**Purpose:** Documents the observer/hook pattern for appointment status change notifications and the expansion points for Feature 7 (Authentication & Email).

**Last Updated:** 2026-02-27
**Phase:** 6.3 — Confirmation Routine (Session 6.3.3)

---

## Overview

The notification system uses an **observer pattern** where the appointment CRUD router calls `notificationService.onStatusChange()` after any successful status transition. The service currently logs the transition; Feature 7 will extend it with email transport.

### Current State (Phase 6.3)

- **In-app notifications:** Vuetify `VSnackbar` via `useNotification` composable (client-side, already working)
- **Server-side hook:** `onStatusChange({ appointmentId, oldStatus, newStatus })` logs transitions
- **Calendar invites:** Already sent for `submitted` and `confirmed` statuses (independent of this service)

### After Feature 7 (Authentication)

- **Email notifications:** `onStatusChange` will send transactional emails using authenticated user context
- **Customer identity:** `req.user` provides customer contact info for email delivery

---

## Architecture

```
Client (Admin Panel)
  └── PATCH /appointments/:id { status: 'confirmed' }
        │
Server (appointmentCrudRouter.ts)
  ├── beforeUpdate: validates transition (isValidTransition)
  ├── sanitizeInput: populates confirmedAt timestamp
  ├── Sequelize update: persists to database
  └── afterUpdate:
        ├── notificationService.onStatusChange() ← non-blocking
        └── calendar invite creation (if applicable)
```

### Call Sites

| Location | Trigger | Old Status Source |
|----------|---------|-------------------|
| `afterUpdate` | Manual status change via PATCH | `_currentStatus` from `beforeUpdate` |
| `afterCreate` | Auto-confirm when `autoConfirmEnabled` is true | Hardcoded `'submitted'` |

### Non-Blocking Guarantee

Both call sites use `.catch()` so notification failures never break the HTTP response:

```typescript
onStatusChange({ appointmentId, oldStatus, newStatus }).catch((err) => {
  logger.error('Notification hook failed (non-blocking)', { error: err })
})
```

---

## Expansion Points for Feature 7

### 1. Email Transport

Add an email sending function (e.g. nodemailer, SendGrid, AWS SES) that `onStatusChange` calls for relevant transitions.

**File:** `server/src/services/notificationService.ts`

```typescript
import { sendEmail } from './emailTransport.js'

if (newStatus === 'confirmed') {
  const customer = await lookupCustomer(appointmentId)
  await sendEmail({
    to: customer.email,
    template: 'appointment-confirmed',
    data: { appointmentId, customerName: customer.name },
  })
}
```

### 2. Customer Lookup

Feature 7 authentication provides `req.user`. The notification service will need a way to look up the customer associated with an appointment (via the attendees table).

**Approach:** Query `AppointmentAttendee` for the client-role attendee, then look up their `User` record for email/name.

### 3. Email Template System

Templates for each notification type:

| Transition | Template | Recipient |
|-----------|----------|-----------|
| `submitted` → `confirmed` | `appointment-confirmed` | Customer |
| `*` → `cancelled` | `appointment-cancelled` | Customer + Agent |
| `*` → `rescheduling` | `appointment-rescheduling` | Customer |

### 4. Additional Hooks

The current `onStatusChange` can be supplemented with:

- `onCreated(appointmentId)` — welcome/submission receipt
- `onCancelled(appointmentId, cancelledBy)` — cancellation notice
- `onRescheduled(appointmentId, oldDate, newDate)` — reschedule notice

---

## Key Files

| File | Role |
|------|------|
| `server/src/services/notificationService.ts` | Service stub with `onStatusChange` hook |
| `server/src/routes/internal/appointments/appointmentCrudRouter.ts` | CRUD router that calls the hook |
| `server/src/routes/internal/appointments/appointmentConstants.ts` | `VALID_STATUS_TRANSITIONS` map |
| `client/src/composables/useNotification.ts` | Client-side notification singleton |
| `client/src/components/AppNotification.vue` | Global snackbar renderer |

---

## Related Documents

- Security Stubs: `server/docs/SECURITY_STUBS.md`
- Phase 6.3 Guide: `.project-manager/features/appointment-workflow/phases/phase-6.3-guide.md`
- Appointment Constants: `server/src/routes/internal/appointments/appointmentConstants.ts`

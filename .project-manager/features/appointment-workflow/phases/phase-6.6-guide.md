# Phase 6.6 Guide: Soft Delete vs Hard Delete

**Purpose:** Phase-level guide for policy and UI for cancelled vs deleted appointments, retention rules, and audit trail.

**Tier:** Phase (Tier 1 - High-Level)

---

## Phase Overview

**Phase Number:** 6.6
**Phase Name:** Soft Delete vs Hard Delete
**Description:** Policy and UI for cancelled vs deleted; retention rules; audit trail.

**Duration:** Session 6.6.1 (policy + admin UI)
**Status:** In Progress

---

## Policy: Soft Delete vs Hard Delete (Task 6.6.1.1)

**Cancelled (soft delete):**
- **Meaning:** Appointment is no longer active; record is **retained** for audit and reporting.
- **When to use:** User or admin cancels a booking; appointment is abandoned or no longer needed but we keep history.
- **Implementation:** PATCH appointment `status` to `cancelled`. Record remains in DB; excluded from capacity/slot counts (see server availability logic).
- **Retention:** Kept indefinitely unless a future purge policy is defined (e.g. purge cancelled older than X months).

**Deleted (hard delete):**
- **Meaning:** Appointment record is **removed** from the database (or marked with status `deleted` as terminal state, depending on implementation).
- **When to use:** Admin explicitly removes the record (e.g. duplicate, test data, or compliance request). Use sparingly; prefer cancelled for audit trail.
- **Implementation:** Either (a) DELETE the row via API, or (b) PATCH `status` to `deleted` if the schema uses soft-delete-with-terminal-status. Current codebase uses DELETE for "Delete" action and PATCH to `cancelled` for "Mark cancelled."
- **Retention:** No retention; record is gone (or hidden if status-based).

**Status transitions (reference):**  
Valid transitions are defined in `client/src/constants/appointmentStatus.ts` and `server/src/routes/internal/appointments/appointmentConstants.ts`. For example: `cancelled` → `deleted` is allowed; `deleted` has no outgoing transitions.

**Audit behavior:**  
- Cancelled appointments remain queryable and visible in admin lists (with status "cancelled"); they support audit and reporting.  
- Deleted appointments are removed from the system (or hidden); no audit trail for the record itself once deleted.

---

## Phase Objectives

- Clear policy for cancelled vs deleted appointments (documented above).
- Admin UI for soft delete (Mark cancelled) and hard delete (Delete) actions.
- Retention and audit behavior documented (above).

---

## Sessions Breakdown

- [ ] ### Session 6.6.1: Policy, UI, and retention/audit

**Description:** Define policy (Task 6.6.1.1) and add admin soft/hard delete UI (Task 6.6.1.2).

**Tasks:** 6.6.1.1 (Policy and documentation), 6.6.1.2 (Admin UI — soft delete and hard delete actions).

---

## Success Criteria

- [ ] Policy documented (cancelled vs deleted, retention, audit).
- [ ] Admin UI: Mark cancelled (soft) and Delete (hard) available where appropriate.
- [ ] Retention and audit behavior documented.

---

## Related Documents

- Feature guide: `.project-manager/features/appointment-workflow/feature-appointment-workflow-guide.md`
- Appointment status: `client/src/constants/appointmentStatus.ts`, `server/src/routes/internal/appointments/appointmentConstants.ts`
- Admin table: `client/src/views/admin/tabs/components/AppointmentsTable.vue`, `AppointmentActionsCell.vue`

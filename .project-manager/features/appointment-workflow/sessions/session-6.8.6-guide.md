# Session 6.8.6 Guide: Admin entry (step 0 / pre-wizard)

**Purpose:** Session-level guide for implementing admin-only step 0 or pre-wizard: Start new inspection | Edit quote | Reschedule, with dropdown of non-completed inspections (time-out filter, API, columns Address / Client name / Agent name).

**Tier:** Session (Tier 2 - Medium-Level)

---

## Quick Start

**Session ID:** 6.8.6
**Session Name:** Admin entry (step 0 / pre-wizard)
**Description:** For admins only, before or as step 0 of the wizard: choices Start new inspection | Edit quote | Reschedule. When Edit quote or Reschedule, show dropdown of non-completed inspections (exclude cancelled, deleted); filter by admin-configurable time-out (X days/weeks); dropdown columns Address, Client name, Agent name. Selection sets wizard mode and `loadedAppointmentId`; wizard proceeds to step 3. API: list appointments filtered by status, time-out window; post–Feature 7 by permission.

**Status:** Not Started

---

## Tasks

- [ ] #### Task 6.8.6.1: Admin setting for time-out (X days/weeks)

**Goal:** Add admin-configurable time-out so only appointments where scheduling began within last X days/weeks (or quote in quote status for last X) appear in the dropdown. Setting location: Business Controls → Calendar or Confirmation & Holds.

**Files:**
- **Client/Server:** Business settings or availability settings types and API; admin panel (AppointmentConfirmationPanel or Business Controls → Calendar / Confirmation & Holds).

**Approach:**
1. Add setting (e.g. `adminEntryTimeOutDays` or similar) to the appropriate settings payload and types.
2. Add UI control (number input or select) in admin panel; persist and read via existing settings API.

**Checkpoint:**
- Setting persisted and readable; value available for filtering list appointments.

---

- [ ] #### Task 6.8.6.2: API endpoint for list appointments (filtered by status, time-out)

**Goal:** Provide API to list appointments for admin entry dropdown: filter by status (exclude cancelled, deleted); filter by time-out window (scheduling began within last X days/weeks or quote in quote status for last X). Post–Feature 7: filter by permission if needed.

**Files:**
- **Server:** Appointment list route or new internal endpoint (e.g. GET list with query params for status, timeWindowDays); appointment model and filters.
- **Client:** API client or composable that calls this endpoint.

**Approach:**
1. Define query params: status filter (exclude cancelled, deleted), time-out (e.g. days or weeks). Optionally filter by status for Edit quote vs Reschedule (e.g. quote status for Edit quote, confirmed for Reschedule).
2. Implement server-side filter; return list with fields needed for dropdown (id, address, client name, agent name or minimal identifiers).

**Checkpoint:**
- API returns filtered list; client can call it with status and time-out.

---

- [ ] #### Task 6.8.6.3: Dropdown UI and selection → wizard mode and step 3

**Goal:** Build admin-only step 0 or pre-wizard UI: choices Start new inspection | Edit quote | Reschedule. When Edit quote or Reschedule, show dropdown of appointments (from API); each row Address, Client name, Agent name. Selection sets wizard mode and `loadedAppointmentId`; wizard proceeds to step 3 (Availability).

**Files:**
- **Client:** New component or integration in booking wizard entry (e.g. BookingWizardView or admin entry point); useWizardAppointmentManagement (loadedAppointmentId, mode); step routing to land at step 3 after load.

**Approach:**
1. Gate UI so only admins see step 0 / pre-wizard (stub or Feature 7 role).
2. Three choices: Start new | Edit quote | Reschedule. Start new proceeds to wizard step 0/1 without loading. Edit quote and Reschedule show dropdown; fetch list using API from 6.8.6.2.
3. Dropdown displays Address, Client name, Agent name; on selection set wizard mode (`quote` or `reschedule`) and `loadedAppointmentId`, then trigger load-at-step-3 and navigate to step 3.

**Checkpoint:**
- Admin sees choices; dropdown shows filtered list with required columns; selection sets mode and loadedAppointmentId and lands at step 3.

---

## Session Workflow

### Before Starting a Session

Use `/session-start 6.8.6 [description]` to load handoff and session guide. Implement tasks 6.8.6.1 → 6.8.6.3 in order. Depends on wizard mode and loadedAppointmentId (Phase 6.5 reschedule flow).

### Session Labeling Format

Label the session: **Session: 6.8.6 — Admin entry (step 0 / pre-wizard)**.

---

## Reference

- **Phase guide:** `.project-manager/features/appointment-workflow/phases/phase-6.8-guide.md` (Admin entry subsection)
- **Session planning:** `.project-manager/features/appointment-workflow/sessions/session-6.8.6-planning.md`
- **Wizard/load context:** Phase 6.5 (reschedule flow); `loadedAppointmentId`, wizard mode, load-at-step-3.

<!-- end excerpt session -->
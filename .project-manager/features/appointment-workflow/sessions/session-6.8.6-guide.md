# Session 6.8.6 Guide: Admin entry (step 0 / pre-wizard)

**Purpose:** Session-level guide for admin-only entry before or as step 0 of the booking wizard: Start new | Edit quote | Reschedule, with dropdown of non-completed inspections and navigation to wizard step 3.

**Tier:** Session (Tier 2 - Medium-Level)

---

## Quick Start

**Session ID:** 6.8.6  
**Session Name:** Admin entry (step 0 / pre-wizard)  
**Description:** For admins only, before or as step 0 of the wizard: choices Start new inspection | Edit quote | Reschedule. When Edit quote or Reschedule, show dropdown of non-completed inspections (exclude cancelled, deleted); filter by admin-configurable time-out (X days/weeks); dropdown columns Address, Client name, Agent name. Selection sets wizard mode and `loadedAppointmentId`; wizard proceeds to step 3. API: list appointments filtered by status, time-out window; post–Feature 7 by permission.

**Status:** In Progress

---

## Tasks

- [x] #### Task 6.8.6.1: Admin entry (step 0 / pre-wizard)

**Goal:** Admin setting for time-out (X days/weeks) in Business Controls → Calendar or Confirmation & Holds.

**Files:** Client: Business Controls (Confirmation & Holds) — admin entry time-out value and unit.

**Approach:** Add admin entry time-out setting; wire to calendar/availability settings for use by list-appointments API and dropdown filter.

**Checkpoint:** Time-out setting is configurable and persisted; used by API and UI.

---

- [x] #### Task 6.8.6.2: API for list appointments (filtered by status, time-out)

**Goal:** Implement API endpoint for list appointments filtered by status (exclude cancelled, deleted) and by admin-configured time-out window (scheduling began within last X days/weeks, or quote in quote status for last X). Return fields needed for admin entry dropdown (id, address, client name, agent name).

**Files:** Server: new or extended list-appointments route; read admin entry time-out from calendar/availability settings. Client: API client for list appointments (used by task 6.8.6.3).

**Approach:** Add or extend list-appointments endpoint with query params for status filter and time-out; resolve time-out (value + unit) from availability/calendar settings; filter appointments by status and time window; return minimal fields for dropdown.

**Checkpoint:** API returns filtered appointment list with required columns; time-out setting from Business Controls is used in the filter.

---

- [x] #### Task 6.8.6.3: Dropdown UI and selection → wizard step 3

**Goal:** Build admin-only step 0 / pre-wizard UI: choices Start new | Edit quote | Reschedule; for Edit quote/Reschedule, dropdown with filtered list (Address, Client name, Agent name); on selection set wizard mode and loadedAppointmentId, load appointment, navigate to step 3.

**Files:** Client: admin entry component(s), dropdown using list-appointments API, useWizardAppointmentManagement (loadedAppointmentId, mode), load-at-step-3 integration.

**Approach:** Implement step 0 UI with three actions; when Edit quote or Reschedule selected, call list-appointments API (using time-out from settings), render dropdown with columns; on selection set mode and loadedAppointmentId, trigger load-at-step-3, navigate to step 3.

**Checkpoint:** Admin entry UI shows choices and dropdown; selection sets mode and loadedAppointmentId and lands at step 3.

---

## Session Workflow

### Before Starting a Session

Use `/session-start 6.8.6` to load handoff, session guide, and task context. Implement tasks in order; after each task run `/task-end <taskId>` and cascade to the next task or `/session-end 6.8.6`.

### During Session

Work one task at a time (6.8.6.1 → 6.8.6.2 → 6.8.6.3). Verify each checkpoint before moving on. Session 6.8.6 is complete when all three tasks are done and session-end passes audits.

### End of Session

Run `/session-end 6.8.6` when all tasks are complete. Resolve any verification checklist or audit findings per the playbook.

---

<!-- end excerpt session -->

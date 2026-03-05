## Phase intent (goals and context)

# Phase 6.8 Guide: Admin Force-Create & Constraint Overrides

**Purpose:** Phase-level guide for planning and tracking the admin force-create and constraint override workflow

**Tier:** Phase (Tier 1 - High-Level)

## Session intent from phase guide

- [ ] ### Session 6.8.6: Admin entry (step 0 / pre-wizard)

**Description:** For admins only, before or as step 0 of the wizard: choices Start new inspection | Edit quote | Reschedule. When Edit quote or Reschedule, show dropdown of non-completed inspections (exclude cancelled, deleted); filter by admin-configurable time-out (X days/weeks); dropdown columns Address, Client name, Agent name. Selection sets wizard mode and `loadedAppointmentId`; wizard proceeds to step 3. API: list appointments filtered by status, time-out window; post–Feature 7 by permission.

**Tasks:**
1. Admin setting for time-out (X days/weeks) in Business Controls → Calendar or Confirmation & Holds. 2. API endpoint for list appointments (filtered by status, time-out). 3. Dropdown UI with columns Address, Client name, Agent name; selection sets wizard mode and loadedAppointmentId, navigates to step 3.

- [x] #### Task 6.8.6.1: ** Admin entry (step 0 / pre-wizard)

**Goal:** ** Admin entry (step 0 / pre-wizard)

**Files:**
(See tierUp guide and context above.)

**Approach:** See tierUp scope above.

**Checkpoint:** Verify per tierUp success criteria. [Fill in]
**Files:**
- [Files to work with]
**Approach:** [Fill in]
**Checkpoint:** [What needs to be verified]

- [x] #### Task 6.8.6.2: API for list appointments (filtered by status, time-out)

**Goal:** Implement API endpoint for list appointments filtered by status (exclude cancelled, deleted) and by admin-configured time-out window (scheduling began within last X days/weeks, or quote in quote status for last X). Return fields needed for admin entry dropdown (id, address, client name, agent name).

**Files:** Server: new or extended list-appointments route; read admin entry time-out from calendar/availability settings. Client: API client for list appointments (used by task 6.8.6.3).

**Approach:** Add or extend list-appointments endpoint with query params for status filter and time-out; resolve time-out (value + unit) from availability/calendar settings; filter appointments by status and time window; return minimal fields for dropdown.

**Checkpoint:** API returns filtered appointment list with required columns; time-out setting from Business Controls is used in the filter.

- [x] - [x] #### Task 6.8.6.3: Dropdown UI and selection → wizard step 3

**Goal:** Build admin-only step 0 / pre-wizard UI: choices Start new | Edit quote | Reschedule; for Edit quote/Reschedule, dropdown with filtered list (Address, Client name, Agent name); on selection set wizard mode and loadedAppointmentId, load appointment, navigate to step 3.

**Files:** Client: admin entry component(s), dropdown using list-appointments API, useWizardAppointmentManagement (loadedAppointmentId, mode), load-at-step-3 integration.

**Approach:** Implement step 0 UI with three actions; when Edit quote or Reschedule selected, call list-appointments API (using time-out from settings), render dropdown with columns; on selection set mode and loadedAppointmentId, trigger load-at-step-3, navigate to step 3.

**Checkpoint:** Admin entry UI shows choices and dropdown; selection sets mode and loadedAppointmentId and lands at step 3.

<!-- end excerpt session -->
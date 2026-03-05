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
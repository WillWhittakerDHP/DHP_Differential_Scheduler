# Session 6.8.3 Guide: Force-create composable and admin UI — useForceCreateAppointment, dialog, Force Schedule button

**Purpose:** Session-level guide for the Vue admin force-create UI (composable, dialog, Force Schedule button).

**Tier:** Session (Tier 2 - Medium-Level)

---

## Quick Start

**Session ID:** 6.8.3  
**Session Name:** Force-create composable and admin UI — useForceCreateAppointment, dialog, Force Schedule button  
**Description:** Build the Vue admin force-create UI: composable `useForceCreateAppointment`, confirmation dialog (violation preview, reason, confirm), and admin-only "Force Schedule" entry point. Server and availability pipeline are done (Sessions 6.8.1–6.8.2).

**Status:** In Progress

---

## Tasks

- [x] #### Task 6.8.3.1: useForceCreateAppointment composable and force-create dialog

**Goal:** Add the composable `useForceCreateAppointment` and the force-create confirmation dialog so callers can open a dialog, see violations for a candidate slot, enter a reason, and confirm to create the appointment and override.

**Files:** Client: new composable (e.g. `client/src/admin/composables/`), force-create dialog component. API: existing `POST /api/v1/internal/appointments/force-create`.

**Approach:** 1. Composable: state (dialog, slot, violations, reason, loading, error); fetch violations for slot; submit force-create; explicit return type and setX/updateX. 2. Dialog: thin component, violations list + reason + Confirm/Cancel; call composable submit; show loading/error.

**Checkpoint:** `useForceCreateAppointment` exists with fetch and submit; dialog shows violations + reason; confirm calls API and success/error are surfaced.

- [ ] #### Task 6.8.3.2: Admin UI Force Schedule button and blocked-slot entry point

**Goal:** Add "Force Schedule" button in admin appointments UI (slot or calendar context), visible only for admin; click opens dialog and triggers violation fetch for selected slot.

**Files:** Admin appointments/slot UI; reuse composable and dialog from 6.8.3.1.

**Approach:** Add Force Schedule button; wire to composable (open dialog, pass slot); enforce admin-only visibility.

**Checkpoint:** Admin can open Force Schedule from a blocked slot; dialog and API flow work end-to-end.

---

## Session Workflow

### Before Starting

Use `/session-start 6.8.3` to load context. Implement tasks in order; after each task run `/task-end <taskId>` and cascade to next or `/session-end 6.8.3`.

### Session Labeling

Label: **Session: 6.8.3 — Force-create composable and admin UI**. Work one task at a time; checkpoint after each per the guide.

---

## Phase intent (goals and context)

# Phase 6.8 Guide: Admin Force-Create & Constraint Overrides

**Purpose:** Phase-level guide for planning and tracking the admin force-create and constraint override workflow

**Tier:** Phase (Tier 1 - High-Level)

## Session intent from phase guide

- [ ] ### Session 6.8.3: ** Force-create composable and admin UI — useForceCreateAppointment, dialog, Force Schedule button

**Description:** ** Force-create composable and admin UI — useForceCreateAppointment, dialog, Force Schedule button

**Tasks:**
1. Add `constraint_overrides` table and model; implement `computeViolationsForSlot()` and force-create route with auth/role checks. 2. Add `relaxConstraintsForExceptions()` and extend availability pipeline with `allowedExceptions` and server-side override verification. 3. Build client composable and dialog (violation preview, reason, confirm); add admin-only Force Schedule entry point. 4. Wire reschedule flow to pass override violations to availability and create new override records on reschedule.

- [x] #### Task 6.8.3.1: ** ** Force-create composable and admin UI — useForceCreateAppointment, dialog, Force Schedule button

**Goal:** ** ** Force-create composable and admin UI — useForceCreateAppointment, dialog, Force Schedule button

**Files:**
(See tierUp guide and context above.)

**Approach:** See tierUp scope above.

**Checkpoint:** Verify per tierUp success criteria. [Fill in]
**Files:**
- [Files to work with]
**Approach:** [Fill in]
**Checkpoint:** [What needs to be verified]

<!-- end excerpt session -->
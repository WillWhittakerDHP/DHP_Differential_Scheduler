# Plan: session 6.8.6 — Admin entry (step 0 / pre-wizard)

## Contract
- **Tier:** session | **ID:** 6.8.6
- **Scope:** Admin entry (step 0 / pre-wizard) — Start new | Edit quote | Reschedule; time-out setting; API; dropdown with Address, Client name, Agent name; selection sets wizard mode and loadedAppointmentId
- **Governance:** Read reports before filling slots

## Where we left off
Session 6.8.5 (Block-level agentPermissions) complete or in progress. Session 6.8.6 follows.

## Goal
For admins only, before or as step 0 of the wizard: choices **Start new inspection** | **Edit quote** | **Reschedule**. When Edit quote or Reschedule, show dropdown of non-completed inspections (exclude cancelled, deleted); optionally filter by status for Edit quote vs Reschedule. Filter by admin-configurable time-out (X days/weeks — scheduling began within last X or quote in quote status for last X). Setting location: Business Controls → Calendar or Confirmation & Holds. Dropdown columns: Address, Client name, Agent name. Selection sets wizard mode and `loadedAppointmentId`; wizard proceeds to step 3. API: list appointments filtered by status, time-out window; post–Feature 7 by permission.

## Files
- **Server:** Appointment list endpoint with filters (status, time-out); optional permission filter post–Feature 7.
- **Client:** Business/availability settings (time-out setting); admin panel UI for time-out; booking wizard entry component(s); composable or API client for list appointments; dropdown component; useWizardAppointmentManagement (loadedAppointmentId, mode), load-at-step-3.
- **Docs:** Phase 6.8 guide (Admin entry subsection).

## Approach
1. Add admin setting for time-out (X days/weeks) in Business Controls → Calendar or Confirmation & Holds; persist and read via settings API. 2. Implement API endpoint for list appointments: filter by status (exclude cancelled, deleted), time-out window; return fields needed for dropdown (id, address, client name, agent name). 3. Build admin-only step 0 or pre-wizard UI: three choices (Start new | Edit quote | Reschedule); for Edit quote/Reschedule, dropdown with filtered list; on selection set wizard mode and loadedAppointmentId, trigger load-at-step-3, navigate to step 3.

## Checkpoint
- Time-out setting configurable and used in API filter.
- API returns filtered appointment list with required columns.
- Admin entry UI shows choices and dropdown; selection sets mode and loadedAppointmentId and lands at step 3.

## How we build the tierDown to achieve them
- **Task 6.8.6.1:** Admin setting for time-out (X days/weeks) in Business Controls
- **Task 6.8.6.2:** API endpoint for list appointments (filtered by status, time-out)
- **Task 6.8.6.3:** Dropdown UI with columns Address, Client name, Agent name; selection sets wizard mode and loadedAppointmentId, navigates to step 3
---
## Reference
- TierUp guide: `.project-manager/features/appointment-workflow/phases/phase-6.8-guide.md`
- Handoff: `.project-manager/features/appointment-workflow/sessions/session-6.8.5-handoff.md` (or phase handoff)
- Wizard/load: Phase 6.5 (loadedAppointmentId, wizard mode, load-at-step-3)

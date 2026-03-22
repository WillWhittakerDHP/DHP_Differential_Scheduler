# Plan: task 6.8.6.3 — Dropdown UI and selection → wizard step 3

## Contract
- **Tier:** task | **ID:** 6.8.6.3
- **Scope:** Client-only — admin entry step 0 UI, dropdown, and navigation to wizard step 3.
- **Governance:** Clean — no violations detected

## Where we left off
Task 6.8.6.1 added the admin time-out setting (Business Controls → Confirmation & Holds). Task 6.8.6.2 added GET `/api/internal/appointments/list-for-admin-entry` returning `AdminEntryAppointmentItem[]` (id, address, clientUserId, agentUserId). This task builds the admin entry UI that uses that API and sets wizard mode and loadedAppointmentId.

## Goal
Build the admin-only step 0 (pre-wizard) UI: three choices **Start new inspection** | **Edit quote** | **Reschedule**. When the user selects Edit quote or Reschedule, show a dropdown of appointments from the list-for-admin-entry API; display columns Address, Client name, Agent name (resolve client/agent names from users lookup, same pattern as admin appointments table). On row selection, set wizard mode and `loadedAppointmentId`, trigger load-at-step-3, and navigate to wizard step 3.

## Files
- **Client:** Admin entry component(s) or view (step 0); API client for GET list-for-admin-entry; users lookup (e.g. useUser or existing users list) to resolve clientUserId/agentUserId to display names; dropdown/select or table list with columns Address, Client name, Agent name; integration with useWizardAppointmentManagement (or equivalent) for loadedAppointmentId and wizard mode; load-at-step-3 and navigation to step 3. No server changes in this task.

## Approach
1. Add or identify the admin entry (step 0) entry point — e.g. where the booking wizard is launched for admins. 2. Render three actions: Start new | Edit quote | Reschedule. 3. When Edit quote or Reschedule is selected, call the list-for-admin-entry API; show a dropdown or list of results. 4. For each row, display address (from API), client name and agent name by resolving clientUserId and agentUserId via the same users lookup used by the admin appointments table (getUserById). 5. On selection of a row, set wizard mode (edit-quote or reschedule) and loadedAppointmentId to the selected appointment id. 6. Trigger load-at-step-3 (load appointment data for the wizard) and navigate to step 3. 7. Start new: set mode for new inspection and proceed without loadedAppointmentId.

## Checkpoint
- Admin entry UI shows the three choices (Start new | Edit quote | Reschedule).
- Selecting Edit quote or Reschedule shows the filtered appointment list (dropdown/list with Address, Client name, Agent name).
- Selecting an appointment sets wizard mode and loadedAppointmentId and navigates to step 3.

## How we build the tierDown
- **Task 6.8.6.3:** Dropdown UI and selection → wizard step 3

---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.8.6-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/sessions/task-6.8.6.2-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

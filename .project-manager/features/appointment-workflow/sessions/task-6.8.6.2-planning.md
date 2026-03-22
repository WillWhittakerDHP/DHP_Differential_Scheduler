# Plan: task 6.8.6.2 — API for list appointments (filtered by status, time-out)

## Contract
- **Tier:** task | **ID:** 6.8.6.2
- **Scope:** API endpoint for list appointments (filtered by status, time-out); server-only in this task.
- **Governance:** Clean — no violations detected

## Where we left off
Task 6.8.6.1 delivered the admin time-out setting (Business Controls → Confirmation & Holds); value persisted in calendar config and read via availability settings API. This task adds the list-appointments API that uses that setting.

## Goal
Implement a list-appointments API that returns appointments filtered by (1) status — exclude cancelled, deleted; (2) admin-configured time-out window — only appointments where scheduling began within the last X days/weeks, or quote has been in quote status for the last X. Return fields needed for the admin entry dropdown: id, address, client name, agent name. Time-out (value + unit) is read from availability/calendar settings (same source as 6.8.6.1).

## Files
- **Server:** New or extended list-appointments route (e.g. under appointments or admin); service/query to resolve calendar config (adminEntryTimeout) from settings; query to list appointments with status and date-window filters; response shape with id, address, client name, agent name.
- **Client:** (Task 6.8.6.3) API client for list appointments; this task only ensures the API contract is clear for the client.
- **Docs:** Phase 6.8 guide (Admin entry); session 6.8.6 guide (Task 6.8.6.2).

## Approach
1. Add or identify list-appointments endpoint (GET). 2. Resolve admin entry time-out: read availability/calendar settings for the scope (e.g. org or calendar) and get `adminEntryTimeout.value` and `adminEntryTimeout.unit` (default 30 days if missing). 3. Compute time window: "now minus X days" or "now minus X weeks" for filtering. 4. Query appointments: exclude statuses cancelled, deleted; filter by `scheduling_started_at` or equivalent within window, or for quote status by quote-status age within window. 5. Return array of items with fields: id, address, client name, agent name (map from existing appointment/block/address and user/agent data). 6. No permission filter in this task (post–Feature 7).

## Checkpoint
- List-appointments API returns filtered appointments (status + time-out window).
- Response includes id, address, client name, agent name per row.
- Time-out window is derived from Business Controls admin entry time-out setting.

## How we build the tierDown
- **Task 6.8.6.2:** API for list appointments (filtered by status, time-out)

---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.8.6-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/sessions/task-6.8.6.1-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

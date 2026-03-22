# Plan: task 6.5.4.2 — 6.5.4.2

## Contract
- **Tier:** task | **ID:** 6.5.4.2
- **Scope:** 6.5.4.2
- **Governance:** 1 governance highlights — read reports before filling slots

## Where we left off
No prior handoff for this task.

## Goal
On booking route load, read query params (`mode`, `appointmentId`). When `mode` is `reschedule` or `quote` and `appointmentId` is present, set wizard mode and load the appointment to step 3 (Availability). URL entry takes precedence over localStorage persisted id.

## Files
- `client/src/composables/booking/useWizardAppointmentManagement.ts` — use `useRoute()`; in `onMounted`, check `route.query.mode` and `route.query.appointmentId` before localStorage; extend `handleLoadAppointment` to accept optional `mode` override for quote vs reschedule
- `client/src/types/booking/wizardAppointmentManagement.ts` — add optional `mode` to `handleLoadAppointment` signature if needed

## Approach
1. **Route query first:** In `onMounted`, read `route.query.mode` and `route.query.appointmentId`. If `mode` is `reschedule` or `quote` and `appointmentId` is a non-empty string, call `handleLoadAppointment(appointmentId, { mode })` and return (skip localStorage).
2. **Extend handleLoadAppointment:** Add optional second param `options?: { mode?: 'reschedule' | 'quote' }`. When loading by id (not random), set `wizard.setWizardMode(options?.mode ?? 'reschedule')` instead of always `reschedule`.
3. **Fallback unchanged:** If no URL params, keep existing localStorage restore logic.
4. **Type guard:** Validate `mode` is `'reschedule' | 'quote'` before using.

## Checkpoint
- Visiting `/booking?mode=reschedule&appointmentId=<valid-id>` loads the appointment and lands at step 3 in reschedule mode.
- Visiting `/booking?mode=quote&appointmentId=<valid-id>` loads the appointment and lands at step 3 in quote mode.
- Visiting `/booking` with no params still restores from localStorage if persisted.

## How we build the tierDown
- **Task 6.5.4.1:** URL scheme and router
- **Task 6.5.4.2:** Wizard entry from query
- **Task 6.5.4.3:** Cancel flow
- **Task 6.5.4.4:** Copy quote link button
- **Task 6.5.4.5:** Invite template variables (optional)
- **Task 6.5.4.6:** Verification and docs

---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.5.4-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/sessions/task-6.5.4.1-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

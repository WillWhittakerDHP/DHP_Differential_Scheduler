# Plan: task 6.5.4.6 — 6.5.4.6

## Contract
- **Tier:** task | **ID:** 6.5.4.6
- **Scope:** 6.5.4.6
- **Governance:** Clean — no violations detected

## Where we left off
No prior handoff for this task.

## Goal
Smoke-test all session 6.5.4 deliverables (reschedule, quote, cancel links; wizard load-at-step-3; copy quote link; wizard persistence; invite template variables). Update session log and handoff with verification results.

## Files
- `.project-manager/features/appointment-workflow/sessions/session-6.5.4-log.md` — Add verification notes
- `.project-manager/features/appointment-workflow/sessions/session-6.5.4-handoff.md` — Update Next Action, Last Updated

## Approach
1. Smoke-test reschedule link: `/booking?mode=reschedule&appointmentId=<id>` loads wizard at step 3.
2. Smoke-test quote link: `/booking?mode=quote&appointmentId=<id>` loads wizard; Copy quote link replaces Submit on last step.
3. Smoke-test cancel link: `/cancel?appointmentId=<id>` shows confirm flow; PATCH completes.
4. Smoke-test wizard persistence: go back from Availability → Contacts → Property Details; selections preserved.
5. (Optional) Verify invite template variables: event template with `{rescheduleLink}` / `{cancelLink}` resolves when APP_BASE_URL set.
6. Update session log with verification summary.
7. Update session handoff (Next Action: session-end or next session).

## Checkpoint
- All links (reschedule, quote, cancel) work end-to-end.
- Copy quote link copies correct URL; wizard persistence preserves selections.
- Session log and handoff updated.

## How we build the tierDown
- **Task 6.5.4.6:** Verification and docs (final task; cascade to session-end)

---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.5.4-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/sessions/task-6.5.4.5-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

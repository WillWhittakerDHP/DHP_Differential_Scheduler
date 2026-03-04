# Plan: task 6.5.3.3 — 6.5.3.3

## Contract
- **Tier:** task | **ID:** 6.5.3.3
- **Scope:** 6.5.3.3
- **Governance:** 1 governance highlights — read reports before filling slots

## Where we left off
No prior handoff for this task.

## Goal
Verify the original-inspection UI end-to-end: confirm that when in reschedule mode with a loaded appointment, the slot matching the current appointment time is visually distinct and selectable. Document verification steps and any gaps (e.g. dev load-mode buttons not yet built).

## Files
- `.project-manager/features/appointment-workflow/sessions/session-6.5.3-log.md` — add verification entry
- No code changes; verification-only task

## Approach
1. Run app and lint to confirm no regressions.
2. Document verification checklist: (a) Reschedule mode + loaded state + same date → one slot shows `appointment-slot-btn--original-inspection` styling; (b) Slot remains clickable/selectable; (c) New/quote flows show no original-inspection styling.
3. Note: Full E2E verification requires a way to enter reschedule mode with loaded appointment (dev load-mode buttons from session scope are not yet implemented). Manual verification or future dev-button task can complete the loop.
4. Update session log with verification outcome.

## Checkpoint
- App starts and lint passes.
- Verification checklist documented; session log updated.
- Session 6.5.3 ready for session-end (or follow-up tasks for dev buttons/theme if needed).

## How we build the tierDown
- **Task 6.5.3.3:** Verify end-to-end original-inspection UI

---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.5.3-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/sessions/task-6.5.3.2-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

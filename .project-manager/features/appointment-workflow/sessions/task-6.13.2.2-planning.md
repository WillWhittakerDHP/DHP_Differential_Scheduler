# Plan: task 6.13.2.2 — 6.13.2.2

## Contract
- **Tier:** task | **ID:** 6.13.2.2
- **Scope:** 6.13.2.2
- **Governance:** 1 governance highlights — read reports before filling slots

## Work Profile
- **Execution intent:** implement
- **Action type:** localized_change
- **Scope shape:** file_local
- **Governance domains:** function
- **Recommended context pack:** local_implementation_pack
- **Planning artifact action:** update
- **Decomposition mode:** moderate
- **Downstream advice:** Planning doc is advisory; guide owns current-tier decomposition. Inherit intent, constraints, and governance emphasis; avoid pre-specifying child execution detail unless decomposition mode is explicit.

## Where we left off
No prior handoff for this task.

## Goal
Verify all six wizard-mode × brand combinations (new/quote/reschedule × brand on/off) produce correct and distinct visuals after the task 6.13.2.1 refactor. Run client lint and fix any issues in touched files. Confirm app starts cleanly.

## Files
- `client/src/components/booking/BookingWizard.vue` — verify class bindings apply correctly
- `client/src/components/booking/BookingWizard.scss` — verify `wizard-palette-active` block produces correct colors
- `client/src/composables/useThemeMode.ts` — verify `--wizard-*` vars are set correctly per mode

## Approach
1. Run `cd client && npm run lint` and fix any lint errors in touched files.
2. Verify app starts cleanly (`npm run start:dev` already running).
3. Use browser DevTools to inspect `--wizard-*` CSS variable values for each mode × brand combination (6 total).
4. Fix any visual or lint regressions found during verification.

## Checkpoint
- `npm run lint` (client) passes with no new errors.
- App starts cleanly.
- CSS variables confirmed set for all six combinations via DevTools inspection.
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.13.2-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/sessions/task-6.13.2.1-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

im# Plan: task 6.5.3.1 — 6.5.3.1

## Contract
- **Tier:** task | **ID:** 6.5.3.1
- **Scope:** 6.5.3.1
- **Governance:** 1 governance highlights — read reports before filling slots

## Where we left off
No prior handoff for this task.

## Goal
Compute which slot is the original inspection (matches loaded appointment's time when rescheduling) and pass its buttonIndex to AppointmentSlotGrid. No UI changes in this task — only the data flow.

## Files
- `client/src/composables/booking/useAvailabilityOrchestrator.ts` — add computed `originalInspectionButtonIndex`
- `client/src/components/booking/steps/AvailabilityStep.vue` — pass `originalInspectionButtonIndex` to AppointmentSlotGrid
- `client/src/utils/booking/timeSlotMatching.ts` — reuse for slot-to-loaded-time comparison (if needed)

## Approach
1. In orchestrator: when `wizardMode === 'reschedule'` and `loadedWizardState` has `availability.candidateDate` + `candidateTimeSlots`, and `selectedDate.start` matches `candidateDate.start`, find the slot whose `startTime` matches `candidateTimeSlots[0].time`. Use `timeSlotMatching` or normalize both for comparison. Return that slot's `buttonIndex` or `null`.
2. Expose `originalInspectionButtonIndex` from orchestrator (computed).
3. In AvailabilityStep: pass `originalInspectionButtonIndex` to AppointmentSlotGrid as a prop.
4. Keep logic in composable/util; component stays thin.

## Checkpoint
Orchestrator exposes `originalInspectionButtonIndex`; AvailabilityStep passes it to AppointmentSlotGrid. No visual change yet (Task 6.5.3.2 adds the class).
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.5.3-guide.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

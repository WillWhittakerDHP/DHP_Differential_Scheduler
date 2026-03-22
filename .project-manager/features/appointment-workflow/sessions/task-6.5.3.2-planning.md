# Plan: task 6.5.3.2 — 6.5.3.2

## Contract
- **Tier:** task | **ID:** 6.5.3.2
- **Scope:** 6.5.3.2
- **Governance:** 1 governance highlights — read reports before filling slots

## Where we left off
No prior handoff for this task.

## Goal
Add the `appointment-slot-btn--original-inspection` class and styles so the original inspection slot (the slot matching the loaded appointment's current time when rescheduling) is visually distinct while remaining selectable. Task 6.5.3.1 already computes and passes `originalInspectionButtonIndex`; this task applies the class and styles.

## Files
- `client/src/components/booking/AppointmentSlotGrid.vue` — add class binding when `slotData.buttonIndex === originalInspectionButtonIndex`
- `client/src/components/booking/AppointmentSlotGrid.scss` — add `.appointment-slot-btn--original-inspection` styles (distinct border/background, optional "Current" label; slot remains selectable)

## Approach
1. In AppointmentSlotGrid.vue: add `'appointment-slot-btn--original-inspection': slotData.buttonIndex === originalInspectionButtonIndex` to the VBtn `:class` binding. The prop `originalInspectionButtonIndex` is already passed from AvailabilityStep (Task 6.5.3.1).
2. In AppointmentSlotGrid.scss: add `.appointment-slot-btn--original-inspection` — distinct but not disabled (e.g. different border/background tint, optional "Current" label). Slot remains selectable; do not change `:disabled` logic.
3. Keep components thin; no new logic beyond the class binding.

## Checkpoint
- In reschedule mode, when the selected date matches the loaded appointment date, the slot matching the current appointment time shows distinct styling (e.g. `appointment-slot-btn--original-inspection`).
- Slot is still clickable and selectable.
- No regression for new-booking or quote flows (no original-inspection styling when not in reschedule or when date doesn't match).

## How we build the tierDown
- **Task 6.5.3.2:** Add original-inspection class and styles

---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.5.3-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/sessions/task-6.5.3.1-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

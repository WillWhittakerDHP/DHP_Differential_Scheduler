# Plan: task 6.7.2.2 — Add includeScheduledBy toggle in event instances

## Contract
- **Tier:** task | **ID:** 6.7.2.2
- **Scope:** Add includeScheduledBy toggle in event instances
- **Governance:** 1 governance highlights — read reports before filling slots

## Where we left off
Task 6.7.2.1 complete (scheduled_by in appointment details). Second task of Session 6.7.2.

## Goal
Add a toggle in the event instances section (e.g. Instance Fields modal or event instances UI) to control whether scheduled-by is included in event instance display/export.

## Files
- `client/src/views/admin/tabs/components/EventInstancesSection.vue`
- `client/src/composables/admin/useEventInstancesSection.ts`
- Possibly `client/src/configs/field/form/appliedForm/eventInstanceFields.ts` or display config if the toggle drives which fields are shown; InstancesTab context (injectionKeys / useInstancesTab).

## Approach
- Add includeScheduledBy state (e.g. in InstancesTab context or useEventInstancesSection).
- Expose as a toggle in the Event Instances UI (e.g. next to "Instance Fields" or inside the Instance Fields modal).
- When enabled, include scheduled_by in event instance display/export.
- Follow existing toggle patterns (e.g. eventInstanceMetadataModalOpen).
- Persist preference (e.g. local storage or tab state).

## Checkpoint
Toggle is visible and persists preference; event instances display/export respects includeScheduledBy.

## How we build the tierDown to achieve them
- **Task 6.7.2.2:** Add includeScheduledBy toggle in event instances

---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.7.2-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/sessions/task-6.7.2.1-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

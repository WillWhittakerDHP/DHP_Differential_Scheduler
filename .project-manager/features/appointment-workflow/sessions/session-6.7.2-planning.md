# Plan: session 6.7.2 — Admin UI — display scheduled_by; includeScheduledBy toggle in event instances

## Contract
- **Tier:** session | **ID:** 6.7.2
- **Scope:** Admin UI — display scheduled_by in appointment details; includeScheduledBy toggle in event instances
- **Governance:** 4 governance highlights — read reports before filling slots

## Where we left off
Session 6.7.1 complete (scheduled_by_id set on create from req.user). Begin Session 6.7.2 (Admin UI).

## Goal
Show scheduled_by in admin appointment details and add an includeScheduledBy toggle in the event instances section so users can control whether scheduled-by is included in event instance display/export.

## Files
- Admin appointment details view/component; API or transformer for scheduler name; client types if needed.
- EventInstancesSection.vue, useEventInstancesSection.ts; InstancesTab context; optionally eventInstanceFields or display config.

## Approach
- Task 6.7.2.1: Use existing or new API shape to expose scheduled_by (and optional display name); add display in admin appointment details following existing patterns.
- Task 6.7.2.2: Add includeScheduledBy state (e.g. in InstancesTab context or useEventInstancesSection); expose as a toggle in Event Instances UI; when enabled, include scheduled_by in event instance display/export. Follow existing toggle patterns (e.g. eventInstanceMetadataModalOpen).

## Checkpoint
- Admin can see who scheduled each appointment in the details view.
- Toggle is visible and persists preference; event instances display/export respects includeScheduledBy.

## How we build the tierDown to achieve them
- **Task 6.7.2.1:** Display scheduled_by in appointment details
- **Task 6.7.2.2:** Add includeScheduledBy toggle in event instances
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/phases/phase-6.7-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/sessions/session-6.7.1-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

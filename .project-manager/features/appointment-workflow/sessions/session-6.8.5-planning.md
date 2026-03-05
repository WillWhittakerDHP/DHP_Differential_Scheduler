# Plan: session 6.8.5 — Block-level agentPermissions

## Contract
- **Tier:** session | **ID:** 6.8.5
- **Scope:** Block-level agentPermissions — full stack (migration, model, versioning, client types, transformer) and Force Schedule/Override visibility
- **Governance:** Read reports before filling slots

## Where we left off
Session 6.8.4 (Reschedule flow and override records) in progress or complete. Session 6.8.5 follows.

## Goal
Add `agent_permissions` (TernaryBoolean: `'true'`, `'false'`, `'override'`) to `block_instances`, same pattern as `differential`. Full stack: migration, model, versioning (if used), client types, transformer. Semantics: `true` = agents only; `false` = clients; `override` = admins can use regardless. Drives which blocks/features (e.g. blocker override, future agent features) are visible or usable per role. Effective permission: state = (user role, block.agentPermissions); admin always allowed; agent when `'true'` or `'override'`; client when `'false'` or `'override'`. Tooltips and permissions (Override constraints, Hold Slot, Force schedule) are variable and state-driven. Update Force Schedule and Override visibility (from 6.8.3/6.8.4) to respect (user role, block.agentPermissions).

## Files
- **Server:** `server/src/db/migrations/` (new migration); `server/src/db/models/booking/block_instance.ts`; `server/src/services/instanceVersioning.ts`; `server/src/db/models/booking/block_instance_version.ts` if applicable.
- **Client:** Booking block instance types; `client/src/utils/transformers/globalToBookingTransformer.ts` (or equivalent); composables/components that gate Force Schedule and Override visibility.
- **Reference:** `server/src/db/migrations/20260210_000001_baseline_schema.sql` (block_instances, differential column); `server/src/db/models/booking/block_instance.ts` (line 26, differential).

## Approach
1. Migration: add `agent_permissions` column to `block_instances`, type `ternary_boolean`, default `'false'`. 2. Model: add to BlockInstance and block_instance_version if versioned; add to instanceVersioning diff/apply. 3. Client types and transformer: add agentPermissions to booking block instance type; map in globalToBookingTransformer. 4. Visibility: where Force Schedule and Override are gated, compute effective permission from (user role, block.agentPermissions) and show/hide accordingly; admins get override.

## Checkpoint
- Migration and model in place; client types and transformer include agentPermissions.
- Force Schedule and Override visibility respect (user role, block.agentPermissions); admins get override.

## How we build the tierDown to achieve them
- **Task 6.8.5.1:** Migration — add agent_permissions column
- **Task 6.8.5.2:** Model and versioning
- **Task 6.8.5.3:** Client types and transformer
- **Task 6.8.5.4:** Force Schedule and Override visibility
---
## Reference
- TierUp guide: `.project-manager/features/appointment-workflow/phases/phase-6.8-guide.md`
- Handoff: `.project-manager/features/appointment-workflow/sessions/session-6.8.4-handoff.md` (or phase handoff)
- Governance reports: `client/.audit-reports/`
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

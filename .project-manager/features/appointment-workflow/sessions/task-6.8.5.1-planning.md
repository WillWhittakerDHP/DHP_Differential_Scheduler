# Plan: task 6.8.5.1 — Migration: add agent_permissions column

## Contract
- **Tier:** task | **ID:** 6.8.5.1
- **Scope:** Add `agent_permissions` column to `block_instances` (migration only)
- **Governance:** Clean — no violations detected

## Where we left off
No prior handoff for this task. Session 6.8.5 just started; this is the first task.

## Goal
Add `agent_permissions` column to `block_instances` using the existing `ternary_boolean` ENUM, default `'false'`. Same pattern as the existing `differential` column in the baseline schema.

## Files
- **Server:** New migration in `server/src/db/migrations/` (add column to `block_instances`).
- **Reference:** `server/src/db/migrations/20260210_000001_baseline_schema.sql` (lines 957–971: `block_instances` table; line 971: `differential public.ternary_boolean DEFAULT 'false'::public.ternary_boolean NOT NULL`).

## Approach
1. Create a new migration file (e.g. `YYYYMMDD_HHMMSS_add_agent_permissions_to_block_instances.mjs`) that adds `agent_permissions public.ternary_boolean DEFAULT 'false'::public.ternary_boolean NOT NULL` to `block_instances`.
2. Implement `up` (ALTER TABLE ADD COLUMN) and `down` (ALTER TABLE DROP COLUMN).
3. Run the migration and verify the column exists with correct type and default.

## Checkpoint
- Column `agent_permissions` exists on `block_instances`; type is `ternary_boolean`; default is `'false'`; NOT NULL.
- Migration runs up and down without error.

## How we build the tierDown
- **Task 6.8.5.1:** Migration — add agent_permissions column
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.8.5-guide.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

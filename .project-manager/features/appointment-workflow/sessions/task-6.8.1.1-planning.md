# Plan: task 6.8.1.1 — 6.8.1.1

## Contract
- **Tier:** task | **ID:** 6.8.1.1
- **Scope:** 6.8.1.1
- **Governance:** Clean — no violations detected

## Where we left off
No prior handoff for this task.

## Goal
Create the constraint_overrides table and ConstraintOverride Sequelize model with associations to Appointment and User (authorizedBy).

## Files
- New migration file under `server/src/db/migrations/` (or project's migration path).
- `server/src/models/` — ConstraintOverride model; register associations with Appointment and User in model index/registry.

## Approach
1. Add migration: table `constraint_overrides` with columns per phase guide (id UUID PK, appointment_id FK → appointments ON DELETE CASCADE, overridden_violations TEXT[], authorized_by_id FK → users, reason TEXT nullable, slot_start TIMESTAMPTZ, slot_end TIMESTAMPTZ, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ); index on appointment_id. 2. Create ConstraintOverride Sequelize model (same columns, appropriate types). 3. Add associations: ConstraintOverride belongsTo Appointment; ConstraintOverride belongsTo User as authorizedBy. 4. Ensure model is registered/loaded in the app's model index so it is available for Task 6.8.1.2.

## Checkpoint
Migration runs cleanly (up/down); ConstraintOverride and associations load without error; no lint/type errors on server.
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.8.1-guide.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

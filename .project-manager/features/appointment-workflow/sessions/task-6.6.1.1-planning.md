# Plan: task 6.6.1.1 — Policy and documentation

## Contract
- **Tier:** task | **ID:** 6.6.1.1
- **Scope:** Policy and documentation (cancelled vs deleted, retention rules)
- **Governance:** Clean — no violations detected

## Where we left off
No prior handoff for this task. Session 6.6.1 just started.

## Goal
Document policy for cancelled (soft, retain for audit) vs deleted (hard or soft-with-purge) and retention rules.

## Files
Phase guide (phase-6.6-guide.md); optional dedicated doc (e.g. server/docs or feature docs) for retention/audit policy.

## Approach
1. Write policy section: cancelled vs deleted semantics, when to use each, retention rules.
2. Add to phase guide or a short doc referenced by the phase guide.

## Checkpoint
Policy and retention rules documented; phase guide or linked doc updated.

---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.6.1-guide.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

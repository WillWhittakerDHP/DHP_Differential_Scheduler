# Plan: session 6.6.1 — Policy, UI, and retention/audit (Soft Delete vs Hard Delete)

## Contract
- **Tier:** session | **ID:** 6.6.1
- **Scope:** Policy, UI, and retention/audit for soft delete vs hard delete
- **Governance:** 5 governance highlights — read reports before filling slots

## Where we left off
No prior handoff for this session. Phase 6.6 just started; appointment status workflow (Phase 6.1) provides cancelled/deleted status values.

## Goal
Define policy for cancelled (soft, retain for audit) vs deleted (hard or soft-with-purge); add admin UI actions for soft delete and hard delete; document retention and audit behavior.

## Files
Phase guide; appointment CRUD/PATCH routes and status handling; admin appointment UI (detail/actions); retention/audit documentation; backend or API only if scope requires.

## Approach
1. Document policy: cancelled vs deleted semantics and retention rules (in phase guide or dedicated doc).
2. Add admin UI actions (soft delete, hard delete) where appropriate; thin components and composables per governance.
3. Document retention and audit behavior; implement any schema/API changes if in scope.

## Checkpoint
Policy documented; admin soft/hard delete actions in place; retention and audit documented; session/phase guide updated.

## How we build the tierDown to achieve them
- **Task 6.6.1.1:** Policy and documentation — document cancelled vs deleted policy and retention rules
- **Task 6.6.1.2:** Admin UI — soft delete and hard delete actions (thin components, composables)
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/phases/phase-6.6-guide.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

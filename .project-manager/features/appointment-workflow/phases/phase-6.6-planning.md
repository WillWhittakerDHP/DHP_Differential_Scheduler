# Plan: phase 6.6 — 6.6

## Contract
- **Tier:** phase | **ID:** 6.6
- **Scope:** 6.6
- **Governance:** Clean — no violations detected

## Where we left off
Phase 6.5 (Rescheduling Flow) is in progress; reschedule/cancel links and status transitions are in place. Phase 6.6 establishes policy and UI for cancelled vs deleted appointments, retention rules, and audit trail.

## Goal
Define and implement policy and UI for soft delete vs hard delete: clear distinction between cancelled and deleted appointments, admin actions for soft/hard delete, and documented retention and audit behavior.

## Files
- Phase guide: `phases/phase-6.6-guide.md`
- Appointment status/workflow (Phase 6.1), CRUD and PATCH (existing)
- Admin UI surfaces for appointment actions (to be identified per session)
- Retention/audit docs and any schema or API changes (TBD in sessions)

## Approach
- Lock policy: cancelled (soft, retain for audit) vs deleted (hard or soft-with-purge); document retention rules.
- Add admin UI actions for soft delete and hard delete where appropriate; respect governance (thin components, composables).
- Document retention and audit behavior; implement any backend/API changes per session scope.

## Checkpoint
- Policy documented; admin soft/hard delete actions in place; retention and audit behavior documented; phase guide and handoff updated.

## How we build the tierDown to achieve them
- **Session 6.6.1:** Soft delete vs hard delete — policy, UI, retention/audit (to be refined in session planning)
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/feature-appointment-workflow-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/phases/phase-6.5-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

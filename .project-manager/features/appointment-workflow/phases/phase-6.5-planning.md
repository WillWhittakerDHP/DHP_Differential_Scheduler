# Plan: phase 6.5 — 6.5

## Contract
- **Tier:** phase | **ID:** 6.5
- **Scope:** 6.5
- **Governance:** 2 governance highlights — read reports before filling slots

## Where we left off
- Prior phase/session work established modal behavior and differential/preClosing context. - Current planning output showed template-heavy context and generic Q&A prompts.

## Goal
Achieve Phase 6.5 Rescheduling Flow per phase guide. Sessions 6.5.1–6.5.4. Session 6.5.2 complete; next session 6.5.3 (Original-Inspection UI).

## Files
- Phase guide: `.project-manager/features/appointment-workflow/phases/phase-6.5-guide.md`
- Session guides under `sessions/` — no code changes at phase level; phase creates branch and enables session cascade.

## Approach
1. Create phase branch `appointment-workflow-phase-6.5` (or equivalent per harness).
2. Ensure phase guide lists sessions 6.5.1–6.5.4; session 6.5.3 is next.
3. Run session-start 6.5.3 when ready; cascade session-end to next or phase-end.

## Checkpoint
- Phase branch exists; session 6.5.3 can start without "ancestor branch does not exist" error.

---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/feature-appointment-workflow-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/phases/phase-6.4-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

# Plan: phase 6.5 — 6.5

## Contract
- **Tier:** phase | **ID:** 6.5
- **Scope:** 6.5
- **Governance:** 2 governance highlights — read reports before filling slots

## Where we left off
- Prior phase/session work established modal behavior and differential/preClosing context. - Current planning output showed template-heavy context and generic Q&A prompts.

## Goal
Create phase 6.5 branch and establish Rescheduling Flow scope. Sessions 6.5.1–6.5.4 already defined; 6.5.2 complete; next is 6.5.3 (Original-Inspection UI).

## Files
- `.project-manager/features/appointment-workflow/phases/phase-6.5-guide.md`
- Session guides: session-6.5.1 through session-6.5.4

## Approach
1. Phase-start execute creates branch `appointment-workflow-phase-6.5`.
2. Sessions 6.5.1, 6.5.2 (done), 6.5.3, 6.5.4 are in the phase guide; run session-start for each in order.
3. Next step: run `/session-start 6.5.3` or `/accepted-proceed` (session 6.5.3 pending).

## Checkpoint
- Branch `appointment-workflow-phase-6.5` exists.
- Phase scope and session order confirmed.

## How we build the tierDown to achieve them
Sessions 6.5.1 (entry/transitions), 6.5.2 (availability bypass — complete), 6.5.3 (original-inspection UI), 6.5.4 (client-facing links). Run session-start for each in order; cascade session-end → next session or phase-end.
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/feature-appointment-workflow-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/phases/phase-6.4-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

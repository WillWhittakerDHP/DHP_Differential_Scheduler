# Plan: phase 6.5 — 6.5

## Contract
- **Tier:** phase | **ID:** 6.5
- **Scope:** 6.5
- **Governance:** 2 governance highlights — read reports before filling slots

## Where we left off
- Prior phase/session work established modal behavior and differential/preClosing context. - Current planning output showed template-heavy context and generic Q&A prompts.

## Goal
Deliver Phase 6.5 Rescheduling Flow: reschedule confirmed appointments using the same wizard flow as quote/dev load; appointment loads at step 3; current appointment excluded from overlap but visible on calendar; original-inspection slot visually distinct; wizard mode reschedule; admin entry (Start new | Edit quote | Reschedule); client-facing links (6.5.4).

## Files
- `.project-manager/features/appointment-workflow/phases/phase-6.5-guide.md` — phase scope and session list
- Session guides under `sessions/` (6.5.1–6.5.4)

## Approach
1. Phase branch `appointment-workflow-phase-6.5` (or `phase-6.5` per config) created from feature branch.
2. Sessions 6.5.1–6.5.4 run in order; session 6.5.2 already complete.
3. Next: session 6.5.3 (Original-Inspection UI), then 6.5.4 (client-facing links).
4. Cascade session-end → next session or phase-end.

## Checkpoint
- Phase branch exists; scope updated.
- All sessions (6.5.1–6.5.4) complete per phase guide success criteria.

---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/feature-appointment-workflow-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/phases/phase-6.4-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

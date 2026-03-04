# Plan: phase 6.5 — 6.5

## Contract
- **Tier:** phase | **ID:** 6.5
- **Scope:** 6.5
- **Governance:** 2 governance highlights — read reports before filling slots

## Where we left off
- Prior phase/session work established modal behavior and differential/preClosing context. - Current planning output showed template-heavy context and generic Q&A prompts.

## Goal
Achieve Phase 6.5 Rescheduling Flow: wizard mode (reschedule), load-at-step-3, reschedulingAppointmentId bypass, original-inspection slot UI, admin entry, client-facing links. Sessions 6.5.1–6.5.4 deliver these outcomes.

## Files
- Phase guide, session guides, handoffs under `.project-manager/features/appointment-workflow/`
- Client: booking wizard, availability composables, AppointmentSlotGrid
- Server: computed-availability, overlap/calendarEvents logic

## Approach
1. Run session-start for each session in order (6.5.1 → 6.5.2 → 6.5.3 → 6.5.4).
2. After each session-end, cascade to next session or phase-end.
3. Follow governance (audits, thin components, composables).

## Checkpoint
- All four sessions complete; reschedule flow works end-to-end (admin entry, availability bypass, original-inspection UI, client links).
- Phase-end audit passes.

## How we build the tierDown to achieve them
- **Session 6.5.1:** Entry/transitions — wizard mode, load-at-step-3, admin entry
- **Session 6.5.2:** Availability bypass — reschedulingAppointmentId in request
- **Session 6.5.3:** Original-inspection slot UI — distinct styling, selectable
- **Session 6.5.4:** Client-facing entry — reschedule/quote/cancel links
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/feature-appointment-workflow-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/phases/phase-6.4-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

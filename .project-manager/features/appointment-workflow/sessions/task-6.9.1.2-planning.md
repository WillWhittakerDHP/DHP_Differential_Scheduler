# Plan: task 6.9.1.2 — Wire sections 1–4 and reserve step 5

## Contract
- **Tier:** task | **ID:** 6.9.1.2
- **Scope:** Session 6.9.1 (Sub-Step Model and Wide Layout) — this task: wire sections 1–4 into sub-step structure, add step 5 slot with placeholder and visibility gate
- **Governance:** Read reports before filling slots; component/composable playbooks apply

## Where we left off
Task 6.9.1.1 completed: sub-step model (five steps), visibility conditions (options, perspective, moveable), and step labels are in place in AvailabilityStep. This task wires the existing sections under those labels and adds the step 5 slot.

## Goal
Wire AvailabilityCalendarSection, AvailabilityOptionsSection, DifferentialGraph, AppointmentSlotGrid into sub-step structure (steps 1–4); add step 5 slot with placeholder and visibility gate so the layout and gate are in place for 6.9.4. Group or wrap existing sections under step labels; add reserved panel/slot for step 5 with placeholder (e.g. "Confirm moveable details" header with a stub message or loading state); gate step 5 visibility on hasMoveablePartsGated. No narrow/card behavior in this task.

## Files
- `client/src/components/booking/steps/AvailabilityStep.vue` — wire sections 1–4 into sub-step structure, add step 5 slot with placeholder.
- Existing child sections (no file changes to their internals): AvailabilityCalendarSection, AvailabilityOptionsSection, DifferentialGraph, AppointmentSlotGrid — used as content for sub-steps 1–4.
- useAvailabilityOrchestrator (existing) — step 5 visibility gate (hasMoveablePartsGated).

## Approach
- In AvailabilityStep template: wrap or group existing sections (calendar, options, differential, slot grid) with step labels so each lives under its sub-step (1–4).
- Add a reserved panel/slot for sub-step 5: placeholder or empty state (e.g. "Confirm moveable details" header with a stub message or loading state) so the structure and visibility gate are in place; render step 5 only when visibility gate is true.
- Ensure options sub-step is visible and ordered before perspective when options exist.
- Keep all panels expanded on wide screens; narrow layout unchanged until Session 6.9.2.
- No changes to orchestrator validation or slot calculation.

## Checkpoint
- Steps 1–4 wired to calendar, options, differential, slot grid; each section appears under the correct step label.
- Step 5 panel/slot present when moveable gate is true; placeholder content only (no real moveable content yet — that is 6.9.4).
- Lint passes; app starts; no regression to existing availability behavior.

## How we build the tierDown to achieve them
- This task only; no child tiers. Implementation order: (1) group existing sections under step labels in template, (2) add step 5 slot with placeholder and visibility gate, (3) verify layout and visibility.
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.9.1-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/sessions/task-6.9.1.1-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

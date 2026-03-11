# Plan: session 6.9.4 — Moveable Content in 5th Sub-Step; Remove Modal and Deprecate

## Contract
- **Tier:** session | **ID:** 6.9.4
- **Scope:** Moveable Content in 5th Sub-Step; Remove Modal and Deprecate
- **Governance:** 3 governance highlights — read reports before filling slots

## Work Profile
- **Execution intent:** plan
- **Action type:** decomposition
- **Scope shape:** cross_cutting
- **Governance domains:** docs
- **Recommended context pack:** decomposition_pack
- **Planning artifact action:** create
- **Decomposition mode:** moderate
- **Downstream advice:** Planning doc is advisory; guide owns current-tier decomposition. Inherit intent, constraints, and governance emphasis; avoid pre-specifying child execution detail unless decomposition mode is explicit.

## Where we left off
Completed Task - Begin Session 6.9.4

## Goal
Implement moveable-details content (contingency questions, completion time grid) in the existing 5th sub-step panel; remove MoveablePartsModal from AvailabilityStep; deprecate the modal. Slot selection remains valid only when moveable sub-step is either not applicable or confirmed. Preserve orchestrator validation and slot calculation; moveable flow moves from modal to in-step.

## Files
- `client/src/components/booking/steps/AvailabilityStep.vue` — 5th sub-step content (via AvailabilitySubStepContent or equivalent), remove MoveablePartsModal usage.
- `client/src/components/booking/MoveablePartsModal.vue` — mark deprecated (JSDoc @deprecated); body content extracted or reused for in-step UI.
- `client/src/composables/booking/useAvailabilityOrchestrator.ts` — no structural change; moveable gate and handlers already exposed; may need to stop opening modal and instead rely on in-step flow.
- `client/src/composables/booking/useMoveablePartsScheduling.ts` — provides moveable data; may need to expose in-step confirm flow instead of modal open/close.
- `client/src/utils/booking/confirmationStepData.ts` — reads `moveableScheduling` from stepData; unchanged if we keep same stepData shape.

## Approach
- Extract or inline MoveablePartsModal body (contingency VRadioGroup + date/time fields, completion time grid with AppointmentSlotGrid) into the 5th sub-step content slot. Reuse orchestrator props: moveableOptions, moveableAppointmentSlots, moveablePartShapeName, selectedMoveableDay, contingencyPeriod, etc.
- Replace modal open/close with in-step visibility: when hasMoveablePartsGated, show 5th sub-step; user confirms in-place via Confirm/Cancel buttons (same handlers: handleMoveableConfirm, handleMoveableCancel).
- Remove MoveablePartsModal import and usage from AvailabilityStep; add JSDoc @deprecated to MoveablePartsModal.
- Ensure useAvailabilityValidation / isFormValid gates slot completion when moveable is applicable and not yet confirmed (same as current modal gate).
- Verify 5th panel receives same expandable-card and a11y treatment as steps 1–4 when visible.

## Checkpoint
- 5th sub-step shows contingency questions and completion time grid when hasMoveablePartsGated; Confirm/Cancel work in-step.
- MoveablePartsModal removed from AvailabilityStep; modal file marked deprecated.
- Slot selection valid only when moveable not applicable or confirmed; lint passes; app starts.

## How we build the tierDown to achieve them
- **Task 6.9.4.1:** Implement moveable content in 5th sub-step panel — contingency questions, completion time grid; reuse orchestrator data.
- **Task 6.9.4.2:** Remove MoveablePartsModal from AvailabilityStep — remove import and usage.
- **Task 6.9.4.3:** Deprecate MoveablePartsModal — JSDoc @deprecated and inline comment.
- **Task 6.9.4.4:** Ensure slot selection validation — gate step valid when moveable applicable and not confirmed.
- **Task 6.9.4.5:** Verify 5th panel in wide/narrow layout — expandable card and a11y apply when visible.

## Amendment (Session 6.9.4)
**Scope change — sub-step collapse extended to all screen widths:** Original Phase 6.9 design had wide layout with all panels expanded; narrow layout with expandable cards. During this session, the decision was changed: sub-step expand/collapse behavior (current step expanded, completed steps collapsed with summary) should apply at all screen widths, not just narrow. Wide layout should use the same accordion pattern so users get consistent progressive disclosure regardless of viewport. Implementation deferred to a follow-up task; this note records the intent.
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/phases/phase-6.9-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/sessions/session-6.9.3-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

# Plan: task 6.9.4.1 — 6.9.4.1

## Contract
- **Tier:** task | **ID:** 6.9.4.1
- **Scope:** 6.9.4.1
- **Governance:** 1 governance highlights — read reports before filling slots

## Work Profile
- **Execution intent:** implement
- **Action type:** localized_change
- **Scope shape:** file_local
- **Governance domains:** function
- **Recommended context pack:** local_implementation_pack
- **Planning artifact action:** update
- **Decomposition mode:** moderate
- **Downstream advice:** Planning doc is advisory; guide owns current-tier decomposition. Inherit intent, constraints, and governance emphasis; avoid pre-specifying child execution detail unless decomposition mode is explicit.

## Where we left off
Session 6.9.4 started. AvailabilitySubStepContent has step 4 placeholder: "Confirm moveable details (content in Session 6.9.4)". MoveablePartsModal body has the target UI (contingency questions, completion time grid). Orchestrator exposes moveable data and handlers.

## Goal
Implement moveable-details content (contingency questions, completion time grid) in the existing 5th sub-step panel. Replace the placeholder in AvailabilitySubStepContent (stepIndex === 4) with the same UI as MoveablePartsModal body. User confirms in-place via Confirm/Cancel buttons; reuse orchestrator handlers. Modal removal and deprecation are separate tasks (6.9.4.2, 6.9.4.3).

## Files
- `client/src/components/booking/steps/AvailabilitySubStepContent.vue` — add step 4 content: contingency VRadioGroup + date/time fields, completion time grid (AppointmentSlotGrid), day stepper, Confirm/Cancel buttons.
- `client/src/components/booking/steps/AvailabilityStep.vue` — extend subStepContext with moveable props and handlers for step 4 (orchestrator o already has them; pass via ctx).
- `client/src/composables/booking/injectionKeys.ts` — extend AvailabilitySubStepContext with moveable-related fields if needed for typed inject.

## Approach
- In AvailabilitySubStepContent, add `v-else-if="stepIndex === 4"` block with moveable content. Copy structure from MoveablePartsModal body: (1) isLoadingOptions → spinner; (2) contingency section (VRadioGroup hasContingency, VTextField endDate/endTime when true); (3) VDivider; (4) completion times section when moveableOptions && hasClosingDate: day stepper (Prev/Next), AppointmentSlotGrid, loading/empty states; (5) Confirm and Cancel VBtn at bottom.
- Extend subStepContext in AvailabilityStep with moveable data (from o) and handlers: setSelectedMoveableDay, selectMoveableSlot, handleMoveableConfirm, handleMoveableCancel, contingencyPeriod (writable). Add to AvailabilitySubStepContext interface.
- Wire contingencyPeriod: use v-model or :model-value + @update so ctx can update. Orchestrator exposes contingencyPeriod as Ref; use same pattern as modal.
- Copy moveable-day-stepper and moveable-slot-grid-wrapper styles from MoveablePartsModal into AvailabilitySubStepContent (or shared) so layout matches.

## Checkpoint
- 5th sub-step shows contingency questions and completion time grid when visible; Confirm/Cancel call handleMoveableConfirm/handleMoveableCancel. Lint passes; app starts.

## How we build the tierDown
- **Task 6.9.4.1:** Extend subStepContext with moveable props/handlers; add step 4 content block in AvailabilitySubStepContent; copy modal body structure and styles.

---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.9.4-guide.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

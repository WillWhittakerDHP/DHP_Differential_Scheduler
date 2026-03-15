# Plan: task 6.10.2.2 — 6.10.2.2

## Contract
- **Tier:** task | **ID:** 6.10.2.2
- **Scope:** 6.10.2.2
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
No prior handoff for this task.

## Goal
Add the "Show apply coupon in wizard" toggle in **Business Controls → Calendar → Confirmation & Holds** and wire it to form state and save. Reuse existing form/save flow (same panel as hold duration and auto-confirm). Types and API already expose `showApplyCouponInWizard` (Task 6.10.2.1).

## Files
- `client/src/views/admin/tabs/components/AppointmentConfirmationPanel.vue` — Add prop `showApplyCouponInWizard` and emit `update:showApplyCouponInWizard`; add VSwitch with label/hint.
- `client/src/configs/businessControlsTabStrings.ts` — Add label and hint strings for the new switch (e.g. under calendar).
- `client/src/views/admin/tabs/BusinessControlsCalendarSection.vue` — Pass `showApplyCouponInWizard` into panel from state; handle `@update:showApplyCouponInWizard`.
- `client/src/composables/admin/useBusinessControlsFormState.ts` and/or `useCalendarHoldFormState.ts` — Expose `showApplyCouponInWizard` from formData; mutate on switch change.
- `client/src/composables/admin/useAdminAvailabilitySettings.ts` — Ensure load maps the field into formData; save already includes it via `buildAvailabilityPayload`.

## Approach
1. Add strings in businessControlsTabStrings (calendar section) for label and hint.
2. In AppointmentConfirmationPanel: add prop and emit; add VSwitch bound to the prop, emitting on change.
3. In BusinessControlsCalendarSection: bind prop from form state; handle emit by updating form state (same pattern as auto-confirm).
4. In form state composable(s): expose showApplyCouponInWizard from formData (source: useAdminAvailabilitySettings); ensure mutation updates the same object that gets passed to buildAvailabilityPayload.
5. Confirm useAdminAvailabilitySettings loads the field into formData (already in API response mapping); save path already sends it. Verify toggle appears, change persists, reload shows correct state.

## Checkpoint
Toggle appears in Confirmation & Holds; changing it and saving persists the value; reloading the admin tab shows the correct state; lint passes.
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.10.2-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/sessions/task-6.10.2.1-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

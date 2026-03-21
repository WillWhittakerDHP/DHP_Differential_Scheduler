# Plan: task 6.10.5.3 — 6.10.5.3

## Contract
- **Tier:** task | **ID:** 6.10.5.3
- **Scope:** 6.10.5.3
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
Move **differential sub-step labels** (Pick Day, Options, Pick Time, Confirm Moveable) from GridConfigPanel to WizardConfigPanel so all wizard-affecting labels live in the Wizard tab. Locate the **brand colors** control (currently in BookingWizard.vue) and, if appropriate, add an admin toggle for it in WizardConfigPanel; otherwise document where it remains. This task completes session 6.10.5 by consolidating wizard UI settings in one place.

## Files
- **WizardConfigPanel:** `client/src/views/admin/tabs/components/WizardConfigPanel.vue` — add the differential sub-step labels section (inject state; use state.differential and handlers from useGridConfigHandlers or equivalent). Optionally add brand colors toggle if we add a setting.
- **GridConfigPanel:** `client/src/views/admin/tabs/components/GridConfigPanel.vue` — remove the sub-step labels block (subStepLabelsSectionTitle and the four VTextFields: subStepLabelPickDay, subStepLabelOptions, subStepLabelPickTime, subStepLabelConfirmMoveable) and their handlers; keep slot increment and the rest of differential (major/minor attendees, labels, graph, etc.) in Grid.
- **Handlers/state:** `client/src/utils/admin/gridConfigHandlers.ts` — handlers (handleSubStepLabel*) are used by both panels; WizardConfigPanel will need access to state.differential and these handlers (inject state, use useGridConfigHandlers(state) in WizardConfigPanel for the new block).
- **Brand colors:** `client/src/components/booking/BookingWizard.vue` — currently has "Brand colors" toggle in wizard UI; if we add admin-controlled setting, wizard reads it from settings/composable; otherwise leave as-is and note in checkpoint.

## Approach
1. In **WizardConfigPanel.vue**: inject BUSINESS_CONTROLS_STATE_KEY; use useGridConfigHandlers(state) to get handleSubStepLabel*; add a section "Differential sub-step labels (wizard)" with the same four VTextFields (subStepLabelPickDay, subStepLabelOptions, subStepLabelPickTime, subStepLabelConfirmMoveable) and UI_STRINGS.differential.*; keep existing showApplyCouponInWizard switch and Save button. Stay thin (template + minimal script).
2. In **GridConfigPanel.vue**: remove the block from subStepLabelsSectionTitle through the four sub-step VTextFields (and the help text that follows only for that block if it’s specific); remove the corresponding handler usages for those four fields. Keep slot increment and the rest of the differential section (major/minor attendees, labels, graph default, moveable fallback, state labels).
3. **Brand colors:** If a global/admin setting for "show brand colors in wizard" exists or is added, add a toggle in WizardConfigPanel and wire it; if not, skip or add a short comment in WizardConfigPanel that brand colors are controlled in the wizard UI (BookingWizard.vue) and leave as-is.
4. Run lint and vue-tsc; verify Wizard tab shows sub-step labels and Grid no longer shows them; save still works.

## Checkpoint
- WizardConfigPanel shows the differential sub-step labels section (four fields); editing and save work.
- GridConfigPanel no longer shows the sub-step labels block; slot increment and other differential settings remain in Grid.
- Brand colors: either moved to WizardConfigPanel or documented where they live.
- Lint and `vue-tsc --noEmit` pass; app starts.

## How we build the tierDown
- **Task 6.10.5.1:** Create useWizardSettings composable
- **Task 6.10.5.2:** Add Wizard tab and WizardConfigPanel
- **Task 6.10.5.3:** Move differential sub-step labels and brand colors to Wizard tab

---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.10.5-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/sessions/task-6.10.5.2-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

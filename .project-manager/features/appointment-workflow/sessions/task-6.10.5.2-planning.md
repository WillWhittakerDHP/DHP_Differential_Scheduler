# Plan: task 6.10.5.2 — 6.10.5.2

## Contract
- **Tier:** task | **ID:** 6.10.5.2
- **Scope:** 6.10.5.2
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
Add a Wizard sub-tab to Business Controls → Calendar and a **WizardConfigPanel** component. Move the **showApplyCouponInWizard** toggle from the Holds tab (AppointmentConfirmationPanel) into the new Wizard tab so it is edited in one place. Use the existing **useWizardSettings** composable (from 6.10.5.1) for read/write; differential labels and brand colors stay in place for 6.10.5.3.

## Files
- **Admin layout:** `client/src/views/admin/tabs/BusinessControlsCalendarSection.vue` — add Wizard VTab and VWindowItem; wire WizardConfigPanel with `state.wizardSettings`.
- **Strings:** `client/src/configs/businessControlsTabStrings.ts` — add Wizard tab label (e.g. `wizard` key).
- **New panel:** `client/src/views/admin/tabs/components/WizardConfigPanel.vue` — thin component: show Apply Coupon in Wizard switch using `state.wizardSettings` (inject BUSINESS_CONTROLS_STATE_KEY); reuse existing UI strings from businessControlsTabStrings.
- **Move from:** `client/src/views/admin/tabs/components/AppointmentConfirmationPanel.vue` — remove showApplyCouponInWizard prop, emit, and switch; remove from parent bindings in BusinessControlsCalendarSection (Holds tab no longer passes wizardSettings for that field).
- **State:** No new state; `state.wizardSettings` already provided by BusinessControlsTab (useWizardSettings with calendar form binding). WizardConfigPanel only injects state and renders the toggle.

## Approach
1. Add "Wizard" tab label to `businessControlsTabStrings.ts` (e.g. under `tabs` or `calendar`).
2. In **BusinessControlsCalendarSection.vue**: add `<VTab value="wizard">` and matching `<VWindowItem value="wizard">`; inside it render `WizardConfigPanel` when `state?.wizardSettings` is available (same pattern as confirmation panel).
3. Create **WizardConfigPanel.vue**: inject `BUSINESS_CONTROLS_STATE_KEY`; use `state.wizardSettings.showApplyCouponInWizard` and `state.wizardSettings.setShowApplyCouponInWizard` for the switch; use existing calendar strings for label/hint; include Save button area if session guide expects it (or reuse parent saveButtonProps). Keep component thin (template + minimal script).
4. In **AppointmentConfirmationPanel.vue**: remove prop `showApplyCouponInWizard`, emit `update:showApplyCouponInWizard`, and the VSwitch for it; remove from useConfirmationAndHoldsPanel if referenced there.
5. In **BusinessControlsCalendarSection.vue** (Holds tab): remove `:show-apply-coupon-in-wizard` and `@update:show-apply-coupon-in-wizard` from AppointmentConfirmationPanel.
6. Run lint and vue-tsc; verify Wizard tab shows and toggle works, Holds tab no longer shows the toggle.

## Checkpoint
- Wizard tab is visible in Business Controls → Calendar; WizardConfigPanel renders with showApplyCouponInWizard switch.
- Holds tab (AppointmentConfirmationPanel) no longer shows showApplyCouponInWizard; save still works via existing form submit.
- Lint and `vue-tsc --noEmit` pass; app starts.

## How we build the tierDown
- **Task 6.10.5.1:** Create useWizardSettings composable
- **Task 6.10.5.2:** Add Wizard sub-tab and WizardConfigPanel
- **Task 6.10.5.3:** Move differential labels and brand colors to Wizard tab

---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.10.5-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/sessions/task-6.10.5.1-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

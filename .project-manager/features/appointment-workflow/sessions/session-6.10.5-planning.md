# Plan: session 6.10.5 — add wizard sub-tab and consolidate wizard settings from scattered locations throughout the admin controls tab and move the brand colors toggle to the wizard settings tab

## Contract
- **Tier:** session | **ID:** 6.10.5
- **Scope:** add wizard sub-tab and consolidate wizard settings from scattered locations throughout the admin controls tab and move the brand colors toggle to the wizard settings tab
- **Governance:** 4 governance highlights — read reports before filling slots

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
Session 6.10.4 complete (coupon fee calculation, percentage off, useAvailabilityStepFeePreview). Begin Session 6.10.5: Wizard sub-tab and consolidated wizard settings.

## Goal
Add a Wizard sub-tab to Business Controls → Calendar (alongside Integration, Holds, Places, Grid). Consolidate all wizard-specific settings into that tab and into a single **useWizardSettings** composable. Move **showApplyCouponInWizard** from Holds, **differential sub-step labels** from Grid, and the **brand colors toggle** into the Wizard tab so one place owns wizard UI settings.

## Files
- **Composable:** `client/src/composables/admin/useWizardSettings.ts` (new) — consolidates wizard settings; read path for wizard steps, write path for Admin; types in `client/src/configs/availabilitySettings/types.ts`.
- **Admin layout:** `client/src/views/admin/tabs/BusinessControlsCalendarSection.vue` — add Wizard VTab and VWindowItem; `client/src/configs/businessControlsTabStrings.ts` — Wizard tab label.
- **New panel:** `client/src/views/admin/tabs/components/WizardConfigPanel.vue` — hosts showApplyCouponInWizard, differential sub-step labels, brand colors; uses useWizardSettings.
- **Move from:** `client/src/views/admin/tabs/components/AppointmentConfirmationPanel.vue` (remove showApplyCouponInWizard to Wizard); `client/src/views/admin/tabs/components/GridConfigPanel.vue` (remove differential labels to Wizard); locate brand colors and move to Wizard.
- **State/API:** Existing `useCalendarHoldFormState` / availability settings API; form state and save wiring for Wizard tab.

## Approach
- **Task 6.10.5.1:** Create useWizardSettings composable; expose showApplyCouponInWizard (and later differential labels, brand colors) with action-based mutation; replace scattered handlers (e.g. handleShowApplyCouponInWizard) with composable usage in Admin and wizard.
- **Task 6.10.5.2:** Add Wizard sub-tab and WizardConfigPanel; move showApplyCouponInWizard from AppointmentConfirmationPanel to WizardConfigPanel; wire form state and save.
- **Task 6.10.5.3:** Move differential sub-step labels from GridConfigPanel and brand colors toggle to WizardConfigPanel; remove from original locations. Follow governance (thin components, composables, explicit return types).

## Checkpoint
- After 6.10.5.1: useWizardSettings exists; handlers replaced; wizard and Admin read/write through composable.
- After 6.10.5.2: Wizard tab visible; showApplyCouponInWizard toggle works from Wizard tab; Holds no longer shows it.
- After 6.10.5.3: Differential labels and brand colors in Wizard tab; Grid and other panels no longer contain them; lint and app start pass.

## How we build the tierDown to achieve them
- **Task 6.10.5.1:** Create useWizardSettings composable — consolidate wizard settings access; replace scattered handlers with this pattern.
- **Task 6.10.5.2:** Add Wizard sub-tab and WizardConfigPanel — add Wizard tab to BusinessControlsCalendarSection; create WizardConfigPanel component.
- **Task 6.10.5.3:** Move differential sub-step labels and brand colors to Wizard tab — move from GridConfigPanel and elsewhere into WizardConfigPanel.
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/phases/phase-6.10-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/sessions/session-6.10.4-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

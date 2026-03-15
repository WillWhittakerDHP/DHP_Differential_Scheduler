# Plan: task 6.10.5.1 — 6.10.5.1

## Contract
- **Tier:** task | **ID:** 6.10.5.1
- **Scope:** 6.10.5.1
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
Session 6.10.5 started; task 6.10.5.1 is first. No prior handoff for this task.

## Goal
Create a **useWizardSettings** composable that consolidates wizard settings access and replaces scattered handlers (e.g. `handleShowApplyCouponInWizard`). Expose a read path for wizard steps and a write path for the Admin panel; wire to existing form state and availability settings API. This task delivers only the composable and replaces the showApplyCouponInWizard handler usage with composable usage where it already exists (e.g. AppointmentConfirmationPanel).

## Files
- **New:** `client/src/composables/admin/useWizardSettings.ts` — single composable; explicit return type; action-based mutation (e.g. `setShowApplyCouponInWizard`); read from availability settings, write via callback or ref passed in for Admin form state.
- **Types:** `client/src/configs/availabilitySettings/types.ts` — `AvailabilitySettings` already has `showApplyCouponInWizard`; no change unless we add a dedicated wizard-settings type.
- **Call sites (this task):** `client/src/views/admin/tabs/components/AppointmentConfirmationPanel.vue` — replace inline `handleShowApplyCouponInWizard` with useWizardSettings (or keep panel as-is and only introduce composable for use in WizardConfigPanel in 6.10.5.2; session guide says "replace scattered handlers"). Prefer: introduce composable and use it in AppointmentConfirmationPanel so both Holds and future Wizard tab can share it.
- **State/API:** Reuse `useAvailabilitySettings()` (wizard read) and `useAdminAvailabilitySettings` / `useCalendarHoldFormState` (Admin load/save); composable can accept a ref for Admin writable state and expose actions.

## Approach
1. Add `client/src/composables/admin/useWizardSettings.ts`. Signature: either (options: { formStateRef?: Ref<…> }) for Admin with write, or two modes (read-only for wizard, read-write for Admin). Expose `showApplyCouponInWizard` as `ComputedRef<boolean>` for read and `setShowApplyCouponInWizard(value: boolean): void` for write when form state is provided. Follow composable governance: explicit return type, no `Ref|ComputedRef` unions at boundary.
2. Wire read path from existing availability settings (e.g. `useAvailabilitySettings().settings` or getAvailabilitySettings); write path updates the ref that Business Controls already owns (`state.formState.showApplyCouponInWizard`).
3. In AppointmentConfirmationPanel, replace local `handleShowApplyCouponInWizard` and the prop/emit for showApplyCouponInWizard with useWizardSettings used in parent (BusinessControlsCalendarSection) and pass down, or use composable inside panel with formStateRef from inject. Prefer parent owns form state and passes setter so panel stays thin.
4. Add explicit return type and flat contract; keep under 10 return properties.

## Checkpoint
- useWizardSettings composable exists with explicit return type; `showApplyCouponInWizard` (read) and `setShowApplyCouponInWizard` (write) in contract.
- AppointmentConfirmationPanel (or its parent) uses useWizardSettings; `handleShowApplyCouponInWizard` removed in favor of composable.
- Lint and `vue-tsc --noEmit` pass.

## How we build the tierDown to achieve them
- **Task 6.10.5.1:** Create useWizardSettings composable — consolidate wizard settings access; replace scattered handlers with this pattern.
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.10.5-guide.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

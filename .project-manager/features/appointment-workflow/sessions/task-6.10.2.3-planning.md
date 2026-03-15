# Plan: task 6.10.2.3 — 6.10.2.3

## Contract
- **Tier:** task | **ID:** 6.10.2.3
- **Scope:** 6.10.2.3
- **Governance:** Clean — no violations detected

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
Ensure the wizard (and later the availability-step fee popover) can access the current **showApplyCouponInWizard** value. Types and API already expose it (Tasks 6.10.2.1–6.10.2.2). No UI change in the wizard in this task — no fee bar or conditional coupon row yet (Session 6.10.3); only ensure the value is readable and reactive where the wizard uses `useAvailabilitySettings()`.

## Files
- `client/src/composables/booking/useAvailabilitySettings.ts` (or equivalent) — Ensure it returns `AvailabilitySettings` so `settings?.showApplyCouponInWizard` is typed and available.
- One wizard component that will use the setting in 6.10.3 (e.g. ConfirmationStep or a shared wizard composable) — Optionally add a read (e.g. computed or inject) so the value is exercised; or verify types only.
- Types: `AvailabilitySettings` already includes `showApplyCouponInWizard` (6.10.2.1); no change needed unless the wizard uses a different type.

## Approach
1. Confirm `useAvailabilitySettings()` (or the composable the wizard uses for availability settings) exposes `settings` of type `AvailabilitySettings` (from configs/availabilitySettings), so `settings?.showApplyCouponInWizard ?? false` is type-safe.
2. If the wizard uses a different path (e.g. a wrapper), ensure that path exposes the field or re-exports from getAvailabilitySettings.
3. Optionally: in one wizard component (e.g. ConfirmationStep or useBookingWizardSetup), add a computed or read of `useAvailabilitySettings().settings?.showApplyCouponInWizard ?? false` so the value is exercised and ready for 6.10.3. No UI change in this task.
4. Verify: from a wizard context the value is readable and reactive; lint passes.

## Checkpoint
From a wizard or any component that uses `useAvailabilitySettings()`, the value is readable and reactive (e.g. for use in Session 6.10.3); lint passes.
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.10.2-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/sessions/task-6.10.2.2-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

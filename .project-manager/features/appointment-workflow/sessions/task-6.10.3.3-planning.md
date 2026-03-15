# Plan: task 6.10.3.3 — 6.10.3.3

## Contract
- **Tier:** task | **ID:** 6.10.3.3
- **Scope:** 6.10.3.3
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
Tasks 6.10.3.1 and 6.10.3.2 complete (fee bar + popover on Availability step). This task: Confirmation step conditional coupon row.

## Goal
Show the Coupon Discount row and Apply Coupon button on the Confirmation step only when the admin toggle `showApplyCouponInWizard` is on.

## Files
- `client/src/components/booking/steps/ConfirmationStep.vue` — already uses `useAvailabilitySettings().settings?.showApplyCouponInWizard` and `showCouponRow` (implemented in session 6.10.2). Verify only; no code change unless gap found.

## Approach
ConfirmationStep.vue already has: `showApplyCouponInWizard` computed from `useAvailabilitySettings().settings?.showApplyCouponInWizard ?? false`; `showCouponRow` = showApplyCouponInWizard && (coupons available or discount applied); template uses `v-if="showCouponRow"` on the coupon row. **Verify** behavior: with toggle off, no coupon row; with toggle on, row appears. If verification passes, no code change; task complete.

## Checkpoint
- With admin toggle off: Confirmation step shows no coupon row.
- With admin toggle on: Confirmation step shows Coupon Discount row and Apply Coupon as before.
- Lint and app start pass.

## How we build the tierDown to achieve them
- **Task 6.10.3.3:** Confirmation step — conditional coupon row (verify existing implementation)
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.10.3-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/sessions/task-6.10.3.2-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

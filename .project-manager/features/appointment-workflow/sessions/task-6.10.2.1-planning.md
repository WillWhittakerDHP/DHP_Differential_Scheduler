# Plan: task 6.10.2.1 — 6.10.2.1

## Contract
- **Tier:** task | **ID:** 6.10.2.1
- **Scope:** 6.10.2.1
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
Extend availability/business settings types and API so **showApplyCouponInWizard** can be read and written. Type-safe round-trip; default `false` when missing. No UI or wizard changes in this task — types and API only.

## Files
- `client/src/configs/availabilitySettings/types.ts` — Add `showApplyCouponInWizard?: boolean` to `AvailabilitySettings` and to `RawAvailabilitySettings` (or the raw response type the API uses).
- `client/src/configs/availabilitySettings/api.ts` — In the response mapping (where converted settings are built), set `showApplyCouponInWizard: rawSettings.showApplyCouponInWizard ?? false`. In `buildAvailabilityPayload`, include `showApplyCouponInWizard` in the payload (match server contract: inside `setting_value` or as top-level key).
- Server (if needed): ensure business_settings/availability endpoint accepts and returns the new key.

## Approach
1. Add `showApplyCouponInWizard?: boolean` to client types (`AvailabilitySettings`, `RawAvailabilitySettings` or equivalent).
2. In `api.ts` response mapping: map the field from raw response with default `false`.
3. In `buildAvailabilityPayload`: add the field to the payload (same shape the server expects).
4. If the server does not yet expose the key: add to backend availability settings model/route so get and save include it.
5. Verify: fetch returns the value (or default false); save persists it; TypeScript compiles.

## Checkpoint
Fetch and save round-trip works; type-safe; default `false` when missing; lint passes.
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.10.2-guide.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

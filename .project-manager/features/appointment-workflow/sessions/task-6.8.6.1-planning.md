# Plan: task 6.8.6.1 — Admin setting for time-out (X days/weeks)

## Contract
- **Tier:** task | **ID:** 6.8.6.1
- **Scope:** Add admin-configurable time-out for admin entry dropdown (this task only)
- **Governance:** Clean — no violations detected

## Where we left off
No prior handoff for this task. Session 6.8.6 just started; this is the first task.

## Goal
Add an admin-configurable time-out (X days or X weeks) so the admin entry dropdown only shows appointments where scheduling began within the last X, or quote has been in quote status for the last X. Setting lives in Business Controls → Calendar or Confirmation & Holds. Value is persisted and read via the existing settings/business-settings API so the list-appointments API (task 6.8.6.2) can filter by it.

## Files
- **Client:** Business Controls / availability or confirmation settings (where time-out is configured); settings API client or composable that reads/writes the value; types if new setting key.
- **Server (if new key):** Business settings schema/registry and any migration or seed for the new key (only if the setting is stored server-side and not yet present).
- **Reference:** Phase 6.8 guide (Admin entry — time-out); existing Business Controls tabs (e.g. `client/src/configs/businessControlsTabStrings.ts`); existing availability/settings APIs.

## Approach
1. Decide where the time-out setting lives: Calendar tab or Confirmation & Holds in Business Controls; reuse existing settings pattern (e.g. business_settings or availability settings). 2. Add a new setting key and UI control (e.g. number + unit: days/weeks); validate range. 3. Persist and read via existing settings API; ensure the value is available for the list-appointments endpoint (task 6.8.6.2) to use as filter.

## Checkpoint
- Time-out (X days/weeks) is configurable in Business Controls at the agreed location.
- Value is persisted and readable via settings API; ready for use in appointment-list filtering in task 6.8.6.2.

## How we build the tierDown
- **Task 6.8.6.1:** Admin setting for time-out (X days/weeks) in Business Controls
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.8.6-guide.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

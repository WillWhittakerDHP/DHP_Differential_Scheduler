# Plan: task 6.11.1.1 — 6.11.1.1

## Contract
- **Tier:** task | **ID:** 6.11.1.1
- **Scope:** 6.11.1.1
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
Add **drive time fee** admin settings to the existing **availability settings** pipeline: **complimentary drive time (minutes)**, **driving rate per hour ($)**, and **drive time rounding (minutes)**. Types and defaults live on `AvailabilitySettings` (distinct from buffer `driveToCandidate` / `driveFromCandidate`). Persist via the same admin save/load path as other Business Controls constraints; expose values to the booking client when settings are fetched. **Out of scope for this task:** fee calculation helper, wizard drive context, `buildConfirmationPriceData`, virtual block instance (tasks 6.11.1.2–6.11.1.5).

## Files
- `shared/types/availabilityTypes.ts` — optional nested type for drive-time **billing** fields (if shared); keep buffer `DriveTimeConfig` separate from fee pricing fields.
- `client/src/configs/availabilitySettings/types.ts` — extend `AvailabilitySettings` / `RawAvailabilitySettings` with the three fields (e.g. under `driveTimeFee?: { complimentaryDriveMinutes; drivingRatePerHour; driveTimeRoundingMinutes }` or equivalent clear naming).
- `client/src/composables/admin/useAdminAvailabilitySettings.ts` (and any merge/parse helpers for API ↔ form) — load/save payload includes new fields; defaults e.g. `0`, `0`, `15` for rounding.
- Server: availability settings validation/persistence (e.g. router or model that stores `availability_settings` JSON) — accept and return new keys without breaking existing clients.
- Admin UI: **Calendar → Confirmation & Holds** — extend `AppointmentConfirmationPanel.vue` + `BusinessControlsCalendarSection.vue` props/wiring **or** a dedicated subsection under Business Controls that already uses `availability.formData` (choose one path; prefer reusing `useAdminAvailabilitySettings` / `formState` patterns from `OverlapConstraintsPanel`-style bindings).
- `client/src/configs/businessControlsTabStrings.ts` — labels/hints for the three inputs.
- `client/src/composables/booking/useAvailabilitySettings.ts` (or wizard fetch path) — ensure booking-side read includes new fields when API returns them (for later tasks; minimal pass-through if already generic).

## Approach
1. **Types first:** Add a single cohesive optional block on `AvailabilitySettings` so fee billing is not mixed with drive **buffer** config under `buffers`.
2. **Server + client API:** Mirror existing availability JSON shape; no ad hoc endpoints; validate numbers (non-negative where appropriate; rounding > 0 if required).
3. **Admin form:** Writable computeds or nested helpers consistent with `useCapacitySettings` / `useBufferSettings` patterns; thin panel: emit updates, parent passes `saveButtonProps` from calendar tab.
4. **Verify:** Save in admin, reload page, confirm values persist; `vue-tsc` + lint clean. Do **not** implement `computeDriveTimeFee` or confirmation line item in this task.

## Checkpoint
- [ ] Admin can set the three drive-time fee fields and save; values reload correctly from API.
- [ ] Types are shared between client and server where applicable; no duplicate conflicting names with buffer drive settings.
- [ ] Lint and `vue-tsc --noEmit` pass; dev server still starts.

## How we build the tierDown to achieve them
- **Task 6.11.1.1:** Leaf task — no sub-task IDs; complete this slice before **Task 6.11.1.2** (calculation helper).

---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.11.1-guide.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

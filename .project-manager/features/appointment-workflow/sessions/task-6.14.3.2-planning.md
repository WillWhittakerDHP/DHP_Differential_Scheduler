# Plan: task 6.14.3.2 — Optional “using org default” badges (legacy Calendar / Availability panels)

## Contract
- **Tier:** task | **ID:** 6.14.3.2
- **Scope:** Admin Business Controls — **Calendar** (grid) and **Constraints** (duration rounding) panels; optionally drive-time fee where it shares merge semantics. No duplication of the Organization defaults tab layout.
- **Governance:** Clean — no violations detected

## Work Profile
- **Execution intent:** implement
- **Action type:** localized_change
- **Scope shape:** file_local
- **Governance domains:** component, composable
- **Recommended context pack:** local_implementation_pack
- **Planning artifact action:** update
- **Decomposition mode:** moderate

## Where we left off
Task **6.14.3.1** completed: exhaustive audit table in `phases/phase-6.14-handoff.md`; confirmation step uses merged `driveTimeFee` via `useConfirmationStepData`. This task adds **admin-only** affordances so editors see when calendar/availability **stored values match** organization defaults vs **explicit overrides**.

## Goal
1. On **legacy** admin surfaces (Business Controls **Calendar → Grid** and **Constraints → Duration rounding**), show a **small, consistent** indicator (e.g. `VChip` size small, tonal) when the persisted field **matches** the loaded **Organization defaults** baseline (“Org default”) and when it **differs** (“Override”), for **minute increment**, **duration rounding** (enabled, increment, method), and **only if low-clutter**: drive-time fee block on Calendar (confirmation/holds area) if the same comparison is straightforward.
2. **Do not** label every control — only the merge-relevant numeric policy fields called out in 6.14.
3. **No new tests** (Phase 3.0 policy). **Lint** client after edits.

## Files
- `client/src/composables/admin/useBusinessControlsTab.ts` — widen **when** `useAdminOrganizationDefaults` loads (today only on **Organization** sub-tab). Load org defaults when Business Controls is active **and** the user is on **Calendar**, **Constraints**, or **Organization** so Grid/Duration panels can read `organizationDefaults.formData` without visiting the Organization tab first.
- `client/src/types/admin/businessControlsState.ts` — only if `BusinessControlsState` / `organizationDefaults` typing needs a documented optional baseline ref (prefer minimal change).
- `client/src/views/admin/tabs/components/GridConfigPanel.vue` — chip or caption beside slot increment when `formState.minuteIncrement` equals `org.timeAndRounding.minuteIncrement` (and inverse for override).
- `client/src/views/admin/tabs/components/DurationRoundingPanel.vue` — same pattern for `durationRoundingEnabled`, increment, method vs `org.timeAndRounding.durationRounding`.
- `client/src/configs/businessControlsTabStrings.ts` — short strings for chip labels (“Org default”, “Override”) if not inlined.
- Optional: `DriveTimeFeeAdminFields.vue` / `AppointmentConfirmationPanel.vue` — only if comparison helpers stay small; otherwise **defer** with a one-line note in `phase-6.14-handoff.md`.

## Approach
1. **Data:** Change `organizationTabEnabled` to a computed that is true when `isTabActive && currentMainTab ∈ { constraints, calendar, organization }` so org JSON loads for badge comparisons on Grid and Rounding panels.
2. **Comparison:** Add a tiny pure helper (e.g. `admin/orgDefaultBadges.ts`) or inline `computed` in each panel: deep-equal or field-wise compare availability/calendar form fields to `organizationDefaults.formData` for the listed slices only.
3. **UI:** One chip **per section** (slot increment block; duration rounding block) or **per field group** — prefer **one chip per section** to avoid clutter; use `VChip` `size="small"` `variant="tonal"` consistent with `FeeCalibrationPanel.vue`.
4. **Edge cases:** If org defaults not loaded yet (`null` / loading), show nothing or a single muted “Loading…” — no false “Org default”.
5. **Docs:** Append a short bullet to `phases/phase-6.14-handoff.md` under session 6.14.3 describing what was shipped or deferred.

## Checkpoint
- Chips appear on Grid + Duration rounding with correct match/override when org defaults are loaded.
- Opening Calendar or Constraints triggers org load without requiring the Organization tab first.
- Handoff updated; client lint passes.

## Design Before Execute (pseudocode)

```
onBusinessTabActive:
  when mainTab in [constraints, calendar, organization]:
    ensure useAdminOrganizationDefaults.load runs (watch enabled)

GridConfigPanel:
  org = inject state.organizationDefaults.formData
  match = org && formState.minuteIncrement === org.timeAndRounding.minuteIncrement
  show VChip: match ? "Org default" : "Override"

DurationRoundingPanel:
  compare enabled, increment, method to org.timeAndRounding.durationRounding
  show one chip for the whole rounding section based on all-three match
```

---

## Reference (read before coding)
- TierUp guide: `.project-manager/features/appointment-workflow/sessions/session-6.14.3-guide.md`
- Prior task handoff: `.project-manager/features/appointment-workflow/sessions/task-6.14.3.1-handoff.md`
- Phase handoff: `.project-manager/features/appointment-workflow/phases/phase-6.14-handoff.md`
- Governance: `client/.audit-reports/` — component-health, composable-health
- Playbooks: `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`

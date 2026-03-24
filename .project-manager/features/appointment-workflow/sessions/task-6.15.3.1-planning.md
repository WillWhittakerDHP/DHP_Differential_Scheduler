# Plan: task 6.15.3.1 — Wire API brand anchors into booking theme (useThemeMode / DHP path)

## Contract
- **Tier:** task | **ID:** 6.15.3.1
- **Scope:** Booking app only. When `useBrandColors` is on (from `wizard_settings`), derive DHP-mode palettes from **`brandPrimaryHex`** / **`brandSecondaryHex`** returned by GET `/wizard-settings` instead of hardcoded `dhpPalette` in `theme.ts`. **Out of scope for this task:** `BookingWizard.vue` header logo, full manual matrix (6.15.3.2).
- **Governance:** Prefer explicit composable options; avoid widening admin-only `useWizardSettings` surface unless the shared contract already supports it; keep `resolvePalette` testable.

## Work Profile
- **Execution intent:** implement
- **Action type:** localized_change
- **Scope shape:** file_local
- **Governance domains:** composable, function

## Where we left off
Session **6.15.3** started on branch `session-6.15.3`. Task **6.15.3.1** is the first build slice: theme pipeline consumption of stored anchors.

## Goal
With **Brand colors** enabled, the booking wizard’s DHP palette (`standard` / `quote` / `reschedule` via `resolvePalette` / `useThemeMode`) uses **API** anchor hex values when present; when hex fields are null/invalid, fall back to **`dhpPalette`** defaults in `theme.ts` (same visual baseline as today). **Done** when toggling admin-configured anchors changes visible wizard colors on the booking client without errors, and `cd client && npm run lint` passes.

## Files
- `client/src/composables/useThemeMode.ts` — extend `resolvePalette` / options to accept optional anchor hex (or pre-built `WizardModePalette` per mode); watch `wizardMode` + `useDhpColors` + anchors.
- `client/src/plugins/5.vuetify/theme.ts` — keep exporting `dhpPalette` / `buildWizardModePaletteFromAnchors` import; only change if a small shared helper is needed (avoid duplicating OKLCH logic).
- `client/src/utils/theme.ts` — `buildWizardModePaletteFromAnchors` (already used elsewhere); reuse for all three modes.
- `client/src/composables/booking/useBookingWizardSetup.ts` — plumb `brandPrimaryHex` / `brandSecondaryHex` from loaded wizard data into `useThemeMode` (via `useBookingWizardSettingsSingleton` data already used by `useWizardSettings` internally, or a narrow read-only helper).
- `client/src/types/admin/wizardSettings.ts` — optional: add readonly `brandAnchors` on `UseWizardSettingsReturn` if that is cleaner than passing refs directly from the singleton.

## Approach
1. **Read path:** Confirm `useBookingWizardSettingsSingleton` / `getWizardSettings()` payload includes `brandPrimaryHex`, `brandSecondaryHex` after `loadState.isReady`.
2. **Plumb:** Pass two optional `ComputedRef<string | null>` (or equivalent) into `useThemeMode` for primary/secondary anchors, sourced from the same `wizardData` as flags.
3. **Resolve:** When `useDhp` is true, for each `wizardMode` key (`standard` | `quote` | `reschedule`), call `buildWizardModePaletteFromAnchors({ primary, secondary, mode })` with normalized hex; on invalid/missing, use `dhpPalette[mode]` as today.
4. **Watch:** Ensure existing `watch` on palette still applies CSS vars; no flash of wrong colors before settings settle (use `wizardSettingsReady` if needed).
5. **Lint:** `cd client && npm run lint`.

## Checkpoint
- With admin-set anchors + Brand colors on, **wizard** colors change vs default DHP anchors.
- With Brand colors off or anchors cleared, behavior matches pre-task baseline.
- Client lint clean; no new tests (Phase 3.0 policy).

## Design Before Execute
- `useThemeMode({ wizard, useDhpColors, brandPrimaryHex?, brandSecondaryHex? })` where the last two are `ComputedRef`s from wizard settings.
- `resolvePalette(mode, useDhp, …)` gains access to normalized anchors; if `!useDhp`, unchanged behavior (quote/reschedule/defaults).
- Normalization: reuse `normalizeBrandHex` from `@/utils/wizardBrand/normalizeBrandHex` or shared util to avoid drift.

---
## Reference
- Session plan: `.project-manager/features/appointment-workflow/sessions/session-6.15.3-planning.md`
- Session guide: `.project-manager/features/appointment-workflow/sessions/session-6.15.3-guide.md`
- Phase 6.13: `.project-manager/features/appointment-workflow/phases/phase-6.13-guide.md`
- Playbooks: `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`

# Plan: task 6.13.1.2 — Wire DHP palette to perceptual generator

## Contract

- **Tier:** task | **ID:** 6.13.1.2
- **Scope:** Replace static `dhpPalette` literals in `theme.ts` with outputs from `buildWizardModePaletteFromAnchors` (task 6.13.1.1); confirm `useThemeMode` `resolvePalette` + `applyPaletteToCss` behave unchanged. No `BookingWizard.vue` / SCSS edits here (Session 6.13.2).
- **Governance:** Explicit return types; avoid circular runtime imports (type-only import from `theme` into utils is already OK).

## Work Profile

- **Execution intent:** implement
- **Action type:** localized_change
- **Scope shape:** file_local
- **Governance domains:** function
- **Recommended context pack:** local_implementation_pack
- **Planning artifact action:** update
- **Decomposition mode:** moderate

## Where we left off

Task 6.13.1.1 added `client/src/utils/theme/` with `buildWizardModePaletteFromAnchors`. Task 6.13.1.2 connects it to exported `dhpPalette` so DHP standard / quote / reschedule stay distinct at runtime.

## Goal

`dhpPalette.standard`, `.quote`, and `.reschedule` are produced by `buildWizardModePaletteFromAnchors` using the same DHP anchor pair as today (`#EED202`, `#FF3333`) and the matching mode flag. `useThemeMode` continues to select `dhpPalette[key]` when brand colors are on; CSS variable application is unchanged. Verify app + wizard with brand on/off.

## Files

- `client/src/plugins/5.vuetify/theme.ts` — build `dhpPalette` from `buildWizardModePaletteFromAnchors`; keep exported `WizardModePalette` type and other exports unchanged aside from `dhpPalette` construction
- `client/src/composables/useThemeMode.ts` — only if a small adjustment is required (e.g. key mapping comment or typing); expect **no** logic change

## Approach

1. Define named constants `DHP_ANCHOR_PRIMARY` and `DHP_ANCHOR_SECONDARY` matching current `standard` hex anchors.
2. Set `dhpPalette.standard`, `.quote`, `.reschedule` to `buildWizardModePaletteFromAnchors({ primary, secondary, mode })` for each mode.
3. Confirm `resolvePalette` keys (`new` → `standard`, `quote`/`reschedule` → same) still align with `dhpPalette` keys.
4. Run `cd client && npm run lint` and `vue-tsc --noEmit` on touched paths.

## Checkpoint

- Three `dhpPalette` entries differ from each other (not identical hex grids) for the same anchors; wizard with DHP on shows mode-appropriate colors; non-DHP quote/reschedule paths unchanged.
- Lint and typecheck pass.

## Design Before Execute

- Avoid runtime circular dependency: `theme.ts` imports value from `@/utils/theme`; utils only use `import type` from `theme` (already true).

---

## Reference (read before filling slots — governance and inventory compliance is required)

- Prior task handoff: `.project-manager/features/appointment-workflow/sessions/task-6.13.1.1-handoff.md`
- Session guide: `.project-manager/features/appointment-workflow/sessions/session-6.13.1-guide.md`
- Governance reports: `client/.audit-reports/`
- Playbooks: `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`

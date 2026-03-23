# Plan: task 6.13.2.1 — 6.13.2.1

## Contract
- **Tier:** task | **ID:** 6.13.2.1
- **Scope:** 6.13.2.1
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
Align `BookingWizard.vue` class bindings and `BookingWizard.scss` overrides with the OKLCH-derived token pipeline from session 6.13.1 so that quote and reschedule modes are visually distinct even when brand colors (DHP) are active. Remove hardcoded RGB triplets in the `.dhp-colors-active` SCSS block that currently override `:root` CSS variables set by `useThemeMode`, and allow `quote-mode-active` / `reschedule-mode-active` classes to coexist with `dhp-colors-active`. Verify all six wizard-mode × brand combinations and pass client lint.

## Files
- `client/src/components/booking/BookingWizard.vue` — class bindings that gate quote/reschedule on `!useDhpColors`; needs update to allow coexistence with brand mode
- `client/src/components/booking/BookingWizard.scss` — `.dhp-colors-active` block with hardcoded RGB triplets that override the pipeline; `.quote-mode-active` / `.reschedule-mode-active` blocks; inline `--quote-mode-*` / `--reschedule-mode-*` / `--inactive-*` default variables
- `client/src/composables/useThemeMode.ts` — touch-ups only if class/CSS-var contract needs adjustment (e.g. `on-*` format validation)
- `client/src/plugins/5.vuetify/theme.ts` — reference only; `dhpPalette` already wired to `buildWizardModePaletteFromAnchors` from 6.13.1

## Approach

**Architecture insight:** `setCSSVariable` sets vars on `document.documentElement` (`:root`). Vuetify's theme provider redefines `--v-theme-*` on a closer ancestor (`.v-theme--light`), which overrides inherited `:root` values. The SCSS component-level overrides on `.booking-wizard` with `:deep(*)` are essential for correct specificity. Composable → `:root` alone is insufficient.

**Solution: unified wizard pipeline via `--wizard-*` intermediate custom properties.**

1. **`useThemeMode.ts`**: Change `applyPaletteToCss` to set `--wizard-*` intermediate vars (e.g. `--wizard-primary`) at `:root` instead of directly overwriting `--v-theme-*`. These custom names are never set by Vuetify so they cascade cleanly. Fix `on-*` values to pass through `hexToRgb` (currently set as hex, needs RGB triplet format). Update `THEME_VAR_KEYS` and `clearThemeOverrides` to match the new names.

2. **`BookingWizard.vue`**: Replace the three conditional classes (`quote-mode-active`, `reschedule-mode-active`, `dhp-colors-active`) with a single `wizard-palette-active` class. Condition: `useDhpColors || isQuoteMode || wizardMode === 'reschedule'` (same as `resolvedPalette !== null`).

3. **`BookingWizard.scss`**: Remove all three mode-specific `--v-theme-*` override blocks (`.quote-mode-active`, `.reschedule-mode-active`, `.dhp-colors-active`). Remove dead `--inactive-*` / `--quote-mode-*` / `--reschedule-mode-*` custom property definitions (never consumed via `var()`). Add one `.wizard-palette-active` block that maps `--v-theme-*: var(--wizard-*)` with `:deep(*)` for descendant propagation. Consolidate stepper header mode backgrounds into a single `.booking-wizard.wizard-palette-active &` rule.

**Data flow:** composable resolves palette for mode + brand → sets `--wizard-*` at `:root` → SCSS `.wizard-palette-active` maps to `--v-theme-*` at component level → all Vuetify descendants use the wizard palette.

Out of scope: changes to the OKLCH generator; admin-editable anchor colors; non-wizard Vuetify theme changes.

## Checkpoint
- Quote and reschedule have distinct visual treatment when brand colors are enabled (not flat DHP-only look).
- No hardcoded DHP RGB triplets remain in `BookingWizard.scss` `.dhp-colors-active` block.
- All six wizard-mode × brand combinations verified (no regression).
- Admin `useBrandColors` toggle behavior unchanged.
- `npm run lint` (client) passes; app starts cleanly.
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.13.2-guide.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

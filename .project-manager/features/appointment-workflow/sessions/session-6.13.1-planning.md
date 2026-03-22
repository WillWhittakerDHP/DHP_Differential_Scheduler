# Plan: session 6.13.1 — Token pipeline and theme wiring

## Contract

- **Tier:** session | **ID:** 6.13.1
- **Scope:** Perceptual token generator; wire `dhpPalette`, `resolvePalette`, and `applyPaletteToCss` for distinct DHP modes (`standard` / `quote` / `reschedule`); non-brand palettes unchanged
- **Governance:** Read Reference reports before coding; keep composables and theme utilities within governance thresholds

## Work Profile

- **Execution intent:** plan
- **Action type:** decomposition
- **Scope shape:** cross_cutting
- **Governance domains:** client composables, client utils, Vuetify theme
- **Recommended context pack:** decomposition_pack
- **Planning artifact action:** update
- **Decomposition mode:** moderate

## Where we left off

Phase 6.13 is open on branch `phase-6.13`. Session 6.13.1 implements the JS/theme half of the phase: derived palettes and wiring. Session 6.13.2 will align `BookingWizard.vue` / SCSS with the new CSS variables.

## Goal

Ship a single pipeline that generates `WizardModePalette` values (and matching CSS custom properties) from DHP anchor colors so `standard`, `quote`, and `reschedule` are **visually distinct** when admin brand colors are on; keep existing non-brand `quoteModeColors` / `rescheduleModeColors` behavior; do not change `BookingWizard` component styling in this session (deferred to 6.13.2).

## Files

- New: `client/src/utils/theme/` (or agreed path) — OKLCH/HSL helpers, token derivation, typed exports
- `client/src/plugins/5.vuetify/theme.ts` — `dhpPalette` built from generator outputs per mode; keep `WizardModePalette` shape
- `client/src/composables/useThemeMode.ts` — `resolvePalette`, `applyPaletteToCss`, DHP branch uses distinct mode-derived palettes
- `client/package.json` — add `culori` (or chosen lib) only if we adopt it

## Approach

1. Add a small color-math module: inputs (primary hex, secondary hex, mode: `standard` | `quote` | `reschedule`) → full `WizardModePalette` fields (primary, secondary, warning, darken-1, on-*, inactive-style tints as needed). Prefer OKLCH adjustments (chroma/lightness) with documented constants.
2. Replace identical `dhpPalette.quote` / `reschedule` copies with generator output; ensure `resolvePalette` applies the correct mode branch when DHP is active.
3. Extend `THEME_VAR_KEYS` / `applyPaletteToCss` only as needed so emitted variables match what the wizard already consumes.
4. Smoke: app start + wizard loads with brand on/off; quote/reschedule routes still resolve (SCSS polish in 6.13.2).
5. Run `cd client && npm run lint` on touched files.

## Checkpoint

End of 6.13.1: three distinct generated palette objects for DHP modes; no duplicate hex triplets across `standard` / `quote` / `reschedule` in `theme.ts` for the same semantic role; `useThemeMode` applies them without errors; client lint passes; `BookingWizard.scss` may still look unchanged until 6.13.2.

## How we build the tierDown to achieve them

- **Task 6.13.1.1:** Color generator module — types, OKLCH/HSL pipeline, unit-friendly pure functions
- **Task 6.13.1.2:** Integrate generator into `theme.ts` and `useThemeMode.ts`; distinct DHP modes; CSS var wiring

---

## Reference (read before filling slots — governance and inventory compliance is required)

- Phase guide: `.project-manager/features/appointment-workflow/phases/phase-6.13-guide.md`
- Deep-dive: `.project-manager/features/appointment-workflow/phases/phase-6.13-planning.md`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

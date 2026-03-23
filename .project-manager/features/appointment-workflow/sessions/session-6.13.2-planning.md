# Plan: session 6.13.2 — ** `BookingWizard.vue` / `BookingWizard.scss` integration; brand + quote/reschedule verification; client lint

## Contract
- **Tier:** session | **ID:** 6.13.2
- **Scope:** ** `BookingWizard.vue` / `BookingWizard.scss` integration; brand + quote/reschedule verification; client lint
- **Governance:** 4 governance highlights — read reports before filling slots

## Work Profile
- **Execution intent:** plan
- **Action type:** decomposition
- **Scope shape:** cross_cutting
- **Governance domains:** docs
- **Recommended context pack:** decomposition_pack
- **Planning artifact action:** create
- **Decomposition mode:** moderate
- **Downstream advice:** Planning doc is advisory; guide owns current-tier decomposition. Inherit intent, constraints, and governance emphasis; avoid pre-specifying child execution detail unless decomposition mode is explicit.

## Where we left off
Completed Task - Begin Session 6.13.1

## Goal
Align `BookingWizard.vue` class bindings and `BookingWizard.scss` overrides with the OKLCH-derived token pipeline from session 6.13.1 so that quote and reschedule modes are visually distinct even when brand colors (DHP) are active. Remove hardcoded RGB triplets in the `.dhp-colors-active` SCSS block that currently override `:root` CSS variables set by `useThemeMode`, and allow `quote-mode-active` / `reschedule-mode-active` classes to coexist with `dhp-colors-active`. Verify all six wizard-mode × brand combinations and pass client lint.

## Files
- `client/src/components/booking/BookingWizard.vue` — class bindings that gate quote/reschedule on `!useDhpColors`; needs update to allow coexistence with brand mode
- `client/src/components/booking/BookingWizard.scss` — `.dhp-colors-active` block with hardcoded RGB triplets that override the pipeline; `.quote-mode-active` / `.reschedule-mode-active` blocks; inline `--quote-mode-*` / `--reschedule-mode-*` / `--inactive-*` default variables
- `client/src/composables/useThemeMode.ts` — touch-ups only if class/CSS-var contract needs adjustment (e.g. `on-*` format validation)
- `client/src/plugins/5.vuetify/theme.ts` — reference only; `dhpPalette` already wired to `buildWizardModePaletteFromAnchors` from 6.13.1

## Approach
1. **Update class bindings** in `BookingWizard.vue`: remove the `&& !useDhpColors` guard from `quote-mode-active` and `reschedule-mode-active` so these classes apply alongside `dhp-colors-active` when brand is on and mode is quote or reschedule.
2. **Refactor `.dhp-colors-active` SCSS block**: remove the hardcoded `--v-theme-*` RGB triplets that override `:root` vars from `useThemeMode`. When brand is on, `useThemeMode.applyPaletteToCss` already sets `--v-theme-primary/secondary/warning/on-*` at `:root` with the derived palette; the SCSS block should defer to those instead of re-declaring fixed DHP yellow/red.
3. **Consolidate SCSS default variables**: where `--quote-mode-*`, `--reschedule-mode-*`, and `--inactive-*` duplicate hex from `theme.ts`, prefer `var(--v-theme-*)` references so the single pipeline is the source of truth. Keep fallback values only for the non-brand path if needed.
4. **Verify all six combinations** (new / quote / reschedule × brand on / brand off) visually in the wizard. Check that button colors, stepper headers, and inactive states are correct.
5. **Run `cd client && npm run lint`** and fix any errors in touched files.

Out of scope: changes to the OKLCH generator itself; admin-editable anchor colors; non-wizard Vuetify theme changes.

## Checkpoint
- Quote and reschedule have distinct visual treatment when brand colors are enabled (not flat DHP-only look).
- No hardcoded DHP RGB triplets remain in `BookingWizard.scss` `.dhp-colors-active` block.
- All six wizard-mode × brand combinations verified (no regression).
- Admin `useBrandColors` toggle behavior unchanged.
- `npm run lint` (client) passes; app starts cleanly.

## How we build the tierDown
- **Task 6.13.2.1:** SCSS and class-binding alignment — remove `!useDhpColors` guards from class bindings; refactor `.dhp-colors-active` SCSS to defer to pipeline CSS vars; consolidate duplicate hex/RGB defaults
- **Task 6.13.2.2:** Verification matrix and lint — verify all six mode × brand combinations; run client lint; fix any issues in touched files
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/phases/phase-6.13-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/sessions/session-6.13.1-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

# Plan: session 6.13.1 — Token pipeline and theme wiring

## Contract
- **Tier:** session | **ID:** 6.13.1
- **Scope:** Token pipeline and theme wiring
- **Governance:** Read governance reports before implementation; follow Vue composable and function playbooks on touched files.

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
Phase 6.12 is complete through session 6.12.8. Session 6.13.1 is the first session of Phase 6.13 (wizard theme tokens); session 6.13.2 will handle wizard SCSS and class wiring.

## Goal
Implement a **single perceptual token pipeline** (OKLCH or HSL; optional **culori**) that derives `WizardModePalette`-shaped outputs from anchor colors, and wire it through **`resolvePalette`** / **`applyPaletteToCss`** so **`dhpPalette.standard`**, **`quote`**, and **`reschedule`** are intentionally distinct when admin **Brand colors** is on (not identical hex copies). Document when seeds come from Vuetify theme vs DHP-only paths. **Session done** when generator + wiring compile, client lint is clean for touched files, and the booking wizard is smoke-tested in standard / quote / reschedule with brand on and off (visual sanity — fine-tuning can follow in 6.13.2).

## Files
- **TierUp:** `.project-manager/features/appointment-workflow/phases/phase-6.13-guide.md`, `phases/phase-6.13-planning.md`
- **Palette / theme:** `client/src/plugins/5.vuetify/theme.ts` (`dhpPalette`, `quoteModeColors`, `rescheduleModeColors`, `WizardModePalette` types as needed)
- **Runtime:** `client/src/composables/useThemeMode.ts` (`resolvePalette`, `applyPaletteToCss`, `THEME_VAR_KEYS`)
- **New:** `client/src/utils/color/` (or similar) — transform helpers + token builder; add `culori` only if we commit to that dependency
- **Out of scope for 6.13.1:** `BookingWizard.vue` / `BookingWizard.scss` restyling beyond what is required to verify variables (defer to 6.13.2)
- **Governance:** `client/.audit-reports/*`, `.project-manager/*_AUTHORING_PLAYBOOK.md`

## Approach
1. **Inventory:** Map current `dhpPalette` duplication, `quoteModeColors` / `rescheduleModeColors`, and where `resolvePalette` ignores theme inputs when DHP is active.
2. **Token module:** Add small, typed helpers (OKLCH/HSL) and rules for darken-1, on-*, warning, inactive tints per phase planning doc.
3. **Generator:** From two anchors (primary/secondary), produce full `WizardModePalette` per mode (`standard`, `quote`, `reschedule`) with documented transforms (e.g. quote = reduced chroma).
4. **Wire:** Integrate into `theme.ts` / `useThemeMode`; ensure `applyPaletteToCss` receives consistent keys; no silent fallbacks — log or document explicit branches.
5. **Verify:** Smoke wizard modes; `cd client && npm run lint`.

## Checkpoint
- `dhpPalette` modes are intentionally different or explicitly documented if intentionally equivalent.
- `resolvePalette` behavior is clear for brand on/off and each wizard mode.
- No new lint violations; app starts.

## How we build the tierDown to achieve them
- **Task 6.13.1.1:** Token utilities and palette generator module
- **Task 6.13.1.2:** Integrate generator with `theme.ts` and `useThemeMode` (resolvePalette, CSS vars, smoke checks)

---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/phases/phase-6.13-guide.md`
- Technical baseline: `.project-manager/features/appointment-workflow/phases/phase-6.13-planning.md`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

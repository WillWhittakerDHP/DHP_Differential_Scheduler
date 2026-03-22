# Plan: phase 6.13 — Wizard Theme Tokens & Brand Palettes

**Phase:** 6.13  
**Status:** Planning (phase-start context gathering)

---

## Contract

- **Tier:** phase | **ID:** 6.13
- **Scope:** Perceptual color pipeline (OKLCH or HSL) for wizard/Vuetify tokens; align DHP brand path with distinct quote/reschedule; single generator feeding `theme.ts`, `useThemeMode`, and `BookingWizard.scss`
- **Governance:** Read Reference reports before implementation sessions

## Work Profile

- **Execution intent:** plan
- **Action type:** decomposition
- **Scope shape:** architectural (client theme + wizard styling)
- **Governance domains:** client composables, components, types
- **Recommended context pack:** decomposition_pack
- **Planning artifact action:** update
- **Decomposition mode:** light

## Where we left off

- **Phase 6.12 complete (2026-03-22):** Sessions 6.12.1–6.12.8 done; handoff points to Phase 6.13. See `.project-manager/features/appointment-workflow/phases/phase-6.12-handoff.md`.

## Goal

Deliver one derived-token pipeline from brand anchors so primary, secondary, warning, darken-1, on-*, inactive, and optional semantic roles stay visually consistent; give **distinct** `standard` / `quote` / `reschedule` palettes when admin **Brand colors** (DHP) is on; remove parallel hex maintenance across `theme.ts`, `useThemeMode`, and `BookingWizard.scss` while preserving accessibility and the `useBrandColors` toggle behavior (unless intentionally extended with documentation).

## Files

- `client/src/plugins/5.vuetify/theme.ts` — `dhpPalette`, `quoteModeColors`, `rescheduleModeColors`, `WizardModePalette`, `THEME_VAR_KEYS`
- `client/src/composables/useThemeMode.ts` — `resolvePalette`, `applyPaletteToCss`, brand/DHP wiring
- `client/src/components/booking/BookingWizard.vue` — class logic for quote/reschedule vs `dhp-colors-active`
- `client/src/components/booking/BookingWizard.scss` — mode and inactive variables; collapse duplicated hex where variables suffice
- New module (e.g. `client/src/utils/theme/` or colocated) — OKLCH/HSL transforms (e.g. culori) and token rules
- `package.json` / client deps — add color library only if adopted in Approach

## Approach

1. **Session 6.13.1:** Specify token rules API (anchors, ΔL for darken-1, warning hue/chroma, quote/reschedule chroma reduction); implement generator; extend `WizardModePalette` / CSS var application; wire `resolvePalette` and `applyPaletteToCss` so DHP receives distinct mode variants; keep non-brand paths working.
2. **Session 6.13.2:** Adjust `BookingWizard.vue` / SCSS so quote and reschedule styling can coexist with brand mode when product requires it; prefer CSS variables from the single pipeline; run client lint and manual wizard checks (brand on/off × modes).

Out of scope for this plan unless explicitly pulled in: admin-editable anchors beyond current DHP palette; full app-wide Vuetify theme regeneration (wizard-scoped overrides first).

## Checkpoint

After both sessions: one source generates the RGB/CSS variables used in practice for wizard theming; quote/reschedule are coherent with brand colors enabled; no regression to wizard modes or brand toggle; `npm run lint` (client) and app start pass.

## How we build the tierDown to achieve them

- **Session 6.13.1:** Token pipeline + theme wiring (`theme.ts`, `useThemeMode`, generator module)
- **Session 6.13.2:** BookingWizard Vue/SCSS integration and verification

---

## Reference (read before filling slots — governance and inventory compliance is required)

- Tier-up guide: `.project-manager/features/appointment-workflow/feature-appointment-workflow-guide.md` (Phase 6.13 row)
- Phase guide: `.project-manager/features/appointment-workflow/phases/phase-6.13-guide.md`
- Prior handoff: `.project-manager/features/appointment-workflow/phases/phase-6.12-handoff.md`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

---

## Intent (technical baseline — retained from earlier draft)

Implement themes rooted in brand colors with **consistent degree** (chroma, lightness, hue relationships) across quote mode, reschedule, warning, tertiary/semantic roles, and inactive tints — not only primary and secondary anchors.

---

## What exists today (baseline)

### 1. Brand colors = DHP palette (not “primary/secondary only”)

Admin `useBrandColors` flows into `useDhpColors` and applies `dhpPalette` in `useThemeMode`. That palette already includes **primary, secondary, warning**, each with `*-darken-1` and `on-*`.

Reference: `client/src/plugins/5.vuetify/theme.ts` — `dhpPalette` for `standard` | `quote` | `reschedule`.

### 2. Quote/reschedule variants are muted when brand is on

In `BookingWizard.vue`, quote/reschedule styling classes apply only when **not** using brand colors (`quote-mode-active` requires `!useDhpColors`). The `.dhp-colors-active` block in SCSS is a **single** palette with no quote/reschedule branch.

`dhpPalette`’s `quote` and `reschedule` entries duplicate `standard` hex values, so `resolvePalette` never yields distinct quote/reschedule treatment for brand mode.

Reference: `client/src/components/booking/BookingWizard.scss`.

### 3. Non-brand quote/reschedule use a hand-tuned system

`quoteModeColors`, `rescheduleModeColors` in `theme.ts` plus matching variables in `BookingWizard.scss`, including inactive tints — separate from the DHP brand path.

### 4. No derive-from-theme pipeline yet

`resolvePalette` receives Vuetify theme colors but does not use them (parameters intentionally unused). There is no “derive everything from two seed colors” pipeline yet.

Reference: `client/src/composables/useThemeMode.ts`.

**Gap:** Brand mode collapses quote/reschedule into one look, while warning / tertiary / success in the global Vuetify theme remain a separate static set unless `WizardModePalette` and `applyPaletteToCss` are extended.

---

## Recommended direction

### 1. Perceptual color space

Use **OKLCH** (or HSL for lighter weight) so “same chroma, −10 lightness” reads as one family. Libraries such as **culori** support this.

### 2. Token rules (examples)

- **Base:** brand primary + brand secondary (anchors).
- **Darken-1:** fixed ΔL (or L multiplier) at same hue/chroma.
- **Warning:** secondary with hue nudged toward red, or fixed semantic hue with **same chroma** as secondary.
- **Quote mode:** e.g. “20% less vibrant” = reduce OKLCH **C** by 20%, optional hue shift — encoded once, not re-guessed per swatch.
- **Inactive / surface:** mix with white in OKLCH or high-L, low-C variant (aligns with “80% white + 20% color” in SCSS, centralized).

### 3. One source of truth

Generate RGB triples / hex from the token builder and feed:

- `WizardModePalette` (extend if success/info/error/**tertiary** are required),
- `THEME_VAR_KEYS` + `applyPaletteToCss`,
- SCSS: prefer runtime CSS variables only, or build-time emission — avoid three hand-maintained copies.

### 4. Brand + quote/reschedule

If quote mode should work **with** brand colors on:

- distinct `dhpPalette.quote` / `dhpPalette.reschedule` (or derived variants), and
- SCSS/class logic so `dhp-colors-active` can coexist with mode-specific overrides (or drive everything from one composable).

### 5. Tertiary / semantic colors

Either add keys to `WizardModePalette` and set `--v-theme-*` overrides, or map tertiary to an existing token (e.g. `info`) with the same chroma ladder as primary.

---

## Summary

- `WizardModePalette` already carries warning + darken + on-colors; DHP currently flattens modes and disables quote/reschedule styling in the wizard when brand is on.
- **Consistent intensity** means moving from hand-picked hex lists to **anchor colors + OKLCH (or similar) transforms**, wired through **one** pipeline into JS and CSS.

---

## Out of scope (until decided)

- Whether admin-configurable brand anchors (beyond DHP yellow/red) ship in this phase or a follow-up.
- Full app-wide Vuetify theme regeneration vs wizard-scoped overrides only.
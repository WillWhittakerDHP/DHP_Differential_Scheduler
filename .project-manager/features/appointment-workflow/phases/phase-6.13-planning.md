# Phase 6.13 Planning: Wizard Theme Tokens & Brand Palettes

**Phase:** 6.13  
**Status:** Draft (registered from `/phase-add` intent; automated tier-add blocked on feature guide — manual registration completed)

---

## Intent

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

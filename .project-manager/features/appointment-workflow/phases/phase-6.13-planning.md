# Phase 6.13 Planning: Wizard Theme Tokens & Brand Palettes

**Phase:** 6.13  
**Status:** Draft (registered from `/phase-add` intent; automated tier-add blocked on feature guide — manual registration completed)

---

## Goal

Deliver **Phase 6.13 — Wizard Theme Tokens & Brand Palettes**: one perceptual pipeline (OKLCH or HSL, e.g. via culori) that derives wizard/Vuetify tokens from anchor colors so primary, secondary, warning, darken-1, on-*, inactive, and optional tertiary/semantic roles stay visually consistent; **distinct** `standard` / `quote` / `reschedule` behavior when admin **Brand colors** (DHP) is on; and consolidated outputs feeding `theme.ts`, `useThemeMode`, and `BookingWizard.scss` (no three parallel hex lists). **Done** when phase guide success criteria are met, wizard is verified in new / quote / reschedule with brand on and off, and `cd client && npm run lint` plus app start pass.

## Files

- **TierUp:** `.project-manager/features/appointment-workflow/phases/phase-6.13-guide.md`, `feature-appointment-workflow-guide.md`
- **Prior handoff:** `.project-manager/features/appointment-workflow/phases/phase-6.12-handoff.md`
- **Theme & palette:** `client/src/plugins/5.vuetify/theme.ts` (`dhpPalette`, `quoteModeColors`, `rescheduleModeColors`, `WizardModePalette`)
- **Runtime application:** `client/src/composables/useThemeMode.ts` (`resolvePalette`, `applyPaletteToCss`, `THEME_VAR_KEYS`)
- **Wizard styles:** `client/src/components/booking/BookingWizard.scss`, `BookingWizard.vue` (class logic for `quote-mode-active`, `dhp-colors-active`)
- **New or refactored:** token builder module (e.g. under `client/src/` composables or `utils/color/`) — single source for derived hex/CSS variables
- **Governance:** `client/.audit-reports/*`, playbooks under `.project-manager/*_AUTHORING_PLAYBOOK.md`

## Approach

1. **Session 6.13.1:** Inventory current overrides; add OKLCH/HSL transform API + generator from brand/Vuetify anchors; extend `WizardModePalette` and wire `resolvePalette` / `applyPaletteToCss` so `dhpPalette.standard` / `quote` / `reschedule` are meaningfully distinct when product requires it; keep `useBrandColors` behavior explicit in code paths.
2. **Session 6.13.2:** Align `BookingWizard.vue` / SCSS so quote and reschedule can coexist with `dhp-colors-active` when intended; replace or narrow hand-maintained duplicate hex in SCSS using runtime CSS variables or the same generator output; verify all wizard modes; client lint.
3. Follow **Vue-only** frontend rule, **explicit types**, **logger in catch** where applicable, and **no silent fallbacks** per project standards.

## Checkpoint

After **6.13.1:** generator produces consistent tokens; `resolvePalette` uses theme seeds or documented DHP path; distinct quote/reschedule entries or documented equivalence; smoke wizard with brand on/off. After **6.13.2:** SCSS/class behavior matches plan; no stray duplicate palettes; `cd client && npm run lint` and `npm run start:dev` clean.

## How we build the tierDown

- **Session 6.13.1:** Token pipeline and theme wiring
- **Session 6.13.2:** Wizard SCSS, classes, and verification

## Reference (read before locking execution — governance and inventory)

- TierUp guide: `.project-manager/features/appointment-workflow/phases/phase-6.13-guide.md`
- Handoff: `.project-manager/features/appointment-workflow/phases/phase-6.12-handoff.md`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

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

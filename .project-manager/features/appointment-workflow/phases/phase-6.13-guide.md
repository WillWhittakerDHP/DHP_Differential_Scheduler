# Phase 6.13 Guide: Wizard Theme Tokens & Brand Palettes

**Purpose:** Phase-level guide for a single perceptual pipeline (OKLCH or HSL) that generates wizard/Vuetify theme tokens so primary, secondary, warning, darken steps, on-colors, inactive tints, and optional tertiary/semantic roles stay visually consistent. Aligns quote and reschedule variants with the admin **Brand colors** (DHP) path and removes duplicated hex across `theme.ts`, `useThemeMode`, and `BookingWizard.scss`.

**Tier:** Phase (Tier 1 - High-Level)

---

## Phase Overview

**Phase Number:** 6.13  
**Phase Name:** Wizard Theme Tokens & Brand Palettes  
**Description:** Today, non-brand quote/reschedule use hand-tuned palettes while brand mode applies a flat DHP palette with identical `standard` / `quote` / `reschedule` entries; quote/reschedule SCSS classes are disabled when brand colors are on. Warning and other semantic colors in the global Vuetify theme are a separate static set. This phase introduces derived tokens from anchor colors (and optional library such as culori), extends `WizardModePalette` and CSS variable application as needed, and consolidates one generator feeding both JS and wizard styles.

**Duration:** 2 sessions (6.13.1, 6.13.2)  
**Status:** Planning

---

## Phase Objectives

- Define token rules (e.g. darken-1 = fixed ΔL; warning chroma aligned with secondary; quote mode = reduced chroma ± hue shift) in one module.
- Support distinct quote/reschedule (and standard) palettes when **Brand colors** is on, without breaking the admin toggle.
- Reduce or eliminate parallel hex lists in `BookingWizard.scss` (prefer runtime CSS variables or build-time emission from the same source).
- Optionally extend semantic roles (success, info, error, tertiary) for wizard scope only if product requires them.
- Preserve accessibility (on-* contrast) with explicit checks or fixed rules.

---

## Tasks

- Inventory current overrides: `dhpPalette`, `quoteModeColors`, `rescheduleModeColors`, `inactiveColors`, `BookingWizard.scss`, `useThemeMode` `THEME_VAR_KEYS`.
- Specify OKLCH/HSL transform API and seed inputs (brand anchors vs Vuetify theme read — note `resolvePalette` currently ignores theme seeds when DHP is on).
- Implement generator + wire `resolvePalette` / `applyPaletteToCss`; adjust `BookingWizard.vue` class logic if quote/reschedule should combine with `dhp-colors-active`.
- Verify wizard in new / quote / reschedule with brand on and off; run client lint.

---

## Sessions Breakdown

- [x] **Session 6.13.1:** Token pipeline + theme wiring (`theme.ts`, `useThemeMode`, OKLCH/HSL generator, `WizardModePalette` / CSS vars)
- [x] **Session 6.13.2:** `BookingWizard.vue` / `BookingWizard.scss` integration; brand + quote/reschedule verification; client lint

_Register each session with `/session-add` or tier workflow when starting work._

Session detail (Goal / Files / Approach / Checkpoint) is under **Sessions (tierDown)** below. Start order: 6.13.1 → 6.13.2.

---

## Dependencies

**Prerequisites:** None blocking; touches booking wizard and Vuetify theme only.  
**Related:** Phase 6.12 is unrelated (annotations); numbering is sequential only.

---

## Success Criteria

- [ ] Single source generates RGB/CSS variables for wizard theme overrides used in practice.
- [ ] Quote and reschedule remain coherent when brand colors are enabled (no accidental flat DHP-only look if product requires differentiation).
- [ ] Admin `useBrandColors` / wizard settings behavior unchanged or intentionally extended with docs.
- [ ] `npm run lint` (client) and app start pass.

---

## Related Documents

- `phases/phase-6.13-planning.md` — technical deep-dive and current-state analysis
- `client/src/plugins/5.vuetify/theme.ts`, `client/src/composables/useThemeMode.ts`, `client/src/components/booking/BookingWizard.scss`
- Feature guide: `feature-appointment-workflow-guide.md` (Phase 6.13 entry)

---

## Sessions (tierDown)

### Session 6.13.1: Token pipeline and theme wiring

**Goal:** Introduce a single perceptual-color module (OKLCH or HSL, optional culori) that derives `WizardModePalette` roles from anchor colors; wire `resolvePalette` and `applyPaletteToCss` so DHP `standard` / `quote` / `reschedule` are **distinct** generated palettes; keep non-brand `quoteModeColors` / `rescheduleModeColors` paths working; document token rules (darken-1, warning, on-*).

**Files:** New generator module under `client/src/utils/theme/` (or agreed location); `client/src/plugins/5.vuetify/theme.ts`; `client/src/composables/useThemeMode.ts`; client `package.json` only if adding a color dependency.

**Approach:** (1) Choose library vs hand-rolled OKLCH transforms; (2) Define a small API: inputs (primary, secondary, mode) → palette record; (3) Replace duplicate `dhpPalette` entries with derived outputs per mode; (4) Extend `THEME_VAR_KEYS` / `applyPaletteToCss` as needed; (5) Smoke-check wizard with brand off; brand-on distinct modes in a follow-up session if SCSS still blocks.

**Checkpoint:** Distinct hex/CSS vars for standard vs quote vs reschedule when DHP is on; no placeholder palette fields; client lint clean for touched files; app starts.

**See:** `sessions/session-6.13.1-guide.md` (created by tier workflow)

### Session 6.13.2: BookingWizard integration and verification

**Goal:** Align `BookingWizard.vue` and `BookingWizard.scss` with the single pipeline: allow quote/reschedule visual treatment alongside `dhp-colors-active` when required; prefer CSS variables from the composable over parallel SCSS hex lists; verify all wizard modes with brand on and off.

**Files:** `client/src/components/booking/BookingWizard.vue`; `client/src/components/booking/BookingWizard.scss`; touch-ups in `useThemeMode.ts` only if class/CSS var contract needs adjustment.

**Approach:** (1) Audit class bindings that gate quote/reschedule on `!useDhpColors`; (2) Map SCSS variables to emitted CSS variables where possible; (3) Manual matrix: new / quote / reschedule × brand on/off; (4) Run `cd client && npm run lint`.

**Checkpoint:** Coherent quote and reschedule appearance with brand colors enabled; admin brand toggle behavior unchanged unless documented; lint and app start pass.

**See:** `sessions/session-6.13.2-guide.md` (created by tier workflow)

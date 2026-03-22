# Phase 6.13 Guide: Wizard Theme Tokens & Brand Palettes

**Purpose:** Phase-level guide for a single perceptual pipeline (OKLCH or HSL) that generates wizard/Vuetify theme tokens so primary, secondary, warning, darken steps, on-colors, inactive tints, and optional tertiary/semantic roles stay visually consistent. Aligns quote and reschedule variants with the admin **Brand colors** (DHP) path and removes duplicated hex across `theme.ts`, `useThemeMode`, and `BookingWizard.scss`.

**Tier:** Phase (Tier 1 - High-Level)

---

## Phase Overview

**Phase Number:** 6.13  
**Phase Name:** Wizard Theme Tokens & Brand Palettes  
**Description:** Today, non-brand quote/reschedule use hand-tuned palettes while brand mode applies a flat DHP palette with identical `standard` / `quote` / `reschedule` entries; quote/reschedule SCSS classes are disabled when brand colors are on. Warning and other semantic colors in the global Vuetify theme are a separate static set. This phase introduces derived tokens from anchor colors (and optional library such as culori), extends `WizardModePalette` and CSS variable application as needed, and consolidates one generator feeding both JS and wizard styles.

**Duration:** 2 sessions (6.13.1, 6.13.2)  
**Status:** Not Started

---

## Phase Objectives

- Define token rules (e.g. darken-1 = fixed ΔL; warning chroma aligned with secondary; quote mode = reduced chroma ± hue shift) in one module.
- Support distinct quote/reschedule (and standard) palettes when **Brand colors** is on, without breaking the admin toggle.
- Reduce or eliminate parallel hex lists in `BookingWizard.scss` (prefer runtime CSS variables or build-time emission from the same source).
- Optionally extend semantic roles (success, info, error, tertiary) for wizard scope only if product requires them.
- Preserve accessibility (on-* contrast) with explicit checks or fixed rules.

---

## Tasks

Phase work is delivered through the two sessions below. Each session has Goal, Files, Approach, and Checkpoint for implementation planning.

---

## Sessions Breakdown

- [ ] ### Session 6.13.1: Token pipeline and theme wiring

**Description:** Inventory `dhpPalette`, `quoteModeColors`, `rescheduleModeColors`, and `resolvePalette` / `applyPaletteToCss`; add an OKLCH or HSL transform layer (culori optional); extend `WizardModePalette` so `standard`, `quote`, and `reschedule` can differ meaningfully when DHP brand mode is on; document when `resolvePalette` uses Vuetify theme seeds vs DHP-only paths.

**Goal:** Ship a single generator that outputs consistent wizard palette objects and CSS variable payloads from anchor colors, with distinct brand-mode quote/reschedule where required by product.

**Files:** `client/src/plugins/5.vuetify/theme.ts`; `client/src/composables/useThemeMode.ts`; new module under `client/src/` (e.g. `utils/color/` or composable-adjacent) for transforms; `package.json` / lockfile only if adding `culori` or similar.

**Approach:** (1) Document current behavior and duplicates. (2) Implement transform API (anchors → full `WizardModePalette` fields). (3) Wire `resolvePalette` to use seeds or DHP consistently; extend `THEME_VAR_KEYS` / `applyPaletteToCss` as needed. (4) Smoke-test wizard with brand on/off.

**Checkpoint:** Generator runs without lint errors; `dhpPalette` entries are intentional (not accidental duplicates); smoke new booking wizard in standard, quote, and reschedule with brand on and off.

**See:** `sessions/session-6.13.1-guide.md` (create via `/session-start 6.13.1`)

- [ ] ### Session 6.13.2: Wizard SCSS, classes, and verification

**Description:** Update `BookingWizard.vue` and `BookingWizard.scss` so quote/reschedule styling can align with `dhp-colors-active` when product requires it; drive colors from shared CSS variables or generator output; remove redundant hand-maintained hex where variables cover the same roles.

**Goal:** One visual system across classes and SCSS; verified matrix of modes (new / quote / reschedule × brand on/off); client lint clean.

**Files:** `client/src/components/booking/BookingWizard.vue`, `BookingWizard.scss`; touch only theme-related imports if class names or CSS var names change.

**Approach:** (1) Map class logic (`quote-mode-active`, `dhp-colors-active`) to the palette from session 6.13.1. (2) Replace duplicate hex with `var(--...)` or shared tokens. (3) Manual verification checklist; `cd client && npm run lint`.

**Checkpoint:** No stray duplicate palettes for the same semantic role; lint passes; `npm run start:dev` runs.

**See:** `sessions/session-6.13.2-guide.md` (create via `/session-start 6.13.2`)

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
